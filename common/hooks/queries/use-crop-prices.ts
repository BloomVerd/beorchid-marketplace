import { useQuery } from "@apollo/client/react";
import { CropPricesDocument } from "@/common/graphql/generated/graphql";

export const useCropPrices = (cropId: string, region?: string, from?: string, to?: string) =>
  useQuery(CropPricesDocument, { variables: { cropId, region, from, to } });
