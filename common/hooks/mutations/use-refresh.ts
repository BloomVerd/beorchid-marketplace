import { useMutation } from "@apollo/client/react";
import { RefreshDocument } from "@/common/graphql/generated/graphql";

export const useRefresh = () => useMutation(RefreshDocument);
