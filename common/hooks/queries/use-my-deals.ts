import { useQuery } from "@apollo/client/react";
import { MyDealsDocument } from "@/common/graphql/generated/graphql";

export const useMyDeals = () => useQuery(MyDealsDocument);
