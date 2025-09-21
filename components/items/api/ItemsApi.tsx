import { graphql } from "react-relay";

export const inventoryForUserQuery = graphql`
  query ItemsApiInventoryForUserQuery {
    inventoryForUser {
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

export const equipItemMutation = graphql`
  mutation ItemsApiEquipItemMutation($itemId: UUID!) {
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

export const unequipItemMutation = graphql`
  mutation ItemsApiUnequipItemMutation($itemId: UUID!) {
    unequipItem(itemId: $itemId) {
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

export const buyItemMutation = graphql`
  mutation ItemsApiBuyItemTutorMutation($itemId: UUID!) {
    buyItem(itemId: $itemId) {
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

export const getItemsByUserQuery = graphql`
  query ItemsApiItemInventoryForUserByIdQuery($userId: UUID!) {
    itemsByUserId(userId: $userId) {
      equipped
      id
      uniqueDescription
      unlocked
      unlockedTime
    }
  }
`;

export const getItemsByUserQueryCustomId = graphql`
  query ItemsApiItemInventoryForUserByIdCustomIdQuery($userIds: [UUID!]!) {
    inventoriesForUsers(userIds: $userIds) {
      items {
        equipped
        catalogItemId: id
        uniqueDescription
        unlocked
        unlockedTime
      }
      unspentPoints
      userId
    }
  }
`;
