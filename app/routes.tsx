import { Navigate, type RouteObject } from "react-router";
import Root from "./root";
import EditorRoute from "./routes/editor";
import Start from "./routes/start";

export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Start },
      { id: "new-c4", path: "new/c4/:kind", Component: EditorRoute },
      { id: "new", path: "new/:type", Component: EditorRoute },
      { id: "saved", path: "d/:id", Component: EditorRoute },
      // A view the editor does not have goes back to the start screen.
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
