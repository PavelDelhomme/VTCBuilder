FROM python:3.12-slim

# Arguments
ARG user=vtcbuilder
ARG uid=1000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    netcat-openbsd \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Create system user
RUN useradd -m -u $uid -s /bin/bash $user

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . /app/

# Create necessary directories
RUN mkdir -p /app/media /app/static /app/logs /var/log

# Set ownership
RUN chown -R $user:$user /app

# Switch to user
USER $user

# Expose port
EXPOSE 8000

# Run Django
# Optimisation: Réduire les workers pour économiser la mémoire
# Utiliser 2 workers au lieu de 4 (réduction de 50% de la mémoire)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--threads", "2", "--worker-class", "sync", "--timeout", "120", "--keep-alive", "5", "--max-requests", "1000", "--max-requests-jitter", "100", "vtcbuilder.wsgi:application"]

