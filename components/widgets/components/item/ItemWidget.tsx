import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import ItemSwiper from "./ItemSwiper";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";

type Props = {
  openFeedback?: boolean;
  category?: GamificationCategory;
};

export default function ItemWidget({ openFeedback, category }: Props) {
  return (
    <WidgetWrapper title="Items" linkHref="/items" linkLabel="All Items">
      <WidgetFeedback openFeedback={openFeedback} category={category} />
      <ItemSwiper />
    </WidgetWrapper>
  );
}
