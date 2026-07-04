import { useQuery } from "@apollo/client/react";
import { CoinDetailDocument } from "@/common/graphql/generated/graphql";

export const useCoinDetail = (id: string) =>
  useQuery(CoinDetailDocument, { variables: { id } });
