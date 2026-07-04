import { useMutation } from "@apollo/client/react";
import {
  WithdrawOfferDocument,
  MyOffersDocument,
  ListingOffersDocument,
  AdminOffersDocument,
} from "@/common/graphql/generated/graphql";

export const useWithdrawOffer = () =>
  useMutation(WithdrawOfferDocument, {
    refetchQueries: [MyOffersDocument, ListingOffersDocument, AdminOffersDocument],
  });
