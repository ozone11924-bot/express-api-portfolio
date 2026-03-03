import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function userToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'user@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Transaction Validation Tests', () => {

  test('Rejects transaction without amount', async ({ request }) => {
    const token = await userToken(request);

    const res = await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { type: 'deposit' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects transaction without type', async ({ request }) => {
    const token = await userToken(request);

    const res = await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { amount: 50 }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects negative amount', async ({ request }) => {
    const token = await userToken(request);

    const res = await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { amount: -10, type: 'withdrawal' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects invalid transaction type', async ({ request }) => {
    const token = await userToken(request);

    const res = await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { amount: 20, type: 'invalid' }
    });

    expect(res.status()).toBe(400);
  });

});
