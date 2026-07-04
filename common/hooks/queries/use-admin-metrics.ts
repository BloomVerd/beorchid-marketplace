import { useQuery } from "@apollo/client/react";
import { AdminMetricsDocument } from "@/common/graphql/generated/graphql";

export const useAdminMetrics = () => useQuery(AdminMetricsDocument);
