import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';
const USERS_URL = 'http://localhost:3000/api/users';

async function login(request) {
  const res = await request.post(LOGIN_URL, {
    data: { email: 'admin@example.com', password: 'secret' }
  });

  expect(res.status()).toBe(200);
  const json = await res.json();
  return json.token;
}

test.describe('Authenticated User CRUD Flow', () => {

  test('Login → Create User → Get User → Update User → Delete User', async ({ request }) => {
    const token = await login(request);

    // CREATE
    const createRes = await request.post(USERS_URL, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        name: 'Auth Flow User',
        email: `auth_${Date.now()}@example.com`
      }
    });

    expect(createRes.status()).toBe(201);
    const created = await createRes.json();
    const userId = created.id;

    // GET
    const getRes = await request.get(`${USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(getRes.status()).toBe(200);

    // UPDATE
    const updateRes = await request.put(`${USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Updated Auth User' }
    });

    expect(updateRes.status()).toBe(200);

    // DELETE
    const deleteRes = await request.delete(`${USERS_URL}/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(deleteRes.status()).toBe(200);
  });

});
