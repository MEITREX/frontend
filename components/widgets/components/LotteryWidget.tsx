import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import Lottery from "@/components/lottery/Lottery";

export default function LotteryWidget() {
  return (
    <WidgetWrapper title="Lottery" linkHref="/items/lottery" linkLabel="Lottery">
      <Lottery />
    </WidgetWrapper>
  );
}
