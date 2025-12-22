import React, { useState } from 'react'

interface FAQSectionPreviewProps {
  title?: string
  items: any[]
  wrapperStyles?: React.CSSProperties
  theme?: 'light' | 'dark'
}

export function FAQSectionPreview({ title, items, wrapperStyles, theme = 'light' }: FAQSectionPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const isDark = theme === 'dark'
  
  return (
    <div style={wrapperStyles} className="mb-6">
      {title && (
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{ color: isDark ? '#f9fafb' : '#111827' }}
        >
          {title}
        </h2>
      )}
      <div className="space-y-4 max-w-4xl mx-auto">
        {items.length > 0 ? (
          items.map((item: any, i: number) => (
            <div
              key={i}
              className="rounded-xl shadow-lg overflow-hidden"
              style={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff'
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
                style={{
                  backgroundColor: openIndex === i ? (isDark ? '#374151' : '#f9fafb') : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (openIndex !== i) {
                    e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#f9fafb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (openIndex !== i) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <span 
                  className="font-semibold pr-8"
                  style={{ color: isDark ? '#f9fafb' : '#111827' }}
                >
                  {item.question || `Question ${i + 1}`}
                </span>
                <span className="text-blue-600 text-xl flex-shrink-0">
                  {openIndex === i ? '−' : '+'}
                </span>
              </button>
              {openIndex === i && (
                <div 
                  className="px-6 pb-5 border-t"
                  style={{
                    color: isDark ? '#9ca3af' : '#4b5563',
                    borderColor: isDark ? '#374151' : '#e5e7eb'
                  }}
                >
                  <p className="pt-4">{item.answer || 'Réponse...'}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div 
            className="text-center py-8 border-2 border-dashed rounded"
            style={{
              color: isDark ? '#9ca3af' : '#9ca3af',
              borderColor: isDark ? '#4b5563' : '#d1d5db'
            }}
          >
            No FAQ questions
          </div>
        )}
      </div>
    </div>
  )
}

