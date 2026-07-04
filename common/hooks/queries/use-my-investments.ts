import { useQuery } from "@apollo/client/react";
import { MyInvestmentsDocument } from "@/common/graphql/generated/graphql";

export const useMyInvestments = () => useQuery(MyInvestmentsDocument);
