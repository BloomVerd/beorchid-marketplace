import { useMutation } from "@apollo/client/react";
import {
  CounterOfferDocument,
  CounterOfferMutationVariables,
  MyOffersDocument,
  ListingOffersDocument,
  AdminOffersDocument,
} from "@/common/graphql/generated/graphql";

export const useCounterOffer = () => {
  const [mutate, result] = useMutation(CounterOfferDocument, {
    refetchQueries: [MyOffersDocument, ListingOffersDocument, AdminOffersDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        amount: (options?.variables?.amount ?? 0) * 100,
      } as CounterOfferMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
