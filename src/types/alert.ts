export type AlertSeverity = 'info' | 'warning' | 'error';

export interface DisasterForecast {
  type: 'flood' | 'drought';
  probability: number;
  timefrace: {
    start: string;
    end: string;
  };
  impact: {
    level: AlertSeverity;
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
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  forecast?: DisasterForecast;
  userTypeContent?: {
    farmer?: string;
    pastoralist?: string;
    aid_organization?: string;
  };
}

export interface AlertsState {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
