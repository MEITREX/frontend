// NotificationPopoverWithArrow.tsx
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import NotificationPopOver from "./NotificationPopOver";

interface Props {
    anchorEl: HTMLElement | null;
    setAnchorEl: (el: HTMLElement | null) => void;
    notifications: any[];
    setNotifications: (n: any) => void;
}

export default function NotificationPopoverWithArrow({
    anchorEl,
    setAnchorEl,
    notifications,
    setNotifications,
}: Props) {
    const [arrowPosition, setArrowPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setArrowPosition({
                top: rect.top + rect.height / 2 - 8,
                left: rect.right,
            });
            console.log('Arrow vis')
        } else {
            setArrowPosition(null);
        }
    }, [anchorEl]);

    return (
        <>

            {/* Das Popover */}
            <NotificationPopOver
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                setNotifications={setNotifications}
                notifications={notifications}
            />
            {/* Pfeil */}
            {arrowPosition && (
                <Box
                    sx={{
                        position: "fixed",
                        left: arrowPosition.left,
                        top: arrowPosition.top,
                        width: 0,
                        height: 0,
                        borderTop: "8px solid transparent",
                        borderBottom: "8px solid transparent",
                        borderRight: "8px solid #009bde",
                        zIndex: 1501,
                        //backgroundColor: 'red',


                    }}
                />
            )}


        </>
    );
}
