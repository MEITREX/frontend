import { ClozeQuestionPreviewFragment$key } from "@/__generated__/ClozeQuestionPreviewFragment.graphql";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";
import { FeedbackTooltip } from "./FeedbackTooltip";

export function ClozeQuestionPreview({
  _question,
}: {
  _question: ClozeQuestionPreviewFragment$key;
}) {
  const question = useFragment(
    graphql`
      fragment ClozeQuestionPreviewFragment on ClozeQuestion {
        itemId
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
      }
    `,
    _question
  );
  return (
    <div>
      {question.clozeElements.map((elem, i) =>
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
        ) : undefined
      )}
      {question.showBlanksList && (
        <div className="max-w-sm flex justify-start gap-2 mt-4 flex-wrap">
          {question.allBlanks.map((value, i) => (
            <div
              key={i}
              className="border border-gray-300 rounded-sm px-2 min-h-[1rem]"
            >
              {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
