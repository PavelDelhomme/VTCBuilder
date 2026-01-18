#!/bin/bash
cd /home/pactivisme/Documents/Dev/Perso/VTCBuilder/frontend

echo "🔍 Vérification des erreurs de compilation..."
echo ""

# Vérifier TypeScript
echo "📝 Vérification TypeScript..."
npx tsc --noEmit 2>&1 | head -50
echo ""

# Vérifier Next.js build
echo "📦 Tentative de build Next.js..."
npm run build 2>&1 | tee /tmp/next_build_output.log | tail -100

echo ""
echo "✅ Vérification terminée"
echo "📄 Logs complets sauvegardés dans /tmp/next_build_output.log"

