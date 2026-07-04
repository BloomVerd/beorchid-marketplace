import { useMutation } from "@apollo/client/react";
import {
  MakeOfferDocument,
  MakeOfferMutationVariables,
  MyOffersDocument,
  ListingOffersDocument,
  AdminOffersDocument,
} from "@/common/graphql/generated/graphql";

export const useMakeOffer = () => {
  const [mutate, result] = useMutation(MakeOfferDocument, {
    refetchQueries: [MyOffersDocument, ListingOffersDocument, AdminOffersDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        amount: (options?.variables?.amount ?? 0) * 100,
      } as MakeOfferMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
