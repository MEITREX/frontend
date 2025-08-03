import { Typography } from "@mui/material";
import { ItemFormSectionProps } from "../form-sections/item/ItemFormSection";
import ItemFormSectionPreview from "../form-sections/item/ItemFormSectionPreview";
import { FlashcardSideData } from "./FlashcardSide";
import { FlashcardSidePreview } from "./FlashcardSidePreview";

type FlashcardProps = {
  title: string;
  flashcardSides: FlashcardSideData[];
} & Pick<ItemFormSectionProps, "item">;

const FlashcardPreview = ({ title, flashcardSides, item }: FlashcardProps) => {
  return (
    <>
      <div className="pt-4 pb-6 -mx-8 px-8 bg-gray-50">
        <Typography variant="overline" color="text.secondary">
          {title}
        </Typography>

        <ItemFormSectionPreview item={item} />

        <div className="flex flex-wrap gap-2 mt-4">
          {flashcardSides.map((currentSide, i) => (
            <FlashcardSidePreview
              sideData={currentSide}
              key={currentSide.label}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default FlashcardPreview;
