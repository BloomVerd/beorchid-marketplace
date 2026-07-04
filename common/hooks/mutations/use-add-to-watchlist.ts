import { useMutation } from "@apollo/client/react";
import {
  AddToWatchlistDocument,
  AddToWatchlistMutationVariables,
  MyWatchlistDocument,
} from "@/common/graphql/generated/graphql";

export const useAddToWatchlist = () => {
  const [mutate, result] = useMutation(AddToWatchlistDocument, {
    refetchQueries: [MyWatchlistDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        priceThreshold: options?.variables?.priceThreshold != null
          ? options.variables.priceThreshold * 100
          : options?.variables?.priceThreshold,
      } as AddToWatchlistMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
