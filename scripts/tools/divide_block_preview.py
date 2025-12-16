#!/usr/bin/env python3
"""
Script pour diviser BlockPreview.tsx en plusieurs fichiers organisés
"""

import re
import os

# Catégories de cases
CATEGORIES = {
    'basic': ['heading', 'text', 'paragraph', 'image', 'button', 'link', 'line', 'icon', 'label'],
    'forms': ['form', 'form-newsletter', 'form-search', 'form-inscription', 'form-login', 
              'booking-form', 'form-multi-step', 'form-conditional', 'form-calculator',
              'form-file-upload', 'form-payment', 'form-quiz', 'form-survey', 'form-poll', 'form-rsvp', 'contact-form'],
    'layout': ['container', 'flex-container', 'grid-container', 'columns', 'rows', 'section',
               'flexbox', 'grid', 'stack', 'inline', 'group', 'wrapper'],
    'complex': ['hero', 'features-grid', 'features_grid', 'cta-section', 'cta_section', 
                'pricing', 'pricing_cards', 'pricing-table', 'testimonials', 'faq-section',
                'banner', 'header', 'footer'],
    'media': ['video', 'video-embed', 'vimeo-embed', 'audio-player', 'gallery', 'image-slider',
              'lightbox', 'carousel'],
    'interactive': ['tabs', 'accordion', 'modal', 'dropdown', 'tooltip', 'popover', 'calendar',
                    'countdown', 'progress-bar', 'progress-circle', 'counter'],
    'data': ['table', 'chart', 'stats', 'timeline', 'list'],
    'vtc': ['service-zones', 'vehicle-gallery', 'route-calculator', 'fare-calculator',
            'availability-calendar', 'driver-profile', 'vehicle-comparison', 'service-packages'],
    'ecommerce': ['product-gallery', 'product-details', 'add-to-cart', 'buy-now',
                  'trust-badges', 'payment-methods'],
    'other': ['quote', 'code', 'alert', 'divider', 'spacer', 'badges', 'social-links',
              'logo-grid', 'team-member', 'card', 'rating', 'icon-box', 'search-bar',
              'breadcrumb', 'tags', 'share-buttons', 'categories', 'author-box',
              'related-posts', 'table-of-contents', 'reading-time', 'rich-text',
              'markdown', 'html-raw', 'map', 'contact-buttons', 'captcha']
}

def main():
    print("Division de BlockPreview.tsx en plusieurs fichiers...")
    print("Cette opération nécessite une refactorisation manuelle complète.")
    print("\nRecommandation:")
    print("1. Garder BlockPreview.tsx comme fichier principal")
    print("2. Extraire progressivement les cases complexes en fonctions séparées")
    print("3. Créer des fichiers renderers/ pour organiser les renderers")
    print("\nLe fichier est trop complexe pour une division automatique complète.")
    print("Il faut le diviser manuellement en plusieurs étapes.")

if __name__ == '__main__':
    main()

