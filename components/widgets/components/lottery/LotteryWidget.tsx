import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import Lottery from "@/components/lottery/Lottery";
import WidgetFeedback from "@/components/widgets/common/WidgetFeedback";

export default function LotteryWidget() {
  return (
    <WidgetWrapper title="Lottery" linkHref="/items/lottery" linkLabel="Lottery" overflow="visible">
      <WidgetFeedback/>
      <Lottery />
    </WidgetWrapper>
  );
}
