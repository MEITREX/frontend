import WidgetWrapper from "@/components/widgets/common/WidgetWrapper";
import Lottery from "@/components/lottery/Lottery";
import ItemSwiper from "./ItemSwiper";


export default function ItemWidget() {

  return (
    <WidgetWrapper title="Items" linkHref="/items" linkLabel="All Items">
      <ItemSwiper />
    </WidgetWrapper>
  );
}