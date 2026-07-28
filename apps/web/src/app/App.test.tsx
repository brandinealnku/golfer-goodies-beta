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
it('opens the same product from its image, name, and visible action', async () => {
  const user = userEvent.setup();
  route('#/course/summit-pines');
  await user.click(
    await screen.findByAltText('Fairway Club, demonstration item'),
  );
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
it('completes the Summit Pines product-to-cart journey with required modifier guidance', async () => {
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
  const add = screen.getByRole('button', { name: /Add · \$10\.95/ });
  expect(screen.getByText('Choose a side to continue.')).toBeVisible();
  expect(add).toHaveAccessibleDescription('Choose a side to continue.');
  await user.click(add);
  expect(screen.getAllByLabelText('Cart, 0 items')).toHaveLength(2);
  expect(screen.getByRole('group', { name: /Choose a side/ })).toHaveFocus();
  await user.click(screen.getByRole('radio', { name: 'Kettle chips' }));
  expect(
    screen.queryByText('Choose a side to continue.'),
  ).not.toBeInTheDocument();
  await user.click(add);
  expect(screen.getAllByLabelText('Cart, 1 items')).toHaveLength(2);
  const floatingCart = screen.getByRole('link', { name: /1 item.*View cart/i });
  expect(floatingCart).toHaveTextContent('$10.95');
  await user.click(floatingCart);
  expect(
    await screen.findByRole('heading', { name: /Summit Pines/ }),
  ).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Fairway Club' })).toBeVisible();
  expect(screen.getAllByText('$10.95').length).toBeGreaterThan(0);
});
it('recovers Cedar Bend verification through its course code and restores the product', async () => {
  const user = userEvent.setup();
  route('#/course/cedar-bend-muni');
  await user.click(
    await screen.findByRole('button', { name: 'View Citrus Sparkler details' }),
  );
  await user.click(
    screen.getByRole('button', { name: 'Start round to order' }),
  );
  expect(
    screen.getByRole('button', { name: 'Current location' }),
  ).toHaveAttribute('aria-pressed', 'true');
  expect(
    screen.getByText('This demo course requires a non-location method.'),
  ).toBeVisible();
  expect(screen.getByText('CEDAR-DEMO-QR')).toBeVisible();
  expect(screen.getByText('CEDAR3')).toBeVisible();
  await user.click(
    screen.getByRole('button', { name: 'Verify and start round' }),
  );
  expect(screen.getByText(/cannot verify the round/i)).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Course code' }));
  expect(screen.getByRole('button', { name: 'Course code' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const courseCodeInput = document.getElementById('verification-entry');
  expect(courseCodeInput).toHaveAccessibleName('Demo course code');
  await user.type(courseCodeInput as HTMLInputElement, 'CEDAR3');
  await user.click(
    screen.getByRole('button', { name: 'Verify and start round' }),
  );
  expect(screen.getByRole('dialog', { name: 'Citrus Sparkler' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: /Add ·/ }));
  expect(screen.getAllByLabelText('Cart, 1 items')).toHaveLength(2);
  await user.click(screen.getByRole('link', { name: /1 item.*View cart/i }));
  expect(
    await screen.findByRole('heading', { name: /Cedar Bend/ }),
  ).toBeVisible();
  expect(
    screen.getByRole('heading', { name: 'Citrus Sparkler' }),
  ).toBeVisible();
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
    screen.getByRole('heading', { name: 'Your cart is ready for the round' }),
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
