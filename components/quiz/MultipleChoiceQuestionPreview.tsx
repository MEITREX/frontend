import { MultipleChoiceQuestionPreviewFragment$key } from "@/__generated__/MultipleChoiceQuestionPreviewFragment.graphql";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";

const MultipleChoiceQuestionPreviewFragment = graphql`
  fragment MultipleChoiceQuestionPreviewFragment on MultipleChoiceQuestion {
    answers {
      correct
      answerText
    }
  }
`;

type Props = {
  question: MultipleChoiceQuestionPreviewFragment$key;
};

export function MultipleChoiceQuestionPreview({ question }: Props) {
  const data = useFragment(MultipleChoiceQuestionPreviewFragment, question);

  return (
    <div className="flex justify-center gap-4">
      <FormGroup>
        {data.answers.map((answer, index) => (
          <div key={index}>
            <FormControlLabel
              sx={{ cursor: "default" }}
              control={
                <Checkbox
                  sx={{ cursor: "default" }}
                  disableRipple
                  checked={answer.correct}
                />
              }
              label={
                <RenderRichText value={answer.answerText}></RenderRichText>
              }
            />
          </div>
        ))}
      </FormGroup>
    </div>
  );
}
