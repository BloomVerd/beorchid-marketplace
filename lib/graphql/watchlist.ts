import { gql } from "@apollo/client";

export const MY_WATCHLIST = gql`
  query MyWatchlist {
    myWatchlist {
      id
      entityType
      entityId
      priceThreshold
      createdAt
    }
  }
`;

export const MY_SAVED_SEARCHES = gql`
  query MySavedSearches {
    mySavedSearches {
      id
      name
      filters
      createdAt
    }
  }
`;

export const ADD_TO_WATCHLIST = gql`
  mutation AddToWatchlist($entityType: WatchlistEntityType!, $entityId: ID!, $priceThreshold: Int) {
    addToWatchlist(entityType: $entityType, entityId: $entityId, priceThreshold: $priceThreshold) {
      id
      entityType
      entityId
      priceThreshold
    }
  }
`;

export const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveFromWatchlist($id: ID!) {
    removeFromWatchlist(id: $id)
  }
`;

export const CREATE_SAVED_SEARCH = gql`
  mutation CreateSavedSearch($name: String!, $filters: Object!) {
    createSavedSearch(name: $name, filters: $filters) {
      id
      name
      filters
    }
  }
`;

export const DELETE_SAVED_SEARCH = gql`
  mutation DeleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id)
  }
`;
