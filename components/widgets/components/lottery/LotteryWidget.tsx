import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import Lottery from "@/components/lottery/Lottery";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";
import { GamificationCategory } from "@/__generated__/WidgetApiRecommendationFeedbackMutation.graphql";

type Props = {
  openFeedback?: boolean,
  category?: GamificationCategory,
}

export default function LotteryWidget({openFeedback, category}:Props) {
  return (
    <WidgetWrapper title="Lottery" linkHref="/items/lottery" linkLabel="Lottery" overflow="visible">
      <WidgetFeedback openFeedback={openFeedback} category={category}/>
      <Lottery />
    </WidgetWrapper>
  );
}
