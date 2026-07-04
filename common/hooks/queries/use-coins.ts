import { useQuery } from "@apollo/client/react";
import { CoinsDocument } from "@/common/graphql/generated/graphql";

export const useCoins = () => useQuery(CoinsDocument);
