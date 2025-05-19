export type AlertSeverity = 'info' | 'warning' | 'error';

export interface DisasterForecast {
  type: 'flood' | 'drought';
  probability: number;
  timefrace: {
    start: string;
    end: string;
  };
  impact: {
    level: AlertServerity;
    description: string;
    affectedAreas: string[];
    recommendations: string[];
  }
}

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
  };
  forecast?: DisasterForecast;
}

export interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
