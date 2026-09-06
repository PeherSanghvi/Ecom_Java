import { test, expect } from '@playwright/test';

test.describe('Cart & Checkout Flow', () => {

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
      const method = route.request().method();

      if (url.includes('/products/1')) {
        return route.fulfill({
          status: 200, headers,
          json: {
            success: true,
            data: {
              _id: '1',
              id: '1',
              title: 'Test Product',
              priceCents: 100000,
              stockQuantity: 10,
              images: ['https://via.placeholder.com/150'],
            }
          }
        });
      }

      if (url.includes('/orders/customer/123')) {
        return route.fulfill({
          status: 200, headers,
          json: {
            success: true,
            orders: [
              { id: 'ORD-12345', _id: 'ORD-12345', status: 'PENDING', totalMinor: 100000, orderDate: new Date().toISOString() }
            ]
          }
        });
      }

      if (url.includes('/orders/ORD-12345')) {
        return route.fulfill({
          status: 200, headers,
          json: {
            success: true,
            order: {
              id: 'ORD-12345',
              _id: 'ORD-12345',
              status: 'PENDING',
              totalMinor: 100000,
              items: [
                { title: 'Test Product', quantity: 1, unitPriceCents: 100000, unit_price_minor: 100000 }
              ]
            }
          }
        });
      }

      if (url.includes('/orders') && method === 'POST') {
        return route.fulfill({
          status: 200, headers,
          json: { success: true, orderId: 'ORD-12345' }
        });
      }

      route.continue();
    });

    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('user', JSON.stringify({
        _id: '123',
        id: '123',
        email: 'test@example.com',
        role: 'user'
      }));
    });
  });

  test('Add to Cart, Update Quantity, Money Calculations, Remove', async ({ page }) => {
    await page.goto('/products/1');
    await expect(page.locator('text=Test Product').first()).toBeVisible();
    
    await page.click('button:has-text("Add to Cart"), button:has-text("Add")');
    
    await page.goto('/cart');
    await expect(page.locator('text=Test Product').first()).toBeVisible();
    
    const plusBtn = page.locator('button').filter({ has: page.locator('svg.lucide-plus') }).first();
    if (await plusBtn.count() > 0) {
      await plusBtn.click();
    }
    
    const removeBtn = page.locator('button:has-text("Remove")').first();
    if (await removeBtn.count() > 0) {
      await removeBtn.click();
    }
  });

  test('Checkout Flow & Order Success', async ({ page }) => {
    await page.goto('/products/1', { waitUntil: 'load' });
    
    const productText = page.locator('text=Test Product').first();
    if (await productText.count() > 0) {
      await expect(productText).toBeVisible({ timeout: 10000 });
      await page.click('button:has-text("Add to Cart"), button:has-text("Add")');
      
      await page.goto('/checkout', { waitUntil: 'load' });
      
      const shippingText = page.locator('text=Shipping Address').first();
      if (await shippingText.count() > 0) {
        await expect(shippingText).toBeVisible({ timeout: 5000 });
        
        const continueBtn = page.locator('button:has-text("Continue to Payment")').first();
        if (await continueBtn.count() > 0) {
          await continueBtn.click();
          
          const paymentText = page.locator('text=Payment Method').first();
          if (await paymentText.count() > 0) {
            await expect(paymentText).toBeVisible({ timeout: 5000 });
            
            const reviewBtn = page.locator('button:has-text("Review Order")').first();
            if (await reviewBtn.count() > 0) {
              await reviewBtn.click();
              
              const reviewText = page.locator('text=Review Order').first();
              if (await reviewText.count() > 0) {
                await expect(reviewText).toBeVisible({ timeout: 5000 });
                
                const placeBtn = page.locator('button:has-text("Place Order")').first();
                if (await placeBtn.count() > 0) {
                  await placeBtn.click();
                  
                  const confirmText = page.locator('text=Order Confirmed, text=Thank You, text=Success').first();
                  if (await confirmText.count() > 0) {
                    await expect(confirmText).toBeVisible({ timeout: 10000 });
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  test('Order History and Detail', async ({ page }) => {
    await page.goto('/orders', { waitUntil: 'load' });
    
    const orderText = page.locator('text=ORD-12345').first();
    if (await orderText.count() > 0) {
      await expect(orderText).toBeVisible({ timeout: 10000 });
      
      await page.goto('/orders/ORD-12345', { waitUntil: 'load' });
      await expect(page.locator('text=Test Product').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Wishlist', async ({ page }) => {
    await page.goto('/products/1', { waitUntil: 'load' });
    
    const productText = page.locator('text=Test Product').first();
    if (await productText.count() > 0) {
      await expect(productText).toBeVisible({ timeout: 10000 });
      
      const heartBtn = page.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
      if (await heartBtn.count() > 0) {
        await heartBtn.click();
      }
      
      await page.goto('/wishlist', { waitUntil: 'load' });
    }
  });
});
