# Emotopia: The City of Emotions
### Early Bird Quota & Interactive Event Registration

Welcome to **Emotopia**! This repository contains the full interactive web application, quota booking system, on-site QR pass generator, and hidden administrative portal.

---

## 🚀 How to Run Locally (For You & Your Teacher)

You can run this project locally on **Windows**, **macOS**, or **Linux** in just two standard npm commands:

### Prerequisites
Make sure **Node.js** (version 18 or higher) is installed on your computer. If you don't have it installed yet, download it for free from [nodejs.org](https://nodejs.org).

### Option 1: Quick 1-Click Launch (Windows)
Double-click `start-emotopia.cmd` in the folder. It will automatically check for Node.js, run `npm install` if needed, and start the local server!

### Option 2: Standard Terminal / VS Code Setup
Open your terminal (or open the folder in VS Code and press ``Ctrl + ` `` to open the terminal), then run:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server
npm run dev
```

Then open your browser and navigate to:
👉 **`http://localhost:3000`**

---

## ❓ Frequently Asked Questions & Notes

### What is `bun.lock`?
`bun.lock` is an auto-generated lockfile from the cloud container environment. If you and your teacher are using `npm`, **you can completely ignore or delete `bun.lock`**. Running `npm install` creates your standard `package-lock.json` and works 100% reliably.

### Why were images missing before?
Static images have been relocated directly to `/public/images/` and configured with direct Vite imports. This ensures images will display properly both in `npm run dev` and in production `npm run build` bundles.

### How do I access the Admin Dashboard?
The Admin Dashboard is protected so regular attendees only see the registration site:
1. Navigate to: **`http://localhost:3000/#admin`** (or press `Ctrl + Shift + A` on the page).
2. Enter the host passcode: **`emotopia2026`** (or `emocity2026`).
3. You can configure event dates, daily opening/closing hours, block break periods, scale up the quota for the big event (presets for 50, 150, 300, 500+ attendees), scan QR passes at the entrance, or export guest rosters to CSV.

---

## 🌐 How to Upload to GitHub & Host Online (Free)

Want to publish this so everyone attending your big event can open the link on their mobile phones or computers?

### Step 1: Upload to GitHub
1. Create a free account at [github.com](https://github.com) if you haven't yet.
2. Click **New Repository**, name it `emotopia` (set to Public or Private), and click **Create repository**.
3. In your local `emotopia` folder, open your terminal and run:
```bash
git init
git add .
git commit -m "Emotopia event registration app"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/emotopia.git
git push -u origin main
```

### Step 2: One-Click Free Hosting with Vercel or Netlify
- **Option A (Vercel - Recommended)**:
  1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
  2. Click **Add New Project** -> Select your `emotopia` repository.
  3. Vercel automatically detects Vite:
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
  4. Click **Deploy**. In under a minute, you get a live public link (e.g. `https://emotopia.vercel.app`) with free SSL!

- **Option B (Netlify)**:
  1. Go to [netlify.com](https://netlify.com) and click **Import from Git**.
  2. Choose your repository and click **Deploy Site**.

---

## 🎨 Infographics & Event Flyers
If you have exhibition maps, infographics, or posters from your school or class, you can place them into `/public/images/` or share them with us, and we will integrate them directly into the interactive exhibition guide!
