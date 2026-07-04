import { useQuery } from "@apollo/client/react";
import { AuditLogDocument } from "@/common/graphql/generated/graphql";

export const useAuditLog = (entity?: string, from?: string, to?: string) =>
  useQuery(AuditLogDocument, { variables: { entity, from, to } });
