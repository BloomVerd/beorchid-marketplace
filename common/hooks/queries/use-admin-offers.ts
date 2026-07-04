import { useQuery } from "@apollo/client/react";
import { AdminOffersDocument } from "@/common/graphql/generated/graphql";

export const useAdminOffers = () => useQuery(AdminOffersDocument);
