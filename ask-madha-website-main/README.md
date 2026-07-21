# Ask Madha Website

An AI-powered Bible companion web app built with [Next.js](https://nextjs.org) (App Router), [React 19](https://react.dev), and [Tailwind CSS v4](https://tailwindcss.com). The app provides scripture-based guidance through conversational AI, daily verses, Bible search, and user engagement tracking.

## Pages

### Marketing

- **Home** (`/`) — Hero, features, how it works, and download CTAs.
- **Download** (`/download`) — App Store and Google Play links.
- **About** (`/about`) — Mission and values.
- **FAQ** (`/faq`) — Expandable frequently asked questions with smooth animations.
- **Contact** (`/contact`) — Support contact form.
- **Privacy Policy** (`/privacy`)
- **Terms & Conditions** (`/terms`)

### App (Authentication Required)

- **Chat** (`/chat`) — Conversational AI interface with streaming responses, biblical verse references displayed as expandable pill cards, typewriter effect, and suggestion prompts.
- **Chat History** (`/chat/history`) — Browse, rename, and delete past conversations with custom confirmation dialogs.
- **Bible** (`/bible`) — Daily verse with an elegant hero card design.
- **Search** (`/search`) — Search the Bible by keyword, book name, or topic with suggested searches and rich result cards.
- **Settings** (`/settings`) — Manage profile, language (English/Tamil), book filter, theme, and account.
- **Streak** (`/settings/streak`) — Daily engagement tracker with a calendar grid showing visited days.
- **Help** (`/settings/help`) — Help center.
- **About App** (`/settings/about`) — About the app.
- **Rate** (`/settings/rate`) — Rate the app.
- **Delete Account** (`/settings/delete-account`) — Account deletion flow.

### Authentication

- **Login** (`/login`) — Sign in with email and password.
- **Sign Up** (`/signup`) — Create a new account.
- **Forgot Password** (`/forgot-password`) — Password reset flow.

## Features

- **Streaming AI Chat** — Server-Sent Events (SSE) based streaming with typewriter effect, biblical verse extraction, and expandable verse reference cards.
- **Bilingual Support** — AI responses in English and Tamil with language toggle.
- **Book Filter** — Filter AI responses to specific Bible books.
- **Daily Verse** — Automatically fetched verse of the day with a beautiful card layout.
- **Bible Search** — Full-text search with keyword suggestions and rich result display.
- **Streak Tracking** — Calendar-based daily engagement tracker with current/longest streak stats.
- **Chat History** — Persistent conversation storage with rename and delete (with confirmation dialog).
- **Dark/Light Theme** — Manual toggle with system preference fallback and localStorage persistence.
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop.
- **SEO** — Metadata, Open Graph image, sitemap, and robots.txt.
- **Static Export** — Configured for easy hosting on any platform.

## Tech Stack

| Category | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 (CSS-variable-based design tokens) |
| Auth & Database | Supabase |
| Markdown | React Markdown |
| Icons | Custom SVG icon components |

## Project Structure

```
src/
├── app/
│   ├── about/              # About page
│   ├── api/                # API routes
│   │   ├── auth/           # Auth endpoints (login, signup, etc.)
│   │   ├── bible/          # Bible verse & search endpoints
│   │   ├── health/         # Health check
│   │   ├── sessions/       # Chat session CRUD + streaming
│   │   └── streak/         # Streak tracking endpoint
│   ├── bible/              # Daily verse page
│   ├── chat/               # Chat interface + history
│   ├── contact/            # Contact form
│   ├── download/           # Download links
│   ├── faq/                # FAQ page
│   ├── forgot-password/    # Password reset
│   ├── login/              # Login page
│   ├── privacy/            # Privacy policy
│   ├── search/             # Bible search
│   ├── settings/           # Settings + sub-pages (streak, help, about, rate, delete)
│   ├── signup/             # Sign up page
│   ├── terms/              # Terms & conditions
│   ├── globals.css         # Global styles & design tokens
│   ├── layout.js           # Root layout
│   └── page.js             # Home page
├── components/
│   ├── chat/               # Chat components (MessageBubble, ChatInputBar, TypingIndicator)
│   ├── AppNavbar.js        # App navigation bar (authenticated)
│   ├── Navbar.js           # Marketing navigation bar
│   ├── AuthGuard.js        # Route protection wrapper
│   ├── AvatarCircle.js     # User avatar
│   ├── FAQContent.js       # FAQ accordion with animations
│   ├── Footer.js           # Marketing footer
│   ├── ThemeToggle.js      # Dark/light theme toggle
│   └── icons.js            # SVG icon library
├── hooks/
│   └── useTypewriter.js    # Typewriter effect for streaming chat
└── lib/
    ├── AuthProvider.js     # Auth context provider
    ├── api.js              # API client (auth, chat, Bible, streak)
    ├── auth.js             # Auth utilities
    ├── cors.js             # CORS middleware
    ├── proxy.js            # API proxy utilities
    └── supabaseAdmin.js    # Supabase admin client
```

## Design System

The app uses Tailwind CSS v4 with CSS-variable-based design tokens defined in `src/app/globals.css`:

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `--primary` | `#7c3aed` | `#8b5cf6` | Purple — primary actions, links |
| `--secondary` | `#ec4899` | `#ec4899` | Pink — gradient accents |
| `--accent` | `#f59e0b` | `#fbbf24` | Amber — streaks, highlights |
| `--background` | `#f8fafc` | `#020617` | Page background |
| `--surface` | `#ffffff` | `#0f172a` | Cards, inputs |
| `--border` | `#e2e8f0` | `#1e293b` | Borders, dividers |

The gradient (`gradient-bg` class) flows from primary → secondary → accent.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Environment Variables

The following environment variables are required for the app to function:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) |
| `ALB_BASE_URL` | Backend ALB URL for API proxy |

## Deploy

The project can be deployed to any platform that supports Next.js:

- **Vercel** — Recommended, zero-config deployment
- **Netlify** — Supported via Next.js adapter
- **Cloudflare Pages** — Supported via Next.js adapter
- **Self-hosted** — Run `npm run build` and serve the output

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Markdown](https://github.com/remarkjs/react-markdown)

