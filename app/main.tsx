import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router";
import { routes } from "./routes";

// Views are named after "#", so every address is the one real page and a host that serves only files needs no fallback.
const router = createHashRouter(routes);
const root = document.getElementById("root");
if (root === null) throw new Error("The page has no element to mount the editor in.");
createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
