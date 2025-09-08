import { useParams } from "next/navigation";
import ProfileCustomHeader from "@/components/profile/header/common/ProfileCustomHeader";
import { useLazyLoadQuery } from "react-relay";
import { widgetApiItemsByUserIdQuery } from "@/components/widgets/api/WidgetApi";
import { WidgetApiItemsByUserIdQuery } from "@/__generated__/WidgetApiItemsByUserIdQuery.graphql";
import { useMemo } from "react";

type Props = {
  displayName: string;
};

export default function UserProfileCustomHeader({ displayName }: Props) {
  const params = useParams();
  const userId = params.userId as string;

  const queryData = useLazyLoadQuery<WidgetApiItemsByUserIdQuery>(
    widgetApiItemsByUserIdQuery,
    { userId: userId },
    { fetchPolicy: "network-only" }
  );

  const inventoryForUser = useMemo(() => {
    if (!queryData?.itemsByUserId) {
      return null;
    }

    return {
      inventoryForUser: {
        items: queryData.itemsByUserId.map((item) => ({
          equipped: item.equipped,
          id: item.id,
          unlocked: item.unlocked,
          unlockedTime: item.unlockedTime,
        })),
      } as const,
    };
  }, [queryData]);

  return (
    <ProfileCustomHeader
      inventoryForUser={inventoryForUser?.inventoryForUser}
      displayName={displayName}
    />
  );
}
