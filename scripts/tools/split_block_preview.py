#!/usr/bin/env python3
"""
Script pour diviser BlockPreview.tsx en plusieurs fichiers plus petits
et mieux structurés.
"""

import re
import os

def main():
    file_path = 'frontend/src/components/editor/BlockPreview.tsx'
    renderers_dir = 'frontend/src/components/editor/renderers'
    
    # Créer le répertoire renderers
    os.makedirs(renderers_dir, exist_ok=True)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire les imports et le début du fichier
    imports_match = re.search(r"(.*?)(function BlockPreviewRenderer)", content, re.DOTALL)
    if not imports_match:
        print("Erreur: Impossible de trouver BlockPreviewRenderer")
        return
    
    imports = imports_match.group(1)
    block_preview_renderer_start = imports_match.start(2)
    
    # Extraire BlockPreviewRenderer jusqu'à getBlockContent
    get_block_content_match = re.search(r"(const getBlockContent = \(\): React\.ReactElement => \{)", content[block_preview_renderer_start:])
    if not get_block_content_match:
        print("Erreur: Impossible de trouver getBlockContent")
        return
    
    # Extraire la partie avant getBlockContent (variables, fonctions helper, etc.)
    before_get_block_content = content[block_preview_renderer_start:block_preview_renderer_start + get_block_content_match.start()]
    
    # Extraire le switch complet
    switch_match = re.search(r"(switch \(block\.type\) \{)(.*?)(\n    default:)", content, re.DOTALL)
    if not switch_match:
        print("Erreur: Impossible de trouver le switch")
        return
    
    switch_content = switch_match.group(2)
    default_case = switch_match.group(3)
    
    # Extraire la fin du fichier (après le switch)
    after_switch_match = re.search(r"(default:.*?\n    \}\n  \}\n\n  const content = getBlockContent\(\))(.*?)(function BlockPreview)", content, re.DOTALL)
    if not after_switch_match:
        # Chercher la fin différemment
        after_switch_match = re.search(r"(default:.*?\n    \}\n  \}\n\n  const content = getBlockContent\(\))(.*?)(export)", content, re.DOTALL)
    
    if after_switch_match:
        after_switch = after_switch_match.group(2)
        block_preview_end = after_switch_match.start(3)
    else:
        after_switch = ""
        block_preview_end = len(content)
    
    # Extraire BlockPreview (le composant principal)
    block_preview_component = content[block_preview_renderer_start + get_block_content_match.start() + len(get_block_content_match.group(1)):block_preview_end]
    
    print("Structure extraite avec succès")
    print(f"- Imports: {len(imports)} caractères")
    print(f"- Avant getBlockContent: {len(before_get_block_content)} caractères")
    print(f"- Switch content: {len(switch_content)} caractères")
    print(f"- Après switch: {len(after_switch)} caractères")
    
    # Pour l'instant, créons un fichier simplifié qui importe les renderers
    # Le vrai travail de division sera fait manuellement car c'est complexe
    
    print("\nLe fichier est trop complexe pour une division automatique complète.")
    print("Recommandation: Diviser manuellement en:")
    print("1. BlockPreview.tsx - Composant principal")
    print("2. renderers/BlockPreviewRenderer.tsx - Le renderer principal")
    print("3. renderers/basic.tsx - Cases simples (heading, text, image, etc.)")
    print("4. renderers/forms.tsx - Tous les formulaires")
    print("5. renderers/complex.tsx - Cases complexes (hero, features-grid, etc.)")
    print("6. renderers/layout.tsx - Cases de layout (container, flex-container, etc.)")

if __name__ == '__main__':
    main()

