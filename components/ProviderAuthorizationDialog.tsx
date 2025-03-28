import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Alert } from "@mui/material";
import { codeAssessmentProvider, ExternalServiceProvider, providerConfig } from "./ProviderConfig";

export function ProviderAuthorizationDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{provider.name} Authorization Required</DialogTitle>
      <DialogContent>
        <Alert severity="warning">
          You must authorize via {provider.name} to add a code assignment.
        </Alert>
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
