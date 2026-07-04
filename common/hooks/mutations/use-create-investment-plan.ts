import { useMutation } from "@apollo/client/react";
import {
  CreateInvestmentPlanDocument,
  CreateInvestmentPlanMutationVariables,
  InvestmentPlansDocument,
} from "@/common/graphql/generated/graphql";

export const useCreateInvestmentPlan = () => {
  const [mutate, result] = useMutation(CreateInvestmentPlanDocument, {
    refetchQueries: [InvestmentPlansDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        input: {
          ...options?.variables?.input,
          unitCost: (options?.variables?.input?.unitCost ?? 0) * 100,
          expectedProfitMin: (options?.variables?.input?.expectedProfitMin ?? 0) * 100,
          expectedProfitMax: (options?.variables?.input?.expectedProfitMax ?? 0) * 100,
        },
      } as CreateInvestmentPlanMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
