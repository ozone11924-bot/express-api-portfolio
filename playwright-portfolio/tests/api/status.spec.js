import { test, expect } from '@playwright/test';

test('GET /api/status returns ok', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/status');
  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.status).toBe('ok');
});