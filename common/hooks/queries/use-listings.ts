import { useQuery } from "@apollo/client/react";
import { ListingsDocument, ListingStatus } from "@/common/graphql/generated/graphql";

export const useListings = (
  crop?: string,
  region?: string,
  status?: ListingStatus,
  maxPrice?: number,
  minHealthScore?: number,
) =>
  useQuery(ListingsDocument, { variables: { crop, region, status, maxPrice, minHealthScore } });
