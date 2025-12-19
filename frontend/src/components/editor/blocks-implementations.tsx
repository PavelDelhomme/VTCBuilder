/**
 * Implémentations des nouveaux blocs pour BlockRenderer et BlockPreview
 * 
 * Les composants sont maintenant organisés par catégories dans components/
 * Ce fichier réexporte tous les composants pour la compatibilité
 */

// Content editors
export {
  RichTextEditorConfig,
  MarkdownEditorConfig,
  HtmlRawConfig,
} from './components/content'

// UI Components
export {
  IconConfig,
  LabelConfig,
  TooltipConfig,
  PopoverConfig,
  DropdownConfig,
} from './components/ui-components'

// Blog components
export {
  CategoriesConfig,
  AuthorBoxConfig,
  RelatedPostsConfig,
  TableOfContentsConfig,
  ReadingTimeConfig,
  ShareButtonsConfig,
} from './components/blog'

// Layout components
export {
  FlexboxConfig,
  GridConfig,
  StackConfig,
  InlineConfig,
  GroupConfig,
  WrapperConfig,
} from './components/layout'

// Media components
export {
  ImageSliderConfig,
  LightboxConfig,
  VimeoEmbedConfig,
  LogoCarouselConfig,
} from './components/media'

// Interactive components
export {
  CounterConfig,
  CardGridConfig,
} from './components/interactive'

// VTC specific components
export {
  RouteCalculatorConfig,
  FareCalculatorConfig,
  AvailabilityCalendarConfig,
} from './components/vtc'

// Form components
export {
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
} from './components/forms'
