<div align="center">

# 🎓 CET Mentor Hub

**Your ultimate companion for Common Entrance Test (CET) Preparation**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg?style=for-the-badge&logo=vercel)](https://cet-mentor-hub.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)]()
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture--flow) • [Getting Started](#-getting-started) • [Contributing](#-contributing)

</div>

---

## 📖 About The Project

**CET Mentor Hub** is a dynamic web application designed to help students master their Common Entrance Test (CET) preparations. The platform provides access to Previous Year Questions (PYQs), progress tracking, mock tests, and personalized mentoring.

### ✨ Features
- **Secure Authentication**: Passwordless & social login via Clerk.
- **Progress Tracking**: Real-time analytics and charts using Recharts.
- **Previous Year Questions (PYQs)**: Dedicated scraper and viewer for past exam questions.
- **Secure Payments**: Integrated with Razorpay for premium mock tests or mentorships.
- **Interactive UI**: Beautiful, accessible, and responsive components built with Radix UI, Framer Motion, and Tailwind CSS.
- **Email Notifications**: Automated updates and alerts via Resend.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Radix UI (Shadcn), Framer Motion |
| **Backend & DB** | Supabase (PostgreSQL) |
| **Authentication** | Clerk |
| **Payments** | Razorpay |
| **Emails** | Resend |
| **Data Visualization**| Recharts |
| **Scraping** | Playwright, Cheerio, Axios |

---

## 🏗 Architecture & Flow

The following flow chart explains the high-level architecture of how the frontend, authentication, and database interact:

```mermaid
graph TD;
    Client[Client Browser / Next.js]
    Auth[Clerk Authentication]
    DB[(Supabase PostgreSQL)]
    Payment[Razorpay Gateway]
    Scraper[Playwright Scraper]
    
    Client -->|1. Sign In / Sign Up| Auth
    Auth -->|2. Return Token| Client
    Client -->|3. Fetch / Update Data| DB
    Client -->|4. Initiate Checkout| Payment
    Payment -->|5. Payment Webhook| DB
    Scraper -->|6. Scrape PYQs| DB
    
    classDef main fill:#2563eb,stroke:#1e40af,stroke-width:2px,color:#fff;
    classDef secondary fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef db fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;
    
    class Client main;
    class Auth,Payment secondary;
    class DB db;
```

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v22+ recommended) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GaneshSarode/cet-mentor-hub.git
   cd cet-mentor-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   # Clerk Auth
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   CLERK_SECRET_KEY=your_clerk_secret

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Razorpay
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   
   # Resend
   RESEND_API_KEY=your_resend_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🕷️ PYQ Scraper

This project includes a custom Playwright scraper inside `scripts/scrape-pyq/` to fetch past examination questions.
To run the scraper:
```bash
cd scripts/scrape-pyq
npm install
node scrape_examside.js
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/GaneshSarode">Ganesh Sarode</a>
</div>
