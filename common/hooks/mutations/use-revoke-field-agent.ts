import { useMutation } from "@apollo/client/react";
import { RevokeFieldAgentDocument, AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useRevokeFieldAgent = () =>
  useMutation(RevokeFieldAgentDocument, {
    refetchQueries: [AdminUsersDocument],
  });
