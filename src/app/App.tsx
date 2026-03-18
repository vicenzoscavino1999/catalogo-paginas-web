import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { AuthProvider } from "@/shared/auth/AuthContext";
import { MvpContentProvider } from "@/shared/content/MvpContentContext";

export default function App() {
  return (
    <AuthProvider>
      <MvpContentProvider>
        <RouterProvider router={router} />
      </MvpContentProvider>
    </AuthProvider>
  );
}
