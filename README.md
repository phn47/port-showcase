# 9F Universe

An avant-garde contemporary art portfolio featuring parallax scrolling, magnetic interactions, and a stark black-and-white aesthetic.

## Tech Stack

- **React 19**: Modern UI library for building user interfaces.
- **TypeScript**: Static typing for better developer experience and code verification.
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Framer Motion**: Production-ready animation library.
- **Lucide React**: Beautiful & consistent icons.

## Project Structure

The project has been refactored for scalability:

```text
src/
├── components/
│   ├── layout/    # Navigation, Footer
│   ├── sections/  # Hero, Gallery, Timeline, etc.
│   ├── ui/        # Reusable UI (Buttons, Marquee, Cursor)
│   └── common/    # Utilities (Preloader)
├── data/          # Static data assets (JSON/TS)
├── App.tsx        # Main application entry
├── index.css      # Global styles & Tailwind directives
└── index.tsx      # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env.local` file.
   - Add your keys (e.g., `GEMINI_API_KEY`) if using AI features.

### Development

Start the local development server:

```bash
npm run dev
```

### Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Features

- **Preloader**: Progressive loading with visual feedback.
- **Custom Cursor**: Magnetic interactions and custom states.
- **Parallax Scroll**: Smooth scrolling effects using Framer Motion.
- **Interactive Gallery**: Filterable and searchable artwork showcase.
- **Floating Controls**: Quick access chat and scroll-to-top.
