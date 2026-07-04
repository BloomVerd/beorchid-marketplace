import { useQuery } from "@apollo/client/react";
import { MyWatchlistDocument } from "@/common/graphql/generated/graphql";

export const useMyWatchlist = () => useQuery(MyWatchlistDocument);
