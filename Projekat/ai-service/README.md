# SportManager AI Service

AI service for predicting football match outcomes in the SportManager project. The service trains a Random Forest model from historical match data stored in PostgreSQL/Neon and exposes predictions through a FastAPI HTTP API.

The current model predicts one of three outcomes:

- `HOME_WIN`
- `DRAW`
- `AWAY_WIN`

It also returns probabilities for all three outcomes.

## Folder Structure

```txt
ai-service/
  Dockerfile
  README.md
  requirements.txt
  .env.example
  model/
    model.pkl
    feature_columns.pkl
    training_report.json
  src/
    app.py
    db.py
    features.py
    predict.py
    train.py
```

## Dependencies

Dependencies are listed in `requirements.txt`:

- `fastapi`
- `uvicorn`
- `pandas`
- `numpy`
- `scikit-learn`
- `joblib`
- `sqlalchemy`
- `psycopg2-binary`
- `python-dotenv`

Install them with:

```powershell
python -m pip install -r requirements.txt
```

## Environment

The service needs access to the same PostgreSQL/Neon database used by the backend.

Create a local `.env` file in `ai-service/` or provide the variable through the shell/container environment:

```txt
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

For local development, `src/db.py` also attempts to read `../backend/.env` if `DATABASE_URL` is not already loaded.

## Run Locally

From the `ai-service` directory:

```powershell
python -m pip install -r requirements.txt
```

Make sure `DATABASE_URL` is available, then train or run the service as needed.

## Train The Model

Training uses the historical football dataset from the database and builds features through `src/features.py`.

```powershell
python src\train.py
```

Training outputs:

- `model/model.pkl`
- `model/feature_columns.pkl`
- `model/training_report.json`

The current training pipeline:

- loads historical matches
- validates dataset quality
- performs a train/test split
- trains `RandomForestClassifier`
- prints accuracy, classification report, confusion matrix, and feature importances
- stores the trained model and feature columns

## Run FastAPI Service

From `ai-service`:

```powershell
python -m uvicorn src.app:app --host 127.0.0.1 --port 8000
```

The model is loaded once on application startup from:

- `model/model.pkl`
- `model/feature_columns.pkl`

## Docker

Build the image:

```powershell
docker build -t sportmanager-ai-service:latest .
```

Run the container:

```powershell
docker run -d --name sportmanager-ai-service -e DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require -p 8000:8000 sportmanager-ai-service:latest
```

The container listens on port `8000`.

Note: if using an env file, make sure `DATABASE_URL` is not wrapped in quotes because Docker passes env-file values literally.

## API Endpoints

### GET `/health`

Checks service status and whether the model was loaded successfully.

Example request:

```http
GET http://127.0.0.1:8000/health
```

Example response:

```json
{
  "status": "ok",
  "modelLoaded": true
}
```

If the model cannot be loaded, `modelLoaded` is `false` and the response includes an error message.

### POST `/predict`

Generates an outcome prediction for a match.

Example request:

```http
POST http://127.0.0.1:8000/predict
Content-Type: application/json
```

```json
{
  "matchId": 167
}
```

Example response:

```json
{
  "matchId": 167,
  "prediction": "HOME_WIN",
  "homeWinProbability": 0.53,
  "drawProbability": 0.175,
  "awayWinProbability": 0.295
}
```

The prediction pipeline:

1. Loads the match from PostgreSQL.
2. Builds feature values using only matches that happened before the requested match.
3. Validates feature columns against `feature_columns.pkl`.
4. Checks for missing, extra, or NaN feature values.
5. Runs `model.predict()`.
6. Runs `model.predict_proba()`.

## Model Artifacts

Generated files are stored in `model/`:

- `model.pkl`: trained Random Forest model
- `feature_columns.pkl`: ordered list of feature columns used during training
- `training_report.json`: dataset validation and training metrics

These files are copied into the Docker image and used by the FastAPI service at startup.
