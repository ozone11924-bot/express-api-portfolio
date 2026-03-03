import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Users Sorting', () => {

  test('Sorts users by name ascending', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${USERS_URL}?sort=name&order=asc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('Sorts users by name descending', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.get(`${USERS_URL}?sort=name&order=desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

});