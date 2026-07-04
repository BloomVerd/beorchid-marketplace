import { useMutation } from "@apollo/client/react";
import {
  CreateCoinDocument,
  CreateCoinMutationVariables,
  CoinsDocument,
  CropsDocument,
} from "@/common/graphql/generated/graphql";

export const useCreateCoin = () => {
  const [mutate, result] = useMutation(CreateCoinDocument, {
    refetchQueries: [CoinsDocument, CropsDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        input: {
          ...options?.variables?.input,
          basePrice: (options?.variables?.input?.basePrice ?? 0) * 100,
        },
      } as CreateCoinMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
