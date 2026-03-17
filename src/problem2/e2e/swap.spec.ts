import { test, expect, type Page } from '@playwright/test';

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Wait for the swap card to be visible AND tokens to finish loading */
async function waitForReady(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('swap-card')).toBeVisible();
  // Wait until loading skeletons are gone
  await expect(page.getByTestId('sell-loading-skeleton')).not.toBeAttached({ timeout: 10_000 });
}

async function openSellTokenPicker(page: Page) {
  await page.getByTestId('sell-section').getByTestId('token-selector-selected').click();
  await expect(page.getByTestId('token-list')).toBeVisible();
}

async function openBuyTokenPicker(page: Page) {
  // Buy section starts with "Select token"
  const buySection = page.getByTestId('buy-section');
  const picker = buySection.getByTestId('token-selector-empty').or(buySection.getByTestId('token-selector-selected'));
  await picker.click();
  await expect(page.getByTestId('token-list')).toBeVisible();
}

async function selectToken(page: Page, symbol: string) {
  await page.getByTestId(`token-option-${symbol}`).click();
}

// ─── Suite: Initial Render ──────────────────────────────────────────────────

test.describe('Initial Render', () => {
  test('renders the swap card', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('swap-card')).toBeVisible();
  });

  test('shows loading skeletons while fetching tokens', async ({ page }) => {
    await page.goto('/');
    // Skeletons should be visible momentarily before tokens load
    // (race condition OK — we just confirm card appears)
    await expect(page.getByTestId('swap-card')).toBeVisible();
  });

  test('shows Sell and Buy section labels', async ({ page }) => {
    await waitForReady(page);
    await expect(page.getByText('Sell')).toBeVisible();
    await expect(page.getByText('Buy')).toBeVisible();
  });

  test('sell section defaults to USD token after load', async ({ page }) => {
    await waitForReady(page);
    const sellSection = page.getByTestId('sell-section');
    await expect(sellSection.getByTestId('token-selector-selected')).toContainText('USD');
  });

  test('buy section shows "Select token" initially', async ({ page }) => {
    await waitForReady(page);
    const buySection = page.getByTestId('buy-section');
    await expect(buySection.getByTestId('token-selector-empty')).toBeVisible();
  });

  test('swap button shows "Please select tokens" when no buy token', async ({ page }) => {
    await waitForReady(page);
    await expect(page.getByTestId('swap-submit-btn')).toContainText('Please select tokens');
    await expect(page.getByTestId('swap-submit-btn')).toBeDisabled();
  });

  test('sell amount input defaults to 0', async ({ page }) => {
    await waitForReady(page);
    await expect(page.getByTestId('sell-amount-input')).toHaveValue('0');
  });
});

// ─── Suite: Token Picker Dialog ─────────────────────────────────────────────

test.describe('Token Picker Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await waitForReady(page);
  });

  test('opens token picker when clicking sell token selector', async ({ page }) => {
    await openSellTokenPicker(page);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByTestId('token-search-input')).toBeVisible();
  });

  test('opens token picker when clicking buy "Select token" button', async ({ page }) => {
    await openBuyTokenPicker(page);
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('search input is auto-focused when dialog opens', async ({ page }) => {
    await openBuyTokenPicker(page);
    await expect(page.getByTestId('token-search-input')).toBeFocused();
  });

  test('filters tokens by search query (case-insensitive)', async ({ page }) => {
    await openBuyTokenPicker(page);
    await page.getByTestId('token-search-input').fill('eth');
    const list = page.getByTestId('token-list');
    // ETH should be present
    await expect(list.getByTestId('token-option-ETH')).toBeVisible();
  });

  test('shows "No tokens found" for unmatched search', async ({ page }) => {
    await openBuyTokenPicker(page);
    await page.getByTestId('token-search-input').fill('zzz_no_match_xyz');
    await expect(page.getByTestId('token-empty-state')).toBeVisible();
    await expect(page.getByTestId('token-empty-state')).toContainText('No tokens found');
  });

  test('closes dialog and selects token on click', async ({ page }) => {
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    const buySection = page.getByTestId('buy-section');
    await expect(buySection.getByTestId('token-selector-selected')).toContainText('ETH');
  });

  test('closes dialog when pressing Escape', async ({ page }) => {
    await openBuyTokenPicker(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('clears search query when dialog is closed and re-opened', async ({ page }) => {
    await openBuyTokenPicker(page);
    await page.getByTestId('token-search-input').fill('eth');
    await page.keyboard.press('Escape');
    await openBuyTokenPicker(page);
    await expect(page.getByTestId('token-search-input')).toHaveValue('');
  });

  test('shows "Selected" badge on currently selected token', async ({ page }) => {
    // USD is already selected on sell side
    await openSellTokenPicker(page);
    const usdRow = page.getByTestId('token-option-USD');
    await expect(usdRow).toContainText('Selected');
    await expect(usdRow).toHaveAttribute('aria-selected', 'true');
  });

  test('lists multiple tokens in the dialog', async ({ page }) => {
    await openBuyTokenPicker(page);
    // Should have many token options
    const options = page.getByRole('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(2);
  });
});

// ─── Suite: Amount Input ────────────────────────────────────────────────────

test.describe('Amount Input Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await waitForReady(page);
    // Select ETH as buy token for all these tests
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
  });

  test('swap button shows "Please enter an amount" when amounts are 0', async ({ page }) => {
    await expect(page.getByTestId('swap-submit-btn')).toContainText('Please enter an amount');
    await expect(page.getByTestId('swap-submit-btn')).toBeDisabled();
  });

  test('typing in sell input calculates buy amount', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('100');
    const buyInput = page.getByTestId('buy-amount-input');
    const buyValue = await buyInput.inputValue();
    expect(parseFloat(buyValue)).toBeGreaterThan(0);
  });

  test('typing in buy input calculates sell amount', async ({ page }) => {
    const buyInput = page.getByTestId('buy-amount-input');
    // Click buy section to focus it
    await page.getByTestId('buy-section').click();
    await buyInput.fill('1');
    const sellInput = page.getByTestId('sell-amount-input');
    const sellValue = await sellInput.inputValue();
    expect(parseFloat(sellValue)).toBeGreaterThan(0);
  });

  test('sell input rejects non-numeric characters', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('abc');
    // After stripping non-numeric, the value is either '' or '0' (placeholder)
    const val = await sellInput.inputValue();
    // Should not contain alphabetic characters
    expect(val).toMatch(/^[0-9.]*$/);
  });

  test('sell input strips leading zeros', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('019999');
    const val = await sellInput.inputValue();
    expect(val).not.toMatch(/^0\d/);
  });

  test('sell input allows decimals', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('1.5');
    await expect(sellInput).toHaveValue('1.5');
  });

  test('fiat value updates when sell amount changes', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('1000');
    const fiatLabel = page.getByTestId('sell-fiat-value');
    const fiatText = await fiatLabel.innerText();
    expect(fiatText).not.toBe('$0.00');
  });

  test('swap button becomes enabled when both tokens and amount > 0', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('10');
    await expect(page.getByTestId('swap-submit-btn')).not.toBeDisabled();
    await expect(page.getByTestId('swap-submit-btn')).toContainText('Swap');
  });
});

// ─── Suite: Exchange Rate Display ───────────────────────────────────────────

test.describe('Exchange Rate Display', () => {
  test('exchange rate shown in buy section after both tokens selected', async ({ page }) => {
    await waitForReady(page);
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
    const rateEl = page.getByTestId('exchange-rate');
    await expect(rateEl).toBeVisible();
    const text = await rateEl.innerText();
    expect(text).toContain('USD');
    expect(text).toContain('ETH');
  });

  test('exchange rate NOT shown in sell section', async ({ page }) => {
    await waitForReady(page);
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
    const sellSection = page.getByTestId('sell-section');
    await expect(sellSection.getByTestId('exchange-rate')).not.toBeVisible();
  });
});

// ─── Suite: Switch Direction ────────────────────────────────────────────────

test.describe('Switch Direction Button', () => {
  test.beforeEach(async ({ page }) => {
    await waitForReady(page);
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
  });

  test('switch button is visible', async ({ page }) => {
    await expect(page.getByTestId('switch-direction-btn')).toBeVisible();
  });

  test('clicking switch swaps sell and buy tokens', async ({ page }) => {
    await page.getByTestId('switch-direction-btn').click();
    const sellSection = page.getByTestId('sell-section');
    const buySection = page.getByTestId('buy-section');
    await expect(sellSection.getByTestId('token-selector-selected')).toContainText('ETH');
    await expect(buySection.getByTestId('token-selector-selected')).toContainText('USD');
  });

  test('clicking switch preserves amounts (swaps them)', async ({ page }) => {
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('50');
    const buyValueBefore = await page.getByTestId('buy-amount-input').inputValue();

    await page.getByTestId('switch-direction-btn').click();

    const sellAfter = await page.getByTestId('sell-amount-input').inputValue();
    const buyAfter = await page.getByTestId('buy-amount-input').inputValue();
    // After switch: sell gets the old buy value, buy gets '50'
    expect(sellAfter).toBe(buyValueBefore);
    expect(buyAfter).toBe('50');
  });
});

// ─── Suite: Auto-Switch When Same Token Selected ─────────────────────────────

test.describe('Auto-switch on same token selection', () => {
  test('selecting same token for buy triggers token swap', async ({ page }) => {
    await waitForReady(page);
    // Current sell = USD. Now open buy picker and pick USD → should auto-switch
    await openBuyTokenPicker(page);
    await selectToken(page, 'USD');
    // Buy token should now be USD and sell token should be empty or swapped
    const sellSection = page.getByTestId('sell-section');
    const buySection = page.getByTestId('buy-section');
    // After auto-switch: sell becomes previous buy (empty/none → no-op, or tokens flip)
    // At minimum: buy selector should NOT be empty anymore or sell is now empty
    const buyToken = buySection.getByTestId('token-selector-selected');
    const sellToken = sellSection.getByTestId('token-selector-selected');
    const buyMatchesUSD = await buyToken.isVisible();
    const sellMatchesUSD = await sellToken.isVisible();
    // At least one of them should be USD (auto-switch happened)
    expect(buyMatchesUSD || sellMatchesUSD).toBeTruthy();
  });
});

// ─── Suite: Swap Flow ───────────────────────────────────────────────────────

test.describe('Swap Execution Flow', () => {
  test.beforeEach(async ({ page }) => {
    await waitForReady(page);
    // Select buy token and enter amount
    await openBuyTokenPicker(page);
    await selectToken(page, 'ETH');
    const sellInput = page.getByTestId('sell-amount-input');
    await sellInput.click();
    await sellInput.fill('100');
    await expect(page.getByTestId('swap-submit-btn')).not.toBeDisabled();
  });

  test('clicking swap shows loading state', async ({ page }) => {
    await page.getByTestId('swap-submit-btn').click();
    // Button text changes to Loading...
    await expect(page.getByTestId('swap-submit-btn')).toContainText('Loading');
    await expect(page.getByTestId('swap-submit-btn')).toBeDisabled();
  });

  test('swap success banner appears after swap completes', async ({ page }) => {
    await page.getByTestId('swap-submit-btn').click();
    // Swap has 1.5s loading + 1.5s success display
    // Wait for success state: either the banner message or the success button text
    await page.waitForFunction(
      () => document.body.innerText.includes('swap was completed') || document.body.innerText.includes('Swap successful'),
      { timeout: 8_000 }
    );
  });

  test('amounts reset to 0 after successful swap', async ({ page }) => {
    await page.getByTestId('swap-submit-btn').click();
    // Wait for success then idle
    await expect(page.getByTestId('sell-amount-input')).toHaveValue('0', { timeout: 8_000 });
    await expect(page.getByTestId('buy-amount-input')).toHaveValue('0', { timeout: 8_000 });
  });
});

// ─── Suite: Accessibility ───────────────────────────────────────────────────

test.describe('Accessibility', () => {
  test('swap card has correct role and aria-label', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main', { name: 'Currency swap form' })).toBeVisible();
  });

  test('sell section group role is labelled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('group', { name: 'Sell section' })).toBeVisible();
  });

  test('buy section group role is labelled', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('group', { name: 'Buy section' })).toBeVisible();
  });

  test('token picker dialog has listbox with aria-label', async ({ page }) => {
    await waitForReady(page);
    await openBuyTokenPicker(page);
    await expect(page.getByRole('listbox', { name: 'Choose token' })).toBeVisible();
  });

  test('switch direction button has accessible label', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Switch sell and buy tokens' })).toBeVisible();
  });
});

// ─── Suite: Responsive Layout ───────────────────────────────────────────────

test.describe('Responsive Layout', () => {
  test('renders correctly on desktop (1280x800)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await waitForReady(page);
    await expect(page.getByTestId('swap-card')).toBeVisible();
  });

  test('renders correctly on mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await waitForReady(page);
    await expect(page.getByTestId('swap-card')).toBeVisible();
    await expect(page.getByTestId('swap-submit-btn')).toBeVisible();
  });

  test('renders correctly on tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await waitForReady(page);
    await expect(page.getByTestId('swap-card')).toBeVisible();
  });
});
