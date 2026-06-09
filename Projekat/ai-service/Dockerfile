FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY model/ ./model/

EXPOSE 8000

CMD ["python", "-c", "import os, uvicorn; uvicorn.run('src.app:app', host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))"]