from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

try:
    from .features import build_features_for_match
    from .predict import load_model_bundle, validate_feature_frame
except ImportError:
    from features import build_features_for_match
    from predict import load_model_bundle, validate_feature_frame


OUTCOME_PROBABILITY_KEYS = {
    "HOME_WIN": "homeWinProbability",
    "DRAW": "drawProbability",
    "AWAY_WIN": "awayWinProbability",
}


class PredictRequest(BaseModel):
    matchId: int = Field(..., gt=0)


class PredictResponse(BaseModel):
    matchId: int
    prediction: str
    homeWinProbability: float
    drawProbability: float
    awayWinProbability: float


app = FastAPI(title="SportManager AI Prediction Service", version="0.1.0")
model: Any = None
feature_columns: list[str] = []
model_load_error: str | None = None


@app.on_event("startup")
def load_model_on_startup() -> None:
    global model, feature_columns, model_load_error

    try:
        model, feature_columns = load_model_bundle()
        model_load_error = None
    except Exception as exc:
        model = None
        feature_columns = []
        model_load_error = str(exc)


@app.get("/health")
def health() -> dict[str, bool | str]:
    response: dict[str, bool | str] = {
        "status": "ok" if model is not None else "error",
        "modelLoaded": model is not None,
    }

    if model_load_error:
        response["error"] = model_load_error

    return response


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model is not loaded: {model_load_error or 'unknown error'}",
        )

    try:
        features = build_features_for_match(request.matchId)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to build features: {exc}") from exc

    validation = validate_feature_frame(features, feature_columns)
    if validation["missingColumns"] or validation["extraColumns"]:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Feature mismatch before inference.",
                "validation": validation,
            },
        )

    if validation["hasNaNValues"]:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Feature frame contains NaN values before inference.",
                "validation": validation,
            },
        )

    ordered_features = features[feature_columns]

    try:
        prediction = str(model.predict(ordered_features)[0])
        probabilities = model.predict_proba(ordered_features)[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    probability_by_class = {
        str(class_name): float(probability)
        for class_name, probability in zip(model.classes_, probabilities)
    }

    return PredictResponse(
        matchId=request.matchId,
        prediction=prediction,
        homeWinProbability=probability_by_class.get("HOME_WIN", 0.0),
        drawProbability=probability_by_class.get("DRAW", 0.0),
        awayWinProbability=probability_by_class.get("AWAY_WIN", 0.0),
    )
