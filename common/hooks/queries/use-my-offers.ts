import { useQuery } from "@apollo/client/react";
import { MyOffersDocument } from "@/common/graphql/generated/graphql";

export const useMyOffers = () => useQuery(MyOffersDocument);
