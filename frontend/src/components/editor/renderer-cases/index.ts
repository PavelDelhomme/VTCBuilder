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
import { renderBookingForm } from './vtc-forms'
import { renderPricingTable, renderServiceZones, renderVehicleGallery, renderContactButtons, renderMap } from './vtc-display'
import { renderBadges } from './data'
import { renderCountdown, renderProgressBar, renderTabs, renderProgressCircle, renderModal } from './interactive'
import { renderIconBox, renderFeatureCard, renderTeamMember, renderCard } from './content-cards'
import { renderVideoEmbed } from './content-media'
import { renderRating } from './content-display'
import { renderBreadcrumb, renderTags, renderSearchBar, renderPagination, renderLink } from './content-navigation'
import { renderChart, renderCalendar } from './data'

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
  
  // Content inline cases
  'icon-box': renderIconBox,
  'feature-card': renderFeatureCard,
  'video-embed': renderVideoEmbed,
  'team-member': renderTeamMember,
  'card': renderCard,
  'rating': renderRating,
  'breadcrumb': renderBreadcrumb,
  'tags': renderTags,
  'search-bar': renderSearchBar,
  'pagination': renderPagination,
  'link': renderLink,
  
  // Interactive inline cases (continued)
  'tabs': renderTabs,
  'progress-circle': renderProgressCircle,
  'modal': renderModal,
  
  // Data inline cases (continued)
  'chart': renderChart,
  'calendar': renderCalendar,
  
  // Configs VTC
  'driver-profile': ({ block, onUpdate }) => React.createElement(DriverProfileConfig, { block, onUpdate }),
  'email-button': ({ block, onUpdate }) => React.createElement(EmailButtonConfig, { block, onUpdate }),
  'sms-button': ({ block, onUpdate }) => React.createElement(SMSButtonConfig, { block, onUpdate }),
  'vehicle-comparison': ({ block, onUpdate }) => React.createElement(VehicleComparisonConfig, { block, onUpdate }),
  'service-packages': ({ block, onUpdate }) => React.createElement(ServicePackagesConfig, { block, onUpdate }),
  
  // Configs E-commerce
  'product-gallery': ({ block, onUpdate }) => React.createElement(ProductGalleryConfig, { block, onUpdate }),
  'product-details': ({ block, onUpdate }) => React.createElement(ProductDetailsConfig, { block, onUpdate }),
  'add-to-cart': ({ block, onUpdate }) => React.createElement(AddToCartConfig, { block, onUpdate }),
  'buy-now': ({ block, onUpdate }) => React.createElement(BuyNowConfig, { block, onUpdate }),
  'trust-badges': ({ block, onUpdate }) => React.createElement(TrustBadgesConfig, { block, onUpdate }),
  'payment-methods': ({ block, onUpdate }) => React.createElement(PaymentMethodsConfig, { block, onUpdate }),
  
  // Configs autres
  'rich-text': ({ block, onUpdate }) => React.createElement(RichTextEditorConfig, { block, onUpdate }),
  'markdown': ({ block, onUpdate }) => React.createElement(MarkdownEditorConfig, { block, onUpdate }),
  'html-raw': ({ block, onUpdate }) => React.createElement(HtmlRawConfig, { block, onUpdate }),
  'icon': ({ block, onUpdate }) => React.createElement(IconConfig, { block, onUpdate }),
  'label': ({ block, onUpdate }) => React.createElement(LabelConfig, { block, onUpdate }),
  'tooltip': ({ block, onUpdate }) => React.createElement(TooltipConfig, { block, onUpdate }),
  'popover': ({ block, onUpdate }) => React.createElement(PopoverConfig, { block, onUpdate }),
  'dropdown': ({ block, onUpdate }) => React.createElement(DropdownConfig, { block, onUpdate }),
  'categories': ({ block, onUpdate }) => React.createElement(CategoriesConfig, { block, onUpdate }),
  'author-box': ({ block, onUpdate }) => React.createElement(AuthorBoxConfig, { block, onUpdate }),
  'related-posts': ({ block, onUpdate }) => React.createElement(RelatedPostsConfig, { block, onUpdate }),
  'table-of-contents': ({ block, onUpdate }) => React.createElement(TableOfContentsConfig, { block, onUpdate }),
  'reading-time': ({ block, onUpdate }) => React.createElement(ReadingTimeConfig, { block, onUpdate }),
  'share-buttons': ({ block, onUpdate }) => React.createElement(ShareButtonsConfig, { block, onUpdate }),
  'flexbox': ({ block, onUpdate }) => React.createElement(FlexboxConfig, { block, onUpdate }),
  'grid': ({ block, onUpdate }) => React.createElement(GridConfig, { block, onUpdate }),
  'stack': ({ block, onUpdate }) => React.createElement(StackConfig, { block, onUpdate }),
  'inline': ({ block, onUpdate }) => React.createElement(InlineConfig, { block, onUpdate }),
  'group': ({ block, onUpdate }) => React.createElement(GroupConfig, { block, onUpdate }),
  'wrapper': ({ block, onUpdate }) => React.createElement(WrapperConfig, { block, onUpdate }),
  'image-slider': ({ block, onUpdate }) => React.createElement(ImageSliderConfig, { block, onUpdate }),
  'lightbox': ({ block, onUpdate }) => React.createElement(LightboxConfig, { block, onUpdate }),
  'vimeo-embed': ({ block, onUpdate }) => React.createElement(VimeoEmbedConfig, { block, onUpdate }),
  'counter': ({ block, onUpdate }) => React.createElement(CounterConfig, { block, onUpdate }),
  'card-grid': ({ block, onUpdate }) => React.createElement(CardGridConfig, { block, onUpdate }),
  'logo-carousel': ({ block, onUpdate }) => React.createElement(LogoCarouselConfig, { block, onUpdate }),
  'route-calculator': ({ block, onUpdate }) => React.createElement(RouteCalculatorConfig, { block, onUpdate }),
  'fare-calculator': ({ block, onUpdate }) => React.createElement(FareCalculatorConfig, { block, onUpdate }),
  'availability-calendar': ({ block, onUpdate }) => React.createElement(AvailabilityCalendarConfig, { block, onUpdate }),
  'captcha': ({ block, onUpdate }) => React.createElement(CaptchaConfig, { block, onUpdate }),
  'form-multi-step': ({ block, onUpdate }) => React.createElement(FormMultiStepConfig, { block, onUpdate }),
  'form-conditional': ({ block, onUpdate }) => React.createElement(FormConditionalConfig, { block, onUpdate }),
  'form-calculator': ({ block, onUpdate }) => React.createElement(FormCalculatorConfig, { block, onUpdate }),
  'form-file-upload': ({ block, onUpdate }) => React.createElement(FormFileUploadConfig, { block, onUpdate }),
  'form-payment': ({ block, onUpdate }) => React.createElement(FormPaymentConfig, { block, onUpdate }),
  'form-quiz': ({ block, onUpdate }) => React.createElement(FormQuizConfig, { block, onUpdate }),
  'form-survey': ({ block, onUpdate }) => React.createElement(FormSurveyConfig, { block, onUpdate }),
  'form-poll': ({ block, onUpdate }) => React.createElement(FormPollConfig, { block, onUpdate }),
  'form-rsvp': ({ block, onUpdate }) => React.createElement(FormRSVPConfig, { block, onUpdate }),
}

export function getBlockRendererCase(blockType: string): RendererCaseFunction | null {
  const normalizedType = blockType.toLowerCase().replace(/_/g, '-')
  return rendererCases[normalizedType] || null
}

