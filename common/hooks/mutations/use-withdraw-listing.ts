import { useMutation } from "@apollo/client/react";
import {
  WithdrawListingDocument,
  ListingsDocument,
  ListingDetailDocument,
} from "@/common/graphql/generated/graphql";

export const useWithdrawListing = () =>
  useMutation(WithdrawListingDocument, {
    refetchQueries: [ListingsDocument, ListingDetailDocument],
  });
