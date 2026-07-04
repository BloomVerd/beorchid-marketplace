import { useMutation } from "@apollo/client/react";
import { SuspendUserDocument, AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useSuspendUser = () =>
  useMutation(SuspendUserDocument, {
    refetchQueries: [AdminUsersDocument],
  });
