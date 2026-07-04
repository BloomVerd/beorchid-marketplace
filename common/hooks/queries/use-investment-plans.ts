import { useQuery } from "@apollo/client/react";
import { InvestmentPlansDocument, PlanStatus } from "@/common/graphql/generated/graphql";

export const useInvestmentPlans = (
  status?: PlanStatus,
  cropId?: string,
  maxMaturityDays?: number,
  lowRiskOnly?: boolean,
) =>
  useQuery(InvestmentPlansDocument, { variables: { status, cropId, maxMaturityDays, lowRiskOnly } });
