// Exporter toutes les fonctions de MediaRenderers, y compris renderImage pour l'éditeur
// Note: renderImage existe aussi dans basic pour la prévisualisation, mais ici c'est pour l'éditeur
export {
  renderImage,
  renderVideo,
  renderGallery,
  renderBanner,
  renderCarousel,
  renderAudioPlayer,
  renderLogoGrid,
} from './MediaRenderers'
export { renderImageSlider } from './image-slider'
export { renderLightbox } from './lightbox'
