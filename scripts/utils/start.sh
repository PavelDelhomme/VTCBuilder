#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🚀 VTCBuilder - Démarrage Rapide                ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé !${NC}"
    echo -e "${YELLOW}Installez Docker depuis : https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé !${NC}"
    echo -e "${YELLOW}Installez Docker Compose depuis : https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

# Vérifier si Make est installé
if ! command -v make &> /dev/null; then
    echo -e "${YELLOW}⚠️  Make n'est pas installé. Installation recommandée.${NC}"
    echo -e "${BLUE}Vous pouvez utiliser docker-compose directement.${NC}"
    USE_MAKE=false
else
    USE_MAKE=true
fi

echo -e "${GREEN}✅ Tous les prérequis sont installés !${NC}"
echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Création du fichier .env...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        cat > .env << EOF
APP_NAME=VTCBuilder
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=vtcbuilder
DB_USERNAME=vtcbuilder_user
DB_PASSWORD=vtcbuilder_password
REDIS_HOST=redis
EOF
    fi
    echo -e "${GREEN}✅ Fichier .env créé !${NC}"
fi

# Proposer le choix d'installation
echo -e "${BLUE}Que souhaitez-vous faire ?${NC}"
echo ""
echo "  1) 🚀 Installation complète automatique (recommandé)"
echo "  2) 🔧 Installation manuelle étape par étape"
echo "  3) ▶️  Démarrer les services existants"
echo "  4) ❌ Quitter"
echo ""
read -p "Votre choix (1-4) : " choice

case $choice in
    1)
        echo -e "${GREEN}🚀 Démarrage de l'installation complète...${NC}"
        if [ "$USE_MAKE" = true ]; then
            make setup
        else
            echo -e "${BLUE}📦 Construction des images Docker...${NC}"
            docker-compose build
            
            echo -e "${BLUE}🐳 Démarrage des services...${NC}"
            docker-compose up -d
            
            echo -e "${BLUE}⏳ Attente du démarrage de MySQL...${NC}"
            sleep 10
            
            echo -e "${BLUE}📦 Installation des dépendances Composer...${NC}"
            docker exec vtcbuilder_backend composer install --no-interaction || true
            
            echo -e "${BLUE}🔑 Génération de la clé Laravel...${NC}"
            docker exec vtcbuilder_backend php artisan key:generate || true
            
            echo -e "${BLUE}🗄️  Exécution des migrations...${NC}"
            docker exec vtcbuilder_backend php artisan migrate --force || true
            
            echo -e "${BLUE}🌱 Insertion des données de test...${NC}"
            docker exec vtcbuilder_backend php artisan db:seed || true
        fi
        ;;
    2)
        echo -e "${BLUE}📦 Étape 1/5 : Construction des images Docker...${NC}"
        docker-compose build
        
        read -p "Appuyez sur Entrée pour continuer..."
        
        echo -e "${BLUE}🐳 Étape 2/5 : Démarrage des services...${NC}"
        docker-compose up -d
        
        read -p "Appuyez sur Entrée pour continuer..."
        
        echo -e "${BLUE}📦 Étape 3/5 : Installation Composer...${NC}"
        docker exec vtcbuilder_backend composer install --no-interaction || true
        
        read -p "Appuyez sur Entrée pour continuer..."
        
        echo -e "${BLUE}🗄️  Étape 4/5 : Migrations...${NC}"
        docker exec vtcbuilder_backend php artisan migrate --force || true
        
        read -p "Appuyez sur Entrée pour continuer..."
        
        echo -e "${BLUE}🌱 Étape 5/5 : Seeders...${NC}"
        docker exec vtcbuilder_backend php artisan db:seed || true
        ;;
    3)
        echo -e "${GREEN}▶️  Démarrage des services...${NC}"
        if [ "$USE_MAKE" = true ]; then
            make start
        else
            docker-compose up -d
            docker-compose ps
        fi
        ;;
    4)
        echo -e "${YELLOW}👋 Au revoir !${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Choix invalide !${NC}"
        exit 1
        ;;
esac

# Afficher les URLs
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Installation terminée avec succès !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🌐 URLs disponibles :${NC}"
echo ""
echo -e "  ${YELLOW}Frontend:${NC}          http://localhost:3000"
echo -e "  ${YELLOW}Backend API:${NC}       http://localhost:8000"
echo -e "  ${YELLOW}PhpMyAdmin:${NC}        http://localhost:8081"
echo -e "  ${YELLOW}Traefik Dashboard:${NC} http://localhost:5050"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🔑 Comptes par défaut :${NC}"
echo ""
echo -e "  ${YELLOW}Super Admin:${NC}"
echo -e "    Email: admin@example.com"
echo -e "    Password: admin123"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}📚 Commandes utiles :${NC}"
echo ""
if [ "$USE_MAKE" = true ]; then
    echo -e "  ${YELLOW}make help${NC}          - Voir toutes les commandes"
    echo -e "  ${YELLOW}make logs${NC}          - Voir les logs"
    echo -e "  ${YELLOW}make stop${NC}          - Arrêter les services"
    echo -e "  ${YELLOW}make restart${NC}       - Redémarrer"
else
    echo -e "  ${YELLOW}docker-compose logs -f${NC}        - Voir les logs"
    echo -e "  ${YELLOW}docker-compose stop${NC}           - Arrêter les services"
    echo -e "  ${YELLOW}docker-compose restart${NC}        - Redémarrer"
fi
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}🎉 Bon développement !${NC}"
echo ""

