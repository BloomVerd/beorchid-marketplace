import { useMutation } from "@apollo/client/react";
import {
  InitiateDepositDocument,
  MyWalletDocument,
  MyLedgerDocument,
} from "@/common/graphql/generated/graphql";

export const useInitiateDeposit = () =>
  useMutation(InitiateDepositDocument, {
    refetchQueries: [MyWalletDocument, MyLedgerDocument],
  });
