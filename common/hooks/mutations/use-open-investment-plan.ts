import { useMutation } from "@apollo/client/react";
import {
  OpenInvestmentPlanDocument,
  InvestmentPlansDocument,
} from "@/common/graphql/generated/graphql";

export const useOpenInvestmentPlan = () => {
  return useMutation(OpenInvestmentPlanDocument, {
    refetchQueries: [InvestmentPlansDocument],
  });
};
