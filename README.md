# REDVOLT - Gym Management Application

> A cross-platform mobile solution to connect members to their gym, manage bookings, and gamify training.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Platform](https://img.shields.io/badge/Platform-iOS%20|%20Android%20|%20Web-blue)
![Stack](https://img.shields.io/badge/Tech-React%20Native%20%2B%20NestJS-orange)

## About the Project

**REDVOLT** is a comprehensive application designed to modernize the gym experience. It allows members to book classes, track their progress, and participate in friendly competition via a gamified leaderboard system.

The goal is to build member loyalty by transforming physical effort into points and rewards, while simplifying administrative management via a robust API.

## Key Features

### Mobile Side (Member Experience)
- **Schedule & Bookings:** Real-time viewing of classes (BodyPump, RPM...) and slot reservation.
- **Club Leaderboard:** Member competition system based on earned points.
  - *Privacy:* Automatic name anonymization (e.g., "Kamal B.").
- **Flash Challenges:** List of daily challenges (e.g., "50 Burpees") validatable by coaches.
- **Store & Shakes:** Quick access to the club shop.
- **Profile & Stats:** Tracking of session counts and point balance.
- **Authentication:** Secure persistent login.

### Backend Side (API & Logic)
- **Modular Architecture:** Clear separation of concerns (Controllers / Services).
- **Capacity Management:** Automatic check of class capacity before booking.
- **Security:** Authentication via JWT (JSON Web Tokens).
- **CORS Configured:** Simultaneously compatible with Web and Mobile.

## Tech Stack

This project relies on a modern **3-Tier Architecture**:

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | ![React Native](https://img.shields.io/badge/-React%20Native-61DAFB?logo=react&logoColor=black) **Expo** | Cross-platform interface (iOS, Android, Web). |
| **Backend** | ![NestJS](https://img.shields.io/badge/-NestJS-E0234E?logo=nestjs&logoColor=white) **Node.js** | REST API, Business Logic, Security. |
| **Database** | ![SQLite](https://img.shields.io/badge/-SQLite-003B57?logo=sqlite&logoColor=white) | Lightweight and portable storage. |
| **ORM** | ![Prisma](https://img.shields.io/badge/-Prisma-2D3748?logo=prisma&logoColor=white) | Schema management and type-safe queries. |

## Installation and Launch

To test the project locally, follow these steps:

### Prerequisites
- Node.js installed
- An Android/iOS emulator or the **Expo Go** app on your phone.

### 1. Start the Backend (API)
```bash
cd backend
npm install

# Database and table creation
npx prisma migrate dev --name init

# Seeding test data (Classes, Challenges...)
npx prisma db seed

# Start the server
npm run start:dev
