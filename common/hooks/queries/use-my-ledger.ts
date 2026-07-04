import { useQuery } from "@apollo/client/react";
import { LedgerAccount, MyLedgerDocument } from "@/common/graphql/generated/graphql";

export const useMyLedger = (from?: string, to?: string, account?: LedgerAccount) =>
  useQuery(MyLedgerDocument, { variables: { from, to, account } });
