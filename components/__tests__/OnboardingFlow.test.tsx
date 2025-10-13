import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockPersistOnboardingData = jest.fn().mockResolvedValue({ serviceIds: [], hairstylistIds: [] });
const mockShowToast = jest.fn();
const mockUseSettings = jest.fn();

jest.mock('../../services/supabaseClient', () => ({
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

jest.mock('../../services/onboardingService', () => ({
  __esModule: true,
  persistOnboardingData: (...args: unknown[]) => mockPersistOnboardingData(...args),
}));

jest.mock('../common/ToastContext', () => ({
  __esModule: true,
  useToast: () => ({ showToast: mockShowToast }),
}));

jest.mock('../../contexts/SettingsContext', () => ({
  __esModule: true,
  useSettings: () => mockUseSettings(),
}));

const OnboardingFlow = require('../OnboardingFlow').default as typeof import('../OnboardingFlow').default;

describe('OnboardingFlow', () => {
  const mockSetSalonName = jest.fn().mockResolvedValue(undefined);
  const mockUpdateSettings = jest.fn().mockResolvedValue(undefined);
  const mockUpdatePreferences = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSettings.mockReturnValue({
      t: (key: string) => key,
      setSalonName: mockSetSalonName,
      updateSettings: mockUpdateSettings,
      updatePreferences: mockUpdatePreferences,
      salonName: '',
      user: { id: 'user-123', user_metadata: {} },
    });
  });

  it('completes onboarding and persists configuration', async () => {
    const onComplete = jest.fn();

    render(<OnboardingFlow onComplete={onComplete} initialSalonName="Test Salon" />);

    // Step 1 -> Step 2
    await userEvent.click(screen.getByRole('button', { name: /onboarding.navigation.next/i }));

    // Select a common service so we can continue
    const serviceTile = await screen.findByText("Haircut & Styling");
    await userEvent.click(serviceTile);

    // Step 2 -> Step 3
    await userEvent.click(screen.getByRole('button', { name: /onboarding.navigation.next/i }));
    // Step 3 -> Step 4
    await userEvent.click(screen.getByRole('button', { name: /onboarding.navigation.next/i }));

    // Complete onboarding
    const completeButton = await screen.findByRole('button', {
      name: /onboarding.step5.bookAppointment/i,
    });
    await userEvent.click(completeButton);

    await waitFor(() => {
      expect(mockPersistOnboardingData).toHaveBeenCalled();
    });

    expect(mockSetSalonName).toHaveBeenCalledWith('Test Salon');
    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ hasCompletedOnboarding: true })
    );
    expect(onComplete).toHaveBeenCalled();
  });
});
