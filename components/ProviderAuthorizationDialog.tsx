import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Alert,
} from "@mui/material";
import { ExternalServiceProvider, providerConfig } from "./ProviderConfig";

export function ProviderAuthorizationDialog({
  onClose,
  onAuthorize,
  alertMessage,
  _provider,
}: {
  onClose: () => void;
  onAuthorize: () => void;
  alertMessage: string;
  _provider: ExternalServiceProvider;
}) {
  const provider = providerConfig[_provider];

  const handleAuthorization = () => {
    const returnTo = window.location.href;
    localStorage.setItem("returnTo", returnTo);

    onAuthorize();

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
