import { useQuery } from "@apollo/client/react";
import { ListingDetailDocument } from "@/common/graphql/generated/graphql";

export const useListingDetail = (id: string) =>
  useQuery(ListingDetailDocument, { variables: { id } });
