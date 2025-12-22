'use client'

import React from 'react'
import { Block } from './types'
import { BlockType } from '@/services/blocks.service'
import { CollapsibleSection } from './CollapsibleSection'
import UrlInputWithSuggestions from './ui/UrlInputWithSuggestions'
import PageSelector from './ui/PageSelector'
import ImageSelector from './ui/ImageSelector'
import {
  RichTextEditorConfig,
  MarkdownEditorConfig,
  HtmlRawConfig,
  IconConfig,
  LabelConfig,
  TooltipConfig,
  PopoverConfig,
  DropdownConfig,
  CategoriesConfig,
  AuthorBoxConfig,
  RelatedPostsConfig,
  TableOfContentsConfig,
  ReadingTimeConfig,
  ShareButtonsConfig,
  FlexboxConfig,
  GridConfig,
  StackConfig,
  InlineConfig,
  GroupConfig,
  WrapperConfig,
  ImageSliderConfig,
  LightboxConfig,
  VimeoEmbedConfig,
  CounterConfig,
  CardGridConfig,
  LogoCarouselConfig,
  RouteCalculatorConfig,
  FareCalculatorConfig,
  AvailabilityCalendarConfig,
  CaptchaConfig,
  FormMultiStepConfig,
  FormConditionalConfig,
  FormCalculatorConfig,
  FormFileUploadConfig,
  FormPaymentConfig,
  FormQuizConfig,
  FormSurveyConfig,
  FormPollConfig,
  FormRSVPConfig,
} from './blocks-implementations'
import {
  DriverProfileConfig,
  EmailButtonConfig,
  SMSButtonConfig,
  ProductGalleryConfig,
  ProductDetailsConfig,
  AddToCartConfig,
  BuyNowConfig,
  VehicleComparisonConfig,
  ServicePackagesConfig,
  TrustBadgesConfig,
  PaymentMethodsConfig,
} from './blocks-vtc-ecommerce'
import {
  renderContainer,
  renderFlexContainer,
  renderGridContainer,
  renderColumns,
  renderRows,
  renderSection,
} from './renderers/layout'
import {
  renderText,
  renderHeading,
  renderParagraph,
  renderLine,
  renderButton,
  renderLink,
  renderList,
  renderAlert,
  renderCode,
  renderTable,
  renderQuote,
  renderSpacer,
  renderDivider,
} from './renderers/content'
import {
  renderImage,
  renderVideo,
  renderGallery,
  renderBanner,
  renderCarousel,
  renderAudioPlayer,
  renderLogoGrid,
} from './renderers/media'
import {
  renderHero,
  renderHeader,
  renderFooter,
  renderFeaturesGrid,
  renderPricing,
  renderCTASection,
  renderTestimonials,
  renderTimeline,
  renderAccordion,
  renderStats,
  renderSocialLinks,
  renderFAQ,
  renderContactForm,
} from './renderers/complex/ComplexRenderers'
import { getBlockRendererCase } from './renderer-cases'

export function BlockRenderer({
  block,
  blockType,
  onUpdate,
}: {
  block: Block
  blockType?: BlockType
  onUpdate: (updates: Partial<Block>) => void
}) {
  // Protection complète : s'assurer que block et block.data existent
  if (!block) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
        <p className="text-sm font-semibold">Erreur : Bloc non défini</p>
      </div>
    )
  }
  
  const safeBlock = { 
    ...block, 
    data: block.data || {},
    styles: block.styles || {},
    type: block.type || 'text'
  }
  
  // Normaliser le type de bloc (minuscules, remplacer underscores par tirets)
  const normalizedType = (safeBlock.type || '').toLowerCase().replace(/_/g, '-')
  
  // Essayer d'obtenir le renderer depuis les cases extraits
  const rendererCase = getBlockRendererCase(normalizedType)
  if (rendererCase) {
    return rendererCase({ block: safeBlock, blockType, onUpdate })
  }
  
  // Fallback vers le switch statement pour les cases non extraits
  switch (normalizedType) {
    case 'container':
      return renderContainer({ block, onUpdate })
    
    case 'flex-container':
      return renderFlexContainer({ block, onUpdate })
    
    case 'grid-container':
      return renderGridContainer({ block, onUpdate })
    
    case 'text':
      return renderText({ block, onUpdate })
    case 'heading':
      return renderHeading({ block, onUpdate })
    case 'image':
      return renderImage({ block, onUpdate })
    case 'button':
      return renderButton({ block, onUpdate })
    case 'video':
      return renderVideo({ block, onUpdate })
    case 'spacer':
      return renderSpacer({ block, onUpdate })
    case 'divider':
      return renderDivider({ block, onUpdate })
    case 'alert':
      return renderAlert({ block, onUpdate })
    case 'code':
      return renderCode({ block, onUpdate })
    case 'table':
      return renderTable({ block, onUpdate })
    case 'rows':
      return renderRows({ block, onUpdate })
    case 'paragraph':
      return renderParagraph({ block, onUpdate })
    case 'line':
      return renderLine({ block, onUpdate })
    case 'testimonials':
      return renderTestimonials({ block, onUpdate })
    case 'features-grid':
    case 'features_grid': // Alias pour compatibilité
      return renderFeaturesGrid({ block, onUpdate })
    
    case 'pricing':
      return renderPricing({ block, onUpdate })
    case 'timeline':
      return renderTimeline({ block, onUpdate })
    case 'accordion':
      return renderAccordion({ block, onUpdate })
    case 'faq':
    case 'faq-section':
      return renderFAQ({ block, onUpdate })
    case 'stats':
      return renderStats({ block, onUpdate })
    case 'social-links':
      return renderSocialLinks({ block, onUpdate })
    case 'columns':
      return renderColumns({ block, onUpdate })
    case 'hero':
      return renderHero({ block, onUpdate })
    case 'gallery':
      return renderGallery({ block, onUpdate })
    case 'banner':
      return renderBanner({ block, onUpdate })
    case 'cta':
    case 'cta-section':
    case 'cta_section':
      return renderCTASection({ block, onUpdate })
    case 'contact-form':
    case 'contact_form':
      return renderContactForm({ block, onUpdate })
    case 'header':
      return renderHeader({ block, onUpdate })
    
    case 'footer':
      return renderFooter({ block, onUpdate })
    case 'section':
      return renderSection({ block, onUpdate })
    case 'carousel':
      return renderCarousel({ block, onUpdate })
    case 'quote':
      return renderQuote({ block, onUpdate })

    case 'logo-grid':
      return renderLogoGrid({ block, onUpdate })

    case 'audio-player':
      return renderAudioPlayer({ block, onUpdate })

    case 'list':
      return renderList({ block, onUpdate })

    case 'rich-text':
      return <RichTextEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'markdown':
      return <MarkdownEditorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'html-raw':
      return <HtmlRawConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'icon':
      return <IconConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'label':
      return <LabelConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'tooltip':
      return <TooltipConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'popover':
      return <PopoverConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'dropdown':
      return <DropdownConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'categories':
      return <CategoriesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'author-box':
      return <AuthorBoxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'related-posts':
      return <RelatedPostsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'table-of-contents':
      return <TableOfContentsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'reading-time':
      return <ReadingTimeConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'share-buttons':
      return <ShareButtonsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'flexbox':
      return <FlexboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'grid':
      return <GridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'stack':
      return <StackConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'inline':
      return <InlineConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'group':
      return <GroupConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'wrapper':
      return <WrapperConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'image-slider':
      return <ImageSliderConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'lightbox':
      return <LightboxConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vimeo-embed':
      return <VimeoEmbedConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'counter':
      return <CounterConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'card-grid':
      return <CardGridConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'logo-carousel':
      return <LogoCarouselConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'route-calculator':
      return <RouteCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'fare-calculator':
      return <FareCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'availability-calendar':
      return <AvailabilityCalendarConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'captcha':
      return <CaptchaConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-multi-step':
      return <FormMultiStepConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-conditional':
      return <FormConditionalConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-calculator':
      return <FormCalculatorConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-file-upload':
      return <FormFileUploadConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-payment':
      return <FormPaymentConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-quiz':
      return <FormQuizConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-survey':
      return <FormSurveyConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-poll':
      return <FormPollConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'form-rsvp':
      return <FormRSVPConfig block={safeBlock} onUpdate={onUpdate} />

    // Blocs VTC
    case 'driver-profile':
      return <DriverProfileConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'email-button':
      return <EmailButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'sms-button':
      return <SMSButtonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'vehicle-comparison':
      return <VehicleComparisonConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'service-packages':
      return <ServicePackagesConfig block={safeBlock} onUpdate={onUpdate} />
    
    // Blocs E-commerce
    case 'product-gallery':
      return <ProductGalleryConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'product-details':
      return <ProductDetailsConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'add-to-cart':
      return <AddToCartConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'buy-now':
      return <BuyNowConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'trust-badges':
      return <TrustBadgesConfig block={safeBlock} onUpdate={onUpdate} />
    
    case 'payment-methods':
      return <PaymentMethodsConfig block={safeBlock} onUpdate={onUpdate} />

    default:
      return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bloc {block.type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Configuration à venir</p>
          {blockType?.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{blockType.description}</p>
          )}
            </div>
          </div>
        </div>
      )
  }
}
