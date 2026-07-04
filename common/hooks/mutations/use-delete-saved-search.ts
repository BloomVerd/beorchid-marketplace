import { useMutation } from "@apollo/client/react";
import { DeleteSavedSearchDocument, MySavedSearchesDocument } from "@/common/graphql/generated/graphql";

export const useDeleteSavedSearch = () =>
  useMutation(DeleteSavedSearchDocument, {
    refetchQueries: [MySavedSearchesDocument],
  });
