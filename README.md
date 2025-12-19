# Fleetek

**Fleetek** is a robust, full-stack vehicle fleet management application designed to streamline inventory tracking and operational efficiency. Built with the **MERN stack (MongoDB, Express, React, Node.js)**, it offers centralized management for vehicle specifications, pricing, and media, alongside advanced modules for fuel consumption monitoring, maintenance logging, and real-time status tracking across multiple locations.

## 🚀 Key Features

- **Car Inventory Management**: Track vehicle details including make, model, year, pricing (cost/sold), registration, and current status (available, sold, service, etc.).
- **Fuel Logging**: Integrated system to monitor fuel consumption, mileage (kms), and costs per vehicle.
- **Service & Maintenance History**: Log all maintenance activities with detailed descriptions and costs to calculate total operational expenses.
- **Role-Based Access Control (RBAC)**: Secure access for Admins and standard Users with specific permission levels.
- **Real-time Status Tracking**: Monitor if vehicles are in the Yard, Showroom, or out for Service.
- **Responsive Dashboard**: A dynamic UI for managing large fleets with ease.

## 🛠️ Tech Stack

- **Frontend**: React, React Router, Tailwind CSS (optional), Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT & Bcryptjs
- **File Uploads**: Multer

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   ```
3. Set up your `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---
*Developed for efficient fleet operations.*
