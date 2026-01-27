# Next.js Firebase Auth + TypeORM PostgreSQL

A **full‑stack authentication and dashboard system** built with **Next.js (App Router)**, **Firebase Authentication**, **TypeORM**, and **PostgreSQL**.
The project demonstrates clean auth flow, route protection, and syncing Firebase users with a SQL database.

---

## 🚀 Features

* ✅ Firebase Email/Password Authentication
* 🔐 Protected routes (Dashboard)
* 🚫 Auth pages hidden after login (Login / Signup restriction)
* 🗄 PostgreSQL integration using TypeORM
* 🔄 Sync Firebase users to database
* ⚡ React Query for data fetching
* 🎨 Dark / Light mode toggle
* 🧠 Clean client‑side auth handling

---

## 🧱 Tech Stack

| Layer         | Technology               |
| ------------- | ------------------------ |
| Frontend      | Next.js 16 (App Router)  |
| Auth          | Firebase Authentication  |
| Backend       | Next.js API Routes       |
| ORM           | TypeORM                  |
| Database      | PostgreSQL               |
| Data Fetching | TanStack React Query     |
| UI            | Tailwind CSS + shadcn/ui |

---

## 📂 Project Structure

```txt
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   └── sign-up/
│   ├── dashboard/
│   └── api/
│       └── users/
├── components/
├── entities/
├── repositories/
├── services/
├── lib/
│   ├── firebase.ts
│   └── datasource.ts
```

---

## 🔐 Authentication Flow

1. User signs up / logs in via **Firebase Auth**
2. Firebase returns authenticated user
3. User is redirected to `/dashboard`
4. Dashboard is protected via `onAuthStateChanged`
5. Auth pages auto‑redirect if user is already logged in

---

## 🔒 Route Protection (Minimal Pattern)

Used on **dashboard**, **login**, and **signup** pages:

```ts
useEffect(() => {
  const unsub = onAuthStateChanged(auth, user => {
    if (!user) router.replace('/auth/login')
  })
  return () => unsub()
}, [])
```

And for auth pages:

```ts
if (user) router.replace('/dashboard')
```

---

## 🗄 Database (PostgreSQL + TypeORM)

### User Entity Example

```ts
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  firstName: string

  @Column({ nullable: true })
  lastName: string

  @Column({ unique: true })
  email: string

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date
}
```

---

## 🌐 API Example

```ts
GET /api/users
```

* Initializes database
* Fetches users using TypeORM repository
* Returns JSON response

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=next_js_database

NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
```

---

## 🧪 Development

```bash
npm install
npm run dev
```

App runs on:

```
http://localhost:3000
```

---

## 🧠 Key Learnings

* Firebase handles **authentication**, not authorization
* Route protection must happen on **client + server**
* `onAuthStateChanged` is the source of truth
* TypeORM should be **singleton‑initialized** in Next.js
* React Query avoids unnecessary refetching

---

## 📌 Future Improvements

* Middleware‑based auth protection
* Role‑based access (admin / user)
* Server Actions for auth sync
* Email verification & password reset

---

## 👤 Author

**Ibrahim Amjad**
Web Developer – Next.js, Firebase, PostgreSQL

---

## 📄 License

MIT License
