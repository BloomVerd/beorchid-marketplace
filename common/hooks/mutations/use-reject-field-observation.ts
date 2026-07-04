import { useMutation } from "@apollo/client/react";
import {
  RejectFieldObservationDocument,
  AdminFieldObservationsDocument,
} from "@/common/graphql/generated/graphql";

export const useRejectFieldObservation = () => {
  return useMutation(RejectFieldObservationDocument, {
    refetchQueries: [AdminFieldObservationsDocument],
  });
};
