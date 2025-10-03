import { DeleteStageButtonMutation } from "@/__generated__/DeleteStageButtonMutation.graphql";
import { Delete } from "@mui/icons-material";
import { Alert, Button } from "@mui/material";
import { useState } from "react";
import { graphql, useMutation } from "react-relay";
import ConfirmationDialog from "./ConfirmationDialog";

export function DeleteStageButton({
  sectionId,
  stageId,
}: {
  sectionId: string;
  stageId: string;
}) {
  const [deleteStage] = useMutation<DeleteStageButtonMutation>(graphql`
    mutation DeleteStageButtonMutation($id: UUID!, $sectionId: UUID!) {
      mutateSection(sectionId: $sectionId) {
        deleteStage(id: $id)
      }
    }
  `);

  const [error, setError] = useState<any>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  function handleDelete() {
    setShowDeleteConfirmation(false);
    deleteStage({
      variables: { id: stageId, sectionId },
      onError: setError,
      updater(store, data) {
        const section = store.get(sectionId);
        const stages = section?.getLinkedRecords("stages");
        if (!section || !stages) return;
        section.setLinkedRecords(
          stages.filter((x) => x.getDataID() !== stageId),
          "stages"
        );
      },
    });
  }

  return (
    <>
      {error?.source.errors.map((err: any, i: number) => (
        <Alert
          key={i}
          severity="error"
          sx={{ minWidth: 400, maxWidth: 800, width: "fit-content" }}
          onClose={() => setError(null)}
        >
          {err.message}
        </Alert>
      ))}

      <Button
        onClick={() => setShowDeleteConfirmation(true)}
        color="warning"
        startIcon={<Delete />}
      >
        Delete stage
      </Button>

      <ConfirmationDialog
        open={showDeleteConfirmation}
        title="Delete Stage"
        message={"Do you really want to delete this stage? This action cannot be undone."}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirmation(false)}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </>
  );
}
