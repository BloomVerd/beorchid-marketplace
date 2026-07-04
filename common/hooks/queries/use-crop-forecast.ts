import { useQuery } from "@apollo/client/react";
import { CropForecastDocument } from "@/common/graphql/generated/graphql";

export const useCropForecast = (cropId: string, region: string, horizonDays?: number) =>
  useQuery(CropForecastDocument, { variables: { cropId, region, horizonDays } });
