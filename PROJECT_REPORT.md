# Real Estate Platform

## Detailed Project Report

## 1. Executive Summary

The Real Estate Platform is a web application for discovering and managing property listings. It brings buyers, sellers, and administrators into one system: buyers can browse properties and contact sellers, sellers can publish and manage listings, and administrators can oversee users, seller approvals, listings, inquiries, and operational requests. The application also includes direct messaging, saved properties, maintenance requests, and amenity bookings.

The project is implemented as a single-page React application backed by an Express API and MongoDB. JWT-based authentication and role checks protect account-specific actions. Cloudinary is configured for uploaded images, Brevo's email API is used for verification and password-reset messages, and Socket.IO supports chat and live operational updates.

## 2. Background and Problem Statement

Property discovery and transaction coordination often involve disconnected listing pages, contact channels, and follow-up processes. Buyers need a way to compare available properties and contact the relevant seller; sellers need tools to manage listings and incoming interest; platform operators need oversight of accounts and listing quality.

This project addresses those needs with a shared platform and role-specific workspaces. It extends the listing workflow beyond discovery by providing buyer-seller communication and basic property-related service operations.

## 3. Project Objectives

- Provide public property browsing and property detail pages.
- Support buyer and seller registration, email verification, login, and password recovery.
- Let approved sellers create, edit, and manage property listings with images.
- Give buyers ways to save properties, submit inquiries, and communicate with sellers.
- Give administrators tools to moderate users, seller requests, listings, inquiries, and contact messages.
- Track maintenance requests and amenity bookings associated with properties.
- Provide real-time message delivery and operational status notifications.

## 4. Scope and User Roles

### Guest

Guests can view the landing page, browse property listings, inspect property details, and access account registration and login screens. Actions that require an account are protected.

### Buyer

Buyers can manage their profile, save properties to a wishlist, send property inquiries, use chat, and create and follow maintenance or amenity-booking requests.

### Seller

Sellers can manage their property listings and seller dashboard, respond to inquiries and chats, and manage maintenance and amenity requests associated with their properties. New seller accounts are created pending approval, in addition to the separate email-verification requirement.

### Administrator

Administrators have a dedicated workspace for user and listing moderation, pending seller approvals, inquiry oversight, contact submissions, dashboard statistics, and operational request management.

## 5. Functional Modules

### Authentication and account management

Registration creates a buyer or seller account, stores a bcrypt-hashed password, and sends a verification code by email. Seller accounts start as unapproved. Login requires a verified, unblocked account and returns a JWT that expires after seven days. The API also supports profile retrieval, email verification, forgotten-password requests, and time-limited password-reset tokens.

### Property discovery and listing management

Public pages list properties and show individual property details. A listing stores its title, description, price, location, property type, optional room and area information, furnishing, amenities, sale status, image URLs, seller reference, verification state, and view data. Sellers can create, update, delete, and change the status of their listings. Listing uploads accept up to ten images per request and use Cloudinary-backed storage.

### Buyer engagement

Authenticated buyers can add or remove properties from a wishlist and submit an inquiry linked to a property, buyer, and seller. Sellers can review their inquiries; inquiries include a read status. The contact form stores general contact submissions for administrator review.

### Chat and notifications

Chat records link a buyer and seller and may also reference a property. Messages are stored in MongoDB and can include text or an image URL. REST endpoints manage chat retrieval and message persistence, while Socket.IO rooms broadcast messages and operational updates to connected users.

### Maintenance and amenity operations

Buyers can create maintenance requests and amenity bookings associated with a property. Sellers and administrators can update these records. Maintenance requests track status and scheduling; amenity bookings track time ranges and statuses such as pending, approved, checked in, completed, or cancelled. The booking API checks for overlapping, non-cancelled bookings for the same property and amenity before creating a booking.

### Administration

The admin API provides user listing, blocking and deletion, property listing and deletion, inquiry listing, dashboard statistics, seller approval, and pending-seller retrieval. Admin routes require an authenticated admin role.

## 6. System Architecture

The system has three primary runtime components:

1. **Frontend:** React 19, React Router, Vite, Tailwind CSS, React Icons, and Axios. The client contains shared public pages, authentication pages, buyer pages, seller dashboards, and admin dashboards. Protected routes and layouts are selected by account role.
2. **Backend:** Node.js with Express 5. Route modules group the API by feature. Controllers implement business operations, Mongoose models define persisted records, and middleware handles JWT authentication, role authorization, and file upload parsing.
3. **Data and integrations:** MongoDB stores application records. Cloudinary stores uploaded media. Brevo sends transactional email. Socket.IO provides live events.

The browser calls the API at `http://localhost:5000`. The Express server mounts feature routers under `/api`, connects to MongoDB, and exposes Socket.IO on the same HTTP server. The API uses bearer tokens for protected REST endpoints. Socket.IO provides room-based broadcasts for chat and operational changes.

### High-level request flow

1. A user visits a React route and interacts with a public or role-protected screen.
2. The frontend sends an HTTP request to the Express API; protected requests include the JWT bearer token.
3. Authentication middleware verifies the token and loads the user. Authorization middleware restricts selected routes by role.
4. A controller validates and applies the operation through Mongoose, then returns JSON.
5. For supported real-time changes, the server emits a Socket.IO event to the affected user or role rooms.

## 7. Data Model Overview

| Entity         | Purpose and main relationships                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| User           | Identity, role (`buyer`, `seller`, or `admin`), profile, verification, approval, blocking, and password-reset state. |
| Property       | Listing details, seller reference, images, amenities, sale status, verification state, and view tracking.            |
| Inquiry        | Connects a buyer, seller, and property; stores the inquiry message and read state.                                   |
| Wishlist       | Connects a user and a saved property.                                                                                |
| Chat           | Connects a buyer and seller, optionally references a property, and embeds messages.                                  |
| Contact        | Stores contact-form submissions for administrator review.                                                            |
| Maintenance    | Connects a property, buyer, and seller with a description, schedule, and request status.                             |
| AmenityBooking | Connects a property, buyer, and seller with an amenity, time range, status, and check-in/out timestamps.             |

Mongoose schemas use timestamps on the main records to support creation and update tracking. Relationships are represented by MongoDB ObjectId references and populated where responses need related user or property information.

## 8. API Areas

The backend exposes these route groups under `/api`:

| Route prefix        | Responsibility                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `/auth`             | Registration, login, email verification, current-user profile, and password recovery.       |
| `/user`             | User profile operations.                                                                    |
| `/property`         | Public discovery and details, seller listing management, counts, and seller dashboard data. |
| `/inquiry`          | Buyer inquiry submission and seller inquiry management.                                     |
| `/wishlist`         | Add, list, and remove saved properties.                                                     |
| `/contact`          | Submit contact messages and retrieve them as an administrator.                              |
| `/chat`             | Start chats, persist and retrieve messages, and manage chat records.                        |
| `/admin`            | Administrative user, seller, property, inquiry, and statistics operations.                  |
| `/maintenance`      | Create, list, and update maintenance requests.                                              |
| `/amenity-bookings` | Create, list, and update amenity bookings.                                                  |

The root endpoint `/` returns a simple API health response.

## 9. Security and Access Control

- Passwords are hashed with bcrypt before persistence.
- JWT bearer tokens protect authenticated API operations.
- Middleware checks account roles for seller- and admin-specific routes.
- Blocked accounts are rejected by authentication middleware.
- Chat reads, message sends, and deletion operations verify that the current user belongs to the conversation.
- Password-reset tokens are hashed before storage and expire after 15 minutes.
- CORS allows the configured frontend origin.

Before production deployment, account creation and privileged-role provisioning should be reviewed carefully. The current registration controller accepts a role from the request when it matches a supported role, so production deployments should prevent public self-assignment of the administrator role. Secrets must be kept outside source control, and production deployments should also use HTTPS, input validation, rate limiting, and appropriate upload limits.

## 10. Technology Stack

| Layer             | Technologies                                                   |
| ----------------- | -------------------------------------------------------------- |
| Frontend          | React 19, Vite, React Router, Axios, Tailwind CSS, React Icons |
| Backend           | Node.js, Express 5, Socket.IO                                  |
| Database          | MongoDB with Mongoose                                          |
| Authentication    | JSON Web Tokens, bcryptjs                                      |
| Media             | Multer memory storage, Cloudinary, streamifier                 |
| Email             | Brevo transactional email API                                  |
| Development tools | ESLint, Vite, nodemon                                          |

## 11. Installation and Local Execution

### Prerequisites

- Node.js and npm
- A MongoDB connection string
- Cloudinary credentials for image uploads
- Brevo API access and a verified sender email for account email flows

### Backend configuration

Create `Server/.env` with the following variables:

```env
MONGODB_URL=mongodb://127.0.0.1:27017
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
BREVO_API_KEY=your-brevo-api-key
EMAIL_USER=your-verified-sender@example.com
```

The database connector appends `/RealState` to `MONGODB_URL`. The backend currently listens on port `5000`; the frontend API base URL is currently set to `http://localhost:5000` in `Client/src/config.js`.

### Start the application

In one terminal:

```powershell
cd Server
npm install
npm start
```

In a second terminal:

```powershell
cd Client
npm install
npm run dev
```

Vite prints the local frontend URL when it starts. The backend health endpoint is available at `http://localhost:5000/`. For a production frontend build, run `npm run build` from `Client`; run `npm run lint` there for ESLint checks.

## 12. Current Boundaries and Future Enhancements

The repository implements listing, user, messaging, and basic operational workflows. The inspected code does not define a payment or escrow workflow, transaction signing, map-based search, or a formal review/rating module; these should be treated as potential future scope rather than existing capabilities.

Recommended next steps include:

- Enforce server-side role assignment and provide a controlled administrator provisioning process.
- Add request validation, consistent error handling, rate limiting, and automated API tests.
- Move the frontend API URL and backend port to environment-based configuration.
- Add pagination and filtering for large property, user, and inquiry collections.
- Add deployment documentation, monitoring, backups, and production security settings.
- Consider payment integration, map search, property comparisons, and ratings only if they fit the product's intended scope.

## 13. Conclusion

The Real Estate Platform provides a full-stack foundation for property discovery and role-based listing management. Its core value is bringing listing workflows, buyer-seller communication, administration, and property-related service requests into one application. The React client, Express API, MongoDB persistence, external media and email services, and Socket.IO events form a clear modular base for continued development. Production readiness depends on tightening role provisioning and operational security, completing environment-based configuration, and adding automated verification around the main user flows.
