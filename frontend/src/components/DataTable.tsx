'use client'

import { useState, useMemo, ReactNode } from 'react'

export interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  sortable?: boolean
  hidden?: boolean | 'sm' | 'md' | 'lg' | 'xl'
  minWidth?: string
  sticky?: 'left' | 'right'
  className?: string
}

export interface Filter {
  key: string
  label: string
  type: 'select' | 'text' | 'date' | 'number'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  filters?: Filter[]
  onFilterChange?: (filters: Record<string, string>) => void
  searchable?: boolean
  searchPlaceholder?: string
  sortable?: boolean
  pagination?: boolean
  itemsPerPage?: number
  emptyMessage?: string
  loading?: boolean
  actions?: (item: T) => ReactNode
  actionsSticky?: boolean
  onRowClick?: (item: T) => void
  className?: string
}

export default function DataTable<T extends { id: number | string }>({
  data,
  columns,
  filters = [],
  onFilterChange,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
  sortable = true,
  pagination = false,
  itemsPerPage = 10,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  actions,
  actionsSticky = true,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    return columns.filter(col => !col.hidden)
  }, [columns])

  // Apply filters
  const filteredData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchable && searchQuery) {
      result = result.filter(item => {
        return visibleColumns.some(col => {
          const value = col.render ? String(col.render(item)) : String((item as any)[col.key])
          return value.toLowerCase().includes(searchQuery.toLowerCase())
        })
      })
    }

    // Apply custom filters
    if (filters.length > 0) {
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          result = result.filter(item => {
            const itemValue = (item as any)[key]
            if (Array.isArray(itemValue)) {
              return itemValue.some(v => String(v).toLowerCase() === value.toLowerCase())
            }
            return String(itemValue).toLowerCase() === value.toLowerCase()
          })
        }
      })
    }

    return result
  }, [data, searchQuery, activeFilters, filters, searchable, visibleColumns])

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key]
      const bValue = (b as any)[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [filteredData, sortConfig])

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, pagination, currentPage, itemsPerPage])

  const totalPages = pagination ? Math.ceil(sortedData.length / itemsPerPage) : 1

  const handleSort = (key: string) => {
    if (!sortable) return

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilterChange?.(newFilters)
    setCurrentPage(1) // Reset to first page on filter change
  }

  const getColumnClasses = (column: Column<T>, index: number) => {
    const classes = ['px-3 sm:px-6 py-4']
    
    if (column.hidden === 'sm') classes.push('hidden sm:table-cell')
    else if (column.hidden === 'md') classes.push('hidden md:table-cell')
    else if (column.hidden === 'lg') classes.push('hidden lg:table-cell')
    else if (column.hidden === 'xl') classes.push('hidden xl:table-cell')

    if (column.sticky === 'left') {
      classes.push('sticky left-0 bg-white dark:bg-gray-800 z-10')
    } else if (column.sticky === 'right') {
      classes.push('sticky right-0 bg-white dark:bg-gray-800 z-10')
    }

    if (column.minWidth) {
      classes.push(`min-w-[${column.minWidth}]`)
    }

    if (column.className) {
      classes.push(column.className)
    }

    return classes.join(' ')
  }

  const getHeaderClasses = (column: Column<T>) => {
    const classes = ['px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider']
    
    if (column.hidden === 'sm') classes.push('hidden sm:table-cell')
    else if (column.hidden === 'md') classes.push('hidden md:table-cell')
    else if (column.hidden === 'lg') classes.push('hidden lg:table-cell')
    else if (column.hidden === 'xl') classes.push('hidden xl:table-cell')

    if (column.sticky === 'left') {
      classes.push('sticky left-0 bg-gray-50 dark:bg-gray-900 z-20')
    } else if (column.sticky === 'right') {
      classes.push('sticky right-0 bg-gray-50 dark:bg-gray-900 z-20')
    }

    if (column.sortable && sortable) {
      classes.push('cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800')
    }

    return classes.join(' ')
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      {/* Search and Filters */}
      {(searchable || filters.length > 0) && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 mb-6">
          <div className="space-y-4">
            {/* Search */}
            {searchable && (
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recherche
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map(filter => (
                  <div key={filter.key}>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {filter.label}
                    </label>
                    {filter.type === 'select' && filter.options ? (
                      <select
                        value={activeFilters[filter.key] || 'all'}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">Tous</option>
                        {filter.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={filter.type}
                        value={activeFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        placeholder={filter.placeholder}
                        className="w-full px-3 py-2 border dark:bg-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                {visibleColumns.map((column, index) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={getHeaderClasses(column)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">{column.label}</span>
                      {column.sortable && sortable && sortConfig?.key === column.key && (
                        <svg
                          className={`h-4 w-4 ${sortConfig.direction === 'asc' ? '' : 'rotate-180'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className={`px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${actionsSticky ? 'sticky right-0 bg-gray-50 dark:bg-gray-900 z-20' : ''}`}>
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (actions ? 1 : 0)} className="px-3 sm:px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {visibleColumns.map((column) => (
                      <td key={column.key} className={getColumnClasses(column, 0)}>
                        {column.render ? column.render(item) : String((item as any)[column.key] || '')}
                      </td>
                    ))}
                    {actions && (
                      <td className={`px-3 sm:px-6 py-4 text-right text-sm font-medium ${actionsSticky ? 'sticky right-0 bg-white dark:bg-gray-800 z-10' : ''}`}>
                        <div className="flex justify-end items-center gap-1 sm:gap-2 flex-nowrap" onClick={(e) => e.stopPropagation()}>
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Affichage de <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, sortedData.length)}</span> sur{' '}
                  <span className="font-medium">{sortedData.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

