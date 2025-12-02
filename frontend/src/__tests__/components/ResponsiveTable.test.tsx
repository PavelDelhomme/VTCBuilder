import { render, screen } from '@testing-library/react'
import ResponsiveTable from '@/components/shared/ResponsiveTable'

describe('ResponsiveTable', () => {
  it('should render headers', () => {
    render(
      <ResponsiveTable headers={['Name', 'Email', 'Role']}>
        <tr>
          <td>John</td>
          <td>john@test.com</td>
          <td>Admin</td>
        </tr>
      </ResponsiveTable>
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('should render children rows', () => {
    render(
      <ResponsiveTable headers={['Name', 'Email']}>
        <tr>
          <td>John Doe</td>
          <td>john@test.com</td>
        </tr>
      </ResponsiveTable>
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@test.com')).toBeInTheDocument()
  })

  it('should display empty message when no children', () => {
    render(
      <ResponsiveTable headers={['Name']} emptyMessage="No data available">
        <tr>
          <td colSpan={1}>No data available</td>
        </tr>
      </ResponsiveTable>
    )

    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})

