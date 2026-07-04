import { useQuery } from "@apollo/client/react";
import { MySavedSearchesDocument } from "@/common/graphql/generated/graphql";

export const useMySavedSearches = () => useQuery(MySavedSearchesDocument);
