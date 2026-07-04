import { useQuery } from "@apollo/client/react";
import { MyWalletDocument } from "@/common/graphql/generated/graphql";

export const useMyWallet = () => useQuery(MyWalletDocument);
