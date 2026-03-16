import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";

export default function App() {
  return (
    <MvpContentProvider>
      <RouterProvider router={router} />
    </MvpContentProvider>
  );
}
