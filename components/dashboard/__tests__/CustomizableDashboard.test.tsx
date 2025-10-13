import { jest } from '@jest/globals';
import React, { Suspense } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_DASHBOARD_CONFIG } from '../../../utils/dashboardDefaults';

const mockUseSettings = jest.fn();

jest.mock('../../../services/supabaseClient', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockResolvedValue({ data: null, error: null }),
      delete: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
  },
}));

jest.mock('../../../contexts/SettingsContext', () => ({
  __esModule: true,
  useSettings: () => mockUseSettings(),
}));

const CustomizableDashboard = require('../CustomizableDashboard').default as typeof import('../CustomizableDashboard').default;

describe('CustomizableDashboard', () => {
  const mockUpdateSettings = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    const configClone = JSON.parse(JSON.stringify(DEFAULT_DASHBOARD_CONFIG));

    mockUseSettings.mockReturnValue({
      salonName: 'Test Salon',
      updateSettings: mockUpdateSettings,
      dashboardConfiguration: configClone,
      services: [],
      sales: [],
      appointments: [],
      clients: [],
      hairstylists: [],
      imageCount: 0,
      t: (key: string) => (key === 'language.code' ? 'en-US' : key),
      currency: 'USD',
      stickyNotes: [],
      addStickyNote: jest.fn(),
      updateStickyNote: jest.fn(),
      deleteStickyNote: jest.fn(),
    });
  });

  it('saves dashboard configuration when a new widget is added', async () => {
    render(
      <Suspense fallback="Loading">
        <CustomizableDashboard savedLookbooks={[]} onQuickAction={jest.fn()} />
      </Suspense>
    );

    await userEvent.click(screen.getByRole('button', { name: /add widget/i }));

    await screen.findByText(/Widget Library/i);

    const widgetOption = await screen.findByText('Average Sale Value');
    await userEvent.click(widgetOption);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalled();
    });

    const payload = mockUpdateSettings.mock.calls[0][0];
    expect(payload?.dashboardConfiguration?.widgets).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'average-sale' })])
    );
  });
});
