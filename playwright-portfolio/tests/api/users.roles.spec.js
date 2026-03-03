import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

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

test.describe('User Role-Based Access', () => {

  test('Admin can list all users', async ({ request }) => {
    const token = await loginAsAdmin(request);

    const res = await request.get(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(200);
  });

  test('User cannot list all users', async ({ request }) => {
    const token = await loginAsUser(request);

    const res = await request.get(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(res.status()).toBe(403);
  });

  test('User can access their own profile', async ({ request }) => {
    const token = await loginAsUser(request);

    // user@example.com is seeded as id: 2
    const res = await request.get(`${USERS_URL}/2`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const json = await res.json();
    expect(res.status()).toBe(200);
    expect(json.email).toBe('user@example.com');
  });

  test('User cannot access another user profile', async ({ request }) => {
    const adminToken = await loginAsAdmin(request);

    // Admin creates a second user
    const create = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Another User 2', email: 'another2@example.com' }
    });

    const created = await create.json();
    const userId = created.id;

    const userToken = await loginAsUser(request);

    const res = await request.get(`${USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    expect(res.status()).toBe(403);
  });

});