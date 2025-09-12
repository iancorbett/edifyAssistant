## **Edify Assistant

---

<img width="1147" height="713" alt="Screenshot 2025-09-11 at 5 43 55 PM" src="https://github.com/user-attachments/assets/2b960e3a-93e1-4006-92cb-44c9e5d61aca" />

---


A hybrid chatbot that combines semantic search (fast FAQ lookup with TensorFlow.js) and an LLM fallback (OpenAI GPT-4o-mini with KB grounding).

---

**Frontend (chatbot.js)**

Runs in the browser with TensorFlow.js + Universal Sentence Encoder.

Finds the closest KB entry and answers instantly if similarity ≥ threshold.

---

**Backend (server.js)**

Node/Express server with OpenAI API.

When no close KB match is found, the frontend POSTs to /ask.

The server embeds the user query, retrieves top-k KB entries, and calls GPT-4o-mini to answer grounded in the KB.

---

## Features

**Semantic search in browser → instant KB answers.**

**LLM fallback for out-of-scope questions.**

**KB stored in JSON (kb.json) → single source of truth.**

**API key safe → only used on backend, never exposed to browser.**

**Hybrid design → cheap, fast, and still smart.**

---

## Project Structure
edify-help-bot/
├── public/
│   ├── index.html      # UI
│   ├── styles.css      # Styling
│   ├── chatbot.js      # Frontend semantic search
│   └── public.js       # (optional) KB for frontend if needed
├── kb.json             # Knowledge base (source of truth)
├── server.js           # Express backend w/ LLM fallback
├── .env                # API key + config (ignored by git)
├── .env.example        # Sample env file
├── package.json
└── README.md

---

## Setup
1. Clone & install
git clone https://github.com/your-username/edify-help-bot.git
cd edify-help-bot
npm install

2. Configure environment

Create a .env file in the root:

OPENAI_API_KEY=sk-yourkeyhere
PORT=8787


(Keep .env secret! Add it to .gitignore.)

3. Run backend
node server.js


Should log:

Indexed <N> KB items.
LLM fallback server on :8787


Test health:

http://localhost:8787/health
→ { "ok": true }

4. Run frontend

Open public/index.html in a browser (or serve with Live Server / vite / any static server).

---

## Usage

Ask a question that exists in KB (e.g., “how do I reset my password”).
→ Semantic search answers instantly.

Ask something random (“how do I cook a beef stew”).
→ Falls back to backend /ask, embeds + retrieves KB, and GPT-4o-mini replies with grounded context.

---

## Config

Threshold: in chatbot.js

const THRESHOLD = 0.47;


Lower = fallback more often, higher = fallback less often.

Top-K retrieval: in server.js

function topK(queryEmb, k = 3) { ... }


Defaults to 3 KB entries per LLM request.

---

## Notes

Keep .env out of git. Share .env.example for setup.

kb.json is your single source of truth. You can expand it anytime.

Frontend only uses KB for local search; backend uses KB for retrieval + LLM context.

CORS is enabled in server.js → frontend and backend can run separately during dev.

---

## Roadmap

 Add support ticket creation for unanswered queries.

 Host both frontend + backend in one Express app to avoid CORS.

 Deploy backend (Render/Heroku) and serve frontend from same origin.

 Add analytics (track queries + hits/misses).
