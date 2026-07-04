import { useMutation } from "@apollo/client/react";
import { UpdateUserRolesDocument, AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useUpdateUserRoles = () =>
  useMutation(UpdateUserRolesDocument, {
    refetchQueries: [AdminUsersDocument],
  });
