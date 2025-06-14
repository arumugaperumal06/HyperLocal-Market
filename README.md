# 🛒 Hyperlocal Marketplace Platform

A fullstack web application built to enable hyperlocal commerce in closed communities such as college campuses, residential areas, or workplaces. Users can **buy, sell, or exchange goods/services** within their locality, promoting trust, convenience, and sustainability.

---

## 🌟 Key Highlights

- 🔐 **Secure Authentication** – JWT-based user login and registration
- 🛍️ **Post & Manage Listings** – Upload product images, add descriptions, and manage inventory
- 🔎 **Smart Search & Filters** – Easily discover items by category, price, or proximity
- 📩 **Peer Messaging** – Chat between buyers and sellers (local-only)
- 🌐 **Responsive Design** – Seamless experience across mobile and desktop
- 📷 **Image Uploads** – Powered by Multer with secure server storage
- 🛠️ **Scalable Backend** – Clean MVC structure for future API integrations

---

## 🔧 Tech Stack

| Layer        | Technology               |
|--------------|---------------------------|
| Frontend     | React, Vite, Tailwind CSS |
| Backend      | Node.js, Express.js       |
| Database     | MongoDB with Mongoose     |
| State Mgmt   | Context API               |
| Auth         | JWT, Bcrypt               |
| File Upload  | Multer                    |
| Dev Tools    | ESLint, Prettier          |

---

## 📂 Folder Structure

/app
├── src/ # React App (Vite-based)
│ ├── components/ # Reusable UI Components
│ ├── context/ # Context API logic
│ └── assets/ # Images and static files
│
├── server/ # Express Backend
│ ├── routes/ # API Endpoints
│ ├── models/ # MongoDB Models
│ ├── services/ # Business Logic
│ ├── middleware/ # Auth & Error Handlers
│ ├── uploads/ # Image Uploads
│ └── config/ # DB Connection & Config
│
├── .env # Environment Variables
└── vite.config.js # Vite Build Config



🧪 Core Features Explained
🔐 Authentication
Secure login with hashed passwords

Token-based access control using JWT

Context-based auth state in React

📦 Product Listings
Create listings with image uploads

Browse and filter by location or tags

Edit/delete owned listings

💬 Chat Integration (Future-ready)
Seller-Buyer messaging

Inbox to track conversations
