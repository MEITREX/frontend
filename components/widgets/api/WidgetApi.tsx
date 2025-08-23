import { graphql } from "react-relay";

export const widgetApiItemInventoryForUserQuery = graphql`
  query WidgetApiItemInventoryForUserQuery {
    inventoryForUser {
      items {
        equipped
        id
        unlocked
        unlockedTime
      }
    }
  }
`;

export const widgetApiAchievementWidgetOverviewQuery = graphql`
  query WidgetApiAchievementWidgetOverviewQuery($id: UUID!) {
    achievementsByUserId(userId: $id) {
      id
      name
      imageUrl
      description
      courseId
      userId
      completed
      requiredCount
      completedCount
      trackingStartTime
      trackingEndTime
    }
  }
`;

