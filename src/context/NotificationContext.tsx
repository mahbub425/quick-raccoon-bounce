import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from "react";
import { GeneratedPaymentCode } from "@/types";
import { toast } from "sonner";

interface NotificationContextType {
  userNotifications: { [userPin: string]: GeneratedPaymentCode[] };
  addGeneratedCodeNotification: (userPin: string, code: string, amount: number, paymentVoucherId?: string) => void;
  markCodeAsUsed: (userPin: string, code: string) => boolean;
  getNotificationsForUser: (userPin: string) => GeneratedPaymentCode[];
  getUnreadNotificationCount: (userPin: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const LOCAL_STORAGE_NOTIFICATIONS_KEY_PREFIX = "userNotifications_";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [userNotifications, setUserNotifications] = useState<{ [userPin: string]: GeneratedPaymentCode[] }>(() => {
    if (typeof window !== "undefined") {
      const notifications: { [userPin: string]: GeneratedPaymentCode[] } = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_NOTIFICATIONS_KEY_PREFIX)) {
          const userPin = key.replace(LOCAL_STORAGE_NOTIFICATIONS_KEY_PREFIX, '');
          try {
            notifications[userPin] = JSON.parse(localStorage.getItem(key) || '[]');
          } catch (e) {
            console.error(`Failed to parse notifications for ${userPin} from localStorage`, e);
          }
        }
      }
      return notifications;
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      Object.keys(userNotifications).forEach(userPin => {
        localStorage.setItem(`${LOCAL_STORAGE_NOTIFICATIONS_KEY_PREFIX}${userPin}`, JSON.stringify(userNotifications[userPin]));
      });
    }
  }, [userNotifications]);

  const addGeneratedCodeNotification = (userPin: string, code: string, amount: number, paymentVoucherId?: string) => {
    setUserNotifications(prev => {
      const currentNotifications = prev[userPin] || [];
      const newNotification: GeneratedPaymentCode = {
        code,
        amount,
        generatedAt: new Date().toISOString(),
        isUsed: false,
        paymentVoucherId,
      };
      return {
        ...prev,
        [userPin]: [...currentNotifications, newNotification],
      };
    });
  };

  const markCodeAsUsed = (userPin: string, code: string): boolean => {
    let codeFoundAndUsed = false;
    setUserNotifications(prev => {
      const currentNotifications = prev[userPin] || [];
      const updatedNotifications = currentNotifications.map(notif => {
        if (notif.code === code && !notif.isUsed) {
          codeFoundAndUsed = true;
          return { ...notif, isUsed: true };
        }
        return notif;
      });
      return {
        ...prev,
        [userPin]: updatedNotifications,
      };
    });
    return codeFoundAndUsed;
  };

  const getNotificationsForUser = (userPin: string): GeneratedPaymentCode[] => {
    return userNotifications[userPin] || [];
  };

  const getUnreadNotificationCount = (userPin: string): number => {
    return (userNotifications[userPin] || []).filter(notif => !notif.isUsed).length;
  };

  const contextValue = useMemo(() => ({
    userNotifications,
    addGeneratedCodeNotification,
    markCodeAsUsed,
    getNotificationsForUser,
    getUnreadNotificationCount,
  }), [userNotifications]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};