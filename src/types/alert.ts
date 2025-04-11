export type AlertSeverity = 'info' | 'warning' | 'error';

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
  isRead: boolean;
  source?: string;
  location?: {
    name: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
