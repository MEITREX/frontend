import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Alert,
} from "@mui/material";
import { codeAssessmentProvider, providerConfig } from "./ProviderConfig";

export function ProviderAuthorizationDialog({
  onClose,
  alertMessage,
}: {
  onClose: () => void;
  alertMessage: string;
}) {
  const provider = providerConfig[codeAssessmentProvider];

  const handleAuthorization = () => {
    const returnTo = window.location.href;
    localStorage.setItem("returnTo", returnTo);

    onClose();

    const authLink = `${provider.authUrl}?client_id=${provider.clientId}`;
    window.location.href = authLink;
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>{provider.name} Authorization Required</DialogTitle>
      <DialogContent>
        <Alert severity="warning">{alertMessage}</Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAuthorization} color="primary">
          Authorize via {provider.name}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
