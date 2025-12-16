#!/usr/bin/env python3
"""
Script pour extraire TOUS les cases restants en fonctions séparées
et modifier le switch pour les utiliser.
"""

import re
import sys

def find_case_end(content, start_pos):
    """Trouve la fin d'un case (jusqu'à la fermeture } du case)."""
    pos = start_pos
    depth = 1
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
        return pos - 1
    
    return None

def extract_case_name_and_content(content, match):
    """Extrait le nom et le contenu d'un case."""
    case_name = match.group(1)
    case_start = match.end()
    
    # Trouver la fin du case
    case_end = find_case_end(content, case_start)
    if not case_end:
        return None, None, None
    
    # Extraire le contenu (sans le case 'name': { et le })
    case_content = content[case_start:case_end].strip()
    
    # Enlever le dernier } si présent
    if case_content.endswith('}'):
        case_content = case_content[:-1].strip()
    
    return case_name, case_content, case_end + 1

def create_function_name(case_name):
    """Crée un nom de fonction à partir du nom du case."""
    # Remplacer - et _ par des espaces, puis capitaliser chaque mot
    words = re.sub(r'[-_]', ' ', case_name).split()
    return 'render' + ''.join(word.capitalize() for word in words)

def main():
    file_path = 'frontend/src/components/editor/BlockPreview.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Erreur: Fichier {file_path} non trouvé")
        sys.exit(1)
    
    # Cases déjà extraits (ceux qui utilisent des imports externes)
    already_extracted = {'heading', 'text', 'image', 'button'}
    
    # Trouver tous les cases dans le switch
    switch_start = content.find('switch (block.type) {')
    if switch_start == -1:
        print("Erreur: Impossible de trouver le switch")
        sys.exit(1)
    
    # Trouver tous les cases
    case_pattern = r"case\s+['\"]([^'\"]+)['\"]\s*:\s*\{"
    all_cases = list(re.finditer(case_pattern, content[switch_start:]))
    
    print(f"Total cases trouvés: {len(all_cases)}")
    
    # Trouver où insérer les nouvelles fonctions (avant getBlockContent)
    get_block_content_pos = content.find('const getBlockContent = (): React.ReactElement => {')
    if get_block_content_pos == -1:
        print("Erreur: Impossible de trouver getBlockContent")
        sys.exit(1)
    
    # Trouver la position d'insertion (juste avant getBlockContent)
    insert_pos = content.rfind('\n  // Function to render block content', 0, get_block_content_pos)
    if insert_pos == -1:
        insert_pos = content.rfind('\n  const getBlockContent', 0, get_block_content_pos)
    
    if insert_pos == -1:
        print("Erreur: Impossible de trouver la position d'insertion")
        sys.exit(1)
    
    # Extraire les cases et créer les fonctions
    new_functions = []
    replacements = []
    
    # Traiter les cases en ordre inverse pour préserver les positions
    for match in reversed(all_cases):
        case_name = match.group(1)
        
        # Ignorer les cases déjà extraits et les sous-cases
        if case_name in already_extracted or case_name in ['phone', 'whatsapp', 'email', 'sms', 'left', 'center', 'right', 'stretch', 'scale', 'lift', 'fade', 'rotate', 'glow']:
            continue
        
        # Trouver le contenu du case
        actual_match_start = switch_start + match.start()
        case_name_found, case_content, case_end = extract_case_name_and_content(content, re.match(case_pattern, content[actual_match_start:]))
        
        if not case_name_found or not case_content:
            print(f"Attention: Impossible d'extraire le case '{case_name}'")
            continue
        
        # Créer le nom de la fonction
        func_name = create_function_name(case_name)
        
        # Créer le code de la fonction
        func_code = f"""  const {func_name} = (): React.ReactElement => {{
{case_content}
  }}
"""
        new_functions.append((func_name, func_code, actual_match_start, case_end))
        
        # Créer le replacement pour le switch
        replacement = f"""    case '{case_name}': {{
      return {func_name}()
    }}"""
        replacements.append((actual_match_start, case_end, replacement, case_name))
    
    print(f"Cases à extraire: {len(new_functions)}")
    
    # Insérer les nouvelles fonctions (en ordre normal)
    if new_functions:
        functions_code = '\n'.join([f[1] for f in sorted(new_functions, key=lambda x: x[2])]) + '\n\n'
        content = content[:insert_pos] + functions_code + content[insert_pos:]
        
        # Ajuster les positions après insertion
        insert_offset = len(functions_code)
        replacements = [(start + insert_offset, end + insert_offset, repl, name) 
                       for start, end, repl, name in replacements if start > insert_pos]
    
    # Remplacer les cases dans le switch (en ordre inverse)
    for start, end, replacement, case_name in sorted(replacements, key=lambda x: x[0], reverse=True):
        content = content[:start] + replacement + content[end:]
        print(f"  ✓ Extrait: {case_name} -> {create_function_name(case_name)}")
    
    # Sauvegarder
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\nExtraction terminée: {len(new_functions)} fonctions créées")

if __name__ == '__main__':
    main()

