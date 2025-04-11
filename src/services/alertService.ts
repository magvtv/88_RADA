import { apiGet, apiPost, apiPut } from "./api";
import type { Alert, AlertSeverity } from "@/types/alert";
import { v4 as uuidv4 } from "uuid";

const ENDPOINTS = {
  alerts: "/alerts",
  alert: (id: string) => `/alerts/${id}`,
  markAsRead: (id: string) => `/alerts/${id}/read`,
  markAllAsRead: "/alerts/read-all",
};

// Mock data for development
const mockAlerts: Alert[] = [
  {
    id: "1",
    title: "Heavy Rain Warning",
    description: "Heavy rainfall expected in your area on Sunday. Potential for localized flooding in low-lying areas.",
    severity: "warning",
    timestamp: "2025-04-10T15:30:00Z",
    isRead: false,
    location: {
      name: "Downtown",
      coordinates: {
        latitude: 40.7128,
        longitude: -74.006,
      },
    },
  },
  {
    id: "2",
    title: "High Wind Advisory",
    description: "Strong winds expected on Monday with gusts up to 45 mph. Secure outdoor items and be cautious when driving.",
    severity: "warning",
    timestamp: "2025-04-10T16:15:00Z",
    isRead: false,
  },
  {
    id: "3",
    title: "Temperature Drop",
    description: "Rapid temperature drop expected tonight. Consider protecting sensitive plants.",
    severity: "info",
    timestamp: "2025-04-11T09:00:00Z",
    isRead: false,
  },
  {
    id: "4",
    title: "Thunderstorm Alert",
    description: "Severe thunderstorms possible on Tuesday evening with risk of lightning and hail.",
    severity: "error",
    timestamp: "2025-04-09T12:45:00Z",
    isRead: true,
  },
  {
    id: "5",
    title: "Forecast Update",
    description: "Weather forecast has been updated for the week. Check the latest predictions.",
    severity: "info",
    timestamp: "2025-04-08T10:30:00Z",
    isRead: true,
    source: "Forecast System",
  },
];

// Service functions
export async function getAllAlerts(): Promise<Alert[]> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<Alert[]>(ENDPOINTS.alerts);

    // For development, return mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockAlerts]);
      }, 800);
    });
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    throw error;
  }
}

export async function getUnreadAlerts(): Promise<Alert[]> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<Alert[]>(`${ENDPOINTS.alerts}?unread=true`);

    // For development, filter mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAlerts.filter((alert) => !alert.isRead));
      }, 600);
    });
  } catch (error) {
    console.error("Failed to fetch unread alerts:", error);
    throw error;
  }
}

export async function getAlertById(id: string): Promise<Alert | null> {
  try {
    // In a real implementation, this would call the API
    // return await apiGet<Alert>(ENDPOINTS.alert(id));

    // For development, find in mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const alert = mockAlerts.find((a) => a.id === id) || null;
        resolve(alert);
      }, 500);
    });
  } catch (error) {
    console.error(`Failed to fetch alert with ID ${id}:`, error);
    throw error;
  }
}

export async function markAlertAsRead(id: string): Promise<Alert> {
  try {
    // In a real implementation, this would call the API
    // return await apiPut<Alert>(ENDPOINTS.markAsRead(id), {});

    // For development, update mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const alertIndex = mockAlerts.findIndex((a) => a.id === id);
        if (alertIndex >= 0) {
          mockAlerts[alertIndex] = {
            ...mockAlerts[alertIndex],
            isRead: true,
          };
          resolve(mockAlerts[alertIndex]);
        } else {
          throw new Error(`Alert with ID ${id} not found`);
        }
      }, 500);
    });
  } catch (error) {
    console.error(`Failed to mark alert ${id} as read:`, error);
    throw error;
  }
}

export async function markAllAlertsAsRead(): Promise<void> {
  try {
    // In a real implementation, this would call the API
    // return await apiPut<void>(ENDPOINTS.markAllAsRead, {});

    // For development, update mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        for (const alert of mockAlerts) {
          alert.isRead = true;
        }
        resolve();
      }, 700);
    });
  } catch (error) {
    console.error("Failed to mark all alerts as read:", error);
    throw error;
  }
}

export async function createNewAlert(
  title: string,
  description: string,
  severity: AlertSeverity
): Promise<Alert> {
  const newAlert: Alert = {
    id: uuidv4(),
    title,
    description,
    severity,
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  try {
    // In a real implementation, this would call the API
    // return await apiPost<Alert>(ENDPOINTS.alerts, newAlert);

    // For development, add to mock data with a simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        mockAlerts.unshift(newAlert);
        resolve(newAlert);
      }, 800);
    });
  } catch (error) {
    console.error("Failed to create new alert:", error);
    throw error;
  }
}
