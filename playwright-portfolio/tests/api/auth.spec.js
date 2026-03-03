import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';

test.describe('Auth API Negative Tests', () => {

  test('Rejects missing email', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { password: 'test123' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects missing password', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: 'test@example.com' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects invalid credentials', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: {
        email: 'wrong@example.com',
        password: 'incorrect'
      }
    });

    expect(res.status()).toBe(401);
  });

});