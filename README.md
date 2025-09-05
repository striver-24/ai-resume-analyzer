# StackResume.ai – Crack your dream job using AI

An AI-powered resume analyzer that helps you optimize your resume for Applicant Tracking Systems (ATS) and real-world job descriptions. Upload your resume (PDF), get instant feedback, actionable tips, and track your history — all powered by Puter.js storage and AI services.

- Live tagline: "Crack your dream job using AI"
- Built with React Router, TypeScript, Tailwind CSS, and Puter.js

## Table of Contents
- What is StackResume.ai?
- Key Features
- Demo & Screenshots
- Tech Stack
- Getting Started
  - Prerequisites
  - Installation
  - Development
  - Build
  - Preview Production Build
- Usage Guide
  - Home
  - Upload & Analyze
  - Review Resume
  - Profile Menu & History
  - Wipe App Data
- Configuration Notes
- Available Scripts
- Troubleshooting
- Contributing
- License
- Acknowledgements

---

## What is StackResume.ai?
StackResume.ai gives you quick, actionable feedback on your resume against a job description. It analyzes tone, content, structure, and skills, and returns an ATS-oriented score along with prioritized improvement tips.

## Key Features
- Resume Upload (PDF): Convert to image for preview, store both assets in Puter drive.
- AI Feedback: Uses Puter AI chat API to generate structured, multi-category feedback.
- ATS Insights: Overall score plus category-wise breakdown and tips.
- History: View your recent analyses from the profile menu.
- Public Homepage: See tagline and sample resumes even when signed out.
- Auth Flow: Sign in/out via Puter auth; redirect back to the page you came from.
- Data Wipe: A dedicated Danger Zone to wipe files and KV data safely with confirmation.

## Demo & Screenshots
These are representative screenshots from the app UI.

- Home (public): shows tagline and sample resumes
  
  ![Home samples](/public/images/resume_01.png)

- Upload in progress (scan animation)
  
  ![Scan](/public/images/resume-scan.gif)

- Review screen with preview and feedback
  
  ![Scan 2](/public/images/resume-scan-2.gif)

Note: Direct file preview thumbnails are generated from your uploaded PDF and stored locally in your Puter drive.

## Tech Stack
- React Router (v7 app template) – client-side routing
- TypeScript – types and safety
- Tailwind CSS – styling
- Puter.js – Auth, File System (fs), Key-Value (kv), and AI services
- Vite – dev server & build tooling

## Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- A browser environment that loads Puter.js (the app expects `window.puter` at runtime)

### Installation
```bash
npm install
```

### Development
Start the dev server with HMR:
```bash
npm run dev
```
The app typically runs at http://localhost:5173.

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Usage Guide

### Home
- Publicly accessible. Shows the tagline and sample resumes when there’s no history.
- If signed in and you have saved analyses, your latest resumes are displayed.

### Upload & Analyze
- Navigate to Upload.
- Fill in Company Name, Job Title, and Job Description.
- Upload your resume (PDF). The app:
  - Uploads the PDF to Puter.fs
  - Converts the first page to an image preview
  - Calls Puter.ai.chat with a structured prompt
  - Saves interim and final data to Puter.kv under keys like `resume:<uuid>`
- You’ll be redirected to the review page once analysis is completed.

### Review Resume
- Route: `/resume/:id`
- Shows a preview image (click to open PDF) and structured feedback sections:
  - ATS
  - Tone & Style
  - Content
  - Structure
  - Skills

### Profile Menu & History
- When signed in, click the avatar in the Navbar to open the profile menu.
- See up to 5 recent resume analyses and navigate to any of them quickly.
- Sign out from here or go to the Wipe App Data screen.

### Wipe App Data
- Route: `/wipe`
- Auth required. Shows counts of files in root and saved resumes in KV.
- Type `wipe` to confirm, then click "Wipe App Data" to delete all files and flush KV.

## Configuration Notes
- SSR is disabled in `react-router.config.ts` (SPA mode):
  ```ts
  export default { ssr: false };
  ```
- Puter.js is required at runtime. The zustand store in `app/lib/puter.ts` waits for `window.puter` and surfaces helpful error messages (e.g., "Puter.js not available").
- Resume KV keys follow the pattern `resume:<uuid>`. Listing uses `kv.list('resume:*', true)` to fetch values.

## Available Scripts
- `dev` – Start development server with HMR
- `build` – Build for production
- `preview` – Preview the production build locally

Refer to `package.json` for the full list.

## Troubleshooting
- Puter.js not available / auth issues
  - Ensure the app runs in an environment where `window.puter` is injected.
  - The store retries for up to 10 seconds; check console for errors.
- No resumes appear on Home
  - Confirm that your uploads succeeded and KV contains keys like `resume:<uuid>`.
- Stuck on auth page after sign in
  - The app uses `/auth?next=/desired/path` for redirection. Ensure the `next` query param is present when navigating to `/auth`.

## Contributing
Contributions are welcome! Please open an issue to discuss improvements or submit a PR with a clear description of changes.

## License
This project is provided as-is. If you need a formal license, add it here (e.g., MIT) and include a LICENSE file.

## Acknowledgements
- © 2025 Deivyansh Singh
- Built with React Router, Tailwind, and Puter.js APIs.
