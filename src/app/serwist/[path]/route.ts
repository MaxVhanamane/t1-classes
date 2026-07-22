import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";
// If you are using Next.js versions older than 15.0.0, add the
// `nextConfig` option so that Serwist can configure the service
// worker according to your options. Serwist 10 and newer will
// only support Next.js 15.0.0 and above.
// import nextConfig from "$cwd/next.config.mjs";

// This is optional!
// A revision helps Serwist version a precached page. This
// avoids outdated precached responses being used. Using
// `git rev-parse HEAD` might not the most efficient way
// of determining a revision, however. You may prefer to use
// the hashes of every extra file you precache.
const revision = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ?? crypto.randomUUID();

// The sw.ts file is compiled by its own esbuild pass, separate from
// Next's normal webpack/turbopack build - so process.env.NEXT_PUBLIC_*
// isn't inlined automatically like it is in client components. We have
// to explicitly tell esbuild to replace these references at build time.
// This route file itself runs in Node.js, so process.env works fine here.
const firebaseEnvDefines = Object.fromEntries(
    [
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_AUTH_DOMAIN",
        "NEXT_PUBLIC_PROJECT_ID",
        "NEXT_PUBLIC_STORAGE_BUCKET",
        "NEXT_PUBLIC_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_APP_ID",
    ].map((key) => [
        `process.env.${key}`,
        JSON.stringify(process.env[key] ?? ""),
    ])
);

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    swSrc: "src/app/sw.ts",
    // nextConfig,
    // If set to `false`, Serwist will attempt to use `esbuild-wasm`.
    useNativeEsbuild: true,
    esbuildOptions: {
        define: firebaseEnvDefines,
    },
});
