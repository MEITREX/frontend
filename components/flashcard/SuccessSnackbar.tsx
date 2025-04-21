import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React from "react";

interface SuccessSnackbarProps {
  visible: boolean;
  onClose: () => void;
  message: string;
}

const SuccessSnackbar: React.FC<SuccessSnackbarProps> = ({
  visible,
  onClose,
  message,
}) => {
  return (
    <Snackbar open={visible} autoHideDuration={3000} onClose={onClose}>
      <Alert onClose={onClose} severity="success" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SuccessSnackbar;
