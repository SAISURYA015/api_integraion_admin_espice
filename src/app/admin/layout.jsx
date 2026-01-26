// import { cookies } from "next/headers";

import AdminGuard from "@/components/auth/AdminGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "Admin Panel - Spice Lounge",
};

const AdminLayout = async ({ children }) => {
  // const cookieStore = await cookies();
  // const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <AdminGuard>
      <SidebarProvider defaultOpen>
        {children}
        <Toaster
          // richColors
          position="top-right"
          toastOptions={{
            classNames: {},
          }}
        />
      </SidebarProvider>
    </AdminGuard>
  );
};

export default AdminLayout;
