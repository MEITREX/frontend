import { graphql } from "react-relay";

export const lotteryApiUserInventoryQuery = graphql`
    query LotteryApiUserInventoryQuery {
        inventoryForUser {
            unspentPoints
        }
    }
`;