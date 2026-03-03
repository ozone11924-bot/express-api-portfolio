import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Users Filtering', () => {

  test('Filters users by search term', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${USERS_URL}?search=user`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

});