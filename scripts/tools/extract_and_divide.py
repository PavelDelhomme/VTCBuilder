#!/usr/bin/env python3
"""
Script pour extraire tous les cases et diviser BlockPreview.tsx en plusieurs fichiers
"""

import re
import os

# Catégories de cases pour organiser les fichiers
CATEGORIES = {
    'basic': ['heading', 'text', 'paragraph', 'image', 'button', 'link', 'line', 'icon', 'label', 'spacer', 'divider', 'alert', 'code', 'quote', 'rich-text', 'markdown', 'html-raw'],
    'forms': ['form', 'form-newsletter', 'form-search', 'form-inscription', 'form-login', 'booking-form', 'form-multi-step', 'form-conditional', 'form-calculator', 'form-file-upload', 'form-payment', 'form-quiz', 'form-survey', 'form-poll', 'form-rsvp', 'contact-form', 'captcha'],
    'layout': ['container', 'flex-container', 'grid-container', 'columns', 'rows', 'section', 'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper'],
    'complex': ['hero', 'features-grid', 'features_grid', 'cta-section', 'cta_section', 'pricing', 'pricing_cards', 'pricing-table', 'testimonials', 'faq-section', 'banner', 'header', 'footer'],
    'media': ['video', 'video-embed', 'vimeo-embed', 'audio-player', 'gallery', 'image-slider', 'lightbox', 'carousel'],
    'interactive': ['tabs', 'accordion', 'modal', 'dropdown', 'tooltip', 'popover', 'calendar', 'countdown', 'progress-bar', 'progress-circle', 'counter'],
    'data': ['table', 'chart', 'stats', 'timeline', 'list'],
    'vtc': ['service-zones', 'vehicle-gallery', 'route-calculator', 'fare-calculator', 'availability-calendar', 'driver-profile', 'vehicle-comparison', 'service-packages', 'contact-buttons', 'map'],
    'ecommerce': ['product-gallery', 'product-details', 'add-to-cart', 'buy-now', 'trust-badges', 'payment-methods'],
    'other': ['badges', 'social-links', 'logo-grid', 'team-member', 'card', 'rating', 'icon-box', 'search-bar', 'breadcrumb', 'tags', 'share-buttons', 'categories', 'author-box', 'related-posts', 'table-of-contents', 'reading-time', 'email-button', 'sms-button']
}

def main():
    file_path = 'frontend/src/components/editor/BlockPreview.tsx'
    renderers_dir = 'frontend/src/components/editor/renderers'
    
    os.makedirs(renderers_dir, exist_ok=True)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Trouver tous les cases
    case_pattern = r"case\s+['\"]([^'\"]+)['\"]\s*:\s*\{"
    all_cases = re.findall(case_pattern, content)
    
    print(f"Total cases: {len(all_cases)}")
    print(f"\nOrganisation par catégorie:")
    for category, cases_list in CATEGORIES.items():
        matching = [c for c in all_cases if c in cases_list]
        print(f"  {category}: {len(matching)} cases")
    
    print("\n⚠️  Le fichier est trop complexe pour une division automatique complète.")
    print("Recommandation: Extraire manuellement les cases les plus volumineux")
    print("et créer les fichiers renderers progressivement.")

if __name__ == '__main__':
    main()

