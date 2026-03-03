import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';

test.describe('Auth Token Tests', () => {

  test('Valid login returns a token string', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: 'admin@example.com', password: 'secret' }
    });

    expect(res.status()).toBe(200);
    const json = await res.json();

    expect(typeof json.token).toBe('string');
    expect(json.token.length).toBeGreaterThan(10);
  });

  test('Multiple failed logins still return 401', async ({ request }) => {
    for (let i = 0; i < 5; i++) {
      const res = await request.post(LOGIN_URL, {
        data: { email: 'wrong@example.com', password: 'bad' }
      });

      expect(res.status()).toBe(401);
    }
  });

});
