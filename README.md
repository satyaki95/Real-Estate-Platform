# Real Estate Platform

A full-stack real estate marketplace built with React, Express, MongoDB, and Socket.IO. The platform supports property discovery, buyer and seller workflows, admin moderation, chat, and service-request management in a single application.

Live demo: https://real-estate-platform-steel-zeta.vercel.app

## Overview

This project brings together buyers, sellers, and administrators in one property management ecosystem. Buyers can browse listings, save properties, send inquiries, and request services. Sellers can create and manage listings, respond to inquiries, and oversee maintenance or amenity bookings. Administrators can moderate users, listings, and requests from a dedicated dashboard.

## Key Features

- Property browsing and detailed listing pages
- Role-based access for buyers, sellers, and admins
- Seller registration with email verification and approval flow
- JWT authentication and protected routes
- Wishlist management for saved properties
- Inquiry management with read/unread tracking
- Real-time messaging using Socket.IO
- Maintenance requests and amenity bookings
- Cloudinary-based image uploads
- Admin dashboard for moderation and operational oversight

## Tech Stack

Frontend
- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO client

Backend
- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Cloudinary integration
- Socket.IO
- bcryptjs

## Project Structure

```text
Real-Estate-Platform/
├── Client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── Server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── .env
│   └── package.json
├── PROJECT_REPORT.md
├── README.md
└── .gitignore
```

## Local Development Setup

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB instance (local or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/satyaki95/Real-Estate-Platform.git
cd Real-Estate-Platform
```

### 2. Install frontend dependencies

```bash
cd Client
npm install
```

### 3. Install backend dependencies

```bash
cd ../Server
npm install
```

### 4. Configure environment variables

Create a `.env` file in the `Server` directory with the following variables:

```env
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
BREVO_API_KEY=your_brevo_api_key
EMAIL_USER=your_email_address
```

### 5. Run the application

Start the backend:

```bash
cd Server
npm start
```

Start the frontend:

```bash
cd Client
npm run dev
```

The frontend will usually run on `http://localhost:5173` and the backend API on `http://localhost:5000`.

## Available Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm start
```

## User Roles

### Buyer
- Browse listings
- Save favourite properties
- Submit property inquiries
- Create maintenance and amenity requests
- Communicate with sellers in chat

### Seller
- Register and get approval
- Create, edit, and remove listings
- Manage inquiries and chats
- Handle maintenance and amenity requests for their properties

### Admin
- Moderate users and listings
- Approve or reject seller requests
- Review inquiries and contact submissions
- Manage operational requests and dashboard analytics

## Deployment

The project is configured for Vercel-style frontend deployment and a Node.js backend deployment. The live front-end is available here:

https://real-estate-platform-steel-zeta.vercel.app

## Notes

- The backend uses Socket.IO for real-time chat and updates.
- File uploads are handled through Cloudinary.
- Email verification and password reset flows rely on Brevo.
- MongoDB is the main data source for users, properties, chats, and service requests.

## License

This project is currently distributed without a published license file.
