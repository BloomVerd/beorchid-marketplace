import { useMutation } from "@apollo/client/react";
import {
  RejectOfferDocument,
  MyOffersDocument,
  ListingOffersDocument,
  AdminOffersDocument,
} from "@/common/graphql/generated/graphql";

export const useRejectOffer = () =>
  useMutation(RejectOfferDocument, {
    refetchQueries: [MyOffersDocument, ListingOffersDocument, AdminOffersDocument],
  });
