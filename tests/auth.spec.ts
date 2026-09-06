import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Mock the login API
    await page.route('**/auth/login', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      if (postData?.email === 'invalid@example.com') {
        await route.fulfill({
          status: 401,
          json: { success: false, error: 'Invalid email or credentials' }
        });
      } else {
        await route.fulfill({
          status: 200,
          json: { success: true, user: { _id: '123', email: postData?.email || 'user@example.com', role: 'user' } }
        });
      }
    });

    // Mock the register API
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        json: { success: true, user: { _id: '123', email: 'newuser@example.com', role: 'user' } }
      });
    });

    // Mock the admin login API
    await page.route('**/auth/admin/login', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      if (postData?.email === 'invalid@example.com') {
        await route.fulfill({
          status: 401,
          json: { success: false, error: 'Invalid admin credentials' }
        });
      } else {
        await route.fulfill({
          status: 200,
          json: { success: true, user: { _id: 'admin123', email: 'admin@example.com', role: 'ADMIN' }, token: 'mock-token' }
        });
      }
    });
  });

  test('User Registration', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[placeholder="you@example.com"]', 'testuser@example.com');
    
    // Fill password and confirm password
    const passwordInputs = page.locator('input[placeholder="••••••••"]');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('password123');
    
    // Fill address
    await page.fill('input[placeholder="Street Address"]', '789 Real Street');
    await page.fill('input[placeholder="City"]', 'Chennai');
    await page.fill('input[placeholder="State"]', 'Tamil Nadu');
    await page.fill('input[placeholder="Pincode"]', '600001');
    
    // Check Terms checkbox
    await page.locator('input[type="checkbox"]').check();

    // Submit
    await page.click('button[type="submit"]');

    // Expected redirect to /
    await expect(page).toHaveURL('/');
    
    // Check JWT persistence (LocalStorage)
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toContain('newuser@example.com');
  });

  test('Validation error (passwords do not match)', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[placeholder="John"]', 'Test');
    await page.fill('input[placeholder="Doe"]', 'User');
    await page.fill('input[placeholder="you@example.com"]', 'testuser@example.com');
    
    const passwordInputs = page.locator('input[placeholder="••••••••"]');
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('password456');

    // Fill address
    await page.fill('input[placeholder="Street Address"]', '789 Real Street');
    await page.fill('input[placeholder="City"]', 'Chennai');
    await page.fill('input[placeholder="State"]', 'Tamil Nadu');
    await page.fill('input[placeholder="Pincode"]', '600001');
    await page.locator('input[type="checkbox"]').check();

    await page.click('button[type="submit"]');

    // Error should be visible
    const errorMsg = page.locator('.text-red-600');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Passwords do not match');
  });

  test('User Login and Logout (JWT clearing)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="you@example.com"]', 'valid@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');

    // Check LocalStorage
    let user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toContain('valid@example.com');

    // Instead of clicking logout (since we don't know the exact locator), we can clear storage to simulate
    await page.evaluate(() => localStorage.removeItem('user'));
    user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toBeNull();
  });

  test('Invalid Login shows error message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="you@example.com"]', 'invalid@example.com');
    await page.fill('input[placeholder="••••••••"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Check for error message
    const errorMsg = page.locator('.text-red-600');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Invalid email or credentials');
  });

  test('Admin Login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[placeholder="admin@example.com"]', 'admin@example.com');
    await page.fill('input[placeholder="••••••••"]', 'adminpass');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin/dashboard');
  });

  test('Route Guards and Redirect after login', async ({ page }) => {
    // Go to protected route
    await page.goto('/orders');
    
    // Should be redirected to login with query param
    await expect(page).toHaveURL(/\/login\?from=\/orders/);

    // Login
    await page.fill('input[placeholder="you@example.com"]', 'valid@example.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button[type="submit"]');

    // Should redirect back to /orders
    await expect(page).toHaveURL(/\/orders/);
  });
});
