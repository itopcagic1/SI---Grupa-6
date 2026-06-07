from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

try:
    from .features import FEATURE_COLUMNS, build_training_dataset
except ImportError:
    from features import FEATURE_COLUMNS, build_training_dataset


RANDOM_STATE = 42
MODEL_DIR = Path(__file__).resolve().parents[1] / "model"
MODEL_PATH = MODEL_DIR / "model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
REPORT_PATH = MODEL_DIR / "training_report.json"


def validate_dataset(dataset: pd.DataFrame) -> dict[str, Any]:
    if dataset.empty:
        raise ValueError("Training dataset is empty.")

    if "target" not in dataset.columns:
        raise ValueError("Training dataset does not contain a target column.")

    missing_feature_columns = [column for column in FEATURE_COLUMNS if column not in dataset.columns]
    if missing_feature_columns:
        raise ValueError(f"Missing feature columns: {missing_feature_columns}")

    target_distribution = dataset["target"].value_counts().to_dict()
    missing_values = dataset.isna().sum().astype(int).to_dict()
    duplicated_rows = int(dataset.duplicated().sum())

    numeric_features = dataset[FEATURE_COLUMNS]
    always_zero_columns = [
        column for column in FEATURE_COLUMNS
        if (numeric_features[column].fillna(0) == 0).all()
    ]
    single_value_columns = [
        column for column in FEATURE_COLUMNS
        if numeric_features[column].nunique(dropna=False) <= 1
    ]

    return {
        "row_count": int(len(dataset)),
        "column_count": int(len(dataset.columns)),
        "feature_columns": FEATURE_COLUMNS,
        "missing_values": missing_values,
        "duplicated_rows": duplicated_rows,
        "target_distribution": target_distribution,
        "always_zero_columns": always_zero_columns,
        "single_value_columns": single_value_columns,
        "has_nan_values": bool(dataset.isna().any().any()),
    }


def _can_stratify(y: pd.Series) -> bool:
    class_counts = y.value_counts()
    return len(class_counts) > 1 and bool((class_counts >= 2).all())


def train_model(dataset: pd.DataFrame) -> dict[str, Any]:
    X = dataset[FEATURE_COLUMNS].copy()
    y = dataset["target"].copy()

    stratify = y if _can_stratify(y) else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=stratify,
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        random_state=RANDOM_STATE,
    )
    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    accuracy = float(accuracy_score(y_test, predictions))
    report = classification_report(y_test, predictions, output_dict=True, zero_division=0)
    matrix = confusion_matrix(y_test, predictions, labels=list(model.classes_))

    importances = sorted(
        [
            {"feature": column, "importance": float(importance)}
            for column, importance in zip(FEATURE_COLUMNS, model.feature_importances_)
        ],
        key=lambda item: item["importance"],
        reverse=True,
    )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(FEATURE_COLUMNS, FEATURE_COLUMNS_PATH)

    return {
        "accuracy": accuracy,
        "classification_report": report,
        "confusion_matrix": {
            "labels": list(model.classes_),
            "matrix": matrix.astype(int).tolist(),
        },
        "feature_importances": importances,
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "model_path": str(MODEL_PATH),
        "feature_columns_path": str(FEATURE_COLUMNS_PATH),
    }


def main() -> dict[str, Any]:
    dataset = build_training_dataset()
    validation = validate_dataset(dataset)
    training = train_model(dataset)

    result = {
        "validation": validation,
        "training": training,
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))
    return result


if __name__ == "__main__":
    main()
