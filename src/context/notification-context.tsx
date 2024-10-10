"use client";
import React, { createContext, FC, useState } from "react";

type NotificationContextType = {
  notification: INotificationValue | undefined;
  addNotification: (
    text: string,
    icon?: React.ReactNode,
    delay?: number
  ) => void;
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
  const [notification, setNotification] = useState<INotificationValue>();

  const addNotification = (
    text: string,
    icon?: React.ReactNode,
    delay?: number
  ) => {
    setNotification({ text, icon, delay });
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
