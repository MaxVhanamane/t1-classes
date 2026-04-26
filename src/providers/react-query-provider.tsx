"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { HttpError } from "@/src/lib/api/fetch-wrapper";

export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [client] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError(error) {
            if (!(error instanceof HttpError)) return;

            if (error.status === 401) {
              router.replace("/login");
              return;
            }

            if (error.status === 403) {
              router.replace("/");
              return;
            }
          },
        }),

        mutationCache: new MutationCache({
          onError(error) {
            if (!(error instanceof HttpError)) return;

            if (error.status === 401) {
              router.replace("/login");
              return;
            }

            if (error.status === 403) {
              router.replace("/");
              return;
            }
          },
        }),

        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },

          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}
