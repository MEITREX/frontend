import { AssociationQuestionPreviewFragment$key } from "@/__generated__/AssociationQuestionPreviewFragment.graphql";
import { graphql, useFragment } from "react-relay";
import { RenderRichText } from "../RichTextEditor";

const AssociationQuestionPreviewFragment = graphql`
  fragment AssociationQuestionPreviewFragment on AssociationQuestion {
    correctAssociations {
      left
      right
    }
  }
`;

type Props = {
  question: AssociationQuestionPreviewFragment$key;
};

export function AssociationQuestionPreview({ question }: Props) {
  const data = useFragment(AssociationQuestionPreviewFragment, question);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {data.correctAssociations.map((elem, i) => (
        <div key={i} className="flex items-center">
          <div className="border rounded-sm px-2">
            <RenderRichText value={elem.left} />
          </div>
          <div className="w-4 border-b"></div>
          <div className="border rounded-sm px-2">
            <RenderRichText value={elem.right} />
          </div>
        </div>
      ))}
    </div>
  );
}