import { useMutation } from "@apollo/client/react";
import { LoginWithPasswordDocument } from "@/common/graphql/generated/graphql";

export const useLoginWithPassword = () => useMutation(LoginWithPasswordDocument);
