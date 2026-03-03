import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function loginAsAdmin(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  const json = await res.json();
  return json.token;
}

async function loginAsUser(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'user@example.com', password: 'secret' }
  });
  const json = await res.json();
  return json.token;
}

test.describe('Transaction Role-Based Access', () => {

  test('Admin can see all transactions', async ({ request }) => {
    const adminToken = await loginAsAdmin(request);

    const res = await request.get(TX_URL, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    expect(res.status()).toBe(200);
  });

  test('User only sees their own transactions', async ({ request }) => {
    const adminToken = await loginAsAdmin(request);
    const userToken = await loginAsUser(request);

    // Admin creates a transaction
    await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { amount: 50, type: 'deposit' }
    });

    // User creates a transaction
    await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { amount: 20, type: 'withdrawal' }
    });

    const res = await request.get(TX_URL, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const json = await res.json();

    expect(json.data.every(t => t.owner === 'user@example.com')).toBe(true);
  });

  test('User cannot see admin transactions', async ({ request }) => {
    const adminToken = await loginAsAdmin(request);
    const userToken = await loginAsUser(request);

    // Admin creates a transaction
    await request.post(TX_URL, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { amount: 100, type: 'deposit' }
    });

    const res = await request.get(TX_URL, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    const json = await res.json();

    expect(json.data.some(t => t.owner === 'admin@example.com')).toBe(false);
  });

});