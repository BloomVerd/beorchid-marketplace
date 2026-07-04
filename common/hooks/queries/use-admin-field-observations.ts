import { useQuery } from "@apollo/client/react";
import {
  AdminFieldObservationsDocument,
  AdminFieldObservationsQueryVariables,
} from "@/common/graphql/generated/graphql";

export const useAdminFieldObservations = (
  variables?: AdminFieldObservationsQueryVariables,
  skip?: boolean,
) => {
  return useQuery(AdminFieldObservationsDocument, { variables, skip });
};
