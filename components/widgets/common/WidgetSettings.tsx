import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import * as React from "react";
import { useState } from "react";
import { widgetApiSettingsMutation } from "@/components/widgets/api/WidgetApi";
import { useMutation } from "react-relay";
import { WidgetApiSettingsMutation } from "@/__generated__/WidgetApiSettingsMutation.graphql";

type Props = {
  refreshInterval: number;
  numWidgets: number;
  onNumWidgetsChange: (value: number) => void;
};

export default function WidgetSettings({
  numWidgets,
  onNumWidgetsChange,
  refreshInterval,
}: Props) {
  const [changeSettings] = useMutation<WidgetApiSettingsMutation>(
    widgetApiSettingsMutation
  );

  const [interval, setInterval] = useState(refreshInterval);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleIntervalChange = (_: unknown, value: number) => {
    setInterval(value);
    updateSettings({
      recommendationRefreshInterval: value,
      numberOfRecommendations: numWidgets,
    });
  };

  const handleNumWidgetsChange = (_: unknown, value: number) => {
    onNumWidgetsChange(value);
    updateSettings({
      recommendationRefreshInterval: interval,
      numberOfRecommendations: value,
    });
  };

  function updateSettings(newSettings: {
    recommendationRefreshInterval: number;
    numberOfRecommendations: number;
  }) {
    changeSettings({
      variables: { widgetSettingsInput: newSettings },
      onError(error) {
        console.error("Update Settings failed", error);
      },
    });
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ position: "absolute", top: 4, right: 0 }}
        size="small"
      >
        <SettingsIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem>
          <Box display="flex" flexDirection="column" gap={1} width={300}>
            <Typography variant="subtitle2">Update Interval</Typography>
            <ToggleButtonGroup
              value={interval}
              exclusive
              onChange={handleIntervalChange}
              size="small"
              fullWidth
            >
              {[6, 12, 18, 24].map((h) => (
                <ToggleButton key={h} value={h} sx={{ flex: 1 }}>
                  {h}h
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </MenuItem>

        <MenuItem>
          <Box display="flex" flexDirection="column" gap={1} width={300}>
            <Typography variant="subtitle2">Number of Widgets</Typography>
            <ToggleButtonGroup
              value={numWidgets}
              exclusive
              onChange={handleNumWidgetsChange}
              size="small"
              fullWidth
            >
              {[1, 2, 4].map((n) => (
                <ToggleButton key={n} value={n} sx={{ flex: 1 }}>
                  {n}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </MenuItem>
      </Menu>
    </>
  );
}
