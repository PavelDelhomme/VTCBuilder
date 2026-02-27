import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders without text by default', () => {
    render(<LoadingSpinner />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText(/./)).not.toBeInTheDocument();
  });

  it('renders with optional text', () => {
    render(<LoadingSpinner text="Chargement..." />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('applies size class for sm', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('.h-4.w-4');
    expect(spinner).toBeInTheDocument();
  });

  it('applies size class for lg', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('.h-12.w-12');
    expect(spinner).toBeInTheDocument();
  });

  it('renders fullScreen overlay when fullScreen is true', () => {
    render(<LoadingSpinner fullScreen />);
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });

  it('does not render fullScreen overlay when fullScreen is false', () => {
    render(<LoadingSpinner fullScreen={false} />);
    const overlay = document.querySelector('.fixed.inset-0');
    expect(overlay).not.toBeInTheDocument();
  });
});
