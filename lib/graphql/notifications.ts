import { gql } from "@apollo/client";

export const MY_NOTIFICATIONS = gql`
  query MyNotifications {
    myNotifications {
      id
      type
      payload
      readAt
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      readAt
    }
  }
`;
