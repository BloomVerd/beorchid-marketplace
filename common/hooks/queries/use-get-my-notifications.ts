import { useQuery } from "@apollo/client/react";
import { GetMyNotificationsDocument } from "@/common/graphql/generated/graphql";

export const useGetMyNotifications = (page = 1, limit = 20) =>
  useQuery(GetMyNotificationsDocument, { variables: { page, limit } });
