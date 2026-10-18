import type { Config } from "@react-router/dev/config";

// Client-only single-page app: no server component (persistence and export are out of scope).
export default { ssr: false } satisfies Config;
