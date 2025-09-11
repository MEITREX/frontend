"use client";
import React from "react";
import NotificationPopOver from "./NotificationPopOver";

type Props = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (el: HTMLElement | null) => void;
  notifications: any[] | ReadonlyArray<any> | undefined | null;
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function NotificationsWithArrow({
                                                 anchorEl,
                                                 setAnchorEl,
                                                 notifications,
                                                 setNotifications,
                                               }: Props) {
  const list = Array.isArray(notifications) ? [...notifications] : [];
  return (
    <NotificationPopOver
      anchorEl={anchorEl}
      setAnchorEl={setAnchorEl}
      notifications={list}
      setNotifications={setNotifications}
    />
  );
}
