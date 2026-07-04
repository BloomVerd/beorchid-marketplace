import { useMutation } from "@apollo/client/react";
import {
  SellCoinDocument,
  MyCoinsDocument,
  MyWalletDocument,
  CoinsDocument,
  MyLedgerDocument,
} from "@/common/graphql/generated/graphql";

export const useSellCoin = () =>
  useMutation(SellCoinDocument, {
    refetchQueries: [MyCoinsDocument, MyWalletDocument, CoinsDocument, MyLedgerDocument],
  });
