# 🌐 ChatSphere — Real-Time Chat Application

A full-stack, industry-grade real-time chat application built with **Spring Boot** (backend) and **React** (frontend), featuring JWT authentication, WebSocket messaging, Redis presence tracking, and a modern dark UI.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT + BCrypt, Register/Login, USER/ADMIN roles |
| 💬 Private Chat | 1-to-1 messaging |
| 👥 Group Chat | Create, join, leave groups |
| ⚡ Real-time | WebSocket (STOMP over SockJS) |
| 🟢 Presence | Online/offline tracking via Redis |
| ✍️ Typing | Real-time typing indicators |
| 📎 Files | Image & file sharing (up to 10MB) |
| 😊 Emoji | Full emoji picker |
| ↩️ Replies | Reply to specific messages |
| ✏️ Edit/Delete | Edit or soft-delete your messages |
| 🔔 Notifications | In-app + WebSocket push |
| 📄 Pagination | Infinite scroll message history |
| 🔍 Search | Search messages & users |
| 👁️ Read receipts | Seen/delivered status |
| 📱 Responsive | Mobile-friendly layout |

---

## 🛠️ Tech Stack

### Backend
- **Java 17** + **Spring Boot 3.2**
- **Spring Security** + **JWT** (jjwt 0.12)
- **Spring WebSocket** (STOMP)
- **Spring Data JPA** (Hibernate) + **MySQL 8**
- **Spring Data Redis** (Lettuce)
- **Maven**

### Frontend
- **React 18** + **React Router 6**
- **Tailwind CSS 3**
- **Axios** (HTTP)
- **@stomp/stompjs** + **SockJS** (WebSocket)
- **react-hot-toast** (notifications)
- **emoji-picker-react**
- **date-fns**

---

## 📋 Prerequisites

- Java 17+
- Node.js 18+ & npm
- MySQL 8.0
- Redis 7+
- Maven 3.9+

---

## 🚀 Setup Guide

### Option A — Manual Setup (Recommended for Development)

#### Step 1: MySQL

```sql
-- In MySQL client:
CREATE DATABASE chatsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Run schema:
source /path/to/ChatSphere/database/schema.sql;
```

Or just start the backend — Spring Boot will auto-create tables via `ddl-auto=update`.

#### Step 2: Redis

**macOS:**
```bash
brew install redis && brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server && sudo systemctl start redis
```

**Windows:** Download from https://github.com/microsoftarchive/redis/releases

Verify: `redis-cli ping` → should return `PONG`

#### Step 3: Configure Backend

Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/chatsphere?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

#### Step 4: Run Backend

```bash
cd ChatSphere/backend
mvn clean install -DskipTests
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

#### Step 5: Run Frontend

```bash
cd ChatSphere/frontend
npm install --legacy-peer-deps
npm start
```

Frontend starts at: **http://localhost:3000**

---

### Option B — Docker Compose (One Command)

```bash
cd ChatSphere
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MySQL: localhost:3306
- Redis: localhost:6379

---

## 🧪 Testing with Postman

### 1. Register
```
POST http://localhost:8080/api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123",
  "displayName": "Alice"
}
```

### 2. Login
```
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "password123"
}
```
Copy the `accessToken` from the response.

### 3. Get My Chats (authenticated)
```
GET http://localhost:8080/api/chats
Authorization: Bearer <your_token>
```

### 4. Create Group Chat
```
POST http://localhost:8080/api/chats/group
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "chatName": "Dev Team",
  "description": "Engineering discussions",
  "memberIds": [2, 3]
}
```

### 5. Send Message
```
POST http://localhost:8080/api/messages
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "chatId": 1,
  "content": "Hello, world!",
  "type": "TEXT"
}
```

---

## 📁 Project Structure

```
ChatSphere/
├── backend/
│   ├── src/main/java/com/chatsphere/
│   │   ├── config/          # Security, WebSocket, Redis, MVC configs
│   │   ├── controller/      # REST controllers (Auth, User, Chat, Message, File)
│   │   ├── service/         # Business logic (Auth, User, Chat, Message, Presence)
│   │   ├── repository/      # JPA repositories
│   │   ├── entity/          # JPA entities (User, Chat, ChatMember, Message)
│   │   ├── dto/             # Request/Response DTOs
│   │   │   ├── request/
│   │   │   └── response/
│   │   ├── security/        # JWT util, filter, UserDetailsService
│   │   ├── websocket/       # WebSocket controller (connect/disconnect/typing)
│   │   └── exception/       # Global exception handler + custom exceptions
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   └── src/
│       ├── pages/           # LoginPage, RegisterPage, ChatPage
│       ├── components/
│       │   ├── layout/      # ChatSidebar
│       │   ├── chat/        # ChatHeader, MessageList, MessageBubble, MessageInput, ChatInfoPanel, SearchPanel
│       │   ├── modals/      # NewChatModal, NewGroupModal, ProfileModal, ExploreGroupsModal
│       │   └── common/      # Avatar
│       ├── context/         # AuthContext, ChatContext
│       ├── services/        # api.js (Axios), websocket.js (STOMP)
│       └── index.css        # Tailwind + custom styles
├── database/
│   └── schema.sql
├── docker-compose.yml
└── README.md
```

---

## 🔌 WebSocket Endpoints

| Destination | Direction | Description |
|---|---|---|
| `/ws/chat` | Connect | STOMP endpoint (SockJS) |
| `/app/chat.send` | Client → Server | Send a message |
| `/app/chat.typing` | Client → Server | Typing indicator |
| `/app/chat.read` | Client → Server | Read receipt |
| `/topic/chat/{chatId}` | Server → Client | New messages in chat |
| `/topic/chat/{chatId}/typing` | Server → Client | Typing events |
| `/topic/chat/{chatId}/read` | Server → Client | Read receipts |
| `/topic/online` | Server → Client | Online/offline status |
| `/user/queue/notifications` | Server → User | Private notifications |

---

## 🔑 REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login, get JWT |
| GET | `/api/auth/me` | ✓ | Get current user |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/{id}` | Get user by ID |
| PUT | `/api/users/profile` | Update profile |

### Chats
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chats` | Get my chats |
| POST | `/api/chats/private` | Start/get private chat |
| POST | `/api/chats/group` | Create group chat |
| POST | `/api/chats/{id}/join` | Join group |
| DELETE | `/api/chats/{id}/leave` | Leave group |
| POST | `/api/chats/{id}/read` | Mark as read |
| GET | `/api/chats/groups/all` | All public groups |

### Messages
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/messages` | Send message |
| GET | `/api/messages/chat/{id}` | Get chat messages |
| PUT | `/api/messages/{id}` | Edit message |
| DELETE | `/api/messages/{id}` | Delete message |
| GET | `/api/messages/chat/{id}/search?q=` | Search messages |

### Files
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/files/upload` | Upload file (multipart) |

---

## 🎨 UI Highlights

- **Dark theme** with deep indigo/purple palette
- **Glassmorphism** on auth pages
- **Animated blobs** and dot-grid backgrounds
- **Typing indicators** with animated dots
- **Online/offline** badges on avatars
- **Infinite scroll** for message history
- **Emoji picker** (full emoji set)
- **File/image preview** in messages
- **Read receipts** (✓ sent, ✓✓ delivered, blue ✓✓ read)
- **Message context menu** (edit, delete)
- **Reply threading** with quote preview
- **Responsive** — works on mobile

---

## 🐛 Troubleshooting

**Backend won't start:**
- Ensure MySQL is running: `mysql -u root -p`
- Ensure Redis is running: `redis-cli ping`
- Check `application.properties` credentials

**WebSocket not connecting:**
- Verify CORS is set to `http://localhost:3000`
- Check browser console for connection errors
- Ensure JWT token is being passed in STOMP headers

**npm install fails:**
- Use `npm install --legacy-peer-deps`

**Port conflict:**
- Backend: change `server.port` in `application.properties`
- Frontend: `PORT=3001 npm start`

---

## 📝 Default Admin Account

After running `schema.sql`:
- **Email:** admin@chatsphere.com  
- **Password:** password

---

*Built with ❤️ using Spring Boot + React*
