import { useMutation } from "@apollo/client/react";
import {
  UpdateCoinStatusDocument,
  CoinsDocument,
} from "@/common/graphql/generated/graphql";

export const useUpdateCoinStatus = () => {
  return useMutation(UpdateCoinStatusDocument, {
    refetchQueries: [CoinsDocument],
  });
};
