import { gql } from "@apollo/client";

export const LISTINGS = gql`
  query Listings($crop: String, $region: String, $status: ListingStatus, $maxPrice: Float, $minHealthScore: Float) {
    listings(crop: $crop, region: $region, status: $status, maxPrice: $maxPrice, minHealthScore: $minHealthScore) {
      id
      crop
      region
      acreage
      askingPrice
      currency
      status
      sellerId
      farmId
      expiresAt
      createdAt
      description
      lat
      lon
      farmImages {
        id
        url
      }
      farmHealth {
        overall_score
      }
    }
  }
`;

export const LISTING_DETAIL = gql`
  query ListingDetail($id: ID!) {
    listing(id: $id) {
      id
      crop
      region
      acreage
      askingPrice
      currency
      status
      sellerId
      farmId
      description
      expiresAt
      createdAt
      updatedAt
      lat
      lon
      farmImages {
        id
        url
      }
      farmHealth {
        overall_score
        soil_health
        crop_health
        weather_stress
        disease_risk
      }
    }
  }
`;

export const LISTING_OFFERS = gql`
  query ListingOffers($listingId: ID!) {
    listingOffers(listingId: $listingId) {
      id
      listingId
      amount
      status
      message
      expiresAt
      createdAt
      buyerId
      parentOfferId
    }
  }
`;

export const MY_OFFERS = gql`
  query MyOffers {
    myOffers {
      id
      listingId
      amount
      status
      message
      expiresAt
      createdAt
    }
  }
`;

export const CREATE_LISTING = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      crop
      region
      acreage
      askingPrice
      status
      createdAt
    }
  }
`;

export const WITHDRAW_LISTING = gql`
  mutation WithdrawListing($id: ID!) {
    withdrawListing(id: $id) {
      id
      status
    }
  }
`;

export const MAKE_OFFER = gql`
  mutation MakeOffer($listingId: ID!, $amount: Int!, $message: String) {
    makeOffer(listingId: $listingId, amount: $amount, message: $message) {
      id
      status
      amount
      expiresAt
    }
  }
`;

export const COUNTER_OFFER = gql`
  mutation CounterOffer($offerId: ID!, $amount: Int!, $message: String) {
    counterOffer(offerId: $offerId, amount: $amount, message: $message) {
      id
      status
      amount
      parentOfferId
    }
  }
`;

export const ACCEPT_OFFER = gql`
  mutation AcceptOffer($offerId: ID!) {
    acceptOffer(offerId: $offerId) {
      id
      status
      amount
      sellerId
      buyerId
      escrowLedgerRef
    }
  }
`;

export const REJECT_OFFER = gql`
  mutation RejectOffer($offerId: ID!) {
    rejectOffer(offerId: $offerId) {
      id
      status
    }
  }
`;

export const WITHDRAW_OFFER = gql`
  mutation WithdrawOffer($offerId: ID!) {
    withdrawOffer(offerId: $offerId) {
      id
      status
    }
  }
`;
