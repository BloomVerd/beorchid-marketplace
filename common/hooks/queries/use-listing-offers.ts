import { useQuery } from "@apollo/client/react";
import { ListingOffersDocument } from "@/common/graphql/generated/graphql";

export const useListingOffers = (listingId: string) =>
  useQuery(ListingOffersDocument, { variables: { listingId } });
