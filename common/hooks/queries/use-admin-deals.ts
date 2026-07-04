import { useQuery } from "@apollo/client/react";
import { AdminDealsDocument } from "@/common/graphql/generated/graphql";

export const useAdminDeals = () => useQuery(AdminDealsDocument);
