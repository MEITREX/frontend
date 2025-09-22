"use client";
import React from "react";
import { graphql, useLazyLoadQuery, useMutation } from "react-relay";
import {
  Box,
  Button,
  Link,
  Popover,
  Tooltip,
  Typography
} from "@mui/material";
import { useRouter } from "next/navigation";

const USER_ID_QUERY = graphql`
  query NotificationPopOverUserIdQuery {
    currentUserInfo {
      id
    }
  }
`;

const MARK_ALL_READ = graphql`
  mutation NotificationPopOver_MarkAllReadMutation($userId: UUID!) {
    markAllRead(userId: $userId)
  }
`;

const MARK_ONE_READ = graphql`
  mutation NotificationPopOver_MarkOneReadMutation($userId: UUID!, $notificationId: UUID!) {
    markOneRead(userId: $userId, notificationId: $notificationId)
  }
`;

interface NotificationPopOverProps {
  anchorEl: any;
  setAnchorEl: (el: any) => void;
  setNotifications: (notification: any) => void;
  notifications: any[];
}

export default function NotificationPopOver({
                                              anchorEl,
                                              setAnchorEl,
                                              setNotifications,
                                              notifications,
                                            }: NotificationPopOverProps) {
  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const isOpen = Boolean(anchorEl);
  const router = useRouter();

  const { currentUserInfo } = useLazyLoadQuery<any>(
    USER_ID_QUERY,
    {},
    { fetchPolicy: "store-and-network" }
  );
  const userId: string | undefined = currentUserInfo?.id;

  const [commitMarkAllRead, allInFlight] = useMutation(MARK_ALL_READ);
  const [commitMarkOneRead, oneInFlight] = useMutation(MARK_ONE_READ);

  const list = Array.isArray(notifications) ? notifications : [];

  const handleMarkAsRead = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    const target = list[index];
    if (!userId || !target?.id) return;
    commitMarkOneRead({
      variables: { userId, notificationId: target.id },
      onCompleted: () => {
        setNotifications((prev: any) =>
          (Array.isArray(prev) ? prev : []).map((n: any, i: number) =>
            i === index ? { ...n, read: true } : n
          )
        );
      },
    });
  };

  const handleDelete = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();
    setNotifications((prev: any) =>
      (Array.isArray(prev) ? prev : []).filter((_: any, i: number) => i !== index)
    );
  };

  const handleOpenLink = (event: React.MouseEvent, index: number, href?: string | null) => {
    event.preventDefault();
    const target = list[index];
    if (target && !target.read) {
      setNotifications((prev: any) =>
        (Array.isArray(prev) ? prev : []).map((n: any, i: number) =>
          i === index ? { ...n, read: true } : n
        )
      );
      if (userId && target.id) {
        commitMarkOneRead({
          variables: { userId, notificationId: target.id },
        });
      }
    }
    if (href) {
      handleCloseNotifications();
      router.push(href);
    }
  };

  function getRelativeTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diffSec = Math.floor((now.getTime() - created.getTime()) / 1000);
    const seconds = diffSec;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    if (seconds < 60) {
      const rounded = Math.floor(seconds / 10) * 10 || 10;
      return `${rounded} seconds ago`;
    } else if (minutes < 10) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (minutes < 60) {
      const rounded = Math.floor(minutes / 5) * 5;
      return `${rounded} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else if (days < 30) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    } else if (days < 365) {
      return `${months} month${months === 1 ? "" : "s"} ago`;
    } else {
      return `${years} year${years === 1 ? "" : "s"} ago`;
    }
  }

  return (
    <Popover
      open={isOpen}
      anchorEl={anchorEl}
      onClose={handleCloseNotifications}
      anchorOrigin={{
        vertical: "center",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            minWidth: 600,
            maxWidth: 700,
            maxHeight: 500,
            p: 2,
            borderRadius: 3,
            marginLeft: 1,
            backgroundColor: 'white',
            boxShadow: 'none',
            border: "1px solid #009bde"
          },
        },
      }}
    >
      <Box sx={{ p: 2, minWidth: 250 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          marginBottom={2}
        >
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              size="small"
              variant="contained"
              color="primary"
              onClick={() => {
                if (!userId || allInFlight) return;
                commitMarkAllRead({
                  variables: { userId },
                  onCompleted: () => {
                    setNotifications((prev: any[]) =>
                      (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true }))
                    );
                  },
                });
              }}
              sx={{ borderRadius: 999 }}
            >
              MARK ALL AS READ
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => setNotifications([])}
              sx={{ borderRadius: 999 }}
            >
              DELETE ALL
            </Button>
          </Box>
        </Box>

        {list.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No new notifications.
          </Typography>
        ) : (
          list.map((note, index) => (
            <Box key={note?.id ?? index} mb={2}>
              <Link
                href={note?.href ?? "#"}
                onClick={(e) => handleOpenLink(e, index, note?.href)}
                style={{ textDecoration: "none" }}
              >
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    p: 2,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                    },
                    border: note?.read
                      ? "1px solid #e0e0e0"
                      : "2px solid #009bde",
                    boxShadow: note?.read
                      ? "none"
                      : "0 0 8px rgba(51,105,173,255, 0.4)",
                    transition: "box-shadow 0.3s ease-in-out",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {note?.title}
                  </Typography>
                  <Tooltip title={note?.description ?? ""} placement="top" arrow>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {note?.description}
                    </Typography>
                  </Tooltip>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 12,
                    }}
                  >
                    {note?.createdAt ? getRelativeTime(note.createdAt) : ""}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(event) => handleMarkAsRead(event, index)}
                      disabled={note?.read || oneInFlight || !userId}
                      sx={{ borderRadius: 999 }}
                    >
                      Mark as read
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={(event) => handleDelete(event, index)}
                      sx={{ borderRadius: 999 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Link>
            </Box>
          ))
        )}
      </Box>
    </Popover>
  );
}
