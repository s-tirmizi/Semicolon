# Semicolon

# SCAVENGER: AI Campus Financial Advocate

**Core Mission:** Democratize access to hidden university resources, emergency funds, and departmental grants by eliminating bureaucratic friction using generative AI.

## 1. App Architecture & Routing (Link Structure)
The app will follow a clean, simple flow to minimize user drop-off.
* **`/` (Home):** Landing page, value proposition, and login/signup.
* **`/dashboard`:** The main hub. Users choose between "Personal Need" or "Club Funding".
* **`/intake`:** The conversational chat interface where the user explains their situation.
* **`/results`:** The personalized dashboard showing matched funds, eligibility scores, and next steps.
* **`/apply`:** The workspace for drafting proposals, uploading proof documents, and generating auto-filled PDFs.

---

## 2. Frontend Structure: Page-by-Page Breakdown

### A. Home Page (`/`)
* **Hero Section:** Minimalist search bar or text box. 
    * *Prompt text:* "What do you need funding for?"
    * *Subtext:* "Instantly search millions in hidden UT Austin grants, emergency funds, and club budgets."
* **Call to Action (CTA):** "Start Scanning" button.

### B. The Dashboard (`/dashboard`)
* **Split View Options:**
    * **Route 1: Individual Advocate:** For personal rent, research, travel, or emergency funds.
    * **Route 2: Organization Treasurer:** For student clubs (e.g., Switch Energy Club) needing venue, catering, or event budgets.
* **Saved Scans:** A sidebar showing previous queries and saved grant applications.

### C. The Intake & Chat Interface (`/intake`)
* **The Component:** A clean chat UI (similar to ChatGPT) but highly focused.
* **User Action:** The student types their messy reality.
    * *Example input:* "I need a travel grant to present a poster at the Jackson School of Geosciences Symposium this February, and I also need help covering my rent this month."
* **Under the Hood:** The frontend sends this unstructured text to the backend OpenAI router.

### D. The Results Page (`/results`)
* **Matched Funds List:** Cards displaying available grants. Each card shows:
    * Grant Name (e.g., "Undergraduate Research Travel Fund").
    * Amount Available.
    * Deadline.
    * **AI Match Score (1-100%):** How well the student fits the criteria.
* **Action Buttons:** "Check Eligibility" or "Start Application".

### E. The Application Workspace (`/apply`)
* **Document Dropzone:** Drag-and-drop area for unstructured files (unofficial transcripts, lease agreements, degree audits).
* **Proposal Writer UI:** A split screen. Left side: The student's rough draft. Right side: The AI's live feedback, scoring the draft against the grant's specific rubric.
* **"Generate PDF" Button:** The final step where the AI auto-fills the university's official paperwork.

---

## 3. Backend & Core Functions (The OpenAI Brain)

To build this, the backend (e.g., Python/FastAPI or Node/Express) will need specific functions to handle the AI workflows.

### Function 1: `search_knowledge_base(user_prompt)`
* **What it does:** Uses the **OpenAI Assistants API** with the `file_search` tool.
* **How it works:** 1. Pre-load an OpenAI Vector Store with 20+ dense university financial PDFs and scraped department websites.
    2. The function takes the user's messy intake prompt and queries the Assistant.
    3. **Output:** A JSON array of the top 3 matching grants, including extracted deadlines and eligibility criteria.

### Function 2: `analyze_eligibility_document(image_file)`
* **What it does:** Uses **GPT-4o's Vision capabilities** to bypass bureaucratic guessing.
* **How it works:**
    1. The student uploads a screenshot of their degree audit or lease.
    2. The backend encodes the image to Base64 and sends it to GPT-4o with the prompt: *"Extract the GPA, major, and current enrollment status from this document. Does it meet the criteria for [Grant Name]?"*
    3. **Output:** A definitive "Yes/No" with the exact extracted data points.

### Function 3: `grade_and_rewrite_proposal(student_draft, grant_rubric)`
* **What it does:** Acts as the expert grant writer.
* **How it works:** 1. Passes the student's raw text and the target grant's requirements to the LLM.
    2. Instructs the model to output a "Score" and "Suggested Rewrites" using OpenAI's **Structured Outputs** (enforcing a strict JSON response).
    3. **Output:** Actionable feedback (e.g., "Your abstract is missing a budget breakdown. Here is a generated template based on your inputs.").

### Function 4: `generate_autofill_payload(user_data, form_fields)`
* **What it does:** Prepares data to physically fill out the university PDF.
* **How it works:** Maps the conversational data the AI has gathered (name, major, requested amount, justification) to the exact field names required by a standard PDF filling library (like `pdffiller` in Node or `PyPDF2` in Python).

---

## 4. MVP Hackathon Execution Strategy
To win, do not try to build every feature perfectly. Focus on the "Wow-Factor" loop:
1.  **Hardcode the Vector Store:** Don't build a web scraper during the hackathon. Manually download 10 real university financial PDFs and upload them to the OpenAI Assistant beforehand.
2.  **Nail the Vision Demo:** Make sure the `analyze_eligibility_document` function works flawlessly. Watching an AI read a messy screenshot of a transcript and instantly approve a grant is a winning demo moment.
3.  **Fake the PDF Output if necessary:** If mapping PDF fields programmatically takes too long, have the AI generate a perfectly formatted Markdown or HTML document that looks like a completed application form.


# Role
You are an expert full-stack developer and AI integration specialist. We are building a hackathon MVP called **SCAVENGER: AI Campus Financial Advocate**. 

# Core Mission
Democratize access to hidden university resources, emergency funds, and departmental grants by eliminating bureaucratic friction using generative AI. 

# Tech Stack
* **Frontend:** React (initialized via Vite) for fast rendering and hot-reloading.
* **Styling:** Tailwind CSS for rapid, utility-first UI development.
* **Backend:** Python with FastAPI. Must include CORS middleware configured for local frontend communication.
* **AI Integration:** OpenAI API (Assistants API for document retrieval, GPT-4o Vision for eligibility extraction, Structured Outputs for strict JSON data).
* **State Management:** React `useState` and `useContext` (no Redux).
* **HTTP Client:** Axios for API calls.

# 1. App Architecture & Routing
Build the following clean, simple flow to minimize user drop-off:
* `/` (Home): Landing page with a minimalist search bar ("What do you need funding for?") and a "Start Scanning" CTA.
* `/dashboard`: The main hub. Split view options: Route 1 (Individual Advocate) or Route 2 (Organization Treasurer - e.g., Switch Energy Club). Sidebar for saved scans.
* `/intake`: Chat interface. User types their unstructured need (e.g., "I need a travel grant to present a poster at the Jackson School of Geosciences Symposium this February...").
* `/results`: Dashboard showing matched funds (Name, Amount, Deadline) and an AI Match Score (1-100%). Includes a "Check Eligibility" button.
* `/apply`: Workspace for drafting proposals. Includes a drag-and-drop document zone, a split-screen AI proposal writer/grader, and a "Generate PDF" (or Markdown equivalent) button.

# 2. API Data Contracts
Ensure the frontend and backend communicate using these exact structures:
* **Endpoint:** `POST /api/intake`
    * **Request Payload (React -> FastAPI):**
        `{ "user_prompt": "string", "student_context": { "major": "string", "role": "string" } }`
    * **Response Payload (FastAPI -> React):**
        `{ "matched_grants": [ { "name": "string", "amount": number, "match_score": number, "next_step": "string" } ] }`

# 3. Backend Core Functions (Python/FastAPI)
Implement the following core AI logic:
* `search_knowledge_base(user_prompt)`: Uses OpenAI Assistants API with the `file_search` tool (assume a pre-loaded Vector Store of university PDFs). Returns top 3 matching grants.
* `analyze_eligibility_document(image_base64)`: Uses GPT-4o Vision. Prompt it to read screenshots of transcripts/leases. **Crucial:** Must use strict Structured Outputs to return exact JSON: `{"eligible": boolean, "extracted_gpa": number, "missing_criteria": []}`.
* `grade_and_rewrite_proposal(student_draft, grant_rubric)`: Uses OpenAI Structured Outputs to return a strict JSON response containing a "Score" and "Suggested_Rewrites".
* `generate_autofill_payload(user_data, form_fields)`: Maps the gathered conversational data to standard PDF fields (output a cleanly formatted HTML/Markdown mockup if actual PDF mapping takes too long for the MVP).

# Execution Instructions
1.  Begin by generating the `main.py` file for the FastAPI backend, including the CORS configuration and the `POST /api/intake` route scaffolding.
2.  Next, provide the terminal commands to initialize the Vite React app and install Tailwind CSS.
3.  Do not over-engineer; focus on a functional "Wow-Factor" loop demonstrating the AI Vision parsing and the unstructured-to-structured intake flow.