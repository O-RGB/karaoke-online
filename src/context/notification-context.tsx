"use client";
import { createContext, FC, useState } from "react";
type NotificationContextType = {
  notification: string | undefined;
  addNotification: (text: string) => void;
};

type NotificationProviderProps = {
  children: React.ReactNode;
};

export const NotificationContext = createContext<NotificationContextType>({
  notification: undefined,
  addNotification: () => undefined,
});

export const NotificationProvider: FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<string>();

  const addNotification = (text: string) => {
    setNotification(text);
  };

  return (
    <NotificationContext.Provider
      value={{
        notification,
        addNotification,
      }}
    >
      <>{children}</>
    </NotificationContext.Provider>
  );
};
