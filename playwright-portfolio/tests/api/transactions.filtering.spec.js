import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Transactions Filtering', () => {

  test('Filters by type', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?type=deposit`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('Filters by amount range', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?minAmount=20&maxAmount=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

});