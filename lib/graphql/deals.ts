import { gql } from "@apollo/client";

export const MY_DEALS = gql`
  query MyDeals {
    myDeals {
      id
      listingId
      acceptedOfferId
      sellerId
      buyerId
      amount
      status
      escrowLedgerRef
      createdAt
      updatedAt
    }
  }
`;

export const DEAL_DETAIL = gql`
  query DealDetail($id: ID!) {
    deal(id: $id) {
      id
      listingId
      acceptedOfferId
      sellerId
      buyerId
      amount
      status
      escrowLedgerRef
      createdAt
      updatedAt
    }
  }
`;

export const CONFIRM_DEAL_PAYMENT = gql`
  mutation ConfirmDealPayment($dealId: ID!) {
    confirmDealPayment(dealId: $dealId) {
      id
      status
    }
  }
`;
