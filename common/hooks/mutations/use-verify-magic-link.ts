import { useMutation } from "@apollo/client/react";
import { VerifyMagicLinkDocument } from "@/common/graphql/generated/graphql";

export const useVerifyMagicLink = () => useMutation(VerifyMagicLinkDocument);
