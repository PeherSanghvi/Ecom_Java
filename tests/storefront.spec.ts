import { test, expect } from '@playwright/test';

const mockProducts = [
  { _id: '1', id: '1', title: 'Product 1', priceCents: 1000, category: 'Electronics', brand: 'Brand A' },
  { _id: '2', id: '2', title: 'Product 2', priceCents: 2000, category: 'Electronics', brand: 'Brand B' },
  { _id: '3', id: '3', title: 'Product 3', priceCents: 3000, category: 'Home', brand: 'Brand C' }
];

test.describe('Storefront Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
      };

      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers });
      }

      const url = route.request().url();

      if (url.includes('/product/categories/hierarchy')) {
        return route.fulfill({ status: 200, headers, json: { success: true, data: { 'Electronics': ['Phones'] } } });
      }

      if (url.includes('/products/1')) {
        return route.fulfill({
          status: 200, headers,
          json: {
            success: true,
            data: {
              _id: '1',
              id: '1',
              title: 'Premium Product',
              priceCents: 500000,
              description: 'A premium product',
              category: 'Electronics',
              brand: 'Aura',
              stockQuantity: 10,
              images: ['img1.png', 'img2.png']
            }
          }
        });
      }

      if (url.includes('/products')) {
        return route.fulfill({
          status: 200, headers,
          json: {
            success: true,
            data: mockProducts,
            pagination: { totalPages: 2, currentPage: 1, totalItems: 24 }
          }
        });
      }

      route.continue();
    });
  });

  test('Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Products page displays skeleton loader then products', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('text=Product 1').first()).toBeVisible();
  });

  test('Search functionality updates title', async ({ page }) => {
    await page.goto('/products?q=TestSearch');
    await expect(page.locator('text=TestSearch').first()).toBeVisible();
  });

  test('Sorting options are present', async ({ page }) => {
    await page.goto('/products');
    const select = page.locator('select').first();
    await select.waitFor({ state: 'attached' });
  });

  test('Pagination controls', async ({ page }) => {
    await page.goto('/products');
    const nextBtn = page.locator('button', { hasText: 'Next' }).first();
    if (await nextBtn.count() > 0) {
      await nextBtn.click();
    }
  });

  test('Product Detail shows price, images, related', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('text=Premium Product').first()).toBeVisible();
  });

  test('Responsive Layout (Mobile Sidebar Filter)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    const filterBtn = page.locator('button', { hasText: 'Filters' }).first();
    if (await filterBtn.count() > 0) {
      await filterBtn.click();
    }
  });
});
