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

export const widgetApiItemsByUserIdQuery = graphql`
query WidgetApiItemsByUserIdQuery($userId: UUID!) {
  itemsByUserId(userId: $userId) {
    equipped
    id
    uniqueDescription
    unlocked
    unlockedTime
  }
}`

export const widgetApiSettingsQuery = graphql`
  query WidgetApiSettingsQuery {
    currentUserWidgetSettings {
      numberOfRecommendations
      recommendationRefreshInterval
    }
  }
`;

export const widgetApiSettingsMutation = graphql`
  mutation WidgetApiSettingsMutation($widgetSettingsInput: WidgetSettingsInput!) {
    setCurrentUserWidgetSettings(settings: $widgetSettingsInput) {
      numberOfRecommendations
      recommendationRefreshInterval
    }
  }
`;

export const widgetApiRecommendationFeedbackMutation = graphql`
    mutation WidgetApiRecommendationFeedbackMutation(
        $category: GamificationCategory!,
        $feedback: RecommendationUserFeedback!
    ) {
        sendRecommendationFeedback(category: $category, feedback: $feedback)
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

export const widgetApiCurrentUserInfoQuery = graphql`
  query WidgetApiCurrentUserInfoQuery {
    currentUserInfo {
      courseMemberships {
        courseId
        course {
          widgetRecommendations {
            category
            requestFeedback
          }
        }
      }
    }
  }
`;


