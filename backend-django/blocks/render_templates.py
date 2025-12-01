"""
Default render templates for blocks
These templates are stored in the database and can be customized by admins
"""
from typing import Dict, Any

# Templates de rendu par défaut pour chaque type de bloc
# Structure: { component: 'div', props: {...}, children: [...] }
DEFAULT_RENDER_TEMPLATES: Dict[str, Dict[str, Any]] = {
    'heading': {
        'type': 'component',
        'component': 'heading',
        'props': {
            'className': 'mb-6',
            'style': {
                'textAlign': '{{data.align}}',
                'fontSize': '{{styles.font_size}}',
                'fontWeight': '{{styles.font_weight}}',
                'color': '{{data.color}}',
            }
        },
        'children': '{{data.text}}',
        'level': '{{data.level}}',
    },
    'text': {
        'type': 'component',
        'component': 'div',
        'props': {
            'className': 'mb-6 prose dark:prose-invert max-w-none',
            'dangerouslySetInnerHTML': True,
            'style': {
                'fontSize': '{{styles.font_size}}',
                'lineHeight': '{{styles.line_height}}',
            }
        },
        'content': '{{data.content}}',
    },
    'image': {
        'type': 'component',
        'component': 'img',
        'props': {
            'className': 'rounded-lg shadow-md',
            'style': {
                'width': '{{data.width}}%',
                'maxWidth': '100%',
            }
        },
        'src': '{{data.url}}',
        'alt': '{{data.alt}}',
    },
    'button': {
        'type': 'component',
        'component': 'a',
        'props': {
            'className': 'inline-block px-6 py-3 rounded-lg font-medium transition-colors',
            'href': '{{data.url}}',
            'style': {
                'backgroundColor': '{{data.background_color}}',
                'color': '{{data.text_color}}',
            }
        },
        'children': '{{data.text}}',
    },
    # ... autres templates seront ajoutés progressivement
}

def get_default_render_template(block_name: str) -> Dict[str, Any]:
    """Get default render template for a block type"""
    return DEFAULT_RENDER_TEMPLATES.get(block_name, {
        'type': 'component',
        'component': 'div',
        'props': {
            'className': 'mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded',
        },
        'children': f'Bloc {block_name}',
    })

