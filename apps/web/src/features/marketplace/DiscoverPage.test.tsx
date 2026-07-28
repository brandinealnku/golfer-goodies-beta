import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DiscoverPage } from './DiscoverPage';
describe('location-first discovery', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('demo never requests real location and never watches', async () => {
    const get = vi.fn();
    const watch = vi.fn();
    vi.stubGlobal('navigator', {
      geolocation: { getCurrentPosition: get, watchPosition: watch },
    });
    render(
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>,
    );
    expect(get).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Find courses near me' }),
    );
    await screen.findByText('Summit Pines Resort');
    expect(get).not.toHaveBeenCalled();
    expect(watch).not.toHaveBeenCalled();
  });
  it('preserves manual search without geolocation or Permissions API', async () => {
    vi.stubGlobal('navigator', {});
    render(
      <MemoryRouter>
        <DiscoverPage />
      </MemoryRouter>,
    );
    fireEvent.change(screen.getByLabelText(/Search by course/), {
      target: { value: 'River' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Search courses' }));
    await waitFor(() =>
      expect(screen.getByText('River Glass Golf Course')).toBeVisible(),
    );
    expect(screen.queryByText(/Clubhouse Sandwich/)).not.toBeInTheDocument();
  });
});
