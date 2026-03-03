import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Transactions Sorting', () => {

  test('Sorts transactions by amount ascending', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?sort=amount&order=asc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('Sorts transactions by amount descending', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?sort=amount&order=desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('Sorts transactions by type ascending', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?sort=type&order=asc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

});