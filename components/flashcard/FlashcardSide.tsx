import { Edit, Help, QuestionAnswer } from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from "@mui/material";
import { ClearIcon } from "@mui/x-date-pickers";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { EditSideModal } from "./EditSideModal";

export type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};

export type FlashcardSideProps = {
  operation: "edit" | "create";
  sideData: FlashcardSideData;
  setSideData: Dispatch<SetStateAction<FlashcardSideData[]>>;
  sideDataIndex: number;
};

export function FlashcardSide(props: FlashcardSideProps) {
  const { sideData, operation } = props;
  const isEditable = operation === "edit";

  const [isEditing, setIsEditing] = useState(false);

  const onEditSubmit = useCallback(
    (data: FlashcardSideData) => {
      const { setSideData, sideDataIndex } = props;

      setIsEditing(false);
      setSideData((prev) => {
        const newSideData = [...prev];
        newSideData.splice(sideDataIndex, 1, data);
        return newSideData;
      });
    },
    [props],
  );

  return (
    <>
      <Card
        variant="outlined"
        className="min-w-[20rem] max-w-[30%]"
        sx={{ backgroundColor: "surfaceA.0" }}
      >
        <CardHeader
          title={sideData.label}
          avatar={
            sideData.isQuestion ? (
              <Help
                fontSize="large"
                sx={{ color: "surfaceA.60" }}
              />
            ) : (
              <QuestionAnswer
                fontSize="large"
                sx={{ color: "surfaceA.60" }}
              />
            )
          }
          action={
            isEditable && (
              <>
                <IconButton
                  onClick={() => setIsEditing(true)}
                  sx={{ color: "text.secondary" }}
                >
                  <Edit fontSize="small" />
                </IconButton>

                <IconButton
                  sx={{ color: "text.secondary" }}
                  // Inline since isEditable serves as type predicate
                  onClick={() => {
                    props.setSideData((prev) => {
                      const newSideData = [...prev];
                      newSideData.splice(props.sideDataIndex, 1);
                      return newSideData;
                    });
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </>
            )
          }
          classes={{
            action: "!my-0",
          }}
        />
        <CardContent>
          <Typography variant="body2" color="text.primary">
            {sideData.text}
          </Typography>
        </CardContent>
      </Card>

      {isEditing && (
        <EditSideModal
          onClose={() => setIsEditing(false)}
          onSubmit={onEditSubmit}
          side={sideData}
        />
      )}
    </>
  );
}
