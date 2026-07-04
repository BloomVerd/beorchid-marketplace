import { useQuery } from "@apollo/client/react";
import { CropsDocument } from "@/common/graphql/generated/graphql";

export const useCrops = (category?: string, region?: string) =>
  useQuery(CropsDocument, { variables: { category, region } });
