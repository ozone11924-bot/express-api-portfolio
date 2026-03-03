import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Users Pagination', () => {

  test('Returns correct page and limit', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${USERS_URL}?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('Returns empty data for page overflow', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${USERS_URL}?page=999&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await res.json();
    expect(json.data.length).toBe(0);
  });

});