import { useMutation } from "@apollo/client/react";
import { SendMagicLinkDocument } from "@/common/graphql/generated/graphql";

export const useSendMagicLink = () => useMutation(SendMagicLinkDocument);
