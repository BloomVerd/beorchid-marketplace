import { useMutation } from "@apollo/client/react";
import { AdminCreateUserDocument, AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useAdminCreateUser = () =>
  useMutation(AdminCreateUserDocument, {
    refetchQueries: [AdminUsersDocument],
  });
