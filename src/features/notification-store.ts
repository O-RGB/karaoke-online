import { create } from "zustand";

export type NotificationVariant = "success" | "error" | "warning" | "info";

export interface INotificationState {
  id: string;
  title?: string;
  description?: string;
  variant?: NotificationVariant;
  duration?: number;
}

export interface INotificationPayload {
  title?: string;
  description?: string;
  variant?: NotificationVariant;
  duration?: number;
}

interface NotificationStore {
  notifications: INotificationState[];
  addNotification: (payload: INotificationPayload) => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (payload) =>
    set((state) => {
      const id =
        Date.now().toString() + Math.random().toString(36).substring(2);
      return {
        notifications: [...state.notifications, { ...payload, id }],
      };
    }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));

export default useNotificationStore;
