import { useMutation } from "@apollo/client/react";
import {
  ApproveFieldObservationDocument,
  AdminFieldObservationsDocument,
} from "@/common/graphql/generated/graphql";

export const useApproveFieldObservation = () => {
  return useMutation(ApproveFieldObservationDocument, {
    refetchQueries: [AdminFieldObservationsDocument],
  });
};
