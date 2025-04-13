
---

## 🏢 `README.md` for **FlickTix Partners App**

```markdown
# 🎭 FlickTix Partners – Empowering Theaters Digitally

**FlickTix Partners** is a dedicated dashboard experience for theater owners to manage their showtimes, bookings, and payments — all from one powerful interface.

> Simplifying cinema management with **Next.js**, **ShadCN UI**, **Stripe Connect**, and **Sanity**.

---

## 🧰 Features

- 🧾 Partner Sign-up & Approval Workflow
- 🗝️ Password Setup on First Login
- 🎬 Create, Edit & Assign Movie Schedules
- 💳 Stripe Connect Integration for Payouts
- 🎟️ Manage Ticket Bookings and View Logs
- 📅 Filter & Search by Date, Theater, Movie
- 📦 Real-time Sync with Sanity

---

## 💡 Workflow Overview

1. Partner signs up for access
2. Admin reviews & approves
3. Partner recieves an approved email
4. Partner is redirected to `/setup` for:
   - Password creation
   - Stripe connection
   - Theater setup
5. Full access to dashboard after setup

---

## ⚙️ Tech Stack

| Layer         | Tech Used                                  |
|---------------|---------------------------------------------|
| **Frontend**  | Next.js, Tailwind CSS, ShadCN UI            |
| **Auth**      | NextAuth (or custom logic)                  |
| **Payments**  | Stripe Connect                              |
| **Database**  | Sanity.io                                   |
| **Hosting**   | Vercel                                      |

---

## 📁 Folder Overview

```bash
flicktix-partners/
│
├── pages/                # Pages & Routing (e.g. /dashboard, /setup)
|     ├──                 # API
├── components/           # UI Components (Cards, Tables, Forms)
├── lib/                  # Stripe, Sanity Client, Helpers
├── sanity/               # Schema Interfaces
├── tailwind.config.js    # Tailwind CSS Configuration
├── .env.example          # Environment Variable Template
