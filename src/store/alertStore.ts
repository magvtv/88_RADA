import { create } from "zustand";
import { Alert, type AlertSeverity, type AlertsState } from "@/types/alert";
import {
  getAllAlerts,
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
  createNewAlert,
} from "@/services/alertService";

interface AlertActions {
  // Actions
  fetchAllAlerts: () => Promise<void>;
  fetchUnreadAlerts: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addAlert: (
    title: string,
    description: string,
    severity: AlertSeverity
  ) => Promise<void>;
}

export const useAlertStore = create<AlertsState & AlertActions>((set, get) => ({
  alerts: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Actions
  fetchAllAlerts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getAllAlerts();
      const unreadCount = data.filter((alert) => !alert.isRead).length;
      set({ alerts: data, unreadCount, loading: false });
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      set({
        error: "Failed to fetch alerts data",
        loading: false
      });
    }
  },

  fetchUnreadAlerts: async () => {
    try {
      set({ loading: true, error: null });
      const data = await getUnreadAlerts();
      set({
        alerts: data,
        unreadCount: data.length,
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch unread alerts:", error);
      set({
        error: "Failed to fetch unread alerts data",
        loading: false
      });
    }
  },

  markAsRead: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const updatedAlert = await markAlertAsRead(id);

      // Update alerts in state
      set((state) => {
        const updatedAlerts = state.alerts.map((alert) =>
          alert.id === id ? updatedAlert : alert
        );

        return {
          alerts: updatedAlerts,
          unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0,
          loading: false,
        };
      });
    } catch (error) {
      console.error(`Failed to mark alert ${id} as read:`, error);
      set({
        error: "Failed to update alert status",
        loading: false
      });
    }
  },

  markAllAsRead: async () => {
    try {
      set({ loading: true, error: null });
      await markAllAlertsAsRead();

      // Update all alerts in state
      set((state) => ({
        alerts: state.alerts.map((alert) => ({ ...alert, isRead: true })),
        unreadCount: 0,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to mark all alerts as read:", error);
      set({
        error: "Failed to update all alerts status",
        loading: false
      });
    }
  },

  addAlert: async (
    title: string,
    description: string,
    severity: AlertSeverity
  ) => {
    try {
      set({ loading: true, error: null });
      const newAlert = await createNewAlert(title, description, severity);

      // Add new alert to state
      set((state) => ({
        alerts: [newAlert, ...state.alerts],
        unreadCount: state.unreadCount + 1,
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to create new alert:", error);
      set({
        error: "Failed to create new alert",
        loading: false
      });
    }
  },
}));
