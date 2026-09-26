/* eslint-disable no-undef */
// Base URL for the backend API used by all frontend requests.
// This keeps the client code clean and centralized instead of hardcoding the server URL everywhere.
const API_URL = import.meta.env.VITE_LOCAL_API_URL;

export default API_URL;
