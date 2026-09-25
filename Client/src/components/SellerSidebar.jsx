/* eslint-disable no-unused-vars */
import {
  HiOutlineChartBar,
  HiOutlineClipboardList,
  HiOutlineLogout,
  HiOutlineSupport,
  HiOutlineUser,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { sellerSidebarStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { NavLink } from "react-router-dom";

// Sidebar for seller-specific tools like listings, leads, messages, and profile actions.
const SellerSidebar = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: HiOutlineViewGrid, path: "/dashboard" },
    {
      name: "My Listings",
      icon: HiOutlineClipboardList,
      path: "/my-properties",
    },
    { name: "Operations", icon: HiOutlineSupport, path: "/operations" },
    { name: "Leads", icon: HiOutlineChartBar, path: "/inquiries" },
    { name: "Messages", icon: HiOutlineViewGrid, path: "/chat-messages" },
    { name: "Profile", icon: HiOutlineUser, path: "/profile" },
    { name: "Support", icon: HiOutlineSupport, path: "/contact" },
  ];

  return (
    <>
      <div
        className={`${s.backdrop} ${isOpen ? s.backdropVisible : s.backdropHidden}`}
        onClick={onClose}
      />

      <aside
        className={`${s.sidebar} ${isOpen ? s.sidebarOpen : s.sidebarClosed}`}
      >
        <div className={s.logoContainer}>
          <Logo fontSize="1.25rem" iconSize={20} />
        </div>

        <nav className={s.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `${s.navLink} ${isActive ? s.navLinkActive : s.navLinkInactive}`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className={s.logoutContainer}>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className={s.logoutButton}
          >
            <HiOutlineLogout size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SellerSidebar;
