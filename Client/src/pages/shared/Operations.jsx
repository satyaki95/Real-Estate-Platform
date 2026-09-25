import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import {
  HiCheckCircle,
  HiClock,
  HiHome,
  HiOutlineSupport,
  HiRefresh,
} from "react-icons/hi";
import API_URL from "../../config";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";

// Shared operations dashboard for maintenance requests and amenity bookings.
const maintenanceInitial = {
  propertyId: "",
  title: "",
  description: "",
  preferredDate: "",
};
const bookingInitial = { propertyId: "", amenity: "", startAt: "", endAt: "" };
const amenityOptions = [
  "Gym",
  "Pool",
  "Club House",
  "Tennis Court",
  "Party Hall",
  "Garden",
];

const statusClass = (status) => {
  if (["Completed", "Approved"].includes(status))
    return "bg-emerald-100 text-emerald-700";
  if (["In Progress", "Checked In"].includes(status))
    return "bg-blue-100 text-blue-700";
  if (status === "Cancelled") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

const newestFirst = (items) =>
  [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

const Operations = () => {
  const { user, token } = useAuth();
  const isBuyer = user?.role === "buyer";
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [maintenanceForm, setMaintenanceForm] = useState(maintenanceInitial);
  const [bookingForm, setBookingForm] = useState(bookingInitial);
  const [maintenanceFilter, setMaintenanceFilter] = useState("All");
  const [bookingFilter, setBookingFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const requests = [
        axios.get(`${API_URL}/api/maintenance`, { headers }),
        axios.get(`${API_URL}/api/amenity-bookings`, { headers }),
      ];
      if (isBuyer) requests.push(axios.get(`${API_URL}/api/property`));
      const [maintenanceRes, bookingRes, propertiesRes] =
        await Promise.all(requests);
      setMaintenance(newestFirst(maintenanceRes.data.requests || []));
      setBookings(newestFirst(bookingRes.data.bookings || []));
      if (propertiesRes) setProperties(propertiesRes.data.properties || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load operations");
    } finally {
      setLoading(false);
    }
  }, [isBuyer, token]);

  useEffect(() => {
    const initialLoad = window.setTimeout(loadData, 0);
    const socket = io(API_URL);
    socket.emit("joinUser", { userId: user?._id, role: user?.role });
    const refresh = () => loadData();
    socket.on("maintenanceUpdated", refresh);
    socket.on("bookingUpdated", refresh);
    return () => {
      window.clearTimeout(initialLoad);
      socket.off("maintenanceUpdated", refresh);
      socket.off("bookingUpdated", refresh);
      socket.disconnect();
    };
  }, [loadData, user?._id, user?.role]);

  const submitMaintenance = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/maintenance`, maintenanceForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMaintenanceForm(maintenanceInitial);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create maintenance request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/amenity-bookings`, bookingForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookingForm(bookingInitial);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to book this amenity");
    } finally {
      setSubmitting(false);
    }
  };

  const updateMaintenance = async (id, values) => {
    try {
      await axios.patch(`${API_URL}/api/maintenance/${id}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update request");
    }
  };

  const updateBooking = async (id, status) => {
    try {
      await axios.patch(
        `${API_URL}/api/amenity-bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update booking");
    }
  };

  const selectedProperty = properties.find(
    (property) => property._id === bookingForm.propertyId,
  );
  const filteredMaintenance =
    maintenanceFilter === "All"
      ? maintenance
      : maintenance.filter((request) => request.status === maintenanceFilter);
  const filteredBookings =
    bookingFilter === "All"
      ? bookings
      : bookings.filter((booking) => booking.status === bookingFilter);
  const availableAmenities = selectedProperty?.amenities?.length
    ? selectedProperty.amenities
    : amenityOptions;

  if (loading)
    return (
      <div className="loader-full-page">
        <div className="loader" />
      </div>
    );

  return (
    <div
      className={`${isBuyer ? "min-h-screen bg-[#f5f7f2]" : "min-h-full"} pb-12`}
    >
      {isBuyer && <Navbar />}
      <main
        className={`mx-auto max-w-7xl px-4 ${isBuyer ? "pb-10 pt-28 md:px-8 md:pt-32" : "py-10 md:px-8"}`}
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Live operations
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Maintenance & amenity desk
            </h1>
            <p className="mt-2 text-slate-500">
              Track every request, booking, and handoff as it happens.
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
          >
            <HiRefresh /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isBuyer && (
          <div className="mb-10 grid gap-6 lg:grid-cols-2">
            <form
              onSubmit={submitMaintenance}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-slate-900">
                <HiOutlineSupport className="text-emerald-600" /> New
                maintenance request
              </h2>
              <p className="mb-5 text-sm text-slate-500">
                Describe the issue and choose a preferred visit date.
              </p>
              <select
                required
                value={maintenanceForm.propertyId}
                onChange={(event) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    propertyId: event.target.value,
                  })
                }
                className="mb-3 w-full rounded-lg border border-slate-200 p-3"
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.title}
                  </option>
                ))}
              </select>
              <input
                required
                placeholder="Issue title"
                value={maintenanceForm.title}
                onChange={(event) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    title: event.target.value,
                  })
                }
                className="mb-3 w-full rounded-lg border border-slate-200 p-3"
              />
              <textarea
                required
                placeholder="What needs attention?"
                value={maintenanceForm.description}
                onChange={(event) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    description: event.target.value,
                  })
                }
                className="mb-3 min-h-24 w-full rounded-lg border border-slate-200 p-3"
              />
              <input
                type="datetime-local"
                value={maintenanceForm.preferredDate}
                onChange={(event) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    preferredDate: event.target.value,
                  })
                }
                className="mb-4 w-full rounded-lg border border-slate-200 p-3"
              />
              <button
                disabled={submitting}
                className="rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                Create request
              </button>
            </form>

            <form
              onSubmit={submitBooking}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-slate-900">
                <HiClock className="text-emerald-600" /> Book an amenity
              </h2>
              <p className="mb-5 text-sm text-slate-500">
                Availability is checked against overlapping bookings.
              </p>
              <select
                required
                value={bookingForm.propertyId}
                onChange={(event) =>
                  setBookingForm({
                    ...bookingForm,
                    propertyId: event.target.value,
                    amenity: "",
                  })
                }
                className="mb-3 w-full rounded-lg border border-slate-200 p-3"
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.title}
                  </option>
                ))}
              </select>
              <select
                required
                value={bookingForm.amenity}
                onChange={(event) =>
                  setBookingForm({
                    ...bookingForm,
                    amenity: event.target.value,
                  })
                }
                className="mb-3 w-full rounded-lg border border-slate-200 p-3"
              >
                <option value="">Select amenity</option>
                {availableAmenities.map((amenity) => (
                  <option key={amenity} value={amenity}>
                    {amenity}
                  </option>
                ))}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  type="datetime-local"
                  value={bookingForm.startAt}
                  onChange={(event) =>
                    setBookingForm({
                      ...bookingForm,
                      startAt: event.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-200 p-3"
                />
                <input
                  required
                  type="datetime-local"
                  value={bookingForm.endAt}
                  onChange={(event) =>
                    setBookingForm({
                      ...bookingForm,
                      endAt: event.target.value,
                    })
                  }
                  className="rounded-lg border border-slate-200 p-3"
                />
              </div>
              <button
                disabled={submitting}
                className="mt-4 rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-60"
              >
                Request booking
              </button>
            </form>
          </div>
        )}

        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Maintenance overview{" "}
              <span className="text-sm font-normal text-slate-500">
                ({filteredMaintenance.length})
              </span>
            </h2>
            <select
              value={maintenanceFilter}
              onChange={(event) => setMaintenanceFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="grid gap-4">
            {filteredMaintenance.length === 0 ? (
              <Empty text="No maintenance requests yet." />
            ) : (
              filteredMaintenance.map((request) => (
                <article
                  key={request._id}
                  className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {request.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        <HiHome className="mr-1 inline" />
                        {request.property?.title || "Property"} ·{" "}
                        {isBuyer
                          ? `Seller: ${request.seller?.name || "Assigned"}`
                          : `Buyer: ${request.buyer?.name || "Resident"}`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-700">{request.description}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Preferred:{" "}
                    {request.preferredDate
                      ? new Date(request.preferredDate).toLocaleString()
                      : "Flexible"}
                    {request.scheduledAt &&
                      ` · Scheduled: ${new Date(request.scheduledAt).toLocaleString()}`}
                  </p>
                  {!isBuyer && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {request.status === "Pending" && (
                        <button
                          onClick={() =>
                            updateMaintenance(request._id, {
                              status: "In Progress",
                            })
                          }
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                        >
                          Accept request
                        </button>
                      )}
                      {request.status === "In Progress" && (
                        <button
                          onClick={() =>
                            updateMaintenance(request._id, {
                              status: "Completed",
                            })
                          }
                          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white"
                        >
                          Mark completed
                        </button>
                      )}
                      {user.role === "admin" &&
                        request.status !== "Completed" && (
                          <input
                            type="datetime-local"
                            onChange={(event) =>
                              updateMaintenance(request._id, {
                                scheduledAt: event.target.value,
                              })
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />
                        )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              Amenity usage overview{" "}
              <span className="text-sm font-normal text-slate-500">
                ({filteredBookings.length})
              </span>
            </h2>
            <select
              value={bookingFilter}
              onChange={(event) => setBookingFilter(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Checked In">Checked In</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {filteredBookings.length === 0 ? (
              <Empty text="No amenity bookings yet." />
            ) : (
              filteredBookings.map((booking) => (
                <article
                  key={booking._id}
                  className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {booking.amenity}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {booking.property?.title} ·{" "}
                        {isBuyer
                          ? `Seller: ${booking.seller?.name || "Assigned"}`
                          : `Buyer: ${booking.buyer?.name || "Resident"}`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(booking.status)}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-700">
                    {new Date(booking.startAt).toLocaleString()} to{" "}
                    {new Date(booking.endAt).toLocaleString()}
                  </p>
                  {!isBuyer && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {booking.status === "Pending" && (
                        <button
                          onClick={() => updateBooking(booking._id, "Approved")}
                          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
                        >
                          Approve time
                        </button>
                      )}
                      {booking.status === "Approved" && (
                        <button
                          onClick={() =>
                            updateBooking(booking._id, "Checked In")
                          }
                          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white"
                        >
                          Check in
                        </button>
                      )}
                      {booking.status === "Checked In" && (
                        <button
                          onClick={() =>
                            updateBooking(booking._id, "Completed")
                          }
                          className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-bold text-white"
                        >
                          Check out
                        </button>
                      )}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const Empty = ({ text }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
    <HiCheckCircle className="mx-auto mb-2 text-emerald-600" size={28} />
    {text}
  </div>
);

export default Operations;
