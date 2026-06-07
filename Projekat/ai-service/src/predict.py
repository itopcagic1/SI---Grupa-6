from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Optional

import joblib

try:
    from .db import query_dataframe
    from .features import build_features_for_match
except ImportError:
    from db import query_dataframe
    from features import build_features_for_match


MODEL_DIR = Path(__file__).resolve().parents[1] / "model"
MODEL_PATH = MODEL_DIR / "model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
OUTCOME_KEYS = {
    "HOME_WIN": "homeWinProbability",
    "DRAW": "drawProbability",
    "AWAY_WIN": "awayWinProbability",
}


def load_model_bundle() -> tuple[Any, list[str]]:
    if not MODEL_PATH.exists() or MODEL_PATH.stat().st_size == 0:
        raise FileNotFoundError(f"Model file not found or empty: {MODEL_PATH}")
    if not FEATURE_COLUMNS_PATH.exists() or FEATURE_COLUMNS_PATH.stat().st_size == 0:
        raise FileNotFoundError(f"Feature columns file not found or empty: {FEATURE_COLUMNS_PATH}")

    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURE_COLUMNS_PATH)

    if not isinstance(feature_columns, list) or not feature_columns:
        raise ValueError("feature_columns.pkl must contain a non-empty list.")

    return model, feature_columns


def validate_feature_frame(features, feature_columns: list[str]) -> dict[str, Any]:
    actual_columns = list(features.columns)
    missing_columns = [column for column in feature_columns if column not in actual_columns]
    extra_columns = [column for column in actual_columns if column not in feature_columns]
    has_nan_values = bool(features[feature_columns].isna().any().any()) if not missing_columns else True

    return {
        "expectedFeatureCount": len(feature_columns),
        "actualFeatureCount": len(actual_columns),
        "missingColumns": missing_columns,
        "extraColumns": extra_columns,
        "hasNaNValues": has_nan_values,
    }


def predict_match(match_id: int) -> dict[str, Any]:
    model, feature_columns = load_model_bundle()
    features = build_features_for_match(match_id)
    validation = validate_feature_frame(features, feature_columns)

    if validation["missingColumns"]:
        raise ValueError(f"Missing feature columns before inference: {validation['missingColumns']}")
    if validation["extraColumns"]:
        raise ValueError(f"Unexpected feature columns before inference: {validation['extraColumns']}")
    if validation["hasNaNValues"]:
        raise ValueError("Feature frame contains NaN values before inference.")

    ordered_features = features[feature_columns]
    prediction = str(model.predict(ordered_features)[0])
    probabilities = model.predict_proba(ordered_features)[0]
    classes = [str(label) for label in model.classes_]
    probability_by_class = dict(zip(classes, probabilities))

    result = {
        "prediction": prediction,
        "homeWinProbability": float(probability_by_class.get("HOME_WIN", 0.0)),
        "drawProbability": float(probability_by_class.get("DRAW", 0.0)),
        "awayWinProbability": float(probability_by_class.get("AWAY_WIN", 0.0)),
        "validation": validation,
        "matchId": int(match_id),
    }

    return result


def find_default_match_id() -> Optional[int]:
    sql = """
        SELECT u."utakmicaId" AS match_id
        FROM "Utakmica" u
        LEFT JOIN "RezultatUtakmice" r ON r."utakmicaId" = u."utakmicaId"
        JOIN "Takmicenje" t ON t."takmicenjeId" = u."takmicenjeId"
        WHERE r."rezultatUtakmiceId" IS NULL
          AND t."sportId" = 1
        ORDER BY u."vrijemePocetka" ASC, u."utakmicaId" ASC
        LIMIT 1
    """
    matches = query_dataframe(sql)
    if matches.empty:
        fallback_sql = """
            SELECT u."utakmicaId" AS match_id
            FROM "Utakmica" u
            JOIN "Takmicenje" t ON t."takmicenjeId" = u."takmicenjeId"
            WHERE t."sportId" = 1
            ORDER BY u."vrijemePocetka" DESC, u."utakmicaId" DESC
            LIMIT 1
        """
        matches = query_dataframe(fallback_sql)

    if matches.empty:
        return None

    return int(matches.iloc[0]["match_id"])


def main() -> dict[str, Any]:
    match_id = int(sys.argv[1]) if len(sys.argv) > 1 else find_default_match_id()
    if match_id is None:
        raise ValueError("No football match found for prediction.")

    result = predict_match(match_id)
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()
