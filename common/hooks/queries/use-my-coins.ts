import { useQuery } from "@apollo/client/react";
import { MyCoinsDocument } from "@/common/graphql/generated/graphql";

export const useMyCoins = () => useQuery(MyCoinsDocument);
