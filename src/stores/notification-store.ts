import { create } from "zustand";

interface NotificationStore {
  notification: INotificationValue | undefined;
  setNotification: (notification: INotificationValue) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notification: undefined,
  setNotification: (notification: INotificationValue) =>
    set((state) => ({
      notification,
    })),
}));

export default useNotificationStore;
