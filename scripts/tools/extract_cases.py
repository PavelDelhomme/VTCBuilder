#!/usr/bin/env python3
"""
Script pour extraire automatiquement tous les cases restants du switch
dans BlockPreview.tsx en fonctions séparées.
"""

import re
import sys

# Cases déjà extraits
EXTRACTED_CASES = {
    'booking-form', 'pricing-table', 'service-zones', 'vehicle-gallery',
    'contact-buttons', 'map', 'form', 'hero', 'features-grid', 'features_grid',
    'cta-section', 'cta_section', 'contact-form', 'availability-calendar',
    'form-multi-step', 'form-conditional', 'form-calculator'
}

def find_case_content(content, case_name, start_pos):
    """Trouve le contenu complet d'un case jusqu'à sa fermeture."""
    # Trouver le début du case
    case_pattern = rf"case\s+['\"]{re.escape(case_name)}['\"]\s*:\s*\{{"
    match = re.search(case_pattern, content[start_pos:])
    if not match:
        return None, None
    
    case_start = start_pos + match.end()
    depth = 1
    pos = case_start
    in_string = False
    string_char = None
    escape_next = False
    
    while pos < len(content) and depth > 0:
        char = content[pos]
        
        if escape_next:
            escape_next = False
            pos += 1
            continue
        
        if char == '\\':
            escape_next = True
            pos += 1
            continue
        
        if not in_string:
            if char in ['"', "'", '`']:
                in_string = True
                string_char = char
            elif char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
        else:
            if char == string_char:
                in_string = False
                string_char = None
        
        pos += 1
    
    if depth == 0:
        return case_start, pos - 1
    
    return None, None

def extract_case_to_function(case_name, case_content):
    """Convertit le contenu d'un case en fonction séparée."""
    # Nettoyer le contenu
    case_content = case_content.strip()
    
    # Créer le nom de la fonction
    func_name = 'render' + ''.join(word.capitalize() for word in case_name.replace('-', '_').replace('_', ' ').split())
    
    # Extraire les variables locales et le return
    # Si le case commence par des déclarations de variables, les garder
    # Sinon, créer une fonction simple
    
    return f"""  const {func_name} = (): React.ReactElement => {{
{case_content}
  }}
"""

def main():
    file_path = 'frontend/src/components/editor/BlockPreview.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Erreur: Fichier {file_path} non trouvé")
        sys.exit(1)
    
    # Trouver tous les cases
    case_pattern = r"case\s+['\"]([^'\"]+)['\"]\s*:\s*\{"
    all_cases = re.finditer(case_pattern, content)
    
    cases_to_extract = []
    for match in all_cases:
        case_name = match.group(1)
        if case_name not in EXTRACTED_CASES and case_name not in ['phone', 'whatsapp', 'email', 'sms']:  # Ignorer les sous-cases
            cases_to_extract.append((case_name, match.start()))
    
    print(f"Cases à extraire: {len(cases_to_extract)}")
    
    # Trouver où insérer les nouvelles fonctions (avant getBlockContent)
    get_block_content_pos = content.find('const getBlockContent = (): React.ReactElement => {')
    if get_block_content_pos == -1:
        print("Erreur: Impossible de trouver getBlockContent")
        sys.exit(1)
    
    # Trouver la position juste avant getBlockContent
    insert_pos = content.rfind('}', 0, get_block_content_pos)
    insert_pos = content.rfind('\n', 0, insert_pos)
    
    # Extraire les cases et créer les fonctions
    new_functions = []
    replacements = []
    
    for case_name, case_start in reversed(cases_to_extract):  # Reversed pour préserver les positions
        case_start_pos, case_end_pos = find_case_content(content, case_name, case_start)
        if case_start_pos and case_end_pos:
            case_content = content[case_start_pos:case_end_pos]
            
            # Créer la fonction
            func_name = 'render' + ''.join(word.capitalize() for word in case_name.replace('-', '_').replace('_', ' ').split())
            func_code = f"""  const {func_name} = (): React.ReactElement => {{
{case_content}
  }}
"""
            new_functions.append(func_code)
            
            # Créer le replacement pour le switch
            replacement = f"""    case '{case_name}': {{
      return {func_name}()
    }}"""
            replacements.append((case_start, case_end_pos + 1, replacement))
    
    # Insérer les nouvelles fonctions
    if new_functions:
        functions_code = '\n'.join(new_functions) + '\n\n'
        content = content[:insert_pos] + functions_code + content[insert_pos:]
    
    # Remplacer les cases dans le switch (en ordre inverse pour préserver les positions)
    for case_start, case_end, replacement in replacements:
        content = content[:case_start] + replacement + content[case_end:]
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Extraction terminée: {len(new_functions)} fonctions créées")

if __name__ == '__main__':
    main()

