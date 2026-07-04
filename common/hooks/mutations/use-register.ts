import { useMutation } from "@apollo/client/react";
import { RegisterDocument } from "@/common/graphql/generated/graphql";

export const useRegister = () => useMutation(RegisterDocument);
