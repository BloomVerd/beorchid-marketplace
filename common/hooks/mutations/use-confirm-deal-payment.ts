import { useMutation } from "@apollo/client/react";
import {
  ConfirmDealPaymentDocument,
  MyDealsDocument,
  AdminDealsDocument,
  MyWalletDocument,
  MyLedgerDocument,
} from "@/common/graphql/generated/graphql";

export const useConfirmDealPayment = () =>
  useMutation(ConfirmDealPaymentDocument, {
    refetchQueries: [MyDealsDocument, AdminDealsDocument, MyWalletDocument, MyLedgerDocument],
  });
