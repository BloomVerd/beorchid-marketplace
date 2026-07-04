import { useMutation } from "@apollo/client/react";
import {
  RecomputeCoinPriceDocument,
  CoinsDocument,
} from "@/common/graphql/generated/graphql";

export const useRecomputeCoinPrice = () =>
  useMutation(RecomputeCoinPriceDocument, {
    refetchQueries: [CoinsDocument],
  });
