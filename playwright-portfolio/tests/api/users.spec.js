import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function adminToken(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });
  return (await res.json()).token;
}

test.describe('Users API CRUD', () => {

  test('Create → Get → Update → Delete user', async ({ request }) => {
    const token = await adminToken(request);

    // CREATE
    const create = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Test User', email: `test_${Date.now()}@example.com` }
    });
    expect(create.status()).toBe(201);
    const created = await create.json();

    // GET
    const get = await request.get(`${USERS_URL}/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(get.status()).toBe(200);

    // UPDATE
    const update = await request.put(`${USERS_URL}/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Updated User' }
    });
    expect(update.status()).toBe(200);

    // DELETE
    const del = await request.delete(`${USERS_URL}/${created.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(del.status()).toBe(200);
  });

});