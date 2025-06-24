import {
  Box,
  Button,
  Link,
  Popover,
  Tooltip,
  Typography
} from "@mui/material";

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

  const handleMarkAsRead = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();

    setNotifications((prev: any) =>
      prev.map((n: any, i: any) => (i === index ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    event.preventDefault();

    setNotifications((prev: any) =>
      prev.filter((_: any, i: any) => i !== index)
    );
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


  // Dummy data, will be reomoved later

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
              variant="outlined"
              onClick={() =>
                setNotifications((prev: any[]) =>
                  prev.map((n) => ({ ...n, read: true }))
                )
              }
            >
              MARK ALL AS READ
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => setNotifications([])}
            >
              DELETE ALL
            </Button>
          </Box>
        </Box>

        {/* Beispiel-Inhalte */}
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No new notifications.
          </Typography>
        ) : (
          notifications.map((note, index) => (
            <Box key={index} mb={2}>
              <Link href={note.href} style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    position: "relative", // 👈 wichtig für absolute Zeit
                    borderRadius: 2,
                    p: 2,
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                      cursor: "pointer",
                    },
                    border: note.read
                      ? "1px solid #e0e0e0"
                      : "2px solid #009bde",
                    boxShadow: note.read
                      ? "none"
                      : "0 0 8px rgba(51,105,173,255, 0.4)",
                    transition: "box-shadow 0.3s ease-in-out",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {note.title}
                  </Typography>
                  <Tooltip title={note.description} placement="top" arrow>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%", // oder z. B. 400 wenn du begrenzen willst
                      }}
                    >
                      {note.description}
                    </Typography>
                  </Tooltip>
                  {/* Zeit oben rechts in dieser Box */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 12,
                    }}
                  >
                    {getRelativeTime(note.createdAt)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, marginTop: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(event) => handleMarkAsRead(event, index)}
                      disabled={note.read}
                    >
                      Mark as read
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={(event) => handleDelete(event, index)}
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
