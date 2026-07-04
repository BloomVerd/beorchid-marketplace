import { useMutation } from "@apollo/client/react";
import {
  PurchaseInvestmentDocument,
  MyInvestmentsDocument,
  MyWalletDocument,
  MyLedgerDocument,
  InvestmentPlansDocument,
} from "@/common/graphql/generated/graphql";

export const usePurchaseInvestment = () =>
  useMutation(PurchaseInvestmentDocument, {
    refetchQueries: [
      MyInvestmentsDocument,
      MyWalletDocument,
      MyLedgerDocument,
      InvestmentPlansDocument,
    ],
  });
