FROM node:18-slim as frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir gunicorn
COPY . .
COPY --from=frontend /app/dist ./client/dist
RUN mkdir -p /app/client/dist && ls -la /app/client/dist/ || echo "Frontend build failed"
RUN find /app -name "index.html" -type f 2>/dev/null || echo "No index.html found anywhere"
ENV PORT=8080
ENV PYTHONPATH=/app
CMD gunicorn production_app:app --bind 0.0.0.0:$PORT --timeout 120 --workers 1
