import { useQuery } from "@apollo/client/react";
import { MyFieldObservationsDocument } from "@/common/graphql/generated/graphql";

export const useMyFieldObservations = () => useQuery(MyFieldObservationsDocument);
