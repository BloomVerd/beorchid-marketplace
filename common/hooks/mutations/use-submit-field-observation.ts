import { useMutation } from "@apollo/client/react";
import {
  SubmitFieldObservationDocument,
  SubmitFieldObservationMutationVariables,
  MyFieldObservationsDocument,
} from "@/common/graphql/generated/graphql";

export const useSubmitFieldObservation = () => {
  const [mutate, result] = useMutation(SubmitFieldObservationDocument, {
    refetchQueries: [MyFieldObservationsDocument],
  });

  const wrappedMutate: typeof mutate = (options) =>
    mutate({
      ...options,
      variables: {
        ...options?.variables,
        input: {
          ...options?.variables?.input,
          observedPrice: (options?.variables?.input?.observedPrice ?? 0) * 100,
        },
      } as SubmitFieldObservationMutationVariables,
    });

  return [wrappedMutate, result] as const;
};
