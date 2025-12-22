// Index centralisé pour tous les cases de BlockRenderer
// Ce fichier mappe les types de blocs vers leurs fonctions de rendu
import React from 'react'
import { RendererCaseFunction } from './types'

// Import des fonctions de rendu existantes
import {
  renderContainer,
  renderFlexContainer,
  renderGridContainer,
  renderColumns,
  renderRows,
  renderSection,
} from '../renderers/layout'
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
} from '../renderers/content'
import {
  renderImage,
  renderVideo,
  renderGallery,
  renderBanner,
  renderCarousel,
  renderAudioPlayer,
  renderLogoGrid,
} from '../renderers/media'
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
} from '../renderers/complex/ComplexRenderers'

// Import des cases inline extraits
import { renderFormNewsletter, renderFormSearch, renderFormInscription, renderForm } from './forms'
import { renderPricingCards } from './complex'
import { renderBookingForm, renderPricingTable, renderServiceZones, renderVehicleGallery, renderContactButtons, renderMap } from './vtc'
import { renderBadges } from './data'
import { renderCountdown, renderProgressBar } from './interactive'

// Import des configs
import {
  DriverProfileConfig,
  EmailButtonConfig,
  SMSButtonConfig,
  VehicleComparisonConfig,
  ServicePackagesConfig,
  ProductGalleryConfig,
  ProductDetailsConfig,
  AddToCartConfig,
  BuyNowConfig,
  TrustBadgesConfig,
  PaymentMethodsConfig,
} from '../blocks-vtc-ecommerce'
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
} from '../blocks-implementations'

// Map de tous les cases - les cases inline seront ajoutés progressivement
const rendererCases: Record<string, RendererCaseFunction> = {
  // Layout
  'container': ({ block, onUpdate }) => renderContainer({ block, onUpdate }),
  'flex-container': ({ block, onUpdate }) => renderFlexContainer({ block, onUpdate }),
  'grid-container': ({ block, onUpdate }) => renderGridContainer({ block, onUpdate }),
  'columns': ({ block, onUpdate }) => renderColumns({ block, onUpdate }),
  'rows': ({ block, onUpdate }) => renderRows({ block, onUpdate }),
  'section': ({ block, onUpdate }) => renderSection({ block, onUpdate }),
  
  // Basic content
  'text': ({ block, onUpdate }) => renderText({ block, onUpdate }),
  'heading': ({ block, onUpdate }) => renderHeading({ block, onUpdate }),
  'paragraph': ({ block, onUpdate }) => renderParagraph({ block, onUpdate }),
  'line': ({ block, onUpdate }) => renderLine({ block, onUpdate }),
  'button': ({ block, onUpdate }) => renderButton({ block, onUpdate }),
  'link': ({ block, onUpdate }) => renderLink({ block, onUpdate }),
  'list': ({ block, onUpdate }) => renderList({ block, onUpdate }),
  'alert': ({ block, onUpdate }) => renderAlert({ block, onUpdate }),
  'code': ({ block, onUpdate }) => renderCode({ block, onUpdate }),
  'table': ({ block, onUpdate }) => renderTable({ block, onUpdate }),
  'quote': ({ block, onUpdate }) => renderQuote({ block, onUpdate }),
  'spacer': ({ block, onUpdate }) => renderSpacer({ block, onUpdate }),
  'divider': ({ block, onUpdate }) => renderDivider({ block, onUpdate }),
  
  // Media
  'image': ({ block, onUpdate }) => renderImage({ block, onUpdate }),
  'video': ({ block, onUpdate }) => renderVideo({ block, onUpdate }),
  'gallery': ({ block, onUpdate }) => renderGallery({ block, onUpdate }),
  'banner': ({ block, onUpdate }) => renderBanner({ block, onUpdate }),
  'carousel': ({ block, onUpdate }) => renderCarousel({ block, onUpdate }),
  'audio-player': ({ block, onUpdate }) => renderAudioPlayer({ block, onUpdate }),
  'logo-grid': ({ block, onUpdate }) => renderLogoGrid({ block, onUpdate }),
  
  // Complex
  'hero': ({ block, onUpdate }) => renderHero({ block, onUpdate }),
  'header': ({ block, onUpdate }) => renderHeader({ block, onUpdate }),
  'footer': ({ block, onUpdate }) => renderFooter({ block, onUpdate }),
  'features-grid': ({ block, onUpdate }) => renderFeaturesGrid({ block, onUpdate }),
  'features_grid': ({ block, onUpdate }) => renderFeaturesGrid({ block, onUpdate }),
  'pricing': ({ block, onUpdate }) => renderPricing({ block, onUpdate }),
  'cta': ({ block, onUpdate }) => renderCTASection({ block, onUpdate }),
  'cta-section': ({ block, onUpdate }) => renderCTASection({ block, onUpdate }),
  'cta_section': ({ block, onUpdate }) => renderCTASection({ block, onUpdate }),
  'testimonials': ({ block, onUpdate }) => renderTestimonials({ block, onUpdate }),
  'timeline': ({ block, onUpdate }) => renderTimeline({ block, onUpdate }),
  'accordion': ({ block, onUpdate }) => renderAccordion({ block, onUpdate }),
  'faq': ({ block, onUpdate }) => renderFAQ({ block, onUpdate }),
  'faq-section': ({ block, onUpdate }) => renderFAQ({ block, onUpdate }),
  'stats': ({ block, onUpdate }) => renderStats({ block, onUpdate }),
  'social-links': ({ block, onUpdate }) => renderSocialLinks({ block, onUpdate }),
  'contact-form': ({ block, onUpdate }) => renderContactForm({ block, onUpdate }),
  'contact_form': ({ block, onUpdate }) => renderContactForm({ block, onUpdate }),
  
  // Forms (inline cases extraits)
  'form-newsletter': renderFormNewsletter,
  'form-search': renderFormSearch,
  'form-inscription': renderFormInscription,
  'form': renderForm,
  
  // Complex inline cases
  'pricing_cards': renderPricingCards,
  'pricing-cards': renderPricingCards,
  
  // VTC inline cases
  'booking-form': renderBookingForm,
  'pricing-table': renderPricingTable,
  'service-zones': renderServiceZones,
  'vehicle-gallery': renderVehicleGallery,
  'contact-buttons': renderContactButtons,
  'map': renderMap,
  
  // Data inline cases
  'badges': renderBadges,
  
  // Interactive inline cases
  'countdown': renderCountdown,
  'progress-bar': renderProgressBar,
  
  // Configs VTC
  'driver-profile': ({ block, onUpdate }) => <DriverProfileConfig block={block} onUpdate={onUpdate} />,
  'email-button': ({ block, onUpdate }) => <EmailButtonConfig block={block} onUpdate={onUpdate} />,
  'sms-button': ({ block, onUpdate }) => <SMSButtonConfig block={block} onUpdate={onUpdate} />,
  'vehicle-comparison': ({ block, onUpdate }) => <VehicleComparisonConfig block={block} onUpdate={onUpdate} />,
  'service-packages': ({ block, onUpdate }) => <ServicePackagesConfig block={block} onUpdate={onUpdate} />,
  
  // Configs E-commerce
  'product-gallery': ({ block, onUpdate }) => <ProductGalleryConfig block={block} onUpdate={onUpdate} />,
  'product-details': ({ block, onUpdate }) => <ProductDetailsConfig block={block} onUpdate={onUpdate} />,
  'add-to-cart': ({ block, onUpdate }) => <AddToCartConfig block={block} onUpdate={onUpdate} />,
  'buy-now': ({ block, onUpdate }) => <BuyNowConfig block={block} onUpdate={onUpdate} />,
  'trust-badges': ({ block, onUpdate }) => <TrustBadgesConfig block={block} onUpdate={onUpdate} />,
  'payment-methods': ({ block, onUpdate }) => <PaymentMethodsConfig block={block} onUpdate={onUpdate} />,
  
  // Configs autres
  'rich-text': ({ block, onUpdate }) => <RichTextEditorConfig block={block} onUpdate={onUpdate} />,
  'markdown': ({ block, onUpdate }) => <MarkdownEditorConfig block={block} onUpdate={onUpdate} />,
  'html-raw': ({ block, onUpdate }) => <HtmlRawConfig block={block} onUpdate={onUpdate} />,
  'icon': ({ block, onUpdate }) => <IconConfig block={block} onUpdate={onUpdate} />,
  'label': ({ block, onUpdate }) => <LabelConfig block={block} onUpdate={onUpdate} />,
  'tooltip': ({ block, onUpdate }) => <TooltipConfig block={block} onUpdate={onUpdate} />,
  'popover': ({ block, onUpdate }) => <PopoverConfig block={block} onUpdate={onUpdate} />,
  'dropdown': ({ block, onUpdate }) => <DropdownConfig block={block} onUpdate={onUpdate} />,
  'categories': ({ block, onUpdate }) => <CategoriesConfig block={block} onUpdate={onUpdate} />,
  'author-box': ({ block, onUpdate }) => <AuthorBoxConfig block={block} onUpdate={onUpdate} />,
  'related-posts': ({ block, onUpdate }) => <RelatedPostsConfig block={block} onUpdate={onUpdate} />,
  'table-of-contents': ({ block, onUpdate }) => <TableOfContentsConfig block={block} onUpdate={onUpdate} />,
  'reading-time': ({ block, onUpdate }) => <ReadingTimeConfig block={block} onUpdate={onUpdate} />,
  'share-buttons': ({ block, onUpdate }) => <ShareButtonsConfig block={block} onUpdate={onUpdate} />,
  'flexbox': ({ block, onUpdate }) => <FlexboxConfig block={block} onUpdate={onUpdate} />,
  'grid': ({ block, onUpdate }) => <GridConfig block={block} onUpdate={onUpdate} />,
  'stack': ({ block, onUpdate }) => <StackConfig block={block} onUpdate={onUpdate} />,
  'inline': ({ block, onUpdate }) => <InlineConfig block={block} onUpdate={onUpdate} />,
  'group': ({ block, onUpdate }) => <GroupConfig block={block} onUpdate={onUpdate} />,
  'wrapper': ({ block, onUpdate }) => <WrapperConfig block={block} onUpdate={onUpdate} />,
  'image-slider': ({ block, onUpdate }) => <ImageSliderConfig block={block} onUpdate={onUpdate} />,
  'lightbox': ({ block, onUpdate }) => <LightboxConfig block={block} onUpdate={onUpdate} />,
  'vimeo-embed': ({ block, onUpdate }) => <VimeoEmbedConfig block={block} onUpdate={onUpdate} />,
  'counter': ({ block, onUpdate }) => <CounterConfig block={block} onUpdate={onUpdate} />,
  'card-grid': ({ block, onUpdate }) => <CardGridConfig block={block} onUpdate={onUpdate} />,
  'logo-carousel': ({ block, onUpdate }) => <LogoCarouselConfig block={block} onUpdate={onUpdate} />,
  'route-calculator': ({ block, onUpdate }) => <RouteCalculatorConfig block={block} onUpdate={onUpdate} />,
  'fare-calculator': ({ block, onUpdate }) => <FareCalculatorConfig block={block} onUpdate={onUpdate} />,
  'availability-calendar': ({ block, onUpdate }) => <AvailabilityCalendarConfig block={block} onUpdate={onUpdate} />,
  'captcha': ({ block, onUpdate }) => <CaptchaConfig block={block} onUpdate={onUpdate} />,
  'form-multi-step': ({ block, onUpdate }) => <FormMultiStepConfig block={block} onUpdate={onUpdate} />,
  'form-conditional': ({ block, onUpdate }) => <FormConditionalConfig block={block} onUpdate={onUpdate} />,
  'form-calculator': ({ block, onUpdate }) => <FormCalculatorConfig block={block} onUpdate={onUpdate} />,
  'form-file-upload': ({ block, onUpdate }) => <FormFileUploadConfig block={block} onUpdate={onUpdate} />,
  'form-payment': ({ block, onUpdate }) => <FormPaymentConfig block={block} onUpdate={onUpdate} />,
  'form-quiz': ({ block, onUpdate }) => <FormQuizConfig block={block} onUpdate={onUpdate} />,
  'form-survey': ({ block, onUpdate }) => <FormSurveyConfig block={block} onUpdate={onUpdate} />,
  'form-poll': ({ block, onUpdate }) => <FormPollConfig block={block} onUpdate={onUpdate} />,
  'form-rsvp': ({ block, onUpdate }) => <FormRSVPConfig block={block} onUpdate={onUpdate} />,
}

export function getBlockRendererCase(blockType: string): RendererCaseFunction | null {
  const normalizedType = blockType.toLowerCase().replace(/_/g, '-')
  return rendererCases[normalizedType] || null
}

