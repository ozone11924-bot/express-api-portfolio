import { test, expect } from '@playwright/test';

const LOGIN_URL = 'http://localhost:3000/api/login';

test.describe('Role-Based Authentication', () => {

  test('Admin login returns admin role and token', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: 'admin@example.com', password: 'secret' }
    });

    expect(res.status()).toBe(200);
    const json = await res.json();

    expect(json.role).toBe('admin');
    expect(typeof json.token).toBe('string');
  });

  test('User login returns user role and token', async ({ request }) => {
    const res = await request.post(LOGIN_URL, {
      data: { email: 'user@example.com', password: 'secret' }
    });

    expect(res.status()).toBe(200);
    const json = await res.json();

    expect(json.role).toBe('user');
    expect(typeof json.token).toBe('string');
  });

  test('Invalid token returns 403 on protected route', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/users', {
      headers: { Authorization: 'Bearer invalid-token' }
    });

    expect(res.status()).toBe(403);
  });

  test('Missing token returns 401 on protected route', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/users');

    expect(res.status()).toBe(401);
  });

});