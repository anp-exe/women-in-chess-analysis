# Women in Chess — scrollytelling site

Personal data journalism project exploring women in competitive chess, built as a scroll essay with inline interactive charts.

## Setup (10 minutes, one time)

### 1. Install Node.js

Download the LTS version from https://nodejs.org. Install with defaults.

Verify it worked — open a terminal and run:

```bash
node --version
npm --version
```

Both should print version numbers.

### 2. Install dependencies

In this folder, open a terminal and run:

```bash
npm install
```

Takes ~2 minutes. Installs Next.js, React, Recharts, Tailwind.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser. You should see the site.

Any time you edit a file, the site auto-reloads. Ctrl+C in the terminal to stop it.

## Deploying to Vercel (free, 5 minutes)

### Option A — one click

1. Push this folder to a new GitHub repo
2. Go to https://vercel.com and sign in with GitHub
3. Click "Add New Project", pick this repo
4. Click "Deploy"

That's it. Vercel gives you a free URL like `women-in-chess-anna.vercel.app`.

### Option B — CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts.

## Editing the content

Everything is in `src/app/page.tsx`. That single file holds:

- All the copy (text paragraphs)
- All the data (arrays at the top of the file)
- All the chart configuration
- The about section

To change a stat, find the relevant array at the top and edit it. To change text, scroll to the matching JSX section further down.

## Updating the styling

`tailwind.config.js` holds the matcha color palette. Change any value there and it propagates across the whole site.

Fonts are loaded from Google Fonts at the top of `src/app/globals.css` — swap them by editing the `@import` URL.

## Structure

```
chess-site/
├── src/
│   └── app/
│       ├── layout.tsx      Root HTML wrapper
│       ├── page.tsx        Main scroll essay (all content here)
│       └── globals.css     Typography, colours, fade animations
├── tailwind.config.js      Matcha colour palette
├── package.json            Dependencies
└── README.md               This file
```

## Stack

- **Next.js 14** — React framework
- **Recharts** — charts (React wrapper over D3)
- **Tailwind CSS** — utility-first styling
- **TypeScript** — type safety

No database, no backend. All data is inline in the page component.
