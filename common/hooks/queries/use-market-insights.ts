import { useQuery } from "@apollo/client/react";
import { MarketInsightsDocument } from "@/common/graphql/generated/graphql";

export const useMarketInsights = (cropId?: string, region?: string) =>
  useQuery(MarketInsightsDocument, { variables: { cropId, region } });
