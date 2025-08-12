import { graphql } from "react-relay";

export const lotteryApiUserInventoryQuery = graphql`
  query LotteryApiUserInventoryQuery {
    inventoryForUser {
      unspentPoints
    }
  }
`;

export const lotteryApiLotteryRunMutation = graphql`
  mutation LotteryApiLotteryRunMutation {
    lotteryRun {
      name
      description
      rarity
      foreColor
      backColor
      url
      filename
      id
    }
  }
`;

export const lotteryApiEquipMutation = graphql`
  mutation LotteryApiEquipItemMutation($itemId: UUID!) {
    equipItem(itemId: $itemId) {
      items {
        equipped
        id
        uniqueDescription
        unlocked
        unlockedTime
      }
      unspentPoints
      userId
    }
  }
`;
