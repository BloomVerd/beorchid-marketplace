import { useMutation } from "@apollo/client/react";
import {
  AcceptOfferDocument,
  MyOffersDocument,
  ListingOffersDocument,
  MyDealsDocument,
  AdminOffersDocument,
  AdminDealsDocument,
  ListingDetailDocument,
  ListingsDocument,
  MyWalletDocument,
} from "@/common/graphql/generated/graphql";

export const useAcceptOffer = () =>
  useMutation(AcceptOfferDocument, {
    refetchQueries: [
      MyOffersDocument,
      ListingOffersDocument,
      MyDealsDocument,
      AdminOffersDocument,
      AdminDealsDocument,
      ListingDetailDocument,
      ListingsDocument,
      MyWalletDocument,
    ],
  });
