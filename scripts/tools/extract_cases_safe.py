#!/usr/bin/env python3
"""
Script sûr pour extraire les cases en fonctions séparées
en préservant la structure du fichier
"""

import re
import sys

def main():
    file_path = 'frontend/src/components/editor/BlockPreview.tsx'
    
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Trouver la ligne de getBlockContent
    get_block_content_line = None
    for i, line in enumerate(lines):
        if 'const getBlockContent = (): React.ReactElement => {' in line:
            get_block_content_line = i
            break
    
    if get_block_content_line is None:
        print("Erreur: Impossible de trouver getBlockContent")
        sys.exit(1)
    
    # Trouver où insérer les fonctions (juste avant getBlockContent)
    insert_line = get_block_content_line - 1
    
    # Extraire les cases un par un manuellement pour les plus importants
    # Pour l'instant, créons juste la structure de base
    
    print("Script de division sécurisée")
    print(f"Fichier: {len(lines)} lignes")
    print(f"Position d'insertion: ligne {insert_line}")
    print("\nRecommandation: Diviser manuellement le fichier en:")
    print("1. BlockPreview.tsx - Composant principal (garde le switch mais réduit)")
    print("2. renderers/complex.tsx - Cases complexes (hero, features-grid, etc.)")
    print("3. renderers/forms.tsx - Tous les formulaires")
    print("4. renderers/layout.tsx - Cases de layout")
    print("5. renderers/vtc.tsx - Cases spécifiques VTC")
    print("6. renderers/basic.tsx - Cases de base (déjà créé)")

if __name__ == '__main__':
    main()

