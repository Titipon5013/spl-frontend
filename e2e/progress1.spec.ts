import { expect, type Page, test } from '@playwright/test';

const apiPattern = 'http://127.0.0.1:8000/api/**';

async function mockProgress1Api(page: Page) {
  const seenRequests: string[] = [];

  await page.route(apiPattern, async (route) => {
    const requestUrl = new URL(route.request().url());
    seenRequests.push(`${requestUrl.pathname}${requestUrl.search}`);

    if (requestUrl.pathname === '/api/analytics/current') {
      const lotId = requestUrl.searchParams.get('lot_id');
      const data =
        lotId === 'CAMT_02'
          ? { available_spaces: 21, occupied_spaces: 20, total_spaces: 41 }
          : { available_spaces: 24, occupied_spaces: 10, total_spaces: 34 };
      await route.fulfill({ json: data });
      return;
    }

    if (requestUrl.pathname === '/api/analytics/heatmap') {
      const lotId = requestUrl.searchParams.get('lot_id');
      await route.fulfill({
        json: {
          spots: [
            { spot_id: 'A1', occupancy_percentage: lotId === 'CAMT_02' ? 90 : 20 },
            { spot_id: 'B1', occupancy_percentage: 55 },
            { spot_id: 'C1', occupancy_percentage: 15 },
            { spot_id: 'D1', occupancy_percentage: 82 },
          ],
        },
      });
      return;
    }

    if (requestUrl.pathname === '/api/analytics/health') {
      await route.fulfill({
        json: {
          system_status: 'Healthy',
          uptime_percentage: 97,
          board: { status: 'online' },
          camera_1: { status: 'online' },
          camera_2: { status: 'online' },
          camera_3: { status: 'online' },
          camera_4: { status: 'online' },
        },
      });
      return;
    }

    if (requestUrl.pathname === '/api/analytics/kpis') {
      await route.fulfill({
        json: {
          utilization_percentage: 62,
          peak_occupancy: 26,
          vehicle_count: 42,
          avg_dwell_time_minutes: 18,
        },
      });
      return;
    }

    if (requestUrl.pathname === '/api/analytics/trends') {
      const lotId = requestUrl.searchParams.get('lot_id');
      await route.fulfill({
        json: {
          trends: [
            { time_label: '2026-06-12 08:00', average_occupancy: lotId === 'CAMT_02' ? 28 : 17 },
            { time_label: '2026-06-12 10:00', average_occupancy: lotId === 'CAMT_02' ? 32 : 10 },
          ],
          peak_hour: lotId === 'CAMT_02' ? '2026-06-12 10:00' : '2026-06-12 08:00',
        },
      });
      return;
    }

    if (requestUrl.pathname === '/api/analytics/export') {
      const format = requestUrl.searchParams.get('export_format') || 'csv';
      await route.fulfill({
        status: 200,
        headers: {
          'content-type': format === 'pdf' ? 'application/pdf' : 'text/csv',
          'content-disposition': `attachment; filename="parkpilot-CAMT_02.${format}"`,
        },
        body: format === 'pdf' ? '%PDF-parkpilot' : 'metric,value\noccupied,20\n',
      });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: `Unhandled mock route: ${requestUrl.pathname}` } });
  });

  return seenRequests;
}

async function mockDegradedHealthApi(page: Page) {
  await page.route(apiPattern, async (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.pathname === '/api/analytics/health') {
      await route.fulfill({
        json: {
          system_status: 'Degraded',
          uptime_percentage: 92,
          board: { status: 'online' },
          camera_1: { status: 'online' },
          camera_2: { status: 'offline' },
          camera_3: { status: 'online' },
          camera_4: { status: 'online' },
        },
      });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: `Unhandled mock route: ${requestUrl.pathname}` } });
  });
}

test.describe('Progress I browser verification on Firefox', () => {
  test('redirects protected dashboard route to login when token is missing', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: /sign in to dashboard/i })).toBeVisible();
  });

  test('renders dashboard analytics, switches lot filter, and downloads exports', async ({ page }) => {
    const seenRequests = await mockProgress1Api(page);
    await page.addInitScript(() => localStorage.setItem('token', 'approved-admin-token'));

    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Parking Operations Overview' })).toBeVisible();
    await expect(page.getByText('40.0%')).toBeVisible();
    await expect(page.getByText('Vehicle Count')).toBeVisible();
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByText('Average Dwell')).toBeVisible();
    await expect(page.getByText('18 min')).toBeVisible();
    await expect(page.getByRole('button', { name: 'A1' })).toBeVisible();
    await expect(page.getByText('High demand 80-100%')).toBeVisible();

    await page.getByLabel('Lot filter').selectOption('CAMT_02');
    await expect
      .poll(() => seenRequests.includes('/api/analytics/heatmap?lot_id=CAMT_02'))
      .toBe(true);
    await expect
      .poll(() => seenRequests.some((url) => url.startsWith('/api/analytics/kpis?') && url.includes('lot_id=CAMT_02')))
      .toBe(true);

    const [csvDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /CSV/ }).click(),
    ]);
    expect(csvDownload.suggestedFilename()).toMatch(/parkpilot-CAMT_02.*\.csv$/);

    const [pdfDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: /PDF/ }).click(),
    ]);
    expect(pdfDownload.suggestedFilename()).toMatch(/parkpilot-CAMT_02.*\.pdf$/);
  });

  test('renders degraded system health and camera incident state', async ({ page }) => {
    await mockDegradedHealthApi(page);
    await page.addInitScript(() => localStorage.setItem('token', 'approved-admin-token'));

    await page.goto('/system-health');

    await expect(page.getByRole('heading', { name: 'System Infrastructure Health' })).toBeVisible();
    await expect(page.getByText('System degraded')).toBeVisible();
    await expect(page.getByText('3 / 4')).toBeVisible();
    await expect(page.getByText('92%').first()).toBeVisible();
    await expect(page.getByText('Hardware alert')).toBeVisible();
    await expect(page.getByText('Parking Area 2 is offline')).toBeVisible();
  });

  test('renders weekly report insight, KPI summary, and uptime', async ({ page }) => {
    await mockProgress1Api(page);
    await page.addInitScript(() => localStorage.setItem('token', 'approved-admin-token'));

    await page.goto('/reports');

    await expect(page.getByRole('heading', { name: 'Weekly Performance Report' })).toBeVisible();
    await expect(page.getByText(/CAMT_01 reached peak demand at 08:00/)).toBeVisible();
    await expect(page.getByText('12 cars').or(page.getByText('42 cars'))).toBeVisible();
    await expect(page.getByText('18 min')).toBeVisible();
    await expect(page.getByText('97%')).toBeVisible();
    await expect(page.getByText('CAMT_01 Peak Hours')).toBeVisible();
    await expect(page.getByText('CAMT_02 Peak Hours')).toBeVisible();
  });
});
