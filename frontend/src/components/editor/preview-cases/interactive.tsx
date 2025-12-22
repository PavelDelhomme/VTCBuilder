import React, { useState } from 'react'
import { PreviewCaseProps } from './types'

// Blocs interactifs : accordion, tabs, countdown, progress-bar, progress-circle, modal, calendar, rating

// Les cases suivants utilisent des fonctions depuis './renderers/interactive'
const renderAccordion: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderTabs: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderCountdown: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null
const renderProgressBar: ((props: PreviewCaseProps) => React.ReactElement | null) | null = null

// Import dynamique désactivé pour éviter les erreurs
// try {
//   const interactiveRenderers = await import('./renderers/interactive').catch(() => null)
//   if (interactiveRenderers) {
//     renderAccordion = interactiveRenderers.renderAccordion || null
//     renderTabs = interactiveRenderers.renderTabs || null
//     renderCountdown = interactiveRenderers.renderCountdown || null
//     renderProgressBar = interactiveRenderers.renderProgressBar || null
//   }
// } catch (e) {
//   // Les renderers n'existent pas encore
// }

export function renderAccordionBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderAccordion) {
    return renderAccordion(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Accordion renderer not available</p>
    </div>
  )
}

export function renderTabsBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderTabs) {
    return renderTabs(props)
  }
  // Fallback avec useState
  const { block, theme = 'light', wrapperStyles } = props
  const tabs = block.data.tabs || []
  const TabsPreview = () => {
    const [activeTab, setActiveTab] = useState(0)
    const isDark = theme === 'dark'
    return (
      <div style={wrapperStyles} className="mb-6">
        {tabs.length > 0 ? (
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {tabs.map((tab: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === index
                      ? isDark ? 'bg-gray-900 text-blue-400 border-b-2 border-blue-400' : 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : isDark ? 'text-gray-400 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.title || `Onglet ${index + 1}`}
                </button>
              ))}
            </div>
            <div className="p-6">
              <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{tabs[activeTab]?.content || 'Contenu...'}</p>
            </div>
          </div>
        ) : (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
            No tabs configured
          </div>
        )}
      </div>
    )
  }
  return <TabsPreview />
}

export function renderCountdownBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderCountdown) {
    return renderCountdown(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Countdown renderer not available</p>
    </div>
  )
}

export function renderProgressBarBase(props: PreviewCaseProps): React.ReactElement | null {
  if (renderProgressBar) {
    return renderProgressBar(props)
  }
  return (
    <div style={props.wrapperStyles} className="mb-6 p-6 border-2 border-dashed rounded">
      <p className="text-gray-500">Progress bar renderer not available</p>
    </div>
  )
}

export function renderProgressCircle(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const progressPercentage = block.data.percentage || 75
  const circleSize = block.data.size || 'medium'
  const sizeMap: { [key: string]: { size: string; stroke: string } } = {
    small: { size: '100', stroke: '8' },
    medium: { size: '150', stroke: '10' },
    large: { size: '200', stroke: '12' },
  }
  const { size: svgSize, stroke: strokeWidth } = sizeMap[circleSize]
  const radius = (parseInt(svgSize) - parseInt(strokeWidth)) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progressPercentage / 100) * circumference
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6 flex flex-col items-center">
      <div className="relative" style={{ width: `${svgSize}px`, height: `${svgSize}px` }}>
        <svg width={svgSize} height={svgSize} className="transform -rotate-90">
          <circle
            cx={parseInt(svgSize) / 2}
            cy={parseInt(svgSize) / 2}
            r={radius}
            stroke={isDark ? '#374151' : '#e5e7eb'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={parseInt(svgSize) / 2}
            cy={parseInt(svgSize) / 2}
            r={radius}
            stroke="#3b82f6"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{progressPercentage}%</span>
        </div>
      </div>
      {block.data.text && (
        <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{block.data.text}</p>
      )}
    </div>
  )
}

export function renderModal(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const ModalPreview = () => {
    const [isOpen, setIsOpen] = useState(false)
    const sizeClass = block.data.size === 'small' ? 'max-w-md' : block.data.size === 'large' ? 'max-w-4xl' : block.data.size === 'fullscreen' ? 'max-w-full h-full' : 'max-w-2xl'
    const isDark = theme === 'dark'
    return (
      <div style={wrapperStyles} className="mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {block.data.trigger_text || 'Ouvrir'}
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl ${sizeClass} w-full m-4`} onClick={(e) => e.stopPropagation()}>
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{block.data.title || 'Modal'}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className={isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}
                >
                  ✕
                </button>
              </div>
              <div className={`p-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {block.data.content || 'Modal content...'}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
  return <ModalPreview />
}

export function renderCalendar(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const isDark = theme === 'dark'
  return (
    <div style={wrapperStyles} className="mb-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <div className={`h-96 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-400'} border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'} rounded`}>
          Calendrier {block.data.calendar_type || 'month'} - Prévisualisation (nécessite bibliothèque calendrier)
        </div>
        {block.data.show_events !== false && (
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>Événements activés</p>
        )}
      </div>
    </div>
  )
}

export function renderRating(props: PreviewCaseProps): React.ReactElement | null {
  const { block, theme = 'light', wrapperStyles } = props
  const rating = block.data.rating || 5
  const ratingSize = block.data.size || 'medium'
  const sizeClass = ratingSize === 'small' ? 'text-lg' : ratingSize === 'large' ? 'text-3xl' : 'text-2xl'
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6 text-center">
      <div className="flex items-center justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={sizeClass}>
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
      {block.data.show_text !== false && block.data.text && (
        <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{block.data.text}</p>
      )}
    </div>
  )
}

// Export map
export const interactiveCases: Record<string, (props: PreviewCaseProps) => React.ReactElement | null> = {
  'accordion': renderAccordionBase,
  'tabs': renderTabsBase,
  'countdown': renderCountdownBase,
  'progress-bar': renderProgressBarBase,
  'progress-circle': renderProgressCircle,
  'modal': renderModal,
  'calendar': renderCalendar,
  'rating': renderRating,
}

