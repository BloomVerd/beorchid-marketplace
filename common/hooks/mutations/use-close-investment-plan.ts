import { useMutation } from "@apollo/client/react";
import {
  CloseInvestmentPlanDocument,
  InvestmentPlansDocument,
} from "@/common/graphql/generated/graphql";

export const useCloseInvestmentPlan = () => {
  return useMutation(CloseInvestmentPlanDocument, {
    refetchQueries: [InvestmentPlansDocument],
  });
};
