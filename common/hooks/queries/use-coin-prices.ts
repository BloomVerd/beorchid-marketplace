import { useQuery } from "@apollo/client/react";
import { CoinPricesDocument } from "@/common/graphql/generated/graphql";

export const useCoinPrices = (coinId: string, from?: string, to?: string) =>
  useQuery(CoinPricesDocument, { variables: { coinId, from, to } });
