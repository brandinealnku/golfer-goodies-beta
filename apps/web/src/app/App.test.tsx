import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { App } from './App';
import type { VerificationMethod } from '../types/marketplace';
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
  expect(screen.getByRole('status')).toHaveTextContent('No course selected');
});
it('selects a course, scopes products, blocks ordering, and changes navigation', async () => {
  route('#/course/summit-pines');
  expect(await screen.findByText('Clubhouse Sandwich')).toBeInTheDocument();
  expect(screen.queryByText('Trail Mix Cup')).not.toBeInTheDocument();
  expect(
    await screen.findByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Browsing · Summit Pines Resort');
  expect(
    screen.getByRole('navigation', { name: 'Golfer navigation' }),
  ).toHaveTextContent('Menu');
  expect(
    screen.getAllByRole('button', { name: 'Verify course to order' })[0],
  ).toBeDisabled();
});
it.each<[string, VerificationMethod]>([
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
    await screen.findByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Active Round · Summit Pines Resort');
  await waitFor(() => {
    expect(
      JSON.parse(
        localStorage.getItem('golfer-goodies.course-context.v1') ?? '{}',
      ).activeRound,
    ).toMatchObject({ courseId: 'summit-pines', verificationMethod: method });
  });
  expect(
    screen.getAllByRole('button', {
      name: 'Ordering planned — not yet available',
    })[0],
  ).toBeDisabled();
});
it('rejects invalid demo code and announces status without geolocation', async () => {
  const originalGeolocation = Object.getOwnPropertyDescriptor(
    navigator,
    'geolocation',
  );
  const getCurrentPosition = vi.fn();
  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      getCurrentPosition,
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    },
  });
  try {
    const user = userEvent.setup();
    route('#/course/summit-pines');
    await screen.findByText('Clubhouse Sandwich');
    await user.type(screen.getByLabelText('Demo course code'), 'WRONG');
    await user.click(screen.getByRole('button', { name: 'Verify demo code' }));
    expect(screen.getByText(/code invalid/i)).toBeInTheDocument();
    expect(getCurrentPosition).not.toHaveBeenCalled();
  } finally {
    if (originalGeolocation)
      Object.defineProperty(navigator, 'geolocation', originalGeolocation);
    else Reflect.deleteProperty(navigator, 'geolocation');
  }
});
it('rejects an invalid demo QR and associates the error with its field', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await screen.findByText('Clubhouse Sandwich');
  const field = screen.getByLabelText('Demo QR token');
  await user.type(field, 'NOT-A-TOKEN');
  await user.click(screen.getByRole('button', { name: 'Check demo QR' }));
  expect(screen.getByText(/Demo QR invalid/i)).toBeInTheDocument();
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAttribute(
    'aria-describedby',
    'qr-help verification-message',
  );
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
    await screen.findByRole('complementary', { name: 'Course context' }),
  ).toHaveTextContent('Browse only');
});

it('offers non-location alternatives when demo location is uncertain', async () => {
  const user = userEvent.setup();
  route('#/course/meadow-loop');
  await screen.findByText('Trail Mix Cup');
  await user.click(
    screen.getByRole('button', { name: 'Confirm demo location' }),
  );
  expect(screen.getByText(/Verification uncertain/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Check demo QR' })).toBeEnabled();
  expect(
    screen.getByRole('button', { name: 'Verify demo code' }),
  ).toBeEnabled();
});

it('shows an actionable outside-service-area demo result', async () => {
  const user = userEvent.setup();
  route('#/course/cedar-bend-muni');
  await screen.findByText('Clubhouse Sandwich');
  await user.click(
    screen.getByRole('button', { name: 'Confirm demo location' }),
  );
  expect(screen.getByText(/Outside service area/i)).toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'choose another course' }),
  ).toBeInTheDocument();
});

it('explains paused, closed, and pickup-only course states', async () => {
  const paused = route('#/course/circuit-links');
  expect(await screen.findByText(/Ordering is paused/i)).toBeInTheDocument();
  paused.unmount();
  const closed = route('#/course/heritage-oaks');
  expect(await screen.findByText(/course is closed/i)).toBeInTheDocument();
  expect(screen.getByText(/Pickup-only availability/i)).toBeInTheDocument();
  closed.unmount();
  route('#/course/cedar-bend-muni');
  expect(
    await screen.findByText(/Pickup-only availability/i),
  ).toBeInTheDocument();
});
