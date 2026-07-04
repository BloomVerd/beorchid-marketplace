import { gql } from "@apollo/client";

export const MY_WALLET = gql`
  query MyWallet {
    myWallet {
      id
      availableBalance
      lockedBalance
      currency
      ownerType
    }
  }
`;

export const MY_LEDGER = gql`
  query MyLedger($from: DateTime, $to: DateTime, $account: LedgerAccount) {
    myLedger(from: $from, to: $to, account: $account) {
      id
      direction
      amount
      account
      transactionId
      createdAt
    }
  }
`;

export const INITIATE_DEPOSIT = gql`
  mutation InitiateDeposit($amount: Int!, $idempotencyKey: String!) {
    initiateDeposit(amount: $amount, idempotencyKey: $idempotencyKey) {
      checkoutUrl
      intent {
        id
        status
        amount
        providerRef
      }
    }
  }
`;
