import { useMutation } from "@apollo/client/react";
import {
  CreateListingDocument,
  CreateListingMutationVariables,
  ListingsDocument,
  ListingDetailDocument,
} from "@/common/graphql/generated/graphql";

export const useCreateListing = () => {
  const [mutate, result] = useMutation(CreateListingDocument, {
    refetchQueries: [ListingsDocument, ListingDetailDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        input: {
          ...options?.variables?.input,
          askingPrice: (options?.variables?.input?.askingPrice ?? 0) * 100,
        },
      } as CreateListingMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
