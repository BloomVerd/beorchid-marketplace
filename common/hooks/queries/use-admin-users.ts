import { useQuery } from "@apollo/client/react";
import { AdminUsersDocument } from "@/common/graphql/generated/graphql";

export const useAdminUsers = () => useQuery(AdminUsersDocument);
