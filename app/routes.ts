import { type RouteConfig, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/start.tsx"),
  route("new/c4/:kind", "routes/editor.tsx", { id: "new-c4" }),
  route("new/:type", "routes/editor.tsx", { id: "new" }),
  route("d/:id", "routes/editor.tsx", { id: "saved" }),
] satisfies RouteConfig;
