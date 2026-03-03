import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const TX_URL = 'http://localhost:3000/api/transactions';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  const json = await res.json();
  return json.token;
}

test.describe('Transactions Pagination', () => {

  test('Returns correct pagination metadata', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${TX_URL}?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
    const json = await res.json();

    expect(json.page).toBe(1);
    expect(json.limit).toBe(5);
    expect(typeof json.total).toBe('number');
    expect(typeof json.totalPages).toBe('number');
    expect(Array.isArray(json.data)).toBe(true);
    expect(json.data.length).toBeLessThanOrEqual(5);
  });

});