import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('User Validation Tests', () => {

  test('Rejects user creation without name', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { email: 'test@example.com' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects user creation without email', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Test User' }
    });

    expect(res.status()).toBe(400);
  });

  test('Rejects invalid email format', async ({ request }) => {
    const token = await adminToken(request);

    const res = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Test User', email: 'not-an-email' }
    });

    expect(res.status()).toBe(400);
  });

});
