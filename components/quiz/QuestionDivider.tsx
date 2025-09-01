import { QuestionDividerFragment$key } from "@/__generated__/QuestionDividerFragment.graphql";
import { QuestionDividerGenerateHintMutation } from "@/__generated__/QuestionDividerGenerateHintMutation.graphql";
import { useAITutorStore } from "@/stores/aiTutorStore";
import { Button, CircularProgress } from "@mui/material";
import { useParams } from "next/navigation";
import { graphql, useFragment, useMutation } from "react-relay";
import { Descendant, Text as SlateText } from "slate";

export const generateHintMutation = graphql`
  mutation QuestionDividerGenerateHintMutation(
    $questionText: String!
    $courseId: UUID!
  ) {
    generateHint(questionText: $questionText, courseId: $courseId) {
      hint
    }
  }
`;

export function getPlainTextOfSlateJS(value: string | null): string {
  let text = "";
  if (!value) return text;

  const parsed: Descendant[] = JSON.parse(value);

  function traverse(nodes: Descendant[]) {
    for (const node of nodes) {
      if (SlateText.isText(node)) {
        text += node.text;
      } else if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(parsed);
  return text;
}

export function QuestionDivider({
  _question,
  onHint,
  questionText,
}: {
  _question: QuestionDividerFragment$key;
  onHint?: () => void;
  questionText?: string;
}) {
  const { courseId } = useParams();
  const showHint = useAITutorStore((state) => state.showHint);
  const [generateHint, isInFlight] =
    useMutation<QuestionDividerGenerateHintMutation>(generateHintMutation);

  function handleGeneratingHint() {
    if (!questionText) {
      showHint("No Hint available");
      return;
    }
    generateHint({
      variables: {
        courseId: courseId,
        questionText: questionText,
      },
      onCompleted(response) {
        showHint(response.generateHint.hint);
      },
    });
  }

  const question = useFragment(
    graphql`
      fragment QuestionDividerFragment on Question {
        hint
      }
    `,
    _question
  );

  return (
    <div className="w-full my-2 flex justify-center border-b border-b-gray-300">
      <HintDialogButton
        hint={question.hint}
        onHint={onHint}
        generateHint={handleGeneratingHint}
        isGenerating={isInFlight}
      />
    </div>
  );
}

function HintDialogButton({
  hint,
  onHint,
  generateHint,
  isGenerating,
}: {
  hint: string | null;
  onHint?: () => void;
  generateHint?: () => void;
  isGenerating: boolean;
}) {
  const plainHintText = getPlainTextOfSlateJS(hint);
  const showHint = useAITutorStore((state) => state.showHint);

  return (
    <>
      <Button
        className="mb-2"
        onClick={() => {
          if (!plainHintText.trim()) {
            if (generateHint) generateHint();
          } else {
            showHint(plainHintText);
          }
          if (onHint) onHint();
        }}
        sx={{ color: "grey" }}
      >
        {isGenerating && (
          <>
            <CircularProgress size={16} />
            &nbsp;Generating&nbsp;
          </>
        )}
        Hint
      </Button>
    </>
  );
}
