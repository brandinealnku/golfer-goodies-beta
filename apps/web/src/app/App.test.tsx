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
it('gives every product card a visible action and supports keyboard opening', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  const productButtons = await screen.findAllByRole('button', {
    name: /View .+ details/,
  });
  expect(productButtons).toHaveLength(6);
  expect(screen.getAllByText(/View details/)).toHaveLength(6);
  productButtons[1].focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog', { name: 'Citrus Sparkler' })).toBeVisible();
});
it('filters course products with accessible chips without changing route, session, or cart', async () => {
  const now = new Date();
  localStorage.setItem(
    'golfer-goodies.course-context.v1',
    JSON.stringify({
      selectedCourseId: 'summit-pines',
      mode: 'ordering_session',
      orderingSession: {
        version: 1,
        id: 'test-session',
        courseId: 'summit-pines',
        verificationMethod: 'simulated_location',
        status: 'active',
        confidence: 'demo',
        verifiedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 60 * 60_000).toISOString(),
      },
    }),
  );
  localStorage.setItem(
    'golfer-goodies.cart.v1',
    JSON.stringify({
      version: 1,
      courseId: 'summit-pines',
      updatedAt: now.toISOString(),
      items: [
        {
          id: 'summit-pines-sparkler-standard',
          productId: 'summit-pines-sparkler',
          name: 'Citrus Sparkler',
          unitPriceCents: 395,
          quantity: 1,
          image: 'images/demo/products/sparkler.svg',
          selectedModifiers: [],
          instructions: '',
        },
      ],
    }),
  );
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await screen.findByRole('button', { name: 'All products' });
  const routeBefore = window.location.hash;
  const all = screen.getByRole('button', { name: 'All products' });
  const food = screen.getByRole('button', { name: 'Food products' });
  const drink = screen.getByRole('button', { name: 'Drink products' });
  expect(all).toHaveAttribute('aria-pressed', 'true');
  expect(document.querySelectorAll('.category-nav a')).toHaveLength(0);
  expect(food).not.toHaveAttribute('href');

  await user.click(food);
  expect(food).toHaveAttribute('aria-pressed', 'true');
  expect(all).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('Fairway Club')).toBeVisible();
  expect(screen.queryByText('Citrus Sparkler')).not.toBeInTheDocument();

  drink.focus();
  await user.keyboard('{Enter}');
  expect(drink).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Citrus Sparkler')).toBeVisible();
  expect(screen.queryByText('Fairway Club')).not.toBeInTheDocument();

  all.focus();
  await user.keyboard(' ');
  expect(all).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Fairway Club')).toBeVisible();
  expect(screen.getByText('Citrus Sparkler')).toBeVisible();
  expect(window.location.hash).toBe(routeBefore);
  expect(window.location.hash).toBe('#/course/summit-pines');
  expect(
    screen.queryByRole('heading', { name: 'Page not found' }),
  ).not.toBeInTheDocument();
  expect(
    screen.getAllByText(/Ordering unlocked at Summit Pines/).length,
  ).toBeGreaterThan(0);
  expect(screen.getAllByLabelText('Cart, 1 items')).toHaveLength(2);
  expect(
    [...document.querySelectorAll<HTMLElement>('.product-open')].every(
      (element) => element.dataset.productId?.startsWith('summit-pines-'),
    ),
  ).toBe(true);
});
it('opens the same product from its image, name, and visible action', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await user.click(
    await screen.findByAltText('Fairway Club, demonstration item'),
  );
  expect(
    document.querySelector(
      '[data-product-sheet][data-product-id="summit-pines-club-sandwich"]',
    ),
  ).toBeVisible();
  expect(screen.getByRole('dialog', { name: 'Fairway Club' })).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'Close product details' }),
  );
  await user.click(screen.getByRole('heading', { name: 'Fairway Club' }));
  expect(screen.getByRole('dialog', { name: 'Fairway Club' })).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'Close product details' }),
  );
  await user.click(screen.getAllByText(/View details/)[0]);
  expect(screen.getByRole('dialog', { name: 'Fairway Club' })).toBeVisible();
});
it('closes the product portal with Escape and backdrop and restores card focus', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  const opener = await screen.findByRole('button', {
    name: 'View Fairway Club details',
  });
  await user.click(opener);
  await user.keyboard('{Escape}');
  expect(
    screen.queryByRole('dialog', { name: 'Fairway Club' }),
  ).not.toBeInTheDocument();
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  expect(opener).toHaveFocus();

  await user.click(opener);
  const backdrop = document.querySelector<HTMLElement>('[data-product-sheet]');
  expect(backdrop).toBeVisible();
  await user.click(backdrop as HTMLElement);
  expect(
    screen.queryByRole('dialog', { name: 'Fairway Club' }),
  ).not.toBeInTheDocument();
});
it('preserves a valid product intent and adds automatically after verification', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await user.click(
    await screen.findByRole('button', { name: 'View Fairway Club details' }),
  );
  await user.click(screen.getByRole('radio', { name: 'Kettle chips' }));
  await user.click(
    screen.getByRole('button', { name: 'Verify you’re at this course' }),
  );
  expect(
    screen.getByRole('dialog', {
      name: 'Confirm you’re at Summit Pines Resort',
    }),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Use my location' }));
  await user.click(screen.getByRole('button', { name: 'Check location' }));
  expect(
    (await screen.findAllByText(/Ordering unlocked at Summit Pines/))[0],
  ).toBeVisible();
  expect(screen.getAllByLabelText('Cart, 1 items')).toHaveLength(2);
});
it('retains a Cedar Bend intent after location rejection and accepts course code', async () => {
  const user = userEvent.setup();
  route('#/course/cedar-bend-muni');
  await user.click(
    await screen.findByRole('button', { name: 'View Citrus Sparkler details' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Verify you’re at this course' }),
  );
  await user.click(screen.getByRole('button', { name: 'Use my location' }));
  await user.click(screen.getByRole('button', { name: 'Check location' }));
  expect(screen.getByText(/cannot be unlocked/i)).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Enter course code' }));
  await user.type(screen.getByLabelText('Demo course code'), 'CEDAR3');
  await user.click(screen.getByRole('button', { name: 'Unlock ordering' }));
  expect(screen.getAllByLabelText('Cart, 1 items')).toHaveLength(2);
});
it.each([
  ['circuit-links', 'Ordering paused'],
  ['heritage-oaks', 'Closed'],
])(
  'keeps %s products browseable but blocks additions',
  async (courseId, status) => {
    const user = userEvent.setup();
    route(`#/course/${courseId}`);
    expect(await screen.findByText(status)).toBeVisible();
    await user.click(
      screen.getByRole('button', { name: 'View Citrus Sparkler details' }),
    );
    expect(
      screen.queryByRole('button', { name: /Add ·/ }),
    ).not.toBeInTheDocument();
  },
);
it('cart route is a real consumer empty state, not a placeholder', () => {
  route('#/cart');
  expect(
    screen.getByRole('heading', { name: 'Your cart is ready' }),
  ).toBeVisible();
  expect(screen.queryByText(/Foundation ready/)).not.toBeInTheDocument();
});
it('requires confirmation instead of carrying a cart across courses', async () => {
  localStorage.setItem(
    'golfer-goodies.cart.v1',
    JSON.stringify({
      version: 1,
      courseId: 'summit-pines',
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 'summit-pines-sparkler-standard',
          productId: 'summit-pines-sparkler',
          name: 'Citrus Sparkler',
          unitPriceCents: 395,
          quantity: 1,
          image: 'images/demo/products/sparkler.svg',
          selectedModifiers: [],
          instructions: '',
        },
      ],
    }),
  );
  route('#/course/cedar-bend-muni');
  expect(
    await screen.findByRole('dialog', { name: 'Change courses?' }),
  ).toHaveTextContent(/will clear/i);
  expect(
    JSON.parse(localStorage.getItem('golfer-goodies.cart.v1') ?? '{}'),
  ).toMatchObject({
    courseId: 'summit-pines',
  });
});
it('orders and account primary destinations are meaningful', () => {
  const view = route('#/orders');
  expect(screen.getByRole('heading', { name: 'Your orders' })).toBeVisible();
  view.unmount();
  route('#/account');
  expect(screen.getByRole('heading', { name: 'Account' })).toBeVisible();
  expect(screen.queryByText(/planned for a future/)).not.toBeInTheDocument();
});
