import { useMutation } from "@apollo/client/react";
import {
  MarkNotificationReadDocument,
  GetMyNotificationsDocument,
} from "@/common/graphql/generated/graphql";

export const useMarkNotificationRead = () =>
  useMutation(MarkNotificationReadDocument, {
    refetchQueries: [GetMyNotificationsDocument],
  });
