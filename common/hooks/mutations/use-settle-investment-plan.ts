import { useMutation } from "@apollo/client/react";
import {
  SettleInvestmentPlanDocument,
  InvestmentPlansDocument,
  MyInvestmentsDocument,
} from "@/common/graphql/generated/graphql";

export const useSettleInvestmentPlan = () =>
  useMutation(SettleInvestmentPlanDocument, {
    refetchQueries: [InvestmentPlansDocument, MyInvestmentsDocument],
  });
