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
    title: "Drought Onset Warning",
    description: "**Urgent Alert for Farmers**: Residents of Mogotio, Baringo, are advised to prepare for severe drought conditions. Prolonged dry spells have significantly reduced water availability and agricultural productivity. Implement water conservation measures immediately.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(1),
    isRead: false,
    location: {
      name: "Mogotio",
      coordinates: {
        latitude: 0.0698,
        longitude: 35.9765,
      },
    },
  },
  {
    id: "2",
    title: "Flash Floods Expected",
    description: "**Alert for Pastoralists**: Residents of Kabarnet, Baringo, are warned to be vigilant due to the possibility of flash floods. Recent weather patterns indicate sudden heavy rainfall that may lead to rapid water accumulation in low-lying areas. Move livestock to higher ground.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(2),
    isRead: false,
    location: {
      name: "Kabarnet",
      coordinates: {
        latitude: 0.4919,
        longitude: 35.7448,
      },
    },
  },
  {
    id: "3",
    title: "Severe Thunderstorm Alert",
    description: "**Alert for Aid Organizations**: A severe thunderstorm with strong winds and lightning is expected in Marigat area. Prepare emergency response teams for potential damage to infrastructure and possible displacement of vulnerable communities.",
    severity: "error",
    timestamp: getTimestampForDaysAgo(2, 5),
    isRead: true,
    location: {
      name: "Marigat",
      coordinates: {
        latitude: 0.4698,
        longitude: 35.9917,
      },
    },
  },
  {
    id: "4",
    title: "Dry Spell Warning",
    description: "**Alert for Farmers**: Eldama Ravine, Baringo, is experiencing the onset of a dry spell. Forecasts indicate minimal rainfall over the next 7-10 days. Farmers should prioritize water management for crops and consider delaying new plantings.",
    severity: "info",
    timestamp: getTimestampForDaysAgo(3),
    isRead: false,
    location: {
      name: "Eldama Ravine",
      coordinates: {
        latitude: 0.0514,
        longitude: 35.7296,
      },
    },
  },
  {
    id: "5",
    title: "Weekly Forecast Update",
    description: "The weekly weather forecast has been updated. Expect variable conditions across Baringo County with localized rainfall in western regions and continued dry conditions in eastern areas.",
    severity: "info",
    timestamp: getTimestampForDaysAgo(4),
    isRead: true,
    source: "Forecast System",
  },
  {
    id: "6",
    title: "River Water Levels Rising",
    description: "**Alert for Residents**: Water levels in rivers around Lake Baringo are rising due to rainfall in catchment areas. Communities in Kampi Ya Samaki should prepare for possible lake shore flooding in the next 48 hours.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(4, 7),
    isRead: false,
    location: {
      name: "Kampi Ya Samaki",
      coordinates: {
        latitude: 0.6125,
        longitude: 36.0989,
      },
    },
  },
  {
    id: "7",
    title: "Locust Swarm Sighting",
    description: "**Alert for Farmers**: A moderate-sized locust swarm has been spotted moving toward agricultural areas in Marigat. Farmers are advised to implement control measures and report sightings to local agricultural extension officers.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(5),
    isRead: false,
    location: {
      name: "Marigat",
      coordinates: {
        latitude: 0.4698,
        longitude: 35.9917,
      },
    },
  },
  {
    id: "8",
    title: "Heat Wave Advisory",
    description: "**Alert for Pastoralists and Farmers**: Temperatures are expected to reach extreme levels over the next 3-5 days across Baringo County. Take precautions to protect livestock and crops from heat stress. Ensure adequate shade and water availability.",
    severity: "error",
    timestamp: getTimestampForDaysAgo(5, 12),
    isRead: false,
    location: {
      name: "Baringo County",
      coordinates: {
        latitude: 0.4919,
        longitude: 35.7448,
      },
    },
  },
  {
    id: "9",
    title: "Water Source Contamination",
    description: "**Alert for Aid Organizations**: Several water sources in Tangulbei area have tested positive for contaminants following recent rainfall. Aid organizations should distribute water purification tablets and provide clean water alternatives.",
    severity: "error",
    timestamp: getTimestampForDaysAgo(6),
    isRead: true,
    location: {
      name: "Tangulbei",
      coordinates: {
        latitude: 1.0204,
        longitude: 36.2729,
      },
    },
  },
  {
    id: "10",
    title: "Livestock Disease Outbreak",
    description: "**Alert for Pastoralists**: A suspected outbreak of foot-and-mouth disease has been reported among cattle in northern Baringo. Pastoralists should limit movement of animals and contact veterinary services immediately if symptoms are observed.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(6, 10),
    isRead: false,
    location: {
      name: "North Baringo",
      coordinates: {
        latitude: 1.1511,
        longitude: 36.0552,
      },
    },
  },
  {
    id: "11",
    title: "Food Security Assessment",
    description: "**Notice for Aid Organizations**: A comprehensive food security assessment will be conducted next week. Organizations are requested to provide input on current conditions and resource availability in their operational areas.",
    severity: "info",
    timestamp: getTimestampForDaysAgo(7),
    isRead: true,
    source: "County Disaster Management Committee",
  },
  {
    id: "12",
    title: "School Closures Due to Weather",
    description: "Several schools in flood-prone areas of Baringo South will be temporarily closed due to anticipated heavy rainfall. Parents are advised to keep children at home until further notice.",
    severity: "warning",
    timestamp: getTimestampForDaysAgo(7, 3),
    isRead: false,
    location: {
      name: "Baringo South",
      coordinates: {
        latitude: 0.2768,
        longitude: 35.9654,
      },
    },
  },
];

// Helper function to generate timestamps for x days ago with optional hour offset
function getTimestampForDaysAgo(days: number, hourOffset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hourOffset);
  return date.toISOString();
}

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
