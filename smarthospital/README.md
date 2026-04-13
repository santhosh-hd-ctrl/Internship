# 🏥 SmartHospital — Intelligent Queue Management System

A full-stack hospital queue management platform with real-time updates, JWT authentication, role-based access control, and appointment scheduling.

---

## 📁 Project Structure

```
smarthospital/
├── backend/          # Spring Boot REST API
└── frontend/         # React (Vite) SPA
```

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- npm 9+

---

## 🔧 Backend Setup

```bash
cd backend
mvn spring-boot:run
```

The server starts at **http://localhost:8080/api**

### H2 Console (Dev)
- URL: http://localhost:8080/api/h2-console
- JDBC: `jdbc:h2:mem:smarthospitaldb`
- User: `sa` / Password: *(empty)*

### Swagger UI
- http://localhost:8080/api/swagger-ui/index.html

### Switch to MySQL (Production)
In `src/main/resources/application.properties`, comment out H2 block and uncomment MySQL:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smarthospital?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 👤 Demo Credentials

| Role    | Email                          | Password   |
|---------|-------------------------------|------------|
| Admin   | admin@smarthospital.com       | admin123   |
| Doctor  | dr.sarah@smarthospital.com    | doctor123  |
| Doctor  | dr.james@smarthospital.com    | doctor123  |
| Patient | patient1@example.com          | patient123 |
| Patient | patient2@example.com          | patient123 |

> All demo accounts are seeded automatically on first startup.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint         | Description      | Auth |
|--------|-----------------|------------------|------|
| POST   | /auth/register  | Patient register | No   |
| POST   | /auth/login     | Login (any role) | No   |
| GET    | /auth/me        | Current user     | Yes  |

### Doctors
| Method | Endpoint              | Description           | Auth    |
|--------|----------------------|-----------------------|---------|
| GET    | /doctors             | List (paginated, search) | Yes  |
| GET    | /doctors/{id}        | Doctor details        | Yes     |
| GET    | /doctors/{id}/schedule | Doctor schedule     | Yes     |

### Appointments
| Method | Endpoint                        | Description          | Auth          |
|--------|--------------------------------|----------------------|---------------|
| POST   | /appointments                  | Book appointment     | PATIENT       |
| GET    | /appointments/my               | My appointments      | Any           |
| GET    | /appointments/doctor/{id}      | Doctor's appointments| DOCTOR/ADMIN  |
| GET    | /appointments/queue/{doctorId} | Live queue status    | Any           |
| PUT    | /appointments/{id}/cancel      | Cancel appointment   | Any           |
| PUT    | /appointments/{id}/status      | Update status        | DOCTOR/ADMIN  |

### Admin
| Method | Endpoint                            | Description              | Auth  |
|--------|-------------------------------------|--------------------------|-------|
| GET    | /admin/dashboard                    | Analytics dashboard      | ADMIN |
| GET    | /admin/patients                     | All patients (paginated) | ADMIN |
| POST   | /admin/doctors                      | Create doctor            | ADMIN |
| PUT    | /admin/doctors/{id}                 | Update doctor            | ADMIN |
| PUT    | /admin/doctors/{id}/toggle-availability | Toggle availability  | ADMIN |

### Notifications
| Method | Endpoint                    | Description          | Auth |
|--------|-----------------------------|----------------------|------|
| GET    | /notifications              | My notifications     | Yes  |
| GET    | /notifications/unread-count | Unread badge count   | Yes  |
| PUT    | /notifications/{id}/read    | Mark one read        | Yes  |
| PUT    | /notifications/read-all     | Mark all read        | Yes  |

---

## 🔄 WebSocket Events

Connect to: `ws://localhost:8080/api/ws` (SockJS)

| Topic                    | Description                     |
|-------------------------|---------------------------------|
| `/topic/queue/{doctorId}` | Live queue updates for a doctor |
| `/user/queue/notifications` | Personal notification push    |

---

## ⚙️ Key Features

### 🔐 Security
- JWT access tokens (24h) + refresh tokens (7d)
- BCrypt password hashing
- Role-based access: `ADMIN`, `DOCTOR`, `PATIENT`
- Method-level security with `@PreAuthorize`

### 📅 Scheduling
- Doctor availability by day of week with time slots
- Break time support (e.g., lunch hours)
- Configurable appointment duration and max daily slots
- Automatic queue number assignment

### 🔔 Notifications
- In-app notification center with unread badge
- Real-time push via WebSocket
- Email simulation (logs to console; configure SMTP for production)
- Auto-reminder scheduler runs every 15 minutes

### 📊 Admin Dashboard
- Live stats: patients, doctors, appointments
- Doctor management (CRUD + availability toggle)
- Patient registry with pagination

---

## 🛠️ Tech Stack

### Backend
- **Spring Boot 3.2** — Application framework
- **Spring Security + JWT** — Authentication & authorization
- **Spring Data JPA** — ORM / database access
- **Spring WebSocket (STOMP)** — Real-time communication
- **H2** (dev) / **MySQL** (prod) — Database
- **Spring Scheduler** — Automated reminders
- **Lombok** — Boilerplate reduction
- **SpringDoc OpenAPI** — Swagger documentation
- **Spring Mail** — Email notifications

### Frontend
- **React 18 + Vite** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **STOMP.js + SockJS** — WebSocket client
- **date-fns** — Date formatting
- **react-hot-toast** — Toast notifications
- **Custom CSS** — Zero-dependency design system (Syne + DM Sans)

---

## 🗂️ Database Schema

```
users           — All users (admin/doctor/patient)
doctors         — Doctor profiles (extends users)
doctor_schedules— Weekly availability schedules
appointments    — Booking records with queue numbers
notifications   — In-app notification log
```

---

## 📧 Email Configuration

For real email notifications, update `application.properties`:
```properties
app.mail.simulation=false
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your@gmail.com
spring.mail.password=your-app-password
```

---

## 🏗️ Build for Production

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/smarthospital-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with any static file server
```
