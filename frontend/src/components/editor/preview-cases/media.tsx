import React from 'react'
import { PreviewCaseProps } from './types'

// Blocs média : carousel, logo-grid, logo-carousel, image-slider, lightbox, vimeo-embed, gallery, audio-player, video-embed

// Les cases suivants utilisent des fonctions depuis './renderers/media'
const renderCarousel: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderLogoGrid: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderImageSlider: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderLightbox: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null

// Import dynamique désactivé pour éviter les erreurs
// try {
//   const mediaRenderers = await import('./renderers/media').catch(() => null)
//   if (mediaRenderers) {
//     renderCarousel = mediaRenderers.renderCarousel || null
//     renderLogoGrid = mediaRenderers.renderLogoGrid || null
//     renderImageSlider = mediaRenderers.renderImageSlider || null
//     renderLightbox = mediaRenderers.renderLightbox || null
//   }
// } catch (e) {
//   // Les renderers n'existent pas encore
// }

export function renderCarouselBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderCarousel) {
    return renderCarousel(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Carousel renderer not available</p>
    </div>
  )
}

export function renderLogoGridBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderLogoGrid) {
    return renderLogoGrid(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Logo grid renderer not available</p>
    </div>
  )
}

export function renderLogoCarousel(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const carouselLogos = block.data?.logos || []
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title}</h3>}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {carouselLogos.map((logo: any, index: number) => (
          <div key={index} className={`flex-shrink-0 w-32 h-32 ${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg flex items-center justify-center p-4`}>
            {logo.url ? (
              <img src={logo.url} alt={logo.name || ''} className="max-w-full max-h-full object-contain" />
            ) : (
              <div className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs text-center`}>{logo.name || `Logo ${index + 1}`}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function renderImageSliderBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderImageSlider) {
    return renderImageSlider(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Image slider renderer not available</p>
    </div>
  )
}

export function renderLightboxBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderLightbox) {
    return renderLightbox(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Lightbox renderer not available</p>
    </div>
  )
}

export function renderVimeoEmbed(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const vimeoId = block.data?.vimeoId || (block.data?.url ? block.data.url.match(/vimeo\.com\/(\d+)/)?.[1] : '')
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data?.title && <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title}</h3>}
      {vimeoId ? (
        <div className="relative" style={{ paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          ID Vimeo requis
        </div>
      )}
    </div>
  )
}

export function renderGallery(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const images = block.data.images || []
  const galleryColumns = block.data.columns || 3
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      <div 
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${galleryColumns}, 1fr)`,
        }}
      >
        {images.length > 0 ? (
          images.map((img: string, i: number) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
              <img
                src={img}
                alt={`Image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          ))
        ) : (
          <div className={`col-span-full text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
            No images in gallery
          </div>
        )}
      </div>
    </div>
  )
}

export function renderAudioPlayer(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {block.data.src ? (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4`}>
          {block.data.title && (
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3`}>
              {block.data.title}
            </h3>
          )}
          <audio
            controls={block.data.controls !== false}
            autoPlay={block.data.autoplay === true}
            loop={block.data.loop === true}
            className="w-full"
          >
            <source src={block.data.src} />
            Your browser does not support the audio element.
          </audio>
        </div>
      ) : (
        <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
          No audio file configured
        </div>
      )}
    </div>
  )
}

export function renderVideoEmbed(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const videoUrl = block.data.url || ''
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
  const isVimeo = videoUrl.includes('vimeo.com')
  const isDark = theme === 'dark'
  
  let embedUrl = ''
  if (isYouTube) {
    const youtubeId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    if (youtubeId) embedUrl = `https://www.youtube.com/embed/${youtubeId}`
  } else if (isVimeo) {
    const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1]
    if (vimeoId) embedUrl = `https://player.vimeo.com/video/${vimeoId}`
  }
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {embedUrl ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%', height: 0 }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : videoUrl ? (
        <div className={`p-8 border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded text-center ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          Video URL not supported. Use YouTube or Vimeo.
        </div>
      ) : (
        <div className={`p-8 border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded text-center ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
          No video configured
        </div>
      )}
    </div>
  )
}

// Export map
export const mediaCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'carousel': renderCarouselBase,
  'logo-grid': renderLogoGridBase,
  'logo-carousel': renderLogoCarousel,
  'image-slider': renderImageSliderBase,
  'lightbox': renderLightboxBase,
  'vimeo-embed': renderVimeoEmbed,
  'gallery': renderGallery,
  'audio-player': renderAudioPlayer,
  'video-embed': renderVideoEmbed,
}

