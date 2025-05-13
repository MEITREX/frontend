import { Help, QuestionAnswer } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";

export type FlashcardSideData = {
  label: string;
  text: string;
  isQuestion: boolean;
  isAnswer: boolean;
};

export type Props = {
  sideData: FlashcardSideData;
};

export function FlashcardSidePreview({ sideData }: Props) {
  return (
    <>
      <Card variant="outlined" className="min-w-[20rem] max-w-[30%]">
        <CardHeader
          title={sideData.label}
          avatar={
            sideData.isQuestion ? (
              <Help fontSize="large" sx={{ color: "grey.400" }} />
            ) : (
              <QuestionAnswer fontSize="large" sx={{ color: "grey.400" }} />
            )
          }
          classes={{ action: "!my-0" }}
        />
        <CardContent>
          <Typography variant="body2" color="textSecondary">
            {sideData.text}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}
