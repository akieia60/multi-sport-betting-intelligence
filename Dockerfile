FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir gunicorn
COPY . .
RUN if [ -d "dist/public" ]; then cp -r dist/public dist/static; fi
ENV PORT=8080
CMD gunicorn app:app --bind 0.0.0.0:$PORT
