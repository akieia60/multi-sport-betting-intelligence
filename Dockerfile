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
RUN ls -la /app/client/dist/ || echo "Frontend build failed"
ENV PORT=8080
CMD gunicorn simple_app:app --bind 0.0.0.0:$PORT
