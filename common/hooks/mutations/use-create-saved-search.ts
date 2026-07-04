import { useMutation } from "@apollo/client/react";
import { CreateSavedSearchDocument, MySavedSearchesDocument } from "@/common/graphql/generated/graphql";

export const useCreateSavedSearch = () =>
  useMutation(CreateSavedSearchDocument, {
    refetchQueries: [MySavedSearchesDocument],
  });
