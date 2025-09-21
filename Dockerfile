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
COPY --from=frontend /app/dist ./dist
RUN ls -la /app/dist/public/ || echo "Frontend build failed"
ENV PORT=8080
CMD gunicorn app:app --bind 0.0.0.0:$PORT
