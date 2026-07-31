FROM python:3.12-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Pass a version in at build time: --build-arg APP_VERSION=v2
ARG APP_VERSION=v1
ENV APP_VERSION=${APP_VERSION}

EXPOSE 5000
CMD ["python", "app.py"]
