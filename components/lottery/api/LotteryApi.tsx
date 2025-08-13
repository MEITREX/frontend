import { graphql } from "react-relay";

export const lotteryApiUserInventoryQuery = graphql`
    query LotteryApiUserInventoryQuery {
        inventoryForUser {
            unspentPoints
        }
    }
`;

export const lotteryApiLotteryRunMutation = graphql `
    mutation LotteryApiLotteryRunMutation {
      lotteryRun {
        id,
        name,
        description,
        rarity,
        foreColor,
        backColor,
        url,
        filename,
        sold,
        sellCompensation
      }
    }
`;

export const lotteryApiLotteryEquipItemMutation = graphql `
  mutation LotteryApiLotteryEquipItemMutation($itemId: UUID!) {
    equipItem(itemId:$itemId) {
        userId
    }
  }
`;