import {
  HiOutlineChatAlt2,
  HiOutlineLibrary,
  HiOutlineLogout,
  HiOutlineMail,
  HiOutlineUserCircle,
  HiOutlineUsers,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { adminSidebarStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/AuthContext";
import Logo from "./common/Logo";
import { NavLink } from "react-router-dom";

const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: "Overview", icon: HiOutlineViewGrid, path: "/admin-dashboard" },
    { name: "Users", icon: HiOutlineUsers, path: "/admin/users" },
    {
      name: "Seller Requests",
      icon: HiOutlineUserCircle,
      path: "/admin/seller-requests",
    },
    { name: "Properties", icon: HiOutlineLibrary, path: "/admin/properties" },
    { name: "Operations", icon: HiOutlineViewGrid, path: "/admin/operations" },
    { name: "Inquiries", icon: HiOutlineChatAlt2, path: "/admin/inquiries" },
    { name: "Contact Inbox", icon: HiOutlineMail, path: "/admin/contacts" },
  ];

  return (
    <>
      <div className={s.backdrop(isOpen)} onClick={onClose} />
      <aside className={s.sidebar(isOpen)}>
        <div className={s.logoContainer}>
          <Logo fontSize="1.2rem" iconSize={20} />
        </div>

        <nav className={s.navContainer}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => s.navLink(isActive)}
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

export default AdminSidebar;
