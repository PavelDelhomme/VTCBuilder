#!/bin/bash

# Script de vérification complète des corrections
# Vérifie TypeScript, build Next.js, et autres problèmes potentiels

set -e

FRONTEND_DIR="/home/pactivisme/Documents/Dev/Perso/VTCBuilder/frontend"
PROJECT_ROOT="/home/pactivisme/Documents/Dev/Perso/VTCBuilder"

echo "🔍 Vérification complète du projet..."
echo "========================================"
echo ""

cd "$PROJECT_ROOT"

# Couleurs pour l'output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Fonction pour afficher les résultats
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "1️⃣  Vérification des fichiers modifiés..."
echo "-------------------------------------------"

# Vérifier que les fichiers existent
if [ -f "$FRONTEND_DIR/src/lib/api.ts" ]; then
    print_result 0 "api.ts existe"
    
    # Vérifier que loadDataCalledRef est bien corrigé
    if grep -q "loadDataCalledRef = useRef<string>('')" "$FRONTEND_DIR/src/app/admin/pages-public/edit/[...slug]/page.tsx" 2>/dev/null; then
        print_result 0 "loadDataCalledRef corrigé (useRef<string>)"
    else
        print_result 1 "loadDataCalledRef non corrigé dans page.tsx"
    fi
    
    # Vérifier que authHeaderStr est utilisé dans api.ts
    if grep -q "authHeaderStr = typeof authHeaderBeforeSend" "$FRONTEND_DIR/src/lib/api.ts"; then
        print_result 0 "api.ts ligne 665 corrigé (conversion string)"
    else
        print_result 1 "api.ts ligne 665 non corrigé"
    fi
else
    print_result 1 "api.ts introuvable"
fi

echo ""
echo "2️⃣  Vérification TypeScript..."
echo "-------------------------------------------"

cd "$FRONTEND_DIR"

if command -v npx &> /dev/null; then
    TSC_OUTPUT=$(npx tsc --noEmit 2>&1)
    TSC_EXIT=$?
    
    if [ $TSC_EXIT -eq 0 ]; then
        print_result 0 "TypeScript: Aucune erreur"
    else
        print_result 1 "TypeScript: Erreurs détectées"
        echo "$TSC_OUTPUT" | grep "error TS" | head -10
        echo ""
        print_warning "Il y a des erreurs TypeScript. Voir ci-dessus."
    fi
else
    print_warning "npx non disponible, impossible de vérifier TypeScript"
fi

echo ""
echo "3️⃣  Vérification du build Next.js..."
echo "-------------------------------------------"

if [ -f "$FRONTEND_DIR/package.json" ]; then
    print_info "Lancement du build Next.js (cela peut prendre quelques secondes)..."
    
    # Nettoyer le cache pour un build propre
    if [ -d "$FRONTEND_DIR/.next" ]; then
        rm -rf "$FRONTEND_DIR/.next"
        print_info "Cache Next.js nettoyé"
    fi
    
    BUILD_OUTPUT=$(npm run build 2>&1)
    BUILD_EXIT=$?
    
    if [ $BUILD_EXIT -eq 0 ]; then
        print_result 0 "Build Next.js: Succès ✅"
        
        # Vérifier les messages de succès
        if echo "$BUILD_OUTPUT" | grep -q "Compiled successfully"; then
            print_result 0 "Compilation réussie"
        fi
        
        # Extraire et afficher les statistiques du build
        if echo "$BUILD_OUTPUT" | grep -q "First Load JS"; then
            echo ""
            echo "📊 Statistiques du build:"
            echo "$BUILD_OUTPUT" | grep -A 5 "First Load JS" | head -3
        fi
    else
        print_result 1 "Build Next.js: Échec ❌"
        
        # Extraire les erreurs principales
        echo ""
        echo "🔴 Erreurs détectées:"
        echo "$BUILD_OUTPUT" | grep -E "(error|Error|Failed)" | head -10
        
        # Vérifier spécifiquement les erreurs await
        if echo "$BUILD_OUTPUT" | grep -qi "await isn't allowed"; then
            print_result 1 "Erreur 'await' détectée dans le build"
        else
            print_result 0 "Pas d'erreur 'await' détectée"
        fi
    fi
else
    print_result 1 "package.json introuvable"
fi

echo ""
echo "4️⃣  Vérification des erreurs spécifiques..."
echo "-------------------------------------------"

# Vérifier qu'il n'y a pas d'await dans des fonctions non-async dans api.ts
cd "$FRONTEND_DIR"

# Chercher les await qui ne sont pas dans des fonctions async
if grep -n "await" "$FRONTEND_DIR/src/lib/api.ts" | grep -v "//.*await" | grep -v "async" > /tmp/await_check.txt 2>/dev/null; then
    # Vérifier le contexte (la ligne avant pour voir si c'est dans une fonction async)
    AWAIT_LINES=$(cat /tmp/await_check.txt | cut -d: -f1)
    HAS_BAD_AWAIT=0
    
    for line in $AWAIT_LINES; do
        # Vérifier si la fonction parente est async
        # Chercher la dernière fonction définie avant cette ligne
        if ! sed -n "1,${line}p" "$FRONTEND_DIR/src/lib/api.ts" | grep -E "(async|\.then\(|\.catch\()" | tail -1 | grep -q "async\|\.then\|\.catch"; then
            HAS_BAD_AWAIT=1
            break
        fi
    done
    
    if [ $HAS_BAD_AWAIT -eq 1 ]; then
        print_warning "Await détecté - vérification manuelle recommandée"
    else
        print_result 0 "Pas d'await dans des fonctions non-async"
    fi
    rm -f /tmp/await_check.txt
else
    print_result 0 "Pas d'await suspect détecté"
fi

# Vérifier les types dans page.tsx
if grep -q "loadDataCalledRef.current === currentKey" "$FRONTEND_DIR/src/app/admin/pages-public/edit/[...slug]/page.tsx" 2>/dev/null; then
    # Vérifier que loadDataCalledRef est bien un string ref
    if grep -q "loadDataCalledRef = useRef<string>" "$FRONTEND_DIR/src/app/admin/pages-public/edit/[...slug]/page.tsx"; then
        print_result 0 "Types corrects dans page.tsx (loadDataCalledRef: string)"
    else
        print_result 1 "Types incorrects dans page.tsx"
    fi
fi

echo ""
echo "5️⃣  Vérification des imports et dépendances..."
echo "-------------------------------------------"

if [ -f "$FRONTEND_DIR/node_modules/.bin/next" ]; then
    print_result 0 "Next.js installé"
else
    print_result 1 "Next.js non installé (npm install nécessaire)"
fi

if [ -f "$FRONTEND_DIR/node_modules/.bin/tsc" ]; then
    print_result 0 "TypeScript installé"
else
    print_result 1 "TypeScript non installé"
fi

echo ""
echo "========================================"
echo "📊 RÉSUMÉ FINAL"
echo "========================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 Tout est parfait ! Aucune erreur détectée.${NC}"
    echo ""
    echo "✅ Le projet est prêt pour le développement"
    echo "✅ Vous pouvez lancer: cd frontend && npm run dev"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) détecté(s)${NC}"
    echo ""
    echo "✅ Pas d'erreur critique, mais vérifiez les avertissements ci-dessus"
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s) détectée(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s) détecté(s)${NC}"
    fi
    echo ""
    echo "🔧 Des corrections sont nécessaires avant de continuer"
    exit 1
fi

