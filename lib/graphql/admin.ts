import { gql } from "@apollo/client";

export const ADMIN_METRICS = gql`
  query AdminMetrics {
    adminMetrics {
      gmv
      aum
      coinVolume
      activeInvestments
      totalListings
      totalDeals
      totalUsers
      gmvDelta
      aumDelta
      coinVolumeDelta
      activeInvestmentsDelta
      totalListingsDelta
      totalDealsDelta
      totalUsersDelta
    }
  }
`;

export const ADMIN_USERS = gql`
  query AdminUsers {
    adminUsers {
      id
      email
      firstName
      lastName
      roles
      isFieldAgent
      createdAt
    }
  }
`;

export const ADMIN_DEALS = gql`
  query AdminDeals {
    adminDeals {
      id
      status
      amount
      sellerId
      buyerId
      createdAt
    }
  }
`;

export const ADMIN_OFFERS = gql`
  query AdminOffers {
    adminOffers {
      id
      status
      amount
      listingId
      buyerId
      createdAt
    }
  }
`;

export const AUDIT_LOG = gql`
  query AuditLog($entity: String, $from: DateTime, $to: DateTime) {
    auditLog(entity: $entity, from: $from, to: $to) {
      id
      actorId
      action
      entity
      entityId
      diff
      createdAt
    }
  }
`;

export const UPDATE_USER_ROLES = gql`
  mutation UpdateUserRoles($userId: ID!, $roles: [String!]!) {
    updateUserRoles(userId: $userId, roles: $roles) {
      id
      roles
    }
  }
`;

export const SUSPEND_USER = gql`
  mutation SuspendUser($userId: ID!) {
    suspendUser(userId: $userId) {
      id
    }
  }
`;

export const GRANT_FIELD_AGENT = gql`
  mutation GrantFieldAgent($userId: ID!) {
    grantFieldAgent(userId: $userId) {
      id
      isFieldAgent
    }
  }
`;

export const REVOKE_FIELD_AGENT = gql`
  mutation RevokeFieldAgent($userId: ID!) {
    revokeFieldAgent(userId: $userId) {
      id
      isFieldAgent
    }
  }
`;
