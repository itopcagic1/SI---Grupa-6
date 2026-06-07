from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable, Optional

import numpy as np
import pandas as pd

try:
    from .db import query_dataframe
except ImportError:
    from db import query_dataframe


LOOKBACK_MATCHES = 5
HISTORICAL_COMPETITION_PREFIX = "AI Historical Football League%"
STAT_NAME_MAP = {
    "Asistencije": "assists",
    "Prekrsaji": "fouls",
    "Zuti kartoni": "yellow_cards",
    "Crveni kartoni": "red_cards",
    "Posjed lopte": "possession",
}

FEATURE_COLUMNS = [
    "home_team_id",
    "away_team_id",
    "competition_id",
    "season_index",
    "home_points_before",
    "away_points_before",
    "points_diff",
    "home_position_before",
    "away_position_before",
    "position_diff",
    "home_form_points_last_5",
    "away_form_points_last_5",
    "form_diff_last_5",
    "home_avg_goals_for_last_5",
    "away_avg_goals_for_last_5",
    "goals_for_diff_last_5",
    "home_avg_goals_against_last_5",
    "away_avg_goals_against_last_5",
    "goals_against_diff_last_5",
    "home_avg_assists_last_5",
    "away_avg_assists_last_5",
    "assists_diff_last_5",
    "home_avg_fouls_last_5",
    "away_avg_fouls_last_5",
    "fouls_diff_last_5",
    "home_avg_yellow_cards_last_5",
    "away_avg_yellow_cards_last_5",
    "yellow_cards_diff_last_5",
    "home_avg_red_cards_last_5",
    "away_avg_red_cards_last_5",
    "red_cards_diff_last_5",
    "home_avg_possession_last_5",
    "away_avg_possession_last_5",
    "possession_diff_last_5",
    "h2h_home_wins",
    "h2h_draws",
    "h2h_away_wins",
    "h2h_points_home_perspective",
]


@dataclass(frozen=True)
class MatchContext:
    match_id: int
    competition_id: int
    season: Optional[str]
    kickoff: pd.Timestamp
    home_team_id: int
    away_team_id: int


def load_historical_matches(include_non_historical: bool = False) -> pd.DataFrame:
    competition_filter = ""
    if not include_non_historical:
        competition_filter = 'AND t."naziv" LIKE :competition_prefix'

    sql = f"""
        SELECT
            u."utakmicaId" AS match_id,
            u."takmicenjeId" AS competition_id,
            u."domaciTimId" AS home_team_id,
            u."gostujuciTimId" AS away_team_id,
            u."vrijemePocetka" AS kickoff,
            u."status" AS match_status,
            t."naziv" AS competition_name,
            t."sezona" AS season,
            t."sportId" AS sport_id,
            ht."naziv" AS home_team_name,
            at."naziv" AS away_team_name,
            r."rezultatDomacin" AS home_goals,
            r."rezultatGost" AS away_goals
        FROM "Utakmica" u
        JOIN "Takmicenje" t ON t."takmicenjeId" = u."takmicenjeId"
        JOIN "Tim" ht ON ht."timId" = u."domaciTimId"
        JOIN "Tim" at ON at."timId" = u."gostujuciTimId"
        JOIN "RezultatUtakmice" r ON r."utakmicaId" = u."utakmicaId"
        WHERE t."sportId" = 1
          {competition_filter}
        ORDER BY u."vrijemePocetka" ASC, u."utakmicaId" ASC
    """
    params = {"competition_prefix": HISTORICAL_COMPETITION_PREFIX}
    df = query_dataframe(sql, params)
    return _prepare_matches(df)


def build_training_dataset() -> pd.DataFrame:
    matches = load_historical_matches()
    if matches.empty:
        return pd.DataFrame(columns=[*FEATURE_COLUMNS, "target"])

    stats = _load_team_stats(matches["match_id"].tolist())
    seasons = _season_index_map(matches["season"])
    rows = []

    for _, match in matches.iterrows():
        context = _context_from_row(match)
        history = _prior_matches(matches, context)
        row = _build_feature_row(context, history, stats, seasons)
        row["target"] = _target(match["home_goals"], match["away_goals"])
        rows.append(row)

    return pd.DataFrame(rows).fillna(0)


def build_features_for_match(match_id: int) -> pd.DataFrame:
    match = _load_match_for_prediction(match_id)
    if match.empty:
        raise ValueError(f"Match with id {match_id} was not found.")

    all_matches = load_historical_matches(include_non_historical=True)
    stats = _load_team_stats(all_matches["match_id"].tolist())
    seasons = _season_index_map(pd.concat([all_matches["season"], match["season"]], ignore_index=True))
    context = _context_from_row(match.iloc[0])
    history = _prior_matches(all_matches, context)
    row = _build_feature_row(context, history, stats, seasons)
    return pd.DataFrame([row]).fillna(0)


def _load_match_for_prediction(match_id: int) -> pd.DataFrame:
    sql = """
        SELECT
            u."utakmicaId" AS match_id,
            u."takmicenjeId" AS competition_id,
            u."domaciTimId" AS home_team_id,
            u."gostujuciTimId" AS away_team_id,
            u."vrijemePocetka" AS kickoff,
            u."status" AS match_status,
            t."naziv" AS competition_name,
            t."sezona" AS season,
            t."sportId" AS sport_id,
            ht."naziv" AS home_team_name,
            at."naziv" AS away_team_name
        FROM "Utakmica" u
        JOIN "Takmicenje" t ON t."takmicenjeId" = u."takmicenjeId"
        JOIN "Tim" ht ON ht."timId" = u."domaciTimId"
        JOIN "Tim" at ON at."timId" = u."gostujuciTimId"
        WHERE u."utakmicaId" = :match_id
    """
    df = query_dataframe(sql, {"match_id": int(match_id)})
    if df.empty:
        return df

    df["kickoff"] = pd.to_datetime(df["kickoff"], utc=True)
    return df


def _load_team_stats(match_ids: Iterable[int]) -> pd.DataFrame:
    match_ids = [int(match_id) for match_id in match_ids]
    if not match_ids:
        return pd.DataFrame(columns=["match_id", "team_id", *STAT_NAME_MAP.values()])

    match_ids_sql = ", ".join(str(match_id) for match_id in match_ids)
    sql = """
        SELECT
            s."utakmicaId" AS match_id,
            s."timId" AS team_id,
            ts."nazivStatistike" AS stat_name,
            v."vrijednost" AS value
        FROM "StatistikaTimaNaUtakmici" s
        JOIN "VrijednostStatistikeTima" v ON v."statistikaTimaId" = s."statistikaTimaId"
        JOIN "TipStatistike" ts ON ts."tipStatistikeId" = v."tipStatistikeId"
        WHERE s."utakmicaId" IN ({match_ids_sql})
    """.format(match_ids_sql=match_ids_sql)
    raw = query_dataframe(sql)
    if raw.empty:
        return pd.DataFrame(columns=["match_id", "team_id", *STAT_NAME_MAP.values()])

    raw["stat_key"] = raw["stat_name"].map(STAT_NAME_MAP)
    raw = raw.dropna(subset=["stat_key"])
    pivot = raw.pivot_table(
        index=["match_id", "team_id"],
        columns="stat_key",
        values="value",
        aggfunc="mean",
        fill_value=0,
    ).reset_index()

    for column in STAT_NAME_MAP.values():
        if column not in pivot:
            pivot[column] = 0.0

    return pivot[["match_id", "team_id", *STAT_NAME_MAP.values()]]


def _prepare_matches(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df

    df = df.copy()
    df["kickoff"] = pd.to_datetime(df["kickoff"], utc=True)
    df["home_goals"] = df["home_goals"].astype(int)
    df["away_goals"] = df["away_goals"].astype(int)
    df["home_points"] = np.select(
        [df["home_goals"] > df["away_goals"], df["home_goals"] == df["away_goals"]],
        [3, 1],
        default=0,
    )
    df["away_points"] = np.select(
        [df["away_goals"] > df["home_goals"], df["away_goals"] == df["home_goals"]],
        [3, 1],
        default=0,
    )
    return df


def _context_from_row(row: pd.Series) -> MatchContext:
    return MatchContext(
        match_id=int(row["match_id"]),
        competition_id=int(row["competition_id"]),
        season=None if pd.isna(row.get("season")) else str(row.get("season")),
        kickoff=pd.Timestamp(row["kickoff"]),
        home_team_id=int(row["home_team_id"]),
        away_team_id=int(row["away_team_id"]),
    )


def _prior_matches(matches: pd.DataFrame, context: MatchContext) -> pd.DataFrame:
    if matches.empty:
        return matches

    return matches[
        (matches["kickoff"] < context.kickoff)
        & (matches["match_id"] != context.match_id)
    ].copy()


def _team_history(history: pd.DataFrame, team_id: int) -> pd.DataFrame:
    return history[
        (history["home_team_id"] == team_id)
        | (history["away_team_id"] == team_id)
    ].sort_values(["kickoff", "match_id"])


def _team_last_matches(history: pd.DataFrame, team_id: int, limit: int = LOOKBACK_MATCHES) -> pd.DataFrame:
    return _team_history(history, team_id).tail(limit)


def _points_for_team(row: pd.Series, team_id: int) -> int:
    if int(row["home_team_id"]) == team_id:
        return int(row["home_points"])
    return int(row["away_points"])


def _goals_for_team(row: pd.Series, team_id: int) -> int:
    if int(row["home_team_id"]) == team_id:
        return int(row["home_goals"])
    return int(row["away_goals"])


def _goals_against_team(row: pd.Series, team_id: int) -> int:
    if int(row["home_team_id"]) == team_id:
        return int(row["away_goals"])
    return int(row["home_goals"])


def team_form_points(history: pd.DataFrame, team_id: int, limit: int = LOOKBACK_MATCHES) -> float:
    last_matches = _team_last_matches(history, team_id, limit)
    if last_matches.empty:
        return 0.0
    return float(sum(_points_for_team(row, team_id) for _, row in last_matches.iterrows()))


def average_goals_for(history: pd.DataFrame, team_id: int, limit: int = LOOKBACK_MATCHES) -> float:
    last_matches = _team_last_matches(history, team_id, limit)
    if last_matches.empty:
        return 0.0
    return float(np.mean([_goals_for_team(row, team_id) for _, row in last_matches.iterrows()]))


def average_goals_against(history: pd.DataFrame, team_id: int, limit: int = LOOKBACK_MATCHES) -> float:
    last_matches = _team_last_matches(history, team_id, limit)
    if last_matches.empty:
        return 0.0
    return float(np.mean([_goals_against_team(row, team_id) for _, row in last_matches.iterrows()]))


def points_before_match(history: pd.DataFrame, competition_id: int, team_id: int) -> int:
    competition_history = history[history["competition_id"] == competition_id]
    team_matches = _team_history(competition_history, team_id)
    return int(sum(_points_for_team(row, team_id) for _, row in team_matches.iterrows()))


def position_before_match(history: pd.DataFrame, competition_id: int, team_id: int) -> int:
    table = _table_before_match(history, competition_id)
    if team_id not in table:
        return len(table) + 1 if table else 1
    return int(table[team_id]["position"])


def head_to_head_stats(
    history: pd.DataFrame,
    home_team_id: int,
    away_team_id: int,
    limit: Optional[int] = None,
) -> dict[str, float]:
    h2h = history[
        (
            (history["home_team_id"] == home_team_id)
            & (history["away_team_id"] == away_team_id)
        )
        | (
            (history["home_team_id"] == away_team_id)
            & (history["away_team_id"] == home_team_id)
        )
    ].sort_values(["kickoff", "match_id"])

    if limit:
        h2h = h2h.tail(limit)

    result = {"home_wins": 0.0, "draws": 0.0, "away_wins": 0.0, "home_points": 0.0}

    for _, row in h2h.iterrows():
        home_goals = _goals_for_team(row, home_team_id)
        away_goals = _goals_for_team(row, away_team_id)
        if home_goals > away_goals:
            result["home_wins"] += 1
            result["home_points"] += 3
        elif home_goals == away_goals:
            result["draws"] += 1
            result["home_points"] += 1
        else:
            result["away_wins"] += 1

    return result


def average_team_stat(
    history: pd.DataFrame,
    stats: pd.DataFrame,
    team_id: int,
    stat_key: str,
    limit: int = LOOKBACK_MATCHES,
) -> float:
    last_matches = _team_last_matches(history, team_id, limit)
    if last_matches.empty or stats.empty or stat_key not in stats:
        return 0.0

    match_ids = set(last_matches["match_id"].astype(int).tolist())
    values = stats[
        (stats["team_id"] == team_id)
        & (stats["match_id"].isin(match_ids))
    ][stat_key]

    if values.empty:
        return 0.0
    return float(values.mean())


def _table_before_match(history: pd.DataFrame, competition_id: int) -> dict[int, dict[str, Any]]:
    competition_history = history[history["competition_id"] == competition_id]
    table: dict[int, dict[str, Any]] = {}

    def ensure(team_id: int) -> dict[str, Any]:
        if team_id not in table:
            table[team_id] = {
                "points": 0,
                "goal_difference": 0,
                "goals_for": 0,
                "position": 0,
            }
        return table[team_id]

    for _, row in competition_history.iterrows():
        home_id = int(row["home_team_id"])
        away_id = int(row["away_team_id"])
        home = ensure(home_id)
        away = ensure(away_id)

        home["points"] += int(row["home_points"])
        away["points"] += int(row["away_points"])
        home["goals_for"] += int(row["home_goals"])
        away["goals_for"] += int(row["away_goals"])
        home["goal_difference"] += int(row["home_goals"]) - int(row["away_goals"])
        away["goal_difference"] += int(row["away_goals"]) - int(row["home_goals"])

    sorted_rows = sorted(
        table.items(),
        key=lambda item: (
            -item[1]["points"],
            -item[1]["goal_difference"],
            -item[1]["goals_for"],
            item[0],
        ),
    )
    for index, (team_id, values) in enumerate(sorted_rows, start=1):
        values["position"] = index
        table[team_id] = values

    return table


def _build_feature_row(
    context: MatchContext,
    history: pd.DataFrame,
    stats: pd.DataFrame,
    season_indexes: dict[str, int],
) -> dict[str, float | int]:
    home_points = points_before_match(history, context.competition_id, context.home_team_id)
    away_points = points_before_match(history, context.competition_id, context.away_team_id)
    home_position = position_before_match(history, context.competition_id, context.home_team_id)
    away_position = position_before_match(history, context.competition_id, context.away_team_id)
    h2h = head_to_head_stats(history, context.home_team_id, context.away_team_id)

    row: dict[str, float | int] = {
        "home_team_id": context.home_team_id,
        "away_team_id": context.away_team_id,
        "competition_id": context.competition_id,
        "season_index": season_indexes.get(context.season or "", 0),
        "home_points_before": home_points,
        "away_points_before": away_points,
        "points_diff": home_points - away_points,
        "home_position_before": home_position,
        "away_position_before": away_position,
        "position_diff": away_position - home_position,
        "home_form_points_last_5": team_form_points(history, context.home_team_id),
        "away_form_points_last_5": team_form_points(history, context.away_team_id),
        "home_avg_goals_for_last_5": average_goals_for(history, context.home_team_id),
        "away_avg_goals_for_last_5": average_goals_for(history, context.away_team_id),
        "home_avg_goals_against_last_5": average_goals_against(history, context.home_team_id),
        "away_avg_goals_against_last_5": average_goals_against(history, context.away_team_id),
        "h2h_home_wins": h2h["home_wins"],
        "h2h_draws": h2h["draws"],
        "h2h_away_wins": h2h["away_wins"],
        "h2h_points_home_perspective": h2h["home_points"],
    }

    row["form_diff_last_5"] = row["home_form_points_last_5"] - row["away_form_points_last_5"]
    row["goals_for_diff_last_5"] = row["home_avg_goals_for_last_5"] - row["away_avg_goals_for_last_5"]
    row["goals_against_diff_last_5"] = (
        row["home_avg_goals_against_last_5"] - row["away_avg_goals_against_last_5"]
    )

    for stat_key in STAT_NAME_MAP.values():
        home_column = f"home_avg_{stat_key}_last_5"
        away_column = f"away_avg_{stat_key}_last_5"
        diff_column = f"{stat_key}_diff_last_5"
        row[home_column] = average_team_stat(history, stats, context.home_team_id, stat_key)
        row[away_column] = average_team_stat(history, stats, context.away_team_id, stat_key)
        row[diff_column] = row[home_column] - row[away_column]

    return {column: row.get(column, 0) for column in FEATURE_COLUMNS}


def _season_index_map(seasons: pd.Series) -> dict[str, int]:
    clean_seasons = sorted(str(season) for season in seasons.dropna().unique())
    return {season: index + 1 for index, season in enumerate(clean_seasons)}


def _target(home_goals: int, away_goals: int) -> str:
    if int(home_goals) > int(away_goals):
        return "HOME_WIN"
    if int(home_goals) == int(away_goals):
        return "DRAW"
    return "AWAY_WIN"
