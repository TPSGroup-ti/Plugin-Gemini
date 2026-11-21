# Plugin-Gemini — Gemini Borderless World & AI Plugin Hub

**Plugin-Gemini** is a modular AI plugin and public AI spawning platform built around the Gemini ecosystem, designed for deployment on **Netlify** with continuous updates synced from **GitHub** (`seperneng-spec/Plugin-Gemini`) and operated under **TPS Group** (Ban Pao, Lampang, Thailand).

It provides a two-state web experience on `index.html`:
1. **Before Login (Showcase View):** Presents the **Gemini Borderless World** hero interface, core pillars (**Create**, **Connect**, **Secure**), an interactive ecosystem diagram, and system overview details.
2. **After Login (Plugin Hub & AI Studio View):** Unlocks plugin usage instructions, installation steps, a copyable **Plugin-Gemini Embed SDK**, model version switching (`gemini-2.5-flash` and `gemini-2.5-pro`), a **Child AI Spawner** for creating and using custom AI personas, and a live execution console powered by Gemini, Google Search grounding, external Public APIs, and GitHub plugin modules.

---

## Key Features

* **Gemini + Google Capabilities:** Connects to Gemini models via `@google/genai` with optional real-time **Google Search** grounding and customizable system instructions.
* **Extensible GitHub Plugin Architecture:** Add or update modules inside `plugins/manifest.json` and `plugins/core_tools.js` on GitHub so new capabilities are surfaced and executed automatically.
* **Public AI Spawner:** Users can define custom AI names, system prompts, and model versions to create specialized sub-agents for immediate use.
* **Public API Bridge:** Optionally attach a public API endpoint URL during execution to inject live external JSON data into Gemini prompts.
* **Authentication (Google OAuth 2.0 + Email):** Supports Google Identity Services token verification (`google-auth-library`) alongside email sign-in.
* **Serverless API Key Protection:** Keeps `GEMINI_API_KEY` and `GOOGLE_CLIENT_ID` inside environment variables on Netlify Functions rather than exposing secrets in client-side code.
* **Automated GitHub Verification:** Includes a GitHub Actions workflow (`.github/workflows/plugin-gemini-ci.yml`) that runs syntax and JSON checks on pushes to `main`.

---

## Project Structure

```text
Plugin-Gemini/
├── .gitignore
├── .env.example
├── netlify.toml
├── package.json
├── README.md
├── .github/
│   └── workflows/
│       └── plugin-gemini-ci.yml
├── plugins/
│   ├── manifest.json
│   └── core_tools.js
├── netlify/
│   └── functions/
│       └── plugin-gemini.js
└── public/
    └── index.html
```

---

## Installation & Setup

### 1. Clone or Initialize the Repository

```bash
git clone [https://github.com/seperneng-spec/Plugin-Gemini.git](https://github.com/seperneng-spec/Plugin-Gemini.git)
cd Plugin-Gemini
```

If starting from a fresh local folder, initialize Git and connect to your GitHub repository:

```bash
git init
git add .
git commit -m "Release Plugin-Gemini Borderless World v1.0"
git branch -M main
git remote add origin [https://github.com/seperneng-spec/Plugin-Gemini.git](https://github.com/seperneng-spec/Plugin-Gemini.git)
git push -u origin main
```

### 2. Install Dependencies (Local Development / CLI)

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` for local testing, and configure the same variables in your **Netlify** site settings under **Site configuration > Environment variables**:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GITHUB_OWNER=seperneng-spec
GITHUB_REPO=Plugin-Gemini
```

> **Security Note:** Never commit `.env` containing live API keys or secrets to a public GitHub repository.

### 4. Set Up Google OAuth 2.0 (Optional for Real Google Sign-In)

1. Open the **Google Cloud Console** and navigate to **APIs & Services > Credentials**.
2. Create an **OAuth client ID** of type **Web application**.
3. Add your development URL (e.g., `http://localhost:8888`) and your live Netlify URL (e.g., `https://your-site.netlify.app`) to **Authorized JavaScript origins**.
4. Set the generated Client ID as `GOOGLE_CLIENT_ID` in your environment variables.

### 5. Deploy to Netlify

1. Log in to **Netlify** and select **Add new site > Import an existing project > GitHub**.
2. Choose `seperneng-spec/Plugin-Gemini`.
3. Netlify reads `netlify.toml` automatically (`publish = "public"`, `functions = "netlify/functions"`, and `/api/*` redirect rules).
4. Add `GEMINI_API_KEY` (and `GOOGLE_CLIENT_ID` if configured) in **Environment variables**, then trigger a deploy.

---

## How to Use the Plugin

### In the Web Interface

1. Open the deployed `index.html` page and click **LOGIN** (or **EXPLORE NOW / LOGIN**).
2. Sign in using Google or Email.
3. Switch to **วิธีใช้ Plugin, วิธีติดตั้ง & โค้ดของ Plugin** to view loaded GitHub modules and copy the generated embed snippet.
4. Switch to **ใช้งาน Plugin-Gemini & สร้าง AI สาธารณะ** to:
   * Select the Gemini model version (`gemini-2.5-flash` or `gemini-2.5-pro`).
   * Create and select custom child AIs with tailored system instructions.
   * Toggle **Google Search** or pass a **Public API URL**.
   * Send prompts and inspect responses.

### Embedding the Plugin in Another Website

After logging in on the portal, copy the personalized snippet or use the following client call pointing to your deployed endpoint:

```html
<script>
async function callPluginGemini(promptText, options = {}) {
  const response = await fetch("/api/plugin-gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: options.email || "user@example.com",
      prompt: promptText,
      modelVersion: options.model || "gemini-2.5-flash",
      customSystemPrompt: options.systemPrompt || "",
      publicApiUrl: options.publicApiUrl || "",
      useGoogleSearch: options.googleSearch !== false
    })
  });
  return await response.json();
}
</script>
```

### Adding New Capabilities via GitHub

1. Add helper functions in `plugins/core_tools.js`.
2. Register new modules or supported models in `plugins/manifest.json`.
3. Commit and push to the `main` branch on GitHub.
4. GitHub Actions validates the code automatically, and Netlify redeploys the updated site and serverless function.

---

## License & Attribution

Developed for **TPS Group** (`Cristal71 Ban Pao, Lampang, Thailand`). All rights reserved.
