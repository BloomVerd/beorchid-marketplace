import { useQuery } from "@apollo/client/react";
import { InvestmentPlanDetailDocument } from "@/common/graphql/generated/graphql";

export const useInvestmentPlanDetail = (id: string) =>
  useQuery(InvestmentPlanDetailDocument, { variables: { id } });
