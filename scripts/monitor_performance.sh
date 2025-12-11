#!/bin/bash

# Script de monitoring des performances VTCBuilder
# Mesure la consommation mémoire, CPU, I/O disque avant/après optimisations

REPORT_DIR="./performance_reports"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$REPORT_DIR/performance_${TIMESTAMP}.json"

mkdir -p "$REPORT_DIR"

echo "🔍 Collecte des métriques de performance VTCBuilder..."

# Fonction pour obtenir les stats d'un conteneur
get_container_stats() {
    local container=$1
    docker stats --no-stream --format "{{.Container}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}}" "$container" 2>/dev/null || echo "N/A"
}

# Fonction pour obtenir la mémoire totale utilisée
get_total_memory() {
    docker stats --no-stream --format "{{.MemUsage}}" $(docker ps -q) 2>/dev/null | \
    awk '{
        if ($1 ~ /[0-9.]+/) {
            value = $1
            unit = $2
            if (unit == "GiB") value = value * 1024
            if (unit == "MiB") value = value
            if (unit == "KiB") value = value / 1024
            total += value
        }
    } END { printf "%.2f", total }'
}

# Fonction pour obtenir le CPU total
get_total_cpu() {
    docker stats --no-stream --format "{{.CPUPerc}}" $(docker ps -q) 2>/dev/null | \
    sed 's/%//' | \
    awk '{sum += $1; count++} END {if (count > 0) printf "%.2f", sum; else printf "0"}'
}

# Fonction pour obtenir l'utilisation disque
get_disk_usage() {
    docker system df --format "{{.Size}}" 2>/dev/null | head -1
}

# Collecte des métriques
echo "📊 Collecte des métriques..."

# Stats par conteneur
BACKEND_STATS=$(get_container_stats "vtcbuilder-backend")
FRONTEND_STATS=$(get_container_stats "vtcbuilder-frontend")
POSTGRES_STATS=$(get_container_stats "vtcbuilder-postgres")
REDIS_STATS=$(get_container_stats "vtcbuilder-redis")

# Totaux
TOTAL_MEMORY=$(get_total_memory)
TOTAL_CPU=$(get_total_cpu)
DISK_USAGE=$(get_disk_usage)

# Création du rapport JSON
cat > "$REPORT_FILE" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "date": "$(date -Iseconds)",
  "containers": {
    "backend": "$BACKEND_STATS",
    "frontend": "$FRONTEND_STATS",
    "postgres": "$POSTGRES_STATS",
    "redis": "$REDIS_STATS"
  },
  "totals": {
    "memory_mb": "$TOTAL_MEMORY",
    "cpu_percent": "$TOTAL_CPU",
    "disk_usage": "$DISK_USAGE"
  },
  "docker_limits": {
    "backend": {
      "memory_limit": "1GB",
      "cpu_limit": "1.5",
      "memory_reservation": "512MB",
      "cpu_reservation": "0.5"
    },
    "frontend": {
      "memory_limit": "768MB",
      "cpu_limit": "1.0",
      "memory_reservation": "256MB",
      "cpu_reservation": "0.25"
    },
    "postgres": {
      "memory_limit": "512MB",
      "cpu_limit": "1.0",
      "memory_reservation": "256MB",
      "cpu_reservation": "0.25"
    },
    "redis": {
      "memory_limit": "256MB",
      "cpu_limit": "0.5",
      "memory_reservation": "64MB",
      "cpu_reservation": "0.1"
    }
  },
  "optimizations": {
    "gunicorn_workers": 2,
    "postgres_max_connections": 50,
    "postgres_shared_buffers": "128MB",
    "redis_maxmemory": "128MB",
    "node_memory_limit": "512MB",
    "logging_level": "WARNING",
    "cache_enabled": true
  }
}
EOF

echo "✅ Rapport sauvegardé: $REPORT_FILE"
echo ""
echo "📈 Résumé des métriques:"
echo "   Mémoire totale: ${TOTAL_MEMORY} MB"
echo "   CPU total: ${TOTAL_CPU}%"
echo "   Utilisation disque: ${DISK_USAGE}"
echo ""
echo "💾 Rapport JSON disponible: $REPORT_FILE"

