import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress } from "@mui/material";
import { Heading } from "../Heading";

export default function SubmissionsHeader(content: any, openEditQuizModal: any){

    console.log(content.content)





    return(
<>
      <Heading
        title={content.content.metadata.name}
        action={
          <div className="flex gap-2">
            <Button
              sx={{ color: "text.secondary" }}
              startIcon={<Edit />}
              onClick={openEditQuizModal}
            >
              Edit Submission
            </Button>

            <Button
              sx={{ color: "text.secondary" }}
              startIcon={
                "isDeleteCommitInFlight".isWellFormed() ? (
                  <CircularProgress size={16} />
                ) : (
                  <Delete />
                )
              }
              onClick={() => {
                if (
                  confirm(
                    "Do you really want to delete this quiz? This can't be undone."
                  )
                )
                  console.log("deleteQuiz();")
              }}
            >
              Delete Quiz
            </Button>
          </div>
        }
        backButton
      />

      {/**<ContentTags metadata={metadata} />*/}

      {/**<FormErrors error={error} onClose={() => setError(null)} />*/}
    </>
    )
}