import { Delete } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { graphql, useMutation } from "react-relay";
import { DeleteAssignmentButtonMutation } from "@/__generated__/DeleteAssignmentButtonMutation.graphql";

export function DeleteAssignmentButton({
  chapterId,
  contentId,
  onError,
  onCompleted,
}: {
  chapterId: string;
  contentId: string;
  onError: (e: any) => void;
  onCompleted: () => void;
}) {
  const [deleteAssignment, isDeleting] = useMutation<DeleteAssignmentButtonMutation>(graphql`
    mutation DeleteAssignmentButtonMutation($id: UUID!) {
      mutateContent(contentId: $id) {
        deleteContent
      }
    }
  `);

  const handleDelete = () => {
    if (
      confirm(
        "Do you really want to delete this assignment? This can't be undone."
      )
    ) {
      deleteAssignment({
        variables: { id: contentId },
        onCompleted,
        onError,
        updater(store) {
          store.get(contentId)?.invalidateRecord();
        },
      });
    }
  };

  return (
    <Button
      sx={{ color: "text.secondary" }}
      startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
      onClick={handleDelete}
    >
      Delete
    </Button>
  );
}
