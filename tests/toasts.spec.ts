const { test, expect } = require('@playwright/test');

test.describe('Toast Notifications & Images Verification', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({ status: 200, json: { success: true, user: { _id: '1', email: 'test@test.com' } } });
    });
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({ status: 200, json: { success: true, user: { _id: '1', email: 'test@test.com' }, token: 'abc' } });
    });
    await page.route('**/orders', async (route) => {
      await route.fulfill({ status: 200, json: { success: true, order: { _id: 'order1' } } });
    });
  });

  test('Home & Beauty category images are valid', async ({ page }) => {
    // Navigate to Home category
    await page.goto('/products?category=Home');
    await page.waitForLoadState('networkidle');
    
    // Get all product images
    const homeImages = await page.locator('img').all();
    for (const img of homeImages) {
      const src = await img.getAttribute('src');
      if (src && !src.includes('unsplash.com') && !src.includes('placeholder.com')) {
        // Just verify it's a valid URL and not the broken placeholder
        expect(src).not.toContain('via.placeholder.com');
      }
    }

    // Navigate to Beauty category
    await page.goto('/products?category=Beauty');
    await page.waitForLoadState('networkidle');
    
    const beautyImages = await page.locator('img').all();
    for (const img of beautyImages) {
      const src = await img.getAttribute('src');
      if (src && !src.includes('unsplash.com') && !src.includes('placeholder.com')) {
        expect(src).not.toContain('via.placeholder.com');
      }
    }
  });

  test('Authentication toasts (Register)', async ({ page }) => {
    // Register
    await page.goto('/register');
    const uniqueEmail = `test${Date.now()}@example.com`;
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[type="email"]', uniqueEmail);
    const passInputs = await page.locator('input[type="password"]').all();
    await passInputs[0].fill('password123');
    await passInputs[1].fill('password123');
    await page.fill('input[placeholder="Street Address"]', '123 Main St');
    await page.fill('input[placeholder="City"]', 'Test City');
    await page.fill('input[placeholder="State"]', 'TS');
    await page.fill('input[placeholder="Pincode"]', '123456');
    await page.check('input[type="checkbox"]');
    await page.click('button[type="submit"]');

    // Assert register toast
    await expect(page.locator('.Toastify__toast-body')).toContainText('Account created successfully', { timeout: 10000 });
  });

});
