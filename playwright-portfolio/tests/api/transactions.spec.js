import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function userToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'user@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Transactions API', () => {

  test('Create multiple transactions (data-driven)', async ({ request }) => {
    const token = await userToken(request);

    const cases = [
      { amount: 10, type: 'deposit' },
      { amount: 20, type: 'withdrawal' },
      { amount: 30, type: 'deposit' }
    ];

    for (const c of cases) {
      const res = await request.post(TX_URL, {
        headers: { Authorization: `Bearer ${token}` },
        data: c
      });

      expect(res.status()).toBe(201);
    }
  });

});