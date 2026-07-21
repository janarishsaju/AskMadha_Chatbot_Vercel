# Ask Madha - Catholic Spiritual Companion

A deeply compassionate, theologically grounded Catholic spiritual guide mobile application built with React Native and Expo. Ask Madha serves as your personal spiritual director, offering guidance rooted in Catholic Catechism, Sacred Scripture, the writings of the Saints, and daily liturgy.

The mobile app communicates with the [Ask Madha backend](https://github.com/deepflockai/ask-madha) for AI chat streaming, Bible search, daily verses, and streak tracking. Authentication is handled via Supabase.

## 🙏 Features

### Core Functionality
- **AI-Powered Spiritual Guidance**: Streaming chat with an AI companion trained in Catholic theology, with inline verse references shown as tappable expandable pills
- **Daily Bread**: Daily scripture verse presented in a hero-style gradient card with a call-to-action to discuss in chat
- **Bible Search**: Search verses by keyword or topic with suggestion chips and result cards
- **Streak Tracking**: Calendar-based spiritual journey tracking with gradient visited days, longest streak, and total visits
- **Chat History**: Browse, rename, and delete past conversations with accent-bar cards and conversation count
- **Community** (Coming Soon): Prayer requests and community support
- **Multi-language Support**: English and Tamil (தமிழ்)

### UI Highlights
- Gradient hero cards for daily verse and streak stats
- Expandable verse reference pills in chat messages
- AI avatar with gradient circle in typing indicator
- Suggestion cards in chat empty state for quick prompts
- Custom sign-out confirmation dialog with loading state
- Page headers with subtitles on search and daily bread screens
- Light and dark themes with smooth transitions

## 🛠 Tech Stack

### Frontend
- **React Native** 0.85.3
- **Expo SDK** 56.0.0
- **TypeScript** 6.0.3
- **React Navigation** v7 (Bottom Tabs + Native Stack)

### State Management & Data
- **Zustand** 5.0.13 - Lightweight state management with AsyncStorage persistence
- **AsyncStorage** - Local data persistence for chat sessions and user preferences
- **Expo Secure Store** - Secure credential storage for auth tokens

### Backend & APIs
- **Supabase** - Authentication (email/password) and user profiles
- **Ask Madha API** - AI chat streaming, Bible search, daily verses, streak tracking (see `EXPO_PUBLIC_API_BASE_URL`)

### UI/UX
- **Expo Linear Gradient** - Gradient cards, buttons, and hero elements
- **React Native Reanimated** 4.4.0 - Smooth message entry animations
- **React Native Markdown Display** - Rich text rendering for AI responses
- **Expo Image** - Optimized image handling for avatars
- **Expo Haptics** - Tactile feedback on send and interactions
- **Expo Fonts** - Custom typography (EB Garamond, Crimson Pro)
- **@expo/vector-icons** (Ionicons) - Consistent icon system

### Additional Libraries
- **date-fns** 4.3.0 - Date formatting and relative time
- **react-native-safe-area-context** - Safe area insets for notch/tab bar handling
- **react-native-gesture-handler** - Touch and gesture handling

## 📱 Screens

### Tab Screens (Bottom Navigation)
1. **Chat** (`ChatScreen.tsx`) - AI spiritual companion conversation with streaming responses, suggestion cards in empty state, and expandable verse pills
2. **Bread** (`DailyBreadScreen.tsx`) - Daily verse in a hero-style gradient card with CTA to discuss in chat
3. **Search** (`SearchBibleScreen.tsx`) - Bible verse search with suggestion chips, result count, and styled result cards
4. **Community** (`CommunityScreen.tsx`) - Prayer requests and community support (coming soon)

### Stack Screens (Push Navigation)
5. **Chat History** (`ChatHistoryScreen.tsx`) - Browse, rename, and delete past conversations with accent-bar cards
6. **Settings** (`SettingsScreen.tsx`) - Gradient profile card, theme selection, language, book filter, streak shortcut, and custom sign-out dialog
7. **Streak** (`settings/StreakScreen.tsx`) - Hero streak card with gradient calendar visited days and motivational message
8. **Theme Selection** (`ThemeSelectionScreen.tsx`) - Choose between light and dark themes
9. **About** (`settings/AboutScreen.tsx`) - App information and credits
10. **Help Center** (`settings/HelpCenterScreen.tsx`) - FAQs and support
11. **Delete Account** (`settings/DeleteAccountScreen.tsx`) - Account deletion flow
12. **Rate App** (`settings/RateAppScreen.tsx`) - App store rating prompt

### Auth Screens
13. **Login** (`auth/LoginScreen.tsx`) - Email/password login with Supabase auth
14. **Signup** (`auth/SignupScreen.tsx`) - New account registration

## 🚀 Getting Started

### Prerequisites
- **Node.js v24.16.0** (pinned via `.nvmrc`)
- npm
- Expo CLI (installed automatically via npx)
- iOS Simulator (macOS with Xcode) or Android Emulator (Android Studio)
- CocoaPods (for iOS builds, macOS only)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/deepflockai/ask-madha.git
cd ask-madha
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the values:

```env
# API base URL for the Ask Madha backend
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# Supabase (find in your Supabase dashboard > Project Settings > API)
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

4. **Install iOS dependencies** (macOS only)
```bash
npx expo run:ios
```

### Running the App

**iOS (simulator):**
```bash
npx expo run:ios
```

**Android (emulator):**
```bash
npx expo run:android
```

**Expo Go (limited — no native modules):**
```bash
npx expo start
```

> **Note**: Use `nvm use` to ensure Node v24.16.0 is active before running.
> A `development-prerequisite.sh` script is available to verify your environment.

### Building for Production

#### Using EAS Build

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Build for iOS**
```bash
eas build --profile production --platform ios
```

4. **Build for Android**
```bash
eas build --profile production --platform android
```

## 📂 Project Structure

```
ask-madha/
├── src/
│   ├── components/
│   │   ├── chat/                # Chat UI components
│   │   │   ├── ChatInputBar.tsx     # Input bar with gradient send button
│   │   │   ├── MessageBubble.tsx    # Message rendering with verse pills
│   │   │   └── TypingIndicator.tsx  # Animated AI avatar + bouncing dots
│   │   └── common/              # Shared UI components
│   │       ├── AppHeader.tsx       # Reusable header with avatar/back button
│   │       ├── AvatarCircle.tsx   # User avatar with fallback initials
│   │       ├── ComingSoon.tsx     # Placeholder for upcoming features
│   │       └── ErrorBoundary.tsx  # Error boundary wrapper
│   ├── hooks/
│   │   └── useTypewriter.ts    # Typewriter effect for streaming text
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Root navigator (auth vs app stack)
│   │   ├── AuthNavigator.tsx   # Login/Signup stack
│   │   └── TabNavigator.tsx    # Bottom tab bar (Chat, Bread, Search, Community)
│   ├── screens/
│   │   ├── ChatScreen.tsx          # Main AI chat with streaming + suggestions
│   │   ├── ChatHistoryScreen.tsx   # Conversation list with rename/delete
│   │   ├── DailyBreadScreen.tsx    # Daily verse hero card
│   │   ├── SearchBibleScreen.tsx   # Bible search with chips + result cards
│   │   ├── CommunityScreen.tsx     # Community (coming soon)
│   │   ├── JourneyScreen.tsx       # Journey (coming soon)
│   │   ├── SettingsScreen.tsx      # Settings with gradient profile card
│   │   ├── ThemeSelectionScreen.tsx
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   └── settings/
│   │       ├── StreakScreen.tsx        # Streak calendar with gradient days
│   │       ├── AboutScreen.tsx
│   │       ├── HelpCenterScreen.tsx
│   │       ├── DeleteAccountScreen.tsx
│   │       └── RateAppScreen.tsx
│   ├── services/
│   │   ├── madhaApi.ts         # API client (chat, search, daily verse, streak)
│   │   ├── supabase.ts        # Supabase client setup
│   │   └── tokenStorage.ts    # Secure token storage via Expo Secure Store
│   ├── store/
│   │   ├── useAuthStore.ts    # Auth state (session, profile, sign in/out)
│   │   ├── useChatStore.ts    # Chat state (messages, streaming, sessions)
│   │   └── useThemeStore.ts   # Theme preference (light/dark)
│   ├── theme/
│   │   ├── ThemeContext.tsx   # Theme provider
│   │   ├── themes.ts          # Light & dark color definitions
│   │   └── tokens.ts          # Design tokens (typography, spacing, radius, shadows)
│   ├── types/
│   │   └── index.ts           # Shared TypeScript types (Message, Profile, etc.)
│   └── utils/
│       └── haptics.ts         # Haptic feedback helpers
├── assets/                    # App icon, splash, favicon, adaptive icons
├── prompts/                   # AI prompt templates
├── ios/                       # Native iOS project
├── app.config.ts              # Expo configuration (bundle ID, plugins, extra)
├── eas.json                   # EAS Build profiles (development, preview, production)
├── App.tsx                    # Root component (fonts, splash, providers, navigator)
├── index.ts                   # App entry point
├── package.json
├── tsconfig.json
├── .nvmrc                     # Node v24.16.0
└── development-prerequisite.sh # Environment verification script
```

## 🎨 Design System

### Themes
- **Light** - Warm, parchment-inspired palette
- **Dark** - Deep, contemplative palette

### Typography
- **Serif**: EB Garamond (headings, scripture, verse text)
- **Serif SemiBold/Bold**: Emphasized headings and verse references
- **Serif Italic**: Verse text in expanded pills and blockquotes
- **Sans**: Crimson Pro (UI labels, metadata, buttons)

### Design Tokens (`src/theme/tokens.ts`)
- **Spacing**: `xxs` through `xxxl` scale
- **Radius**: `sm`, `md`, `lg`, `xl`, `full`
- **Shadows**: `sm`, `md` for card elevation
- **Typography**: Font families, sizes (`xs`–`hero`), line heights

### Gradients
- Primary gradient used for hero cards, send button, verse pills, and profile card
- Defined per-theme via `gradientFrom`, `gradientVia`, `gradientTo` color tokens

## 🔐 Security

- `EXPO_PUBLIC_*` vars are inlined at build time (not secret, safe for client)
- Auth tokens stored via Expo Secure Store (Keychain/Keystore)
- Supabase Row Level Security (RLS) policies on backend
- HTTPS-only API communication in production
- `.env` is gitignored

## 📝 Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Ask Madha backend API URL |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key |

See `.env.example` for reference.

## 🏗 EAS Build Profiles

| Profile | Distribution | API URL |
|---------|-------------|--------|
| `development` | Internal (simulator) | Dev deployment |
| `preview` | Internal (device) | Dev deployment |
| `production` | Store | `www.askmadha.com` |

```bash
# Development build (simulator)
eas build --profile development --platform ios

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Catholic Church teachings and traditions
- Supabase for authentication infrastructure
- Expo team for the amazing framework
- React Native community

## 📧 Contact

For questions or support, please open an issue on [GitHub](https://github.com/deepflockai/ask-madha).

---

**Built with ❤️ and 🙏 for the Catholic community**
