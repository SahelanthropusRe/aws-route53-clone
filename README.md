# ☁️ AWS Route 53 Clone

A full-stack, pixel-perfect clone of the Amazon Web Services (AWS) Route 53 console. This application provides a comprehensive interface for DNS management, including hosted zone creation, record management, BIND zone file imports, JSON exports, and a fully functional AWS-matched dark mode.

## ✨ Features

- **Pixel-Perfect UI:** Accurately recreates the AWS Console experience, including the split-panel IAM login page and navigational dashboards.
- **Flawless Dark Mode:** Native, flicker-free dark mode matching the AWS dark theme, powered by Tailwind CSS v4 `@custom-variant` and `next-themes`.
- **DNS Management:** Create, read, and filter Hosted Zones and DNS Records (A, AAAA, CNAME, MX, TXT, PTR, SRV, CAA, NS).
- **Bulk Operations:** Concurrent bulk deletion of DNS records for fast management.
- **Import/Export:** Import standard BIND (`.txt` / `.zone`) files and export zone configurations to JSON.
- **Authentication:** Secure, JWT-based user isolation.

---

## 🏗 Architecture Overview

The application follows a decoupled client-server architecture:

- **Frontend:** Built with **Next.js (App Router)** and **React**. Styling is handled by **Tailwind CSS v4**, using CSS-first configuration and `next-themes` for seamless system-aware dark mode toggling. Icons come from `lucide-react`.
- **Backend:** A **Python** REST API (served at `http://127.0.0.1:8000`). It handles JWT-based authentication, concurrent record deletions, and multipart form data processing for BIND file imports.
- **State Management & Data Fetching:** Uses React's `useState` and `useEffect` alongside a custom `fetchApi` utility wrapper for authenticated requests and standardized error handling.

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- Python (3.9+ recommended)
- Git

### 1. Backend Setup (Python API)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv venv

   # Windows:
   venv\Scripts\activate

   # macOS/Linux:
   source venv/bin/activate
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Start the local server:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

   The API will be available at `http://127.0.0.1:8000`.

### 2. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install Node dependencies:

   ```bash
   npm install
   ```

3. Start the Next.js development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄 Database Schema

The relational data model consists of three primary entities that isolate and manage each user's environment.

### `users`

Manages authentication and isolates DNS environments per user.

| Column            | Type      | Constraints      | Description                    |
| ----------------- | --------- | ---------------- | ------------------------------ |
| `id`              | UUID      | Primary Key      | Unique identifier for the user |
| `username`        | String    | Unique, Not Null | IAM user login handle          |
| `hashed_password` | String    | Not Null         | Securely hashed credential     |
| `created_at`      | Timestamp | Default: Now()   | Account creation timestamp     |

### `hosted_zones`

Represents a DNS zone containing routing rules for a specific domain.

| Column         | Type    | Constraints | Description                                |
| -------------- | ------- | ----------- | ------------------------------------------ |
| `id`           | String  | Primary Key | AWS-style Zone ID (e.g., `Z17F3820BD0104`) |
| `user_id`      | UUID    | Foreign Key | References `users(id)`                     |
| `name`         | String  | Not Null    | Domain name (e.g., `example.com`)          |
| `description`  | String  | Nullable    | Optional user-defined description          |
| `type`         | String  | Not Null    | E.g., `Public hosted zone`                 |
| `record_count` | Integer | Default: 0  | Denormalized count for fast UI rendering   |

### `records`

Individual DNS routing entries attached to a specific hosted zone.

| Column           | Type    | Constraints | Description                                    |
| ---------------- | ------- | ----------- | ---------------------------------------------- |
| `id`             | UUID    | Primary Key | Unique record identifier                       |
| `zone_id`        | String  | Foreign Key | References `hosted_zones(id)`                  |
| `name`           | String  | Not Null    | Fully qualified domain name                    |
| `type`           | String  | Not Null    | DNS record type (A, AAAA, CNAME, MX, etc.)     |
| `routing_policy` | String  | Not Null    | E.g., `Simple`, `Weighted`, `Latency`          |
| `ttl`            | Integer | Not Null    | Time-to-live in seconds (e.g., `300`)          |
| `values`         | Text    | Not Null    | Target IPs or routing values (newline separated) |

---

## 📡 API Overview

All protected endpoints require a valid JWT passed in the `Authorization: Bearer <token>` header.

### Authentication

**`POST /api/auth/register`**
- **Payload:** `{ "username": "user1", "password": "securepwd" }`
- **Response:** `201 Created`

**`POST /api/auth/login`**
- **Payload:** `{ "username": "user1", "password": "securepwd" }`
- **Response:** Returns a JWT token and a basic user payload.

### Hosted Zones

**`GET /api/hostedzones`**
- Retrieves all hosted zones for the authenticated user.

**`POST /api/hostedzones`**
- **Payload:** `{ "name": "example.com", "description": "Prod zone", "type": "Public" }`
- Creates a new hosted zone.

**`GET /api/hostedzones/{zone_id}`**
- Retrieves metadata for a specific hosted zone.

### DNS Records

**`GET /api/hostedzones/{zone_id}/records`**
- **Query params:** `?search=subdomain` (optional text filtering)
- Fetches all records for a zone, supporting server-side or client-side filtering.

**`POST /api/hostedzones/{zone_id}/records`**
- **Payload:** `{ "name": "api.example.com", "type": "A", "ttl": 300, "routing_policy": "Simple", "values": "192.168.1.1" }`
- Creates a single DNS record.

**`DELETE /api/hostedzones/{zone_id}/records/{record_id}`**
- Deletes a specific record. The frontend calls this concurrently via `Promise.all` for bulk deletions.

**`POST /api/hostedzones/{zone_id}/records/import`**
- **Payload:** `multipart/form-data` containing a `.txt` or `.zone` BIND file.
- Parses a BIND zone file and automatically populates the database with the extracted records.
