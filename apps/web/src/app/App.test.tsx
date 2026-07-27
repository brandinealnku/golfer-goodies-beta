import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { App } from './App';
const route = (h: string) => {
  location.hash = h;
  render(<App />);
};
beforeEach(() => (location.hash = ''));
it('discovers and searches courses with golfer nav and badge', async () => {
  route('#/discover');
  expect(screen.getByLabelText(/environment: demo/i)).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Golfer navigation' }),
  ).toBeInTheDocument();
  expect(await screen.findByText('Summit Pines Resort')).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText(/Search courses/), 'Nova City');
  expect(screen.getByText('Circuit Links')).toBeInTheDocument();
  expect(screen.queryByText('Summit Pines Resort')).not.toBeInTheDocument();
});
it('renders detail and currency', async () => {
  route('#/course/summit-pines');
  expect(
    await screen.findByRole('heading', { name: 'Summit Pines Resort' }),
  ).toBeInTheDocument();
  expect(screen.getByText('$6.50')).toBeInTheDocument();
});
it('renders role layouts', async () => {
  route('#/partner');
  expect(
    screen.getByRole('navigation', { name: 'Partner navigation' }),
  ).toBeInTheDocument();
  location.hash = '#/platform';
  await waitFor(() =>
    expect(
      screen.getByRole('navigation', { name: 'Platform navigation' }),
    ).toBeInTheDocument(),
  );
});
it('renders not found', () => {
  route('#/nope');
  expect(screen.getByText('Page not found')).toBeInTheDocument();
});
it('creates hash links for subpaths', async () => {
  route('#/discover');
  expect(
    (await screen.findByRole('link', { name: /View Summit/ })).getAttribute(
      'href',
    ),
  ).toBe('#/course/summit-pines');
});
