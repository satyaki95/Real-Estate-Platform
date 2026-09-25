import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  HiOutlineCalendar,
  HiOutlineClipboardList,
  HiOutlineSupport,
} from "react-icons/hi";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";

const statusClass = (status) => {
  if (["Completed", "Approved"].includes(status))
    return "bg-emerald-100 text-emerald-700";
  if (["In Progress", "Checked In"].includes(status))
    return "bg-blue-100 text-blue-700";
  return "bg-amber-100 text-amber-700";
};

const MaintenanceAmenitySummary = ({ role }) => {
  const { token, user } = useAuth();
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [maintenanceRes, bookingRes] = await Promise.all([
        axios.get(`${API_URL}/api/maintenance`, { headers }),
        axios.get(`${API_URL}/api/amenity-bookings`, { headers }),
      ]);
      setMaintenance(maintenanceRes.data.requests || []);
      setBookings(bookingRes.data.bookings || []);
    } catch (error) {
      console.error("Failed to load maintenance summary:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadSummary, 0);
    const socket = io(API_URL);
    socket.emit("joinUser", { userId: user?._id, role: user?.role });
    socket.on("maintenanceUpdated", loadSummary);
    socket.on("bookingUpdated", loadSummary);
    return () => {
      window.clearTimeout(initialLoad);
      socket.off("maintenanceUpdated", loadSummary);
      socket.off("bookingUpdated", loadSummary);
      socket.disconnect();
    };
  }, [loadSummary, user?._id, user?.role]);

  if (loading)
    return <div className="mb-8 h-36 animate-pulse rounded-xl bg-white/70" />;

  const pendingMaintenance = maintenance.filter(
    (item) => item.status === "Pending",
  ).length;
  const activeMaintenance = maintenance.filter(
    (item) => item.status === "In Progress",
  ).length;
  const activeBookings = bookings.filter(
    (item) => !["Completed", "Cancelled"].includes(item.status),
  ).length;
  const visibleMaintenance = maintenance.filter(
    (item) => item.status !== "Completed",
  );
  const visibleBookings = bookings.filter(
    (item) => item.status !== "Completed",
  );
  const deskPath = role === "admin" ? "/admin/operations" : "/operations";
  const recentItems = [
    ...visibleMaintenance.map((item) => ({
      ...item,
      kind: "maintenance",
      date: item.createdAt,
    })),
    ...visibleBookings.map((item) => ({
      ...item,
      kind: "booking",
      date: item.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  return (
    <section className="mb-8 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Live operations
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">
            Maintenance & amenity desk
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Real-time requests and facility usage.
          </p>
        </div>
        <Link
          to={deskPath}
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
        >
          Open desk
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <SummaryMetric
          label="Pending requests"
          value={pendingMaintenance}
          icon={<HiOutlineSupport />}
        />
        <SummaryMetric
          label="In progress"
          value={activeMaintenance}
          icon={<HiOutlineClipboardList />}
        />
        <SummaryMetric
          label="Active bookings"
          value={activeBookings}
          icon={<HiOutlineCalendar />}
        />
      </div>

      {recentItems.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {recentItems.map((item) => (
            <div
              key={`${item.kind}-${item._id}`}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">
                  {item.kind === "maintenance" ? item.title : item.amenity}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {item.property?.title || "Property"}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${statusClass(item.status)}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

const SummaryMetric = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
    <span className="text-xl text-emerald-700">{icon}</span>
    <span>
      <span className="block text-2xl font-extrabold text-slate-900">
        {value}
      </span>
      <span className="text-xs font-semibold text-slate-500">{label}</span>
    </span>
  </div>
);

export default MaintenanceAmenitySummary;
