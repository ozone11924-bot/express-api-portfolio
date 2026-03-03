import { test, expect } from '@playwright/test';

test('GET /api/health returns healthy', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/health');
  expect(res.status()).toBe(200);

  const json = await res.json();
  expect(json.health).toBe('healthy');
});