# Engineering Tradeoffs & Scale Assumptions

This document outlines the scale assumptions, conscious product decisions, and architectural tradeoffs made for the **StyleHive AI-Native Mini CRM** assignment.

## 1. Scale Assumptions

For the scope of this assignment, the system is designed to handle:
*   **Audience Size:** Thousands to tens of thousands of shoppers.
*   **Throughput:** Processing hundreds of messages per minute through the stubbed channel service.
*   **Data Volume:** A moderate e-commerce dataset (e.g., 50k orders, 10k customers) that fits comfortably in a standard relational database without requiring sharding or specialized OLAP data warehouses.

---

## 2. The Channel Service & Event Queuing

**Tradeoff: `pg-boss` (PostgreSQL) vs. Dedicated Message Broker (Kafka/RabbitMQ)**
*   **What I did for this scope:** I used `pg-boss` to handle the asynchronous campaign execution and webhook delivery. This runs on top of the existing PostgreSQL database.
*   **What I'd do at scale:** At a massive scale (millions of messages a day), I would decouple this into a dedicated message broker like Apache Kafka or RabbitMQ, paired with a high-throughput Redis instance for rate-limiting and deduplication.
*   **Reasoning:** For this assignment, using `pg-boss` reduces infrastructure complexity and provides excellent transactional guarantees (a job is only queued if the database transaction succeeds). It is robust enough to handle retries and failures gracefully without needing a separate distributed cluster.

**Handling Callbacks, Retries, and Failures:**
*   The channel service simulates network delays and randomly generates statuses (`delivered`, `opened`, `clicked`, `failed`). 
*   Because webhook callbacks can arrive out of order, the system relies on idempotent state updates (e.g., an `opened` event will not overwrite a `clicked` event if they arrive out of sync). 

---

## 3. AI-Native Audience Segmentation (Natural Language to SQL)

**Tradeoff: LLM SQL Generation vs. Visual Rule Builder UI**
*   **What I did for this scope:** I built a "chat-first" experience where marketers type their intent (e.g., "Users who haven't shopped in 60 days"), and Google Gemini translates this directly into a parameterized PostgreSQL `SELECT` query.
*   **What I'd do at scale:** I would build a hybrid system. The AI would output a structured JSON AST (Abstract Syntax Tree) representing the filters, which would then be rendered into a Visual Rule Builder UI. The user could tweak the UI before running it.
*   **Reasoning:** Generating SQL directly provides unmatched flexibility for the assignment's scope and truly feels "AI-native." To mitigate the inherent hallucination risks, the AI is sandboxed to only perform `SELECT` operations, and strict validation prevents any destructive queries.

---

## 4. 1:1 Message Personalization

**Tradeoff: Real-time LLM Inference vs. Standard Templating**
*   **What I did for this scope:** The system feeds individual customer data (name, past purchase history) into the Gemini API to craft a hyper-personalized, unique message for *every single user* in a campaign.
*   **What I'd do at scale:** Running an LLM inference for every user in a 500,000-person campaign is cost-prohibitive and slow. At scale, I would use the LLM to generate 5-10 distinct "message variants" based on broader cohorts, and then use standard string interpolation (e.g., Liquid or Handlebars) to inject the user's name and product variables quickly.
*   **Reasoning:** For a take-home assignment, doing true 1:1 generative personalization beautifully demonstrates the power of an AI-native CRM, prioritizing message quality over raw bulk throughput.

---

## 5. What I Consciously Chose NOT To Do

*   **Complex Auth & RBAC:** I relied on Supabase's out-of-the-box authentication rather than building a complex multi-tenant Role-Based Access Control (RBAC) system from scratch.
*   **Redis Caching:** I chose not to implement a Redis caching layer for campaign analytics. The Postgres database is fast enough for the current data volume, and caching would add unnecessary architectural overhead for this scope.
*   **WebSockets for Real-Time UI:** Instead of setting up WebSockets to watch campaign progress update in real-time on the frontend, I rely on simple optimistic UI updates and polling. This keeps the frontend architecture simpler while still delivering a responsive feel.
