# 🏟️ CodeArena — Smart Coding Practice & Evaluation Platform

A full-stack coding platform built with **Java Spring Boot** + **React**, featuring secure JWT authentication, a real Java code execution engine, admin problem management, and a live leaderboard.

---

## 📸 Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT-based login/register, roles: ADMIN / USER |
| 💻 Code Editor | Monaco Editor with Java syntax highlighting |
| ⚡ Live Execution | Compiles & runs Java via ProcessBuilder, validates against test cases |
| 📊 Leaderboard | Real-time rankings by score and problems solved |
| 🛡️ Admin Panel | Create / edit / delete problems with hidden test cases |
| 📋 Submission History | Full history with code, status, execution time |
| 🎨 Premium UI | Responsive dark/light mode with Tailwind CSS |

---

## 🗂️ Project Structure

```
codearena/
├── backend/              ← Spring Boot (Java 17)
│   └── src/main/java/com/codearena/
│       ├── config/       ← Security, CORS, DataInitializer
│       ├── controller/   ← REST controllers
│       ├── dto/          ← Request/Response DTOs
│       ├── exception/    ← Custom exceptions + GlobalExceptionHandler
│       ├── model/        ← JPA entities
│       ├── repository/   ← Spring Data JPA repos
│       ├── security/     ← JWT filter + service
│       └── service/      ← Business logic + CodeExecutionService
├── frontend/             ← React 18 + Vite + Tailwind
│   └── src/
│       ├── components/   ← Reusable UI components
│       ├── context/      ← AuthContext, ThemeContext
│       ├── pages/        ← All page components
│       └── utils/        ← api.js, helpers.js
└── database/
    └── schema.sql        ← DDL (auto-applied by Hibernate)
```

---

## ⚙️ Prerequisites

| Tool | Version |
|---|---|
| Java JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

> **IMPORTANT:** Java must be in your system `PATH` for the code execution engine to compile and run submitted code.

---

## 🚀 Setup & Run

### 1. Database Setup

Start MySQL and create the database:

```sql
CREATE DATABASE codearena_db CHARACTER SET utf8mb4;
```

Or apply the schema manually:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Configure Backend

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/codearena_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USER
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### 3. Start the Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/codearena-backend-1.0.0.jar
```

Or with Maven directly:
```bash
cd backend
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**

> On first start, the `DataInitializer` seeds:
> - Admin user: `admin` / `admin123`
> - Test user: `testuser` / `test123`
> - 8 sample problems (Two Sum, Fibonacci, Binary Search, etc.)

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| User | `testuser` | `test123` |

---

## 📡 API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new user |
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/problems` | Public | List problems (paginated, filterable) |
| GET | `/problems/{id}` | Public | Get problem details |
| POST | `/submissions` | User | Submit Java code |
| GET | `/submissions/me` | User | Get own submission history |
| GET | `/submissions/problem/{id}` | User | Get submissions for a problem |
| GET | `/leaderboard` | Public | Get leaderboard |
| GET | `/admin/stats` | Admin | Platform statistics |
| POST | `/admin/problems` | Admin | Create problem |
| PUT | `/admin/problems/{id}` | Admin | Update problem |
| DELETE | `/admin/problems/{id}` | Admin | Soft-delete problem |
| GET | `/admin/users` | Admin | List all users |

### Swagger UI
Available at: **http://localhost:8080/swagger-ui.html**

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

---

## 🧠 Code Execution Engine

The `CodeExecutionService` works as follows:

1. **Write** submitted Java code to a temp file at `/tmp/codearena/<uuid>/Solution.java`
2. **Compile** using `javac` (must be on PATH)
3. **Execute** against each test case by piping stdin and capturing stdout
4. **Compare** actual output vs expected output (after normalizing whitespace)
5. **Determine status**: `ACCEPTED`, `WRONG_ANSWER`, `COMPILATION_ERROR`, `RUNTIME_ERROR`, `TIME_LIMIT_EXCEEDED`
6. **Cleanup** temp directory

> ⚠️ **Security Note:** For production, wrap execution in Docker containers for proper sandboxing. The current ProcessBuilder approach is suitable for development/demo purposes.

---

## 🎨 Frontend Pages

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | User dashboard with stats + recent activity |
| `/problems` | Problem list with search + difficulty filter |
| `/problems/:id` | Code editor + problem description + results |
| `/leaderboard` | Global rankings with podium |
| `/submissions` | My submission history |
| `/admin` | Admin panel (problems + users + stats) |

---

## 🛡️ Security

- Passwords hashed with BCrypt
- JWT tokens expire after 24 hours (configurable via `jwt.expiration`)
- Role-based access: all `/admin/**` routes require `ROLE_ADMIN`
- CORS configured for `localhost:3000` and `localhost:5173`
- Frontend protected routes redirect unauthenticated users to `/login`

---

## 🔧 Configuration Reference

| Property | Default | Description |
|---|---|---|
| `jwt.secret` | (long random string) | JWT signing secret — change in production! |
| `jwt.expiration` | `86400000` | Token lifetime in ms (24h) |
| `codearena.execution.timeout-seconds` | `10` | Max seconds per test case execution |
| `codearena.execution.temp-dir` | `/tmp/codearena` | Temp dir for compilation |
| `server.port` | `8080` | Backend port |

---

## 🏗️ Tech Stack

### Backend
- Java 17
- Spring Boot 3.2
- Spring Security + JWT (jjwt 0.11.5)
- Spring Data JPA + Hibernate
- MySQL 8 + HikariCP
- Lombok, SpringDoc OpenAPI

### Frontend
- React 18 + Vite
- React Router 6
- Tailwind CSS 3
- Monaco Editor (`@monaco-editor/react`)
- Axios
- React Hot Toast
- Framer Motion
- React Markdown

---

## 📝 License

MIT License — free to use and modify.

---

## ✅ Java 17 Compatibility Notes

This project is fully tested and configured for **Java 17**. Key design decisions:

| Area | Detail |
|---|---|
| **Compiler** | `maven-compiler-plugin 3.11.0` with `<release>17</release>` |
| **Lombok** | Version `1.18.30` with explicit `annotationProcessorPaths` (required for Java 17 strict annotation processing) |
| **JWT Key** | Secret derived via SHA-256 → guaranteed 256-bit key, satisfying Java 17's stricter `Keys.hmacShaKeyFor()` validation |
| **JPA Models** | Use `@Getter`/`@Setter`/`@EqualsAndHashCode(onlyExplicitlyIncluded=true)` instead of `@Data` to avoid LazyInitializationException in `hashCode()` on lazy-loaded associations |
| **UserDetails** | `getUsername()` and `getPassword()` explicitly overridden (not relying on Lombok) to prevent method ambiguity with Spring Security |
| **Namespaces** | All Jakarta EE APIs use `jakarta.*` (`jakarta.persistence`, `jakarta.validation`, `jakarta.servlet`) — not `javax.*`. Note: `javax.crypto` is Java SE and stays as-is. |
| **Spring Boot** | 3.2.3 — minimum requirement is Java 17, fully supports Java 17 and 21 |

### Common Java 17 Pitfalls Avoided
- ❌ `@Data` on JPA entities with lazy collections → causes `LazyInitializationException` in `equals()`/`hashCode()`
- ❌ Short JWT secret string passed raw to `Keys.hmacShaKeyFor()` → `WeakKeyException`  
- ❌ Missing Lombok `annotationProcessorPaths` → `@Builder`/`@Getter` annotations silently ignored
- ❌ `javax.persistence.*` instead of `jakarta.persistence.*` → `ClassNotFoundException` at startup
