import { useState } from "react";
import { adminLayoutStyles as s } from "../assets/dummyStyles";
import AdminSidebar from "./AdminSidebar";
import DashboardNavbar from "./DashboardNavbar";
import { Outlet } from "react-router-dom";

// Layout for all admin screens, including the sidebar and top navigation wrapper.
const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={s.layout}>
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className={s.mainWrapper}>
        <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className={s.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
