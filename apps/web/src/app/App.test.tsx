import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it } from 'vitest';
import { App } from './App';
const route = (hash: string) => {
  window.history.replaceState(null, '', hash);
  return render(<App />);
};
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '#/');
});
it('presents consumer discovery without requesting location automatically', () => {
  route('#/discover');
  expect(
    screen.getByRole('heading', {
      name: 'Everything you need, without leaving the course.',
    }),
  ).toBeVisible();
  expect(screen.getByRole('searchbox', { name: /course name/i })).toBeVisible();
  expect(screen.queryByText('Fairway Club')).not.toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Main navigation' }),
  ).not.toHaveTextContent(/Rewards|Track/);
});
it('distinguishes enabled and external courses without leaking products', async () => {
  const user = userEvent.setup();
  route('#/discover');
  await user.click(
    screen.getByRole('button', { name: 'Find courses near me' }),
  );
  expect(
    await screen.findByRole('heading', { name: 'Ordering available nearby' }),
  ).toBeVisible();
  expect(screen.getAllByText('Ordering available').length).toBeGreaterThan(0);
  expect(
    screen.getAllByText('Ordering not available here yet').length,
  ).toBeGreaterThan(0);
  expect(screen.queryByText('Fairway Club')).not.toBeInTheDocument();
});
it('shows a course-scoped browseable storefront and progressive verification', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  expect(await screen.findByText('Fairway Club')).toBeVisible();
  expect(screen.getByText(/You’re browsing Summit Pines/)).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'View Fairway Club details' }),
  );
  expect(screen.getByRole('dialog', { name: 'Fairway Club' })).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'Start round to order' }),
  );
  expect(
    screen.getByRole('dialog', { name: 'Start your round' }),
  ).toBeVisible();
  expect(screen.queryByLabelText('Demo course code')).not.toBeInTheDocument();
  await user.click(
    screen.getByRole('button', { name: 'Verify and start round' }),
  );
  expect(
    (await screen.findAllByText(/Active at Summit Pines/))[0],
  ).toBeVisible();
  expect(screen.getByRole('dialog', { name: 'Fairway Club' })).toBeVisible();
});
it('cart route is a real consumer empty state, not a placeholder', () => {
  route('#/cart');
  expect(
    screen.getByRole('heading', { name: 'Your cart is ready for the round' }),
  ).toBeVisible();
  expect(screen.queryByText(/Foundation ready/)).not.toBeInTheDocument();
});
it('orders and account primary destinations are meaningful', () => {
  const view = route('#/orders');
  expect(screen.getByRole('heading', { name: 'Your orders' })).toBeVisible();
  view.unmount();
  route('#/account');
  expect(screen.getByRole('heading', { name: 'Account' })).toBeVisible();
  expect(screen.queryByText(/planned for a future/)).not.toBeInTheDocument();
});
