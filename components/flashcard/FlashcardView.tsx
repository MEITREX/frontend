import { EditFlashcardFragment$key } from "@/__generated__/EditFlashcardFragment.graphql";
import { useFragment } from "react-relay";
import { Item } from "../form-sections/item/ItemFormSection";
import { FlashcardFragment } from "./EditFlashcard";
import Flashcard from "./Flashcard";
import { FlashcardSideData } from "./FlashcardSide";

interface Props {
  title: string;
  flashcard: EditFlashcardFragment$key;
}

const FlashcardView = ({ flashcard, title }: Props) => {
  const { item, sides } = useFragment(FlashcardFragment, flashcard);
  return (
    <Flashcard
      operation="view"
      title={title}
      item={item as Item}
      flashcardSides={sides as FlashcardSideData[]}
    />
  );
};

export default FlashcardView;
