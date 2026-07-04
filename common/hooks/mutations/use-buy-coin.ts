import { useMutation } from "@apollo/client/react";
import {
  BuyCoinDocument,
  MyCoinsDocument,
  MyWalletDocument,
  CoinsDocument,
  MyLedgerDocument,
} from "@/common/graphql/generated/graphql";

export const useBuyCoin = () =>
  useMutation(BuyCoinDocument, {
    refetchQueries: [MyCoinsDocument, MyWalletDocument, CoinsDocument, MyLedgerDocument],
  });
