import { useMutation } from "@apollo/client/react";
import { GrantFieldAgentDocument, AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useGrantFieldAgent = () =>
  useMutation(GrantFieldAgentDocument, {
    refetchQueries: [AdminUsersDocument],
  });
