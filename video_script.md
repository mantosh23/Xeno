# Xeno Mini-CRM Video Walkthrough Script

**Target Time:** 5-6 Minutes
**Preparation:**
- Have the app running locally or deployed.
- Open the codebase in your IDE.
- Open the database (Supabase) to show the tables if needed.
- Have a notepad or prompt ready to copy-paste into the AI agent.

---

## 1. Product Intro & Story (0:00 - 0:50)
*(Screen: Show the main Dashboard of your Mini CRM)*

**"It was 11 PM. Aryan, founder of a D2C brand, called me.**

**'I have 5000+ buyers, but I don't know who to talk to or what to say. Existing CRMs are too complex—I don't have hours to build workflows and write copy.'**

**He laughed, 'You're an engineer. Solve it.' I smiled. 'Give me one night.'**

**This isn't just Aryan's story—it's the reality for every D2C brand today. That's why I built this AI-Native Agentic CRM.**

**Instead of manually defining segments and writing emails, you just type your intent in plain English, and our multi-agent AI orchestrates the entire campaign. Let me show you."**

---

## 2. Functional Demo (0:45 - 2:30)
*(Screen: Click on "AI Campaign Agent" to open the wizard/chat interface)*

**"Let's say Aryan at StyleHive wants to clear out some summer inventory. He just types his intent here: *'Launch a 20% discount on our summer dress collection for our premium tier customers via WhatsApp and Email.'***

*(Screen: Type the prompt, click generate, and wait for the AI to process)*

**"Under the hood, the AI is doing several things at once. First, it translates this natural language into a structured SQL query, digging into our PostgreSQL database to find the exact shoppers who match this criteria. Second, it drafts a multi-channel strategy."**

*(Screen: Show the Audience, Strategy, and Creatives screens that the AI populated)*

**"As you can see, the AI successfully carved out our audience segment. Moving to the next steps, it has automatically generated the subject lines, the WhatsApp message copy, and the email templates. As a marketer, Aryan is just here to review and approve, rather than starting from scratch."**

*(Screen: Click "Launch Campaign", then navigate to the Campaign Details page)*

**"Now, we launch the campaign. When it goes active, we can immediately dive into the analytics dashboard."**

*(Screen: Show the empty funnel charts, then let the auto-flood populate the charts)*

**"To demonstrate the engagement, I've built a simulator that pumps realistic event data into the dashboard. You can see the marketing funnel updating as events stream in—tracking everything from Sent and Delivered, to Opened, Clicked, and ultimately, Purchased."**

---

## 3. Technical Architecture (2:30 - 3:30)
*(Screen: Switch to your IDE. Open `stubChannelService.js` and `webhookController.js`)*

**"Let's talk about the architecture. A key requirement was decoupling the channel delivery into a separate service, simulating how Twilio or SendGrid would work.**

**I built a two-service, callback-driven loop. When I clicked 'Launch' earlier, the CRM's send API didn't insert events into the database directly. Instead, it handed a payload to this `stubChannelService.js` module.**

**This stub service runs asynchronously. It models the latency and drop-off rates of a real channel, and then it uses HTTP requests to POST the delivery outcomes—like 'delivered' or 'opened'—back to our CRM's Webhook Receipt API, which you can see here in `webhookController.js`.**

**The webhook controller receives these payloads, ingests them into the Supabase database, and our React frontend listens to Postgres realtime sockets to pulse the charts on the dashboard without requiring a page refresh."**

---

## 4. Code Walkthrough (3:30 - 4:30)
*(Screen: Switch to `useAgentStore.ts` or `campaignController.js`)*

**"For the code structure, I used a modern stack with React, Node.js, and Supabase.**

**One of the most interesting parts of the code is how the AI Agent interacts with the backend. Instead of relying on brittle string parsing, I used structured JSON output schemas with the Gemini API.**

**When the user submits a prompt, the backend prompts the LLM with a strict JSON schema for the audience parameters, the channel strategy, and the creative copy. The frontend then ingests this structured object into a Zustand state store, which makes the UI instantly reactive to the AI's decisions.**

*(Screen: Briefly scroll through `analyticsController.js`)*

**"I also spent time making sure the analytics engine was logically sound. When the webhook receives a 'Clicked' event, the analytics controller is smart enough to cascade that metric upwards—knowing that if a message was clicked, it must have also been opened, delivered, and sent—ensuring the funnel charts are mathematically accurate."**

---

## 5. AI-Native Workflow (4:30 - 5:30)
*(Screen: Return to the working CRM Dashboard)*

**"Finally, building this was an incredibly AI-native experience. I leveraged an advanced agentic coding assistant to help me move fast.**

**Rather than manually scaffolding the React components or writing boilerplate, I acted as the tech lead—directing the AI on the architectural patterns, defining the database schemas, and guiding the design of the deep Recharts analytics dashboard. Whenever I needed complex SQL queries for the audience builder or realtime web socket listeners for Supabase, I co-programmed with the AI to implement them flawlessly.**

**This workflow allowed me to focus purely on the product logic, user experience, and the architecture tradeoffs, which is exactly how I envision the future of software engineering.**

**Thanks for watching, and I look forward to discussing the CRM with the Xeno team!"**
