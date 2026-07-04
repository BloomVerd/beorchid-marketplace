import { useMutation } from "@apollo/client/react";
import {
  RemoveFromWatchlistDocument,
  MyWatchlistDocument,
} from "@/common/graphql/generated/graphql";

export const useRemoveFromWatchlist = () =>
  useMutation(RemoveFromWatchlistDocument, {
    refetchQueries: [MyWatchlistDocument],
  });
