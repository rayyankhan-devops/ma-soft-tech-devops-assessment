import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App.jsx';

// Mock fetch globally for frontend unit tests
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('/health')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            status: 'UP',
            service: 'MA-DevOps-Backend',
            version: '1.0.0',
            environment: 'development',
            uptime: 42,
            database: { mode: 'mysql' },
          }),
      });
    }

    if (url.includes('/api/v1/items')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            success: true,
            count: 1,
            data: [
              {
                id: 1,
                title: 'Test CI/CD Item',
                priority: 'high',
                category: 'CI/CD',
                created_at: new Date().toISOString(),
              },
            ],
          }),
      });
    }

    return Promise.reject(new Error('Unknown URL'));
  });
});

describe('Frontend React App Test Suite (MA Soft Tech Solutions)', () => {
  it('renders main application header and company branding', async () => {
    render(<App />);

    expect(await screen.findByText('MA SOFT TECH SOLUTIONS')).toBeInTheDocument();
    expect(screen.getByText(/DevOps Engineering Internship Assessment/i)).toBeInTheDocument();

    const logoImg = screen.getByAltText('MA Soft Tech Solutions');
    expect(logoImg).toBeInTheDocument();
  });

  it('renders health telemetry section and action button', async () => {
    render(<App />);

    expect(screen.getByText('/health Endpoint')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /Refresh Health/i })).toBeInTheDocument();
  });

  it('renders the interactive input validation test form', async () => {
    render(<App />);

    expect(await screen.findByLabelText(/Item Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Trigger Validation Error/i })).toBeInTheDocument();
  });
});
