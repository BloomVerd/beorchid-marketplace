"use client";

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  CombinedGraphQLErrors,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { Observable } from "rxjs";
import { useAuthStore } from "@/stores/auth-store";
import { REFRESH_MUTATION } from "@/lib/graphql/auth";

const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql";

const httpLink = createHttpLink({ uri: graphqlUrl });

const authLink = setContext((_, prevContext) => {
  const headers = prevContext.headers as Record<string, string> | undefined;
  const token = useAuthStore.getState().accessToken;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

async function refreshAccessToken(): Promise<string> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(graphqlUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: REFRESH_MUTATION,
      variables: { refreshToken },
    }),
  });

  const json = (await res.json()) as {
    errors?: unknown[];
    data?: { refresh?: { accessToken: string; refreshToken: string } };
  };

  if (json.errors?.length || !json.data?.refresh) {
    throw new Error("Token refresh failed");
  }

  const { accessToken, refreshToken: newRefreshToken } = json.data.refresh;
  useAuthStore.getState().setTokens(accessToken, newRefreshToken);
  return accessToken;
}

function handleRefreshFailure() {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

const errorLink = onError(({ error, operation, forward }) => {
  const isUnauth =
    (CombinedGraphQLErrors.is(error) &&
      error.errors.some((e) => e.extensions?.code === "UNAUTHENTICATED")) ||
    (!CombinedGraphQLErrors.is(error) &&
      "statusCode" in error &&
      (error as unknown as { statusCode: number }).statusCode === 401);

  if (!isUnauth) return;

  if (isRefreshing) {
    return new Observable((observer) => {
      pendingRequests.push(() => forward(operation).subscribe(observer));
    });
  }

  isRefreshing = true;

  return new Observable((observer) => {
    refreshAccessToken()
      .then(() => {
        isRefreshing = false;
        pendingRequests.forEach((cb) => cb());
        pendingRequests = [];
        forward(operation).subscribe(observer);
      })
      .catch(() => {
        isRefreshing = false;
        pendingRequests = [];
        handleRefreshFailure();
        observer.complete();
      });
  });
});

const client = new ApolloClient({
  link: errorLink.concat(authLink).concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
