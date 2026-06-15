# StyleHive - AI Marketing OS (Mini CRM)

StyleHive is an AI-native Marketing OS and Mini CRM built to orchestrate and execute smart, personalized marketing campaigns. Designed to solve complex audience targeting and messaging simulation, it features a React-based frontend and a robust Node.js backend powered by PostgreSQL, a persistent job queue, and Google Gemini AI.

## 🌟 Key Features

- **AI Strategy Planner:** Uses Google Gemini AI to brainstorm campaign strategies, generate personalized marketing copy, and suggest target audiences based on real-time trends.
- **Smart Audience Targeting:** Translates natural language queries into secure SQL to instantly filter and segment customers (e.g., "Find users who haven't shopped in 60 days").
- **Campaign Execution Engine:** Uses a robust, persistent job queue (`pg-boss`) to schedule and execute marketing campaigns reliably.
- **Simulated Delivery Channel & Webhooks:** A stubbed, async communication channel that simulates network delays and posts back delivery, open, and click events via webhooks to update campaign analytics in real-time.
- **Beautiful & Responsive UI:** A modern, premium React frontend using Tailwind CSS, featuring a responsive mobile-friendly dashboard, sidebar, and campaign grid.

## 🏗️ Tech Stack

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** (for styling and responsive layouts)
- **Zustand** (for lightweight state management)
- **Recharts** (for analytics data visualization)
- **Lucide React** (for iconography)

### Backend
- **Node.js & Express**
- **Supabase (PostgreSQL)** (for relational data storage and JWT authentication)
- **pg-boss** (for persistent job queues and background workers)
- **Google Gemini SDK** (for AI text generation and data structuring)
- **Cloudinary** (for image storage and delivery)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (with SQL schemas applied)
- Google Gemini API Key
- Cloudinary Account (optional, for image uploads)

### 1. Clone & Install

Install dependencies for both the frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend (`backend/.env`):**
Copy `backend/.env.example` to `backend/.env` and provide your API keys:
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_DB_URL=your_supabase_postgres_url
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend (`frontend/.env`):**
Create a `.env` file in the `frontend` folder:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the Development Servers

You will need two terminal tabs to run both servers simultaneously.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```text
.
├── backend/                  # Node.js Express API and Queue Worker
│   ├── src/
│   │   ├── controllers/      # API logic (AI, Campaigns, Webhooks, Channels)
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # pg-boss job queue configuration
│   │   └── config/           # Database and third-party API configs
│   └── models/               # Supabase SQL schema definitions
│
├── frontend/                 # React Vite Application
│   ├── src/
│   │   ├── components/       # Reusable UI components and layout blocks
│   │   ├── features/         # Domain-specific logic (dashboard, strategy, campaigns)
│   │   ├── hooks/            # Shared React hooks and Zustand stores
│   │   └── pages/            # Top-level page views
│   └── index.html
│
└── README.md                 # You are here
```
