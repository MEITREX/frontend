import { ClozeQuestionPreviewFragment$key } from "@/__generated__/ClozeQuestionPreviewFragment.graphql";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { FeedbackTooltip } from "./FeedbackTooltip";

const ClozeQuestionPreviewFragment = graphql`
  fragment ClozeQuestionPreviewFragment on ClozeQuestion {
    clozeElements {
      __typename
      ... on ClozeTextElement {
        text
      }
      ... on ClozeBlankElement {
        correctAnswer
        feedback
      }
    }
    allBlanks
    showBlanksList
    hint
  }
`;

type Props = {
  question: ClozeQuestionPreviewFragment$key;
};

export function ClozeQuestionPreview({ question }: Props) {
  const data = useFragment(ClozeQuestionPreviewFragment, question);

  return (
    <>
      {data.clozeElements.map((elem, i) =>
        elem.__typename === "ClozeTextElement" ? (
          <span key={i}>
            <RenderRichText value={elem.text} />
          </span>
        ) : elem.__typename === "ClozeBlankElement" ? (
          <FeedbackTooltip
            key={i}
            feedback={elem.feedback}
            correctAnswer={elem.correctAnswer}
          >
            <span className="mx-1 px-1 border-b border-gray-300">
              {elem.correctAnswer}
            </span>
          </FeedbackTooltip>
        ) : null
      )}

      {data.hint && (
        <div className="flex justify-start flex-wrap gap-2 mt-2">
          Hint:
          <RenderRichText value={data.hint} />
        </div>
      )}
    </>
  );
}
