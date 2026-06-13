import { StateCreator } from 'zustand';

export interface AnalyticsSlice {
  analytics: Record<string, unknown>;
  trackEvent: (eventName: string, eventParams?: Record<string, unknown>) => void;
  isTrackingEnabled: boolean;
  setAnalyticsConfigOpen: (open: boolean) => void;
}

export const createAnalyticsSlice: StateCreator<AnalyticsSlice> = () => ({
  analytics: {},
  trackEvent: () => {},
  isTrackingEnabled: false,
  setAnalyticsConfigOpen: () => {},
});
