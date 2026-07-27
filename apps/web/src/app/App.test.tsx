import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';
const route = (hash: string) => {
  window.history.replaceState(null, '', hash);
  return render(<App />);
};
beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, '', '#/');
});

it('discovery shows courses, course facts, and no individual products', async () => {
  route('#/discover');
  expect(await screen.findByText('Summit Pines Resort')).toBeInTheDocument();
  expect(
    screen.getByRole('navigation', { name: 'Golfer navigation' }),
  ).toHaveTextContent('Find Course');
  expect(screen.queryByText('Clubhouse Sandwich')).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /menu/i })).not.toBeInTheDocument();
});
it('selects a course, scopes products, blocks ordering, and changes navigation', async () => {
  route('#/course/summit-pines');
  expect(await screen.findByText('Clubhouse Sandwich')).toBeInTheDocument();
  expect(screen.queryByText('Trail Mix Cup')).not.toBeInTheDocument();
  expect(
    screen.getByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Browsing · Summit Pines Resort');
  expect(
    screen.getByRole('navigation', { name: 'Golfer navigation' }),
  ).toHaveTextContent('Menu');
  expect(
    screen.getAllByRole('button', { name: 'Verify course to order' })[0],
  ).toBeDisabled();
});
it.each([
  ['Confirm demo location', 'simulated_location'],
  ['Check demo QR', 'demo_qr'],
  ['Verify demo code', 'demo_course_code'],
])('creates one-course Active Round using %s', async (button, method) => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await screen.findByText('Clubhouse Sandwich');
  if (method === 'demo_qr')
    await user.type(screen.getByLabelText('Demo QR token'), 'SUMMIT-DEMO-QR');
  if (method === 'demo_course_code')
    await user.type(screen.getByLabelText('Demo course code'), 'BIRDIE7');
  await user.click(screen.getByRole('button', { name: button }));
  expect(
    screen.getByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Active Round · Summit Pines Resort');
  expect(
    JSON.parse(localStorage.getItem('golfer-goodies.course-context.v1')!)
      .activeRound,
  ).toMatchObject({ courseId: 'summit-pines', verificationMethod: method });
});
it('rejects invalid demo code and announces status without geolocation', async () => {
  const geolocation = vi.spyOn(navigator.geolocation, 'getCurrentPosition');
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await screen.findByText('Clubhouse Sandwich');
  await user.type(screen.getByLabelText('Demo course code'), 'WRONG');
  await user.click(screen.getByRole('button', { name: 'Verify demo code' }));
  expect(screen.getByText(/code invalid/i)).toBeInTheDocument();
  expect(geolocation).not.toHaveBeenCalled();
  geolocation.mockRestore();
});
it('changing course replaces product and Active Round context', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await screen.findByText('Clubhouse Sandwich');
  await user.click(
    screen.getByRole('button', { name: 'Confirm demo location' }),
  );
  window.location.hash = '#/course/meadow-loop';
  await waitFor(() =>
    expect(screen.getByText('Trail Mix Cup')).toBeInTheDocument(),
  );
  expect(screen.queryByText('Clubhouse Sandwich')).not.toBeInTheDocument();
  expect(
    screen.getByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Browse only');
});
