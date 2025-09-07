import { widgetApiItemInventoryForUserQuery } from "@/components/widgets/api/WidgetApi";
import { WidgetApiItemInventoryForUserQuery } from "@/__generated__/WidgetApiItemInventoryForUserQuery.graphql";
import { useLazyLoadQuery } from "react-relay";
import ProfileCustomHeader from "@/components/profile/header/common/ProfileCustomHeader";

type Props = {
  displayName: string;
};

export default function OwnProfileCustomHeader({ displayName }: Props) {
  const { inventoryForUser } =
    useLazyLoadQuery<WidgetApiItemInventoryForUserQuery>(
      widgetApiItemInventoryForUserQuery,
      { fetchPolicy: "network-only" }
    );

  return (
    <ProfileCustomHeader
      inventoryForUser={inventoryForUser}
      displayName={displayName}
    />
  );
}
