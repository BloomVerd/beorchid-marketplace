import { useLazyQuery } from "@apollo/client/react";
import { SearchDocument } from "@/common/graphql/generated/graphql";

export const useSearchLazy = () => useLazyQuery(SearchDocument);
