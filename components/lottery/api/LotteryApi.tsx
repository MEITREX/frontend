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
    }
  }
`;
