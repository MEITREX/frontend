import { ItemsApiItemInventoryForUserByIdCustomIdQuery } from "@/__generated__/ItemsApiItemInventoryForUserByIdCustomIdQuery.graphql";
import { getItemsByUserQueryCustomId } from "@/components/items/api/ItemsApi";
import ProfileCustomHeader from "@/components/profile/header/common/ProfileCustomHeader";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useLazyLoadQuery } from "react-relay";

type Props = {
  displayName: string;
};

export default function UserProfileCustomHeader({ displayName }: Props) {
  const params = useParams();
  const userId = params.userId as string;

  const queryData =
    useLazyLoadQuery<ItemsApiItemInventoryForUserByIdCustomIdQuery>(
      getItemsByUserQueryCustomId,
      { userIds: [userId] },
      { fetchPolicy: "network-only" }
    );

  const inventoryForUser = useMemo(() => {
    if (!queryData?.inventoriesForUsers[0].items) {
      return null;
    }

    return {
      inventoryForUser: {
        items: queryData.inventoriesForUsers[0].items.map((item) => ({
          equipped: item.equipped,
          id: item.catalogItemId,
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
