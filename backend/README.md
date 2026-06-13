# StyleHive Backend (Mini CRM for Xeno Assignment)

The backend for StyleHive is an AI-native Node.js/Express application that manages shopper data, integrates tightly with Gemini AI for complex queries and copy generation, and features a robust, persistent job queue for simulating asynchronous messaging channels.

## 🏗️ Architecture & Key Decisions

This project specifically targets the system design requirements of the Xeno "Mini CRM" engineering prompt.

### 1. The Channel Service & Callback Loop
As requested by the prompt: *"Do not integrate any real messaging provider. Instead, we want you to stub the channel yourself as a separate service, and model the full lifecycle of a communication."*

We solved this by implementing a **highly robust, distributed-ready architecture**:
- **`pg-boss` (Persistent Queue):** We avoided using simple `setTimeout` or in-memory arrays. Instead, campaigns are pushed into a PostgreSQL-backed job queue (`pg-boss`). This ensures that if the server crashes or restarts, jobs are never lost, and retries are handled natively.
- **`channelController.js` (The Stubbed Service):** The worker picks up the job and sends the communication payload to our internal stubbed channel service. It waits for a simulated network delay and then **asynchronously fires an HTTP POST** back to our webhook receiver.
- **`webhookController.js` (The Receipt API):** The webhook endpoint receives the callback (`delivered`, `opened`, `clicked`) and directly updates the campaign analytics in the database in real-time.

### 2. AI-Native Engine
- **Strategy & Copywriting:** `aiController.js` utilizes Google's Gemini SDK to brainstorm strategies and draft personalized message copy based on the specific audience.
- **Natural Language to SQL:** We leverage Gemini with Structured Outputs to translate raw marketer input (e.g., *"Find users who haven't shopped in 60 days"*) into secure, parameterized database queries.

### 3. Database & Security
- **Supabase (PostgreSQL):** We use Supabase for persistent storage, leveraging relational models for Customers, Campaigns, Automations, and Analytics.
- **JWT Auth Middleware:** All routes are protected by a custom `authMiddleware.js` that verifies Supabase JWT Bearer tokens to ensure secure access.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase Project (with the SQL schema applied)
- A Gemini API Key

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your Supabase connection string and API keys.
   ```bash
   cp .env.example .env
   ```

3. Start the server (Development):
   ```bash
   npm run dev
   ```

4. Start the server (Production):
   ```bash
   npm start
   ```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── config/          # Database and API configurations
│   ├── controllers/     # Express route handlers (AI, Campaigns, Webhooks)
│   ├── middleware/      # Auth & Error handling
│   ├── routes/          # Express router definitions
│   └── services/        # pg-boss automation engine
├── models/              # Supabase SQL schema definitions
├── Dockerfile           # Production container build
└── server.js            # Entry point
```
