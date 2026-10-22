# SoundVault Showcase

A public portfolio demonstration of **SoundVault**, a music library and streaming application built with React, JavaScript, Node.js, and Express.

This showcase is a smaller, independent version of the private SoundVault project, designed to demonstrate frontend development, REST API integration, relational database operations, music playback, and deployment on Cloudflare.

## Live Demo

**[Launch SoundVault Showcase](https://soundvault-showcase.pages.dev/)**

Visitors can explore the application without creating an account.

## Demo Features

- Browse a music library containing four playable recordings.
- Stream real audio files with playback controls.
- Manage a playback queue.
- Favorite and unfavorite recordings.
- Create, rename, and delete playlists.
- Add, remove, and reorder recordings within playlists.
- Use isolated demo sessions without registration.
- Preserve playlists and favorites across page refreshes.
- Reset personal demo data without affecting other visitors.
- Automatically expire demo sessions after seven days.
- Access music attribution and licensing information.

The demo includes four recordings by Kevin MacLeod, licensed under Creative Commons Attribution 4.0.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Cloudflare Workers
- Node.js-compatible Express
- REST APIs
- Cloudflare Pages Functions

### Database
- Cloudflare D1
- SQLite-based relational database
- SQL migrations

### Hosting and Deployment
- Cloudflare Pages — frontend hosting
- Cloudflare Workers — backend API
- Cloudflare D1 — database
- Cloudflare Pages static assets — audio hosting
- GitHub — source control
- GitHub Actions — frontend linting/build checks and server dependency installation

## Demo Architecture

SoundVault Showcase uses a React frontend hosted on Cloudflare Pages and an Express API running inside a Cloudflare Worker.

Frontend API requests are forwarded to the Worker through a Cloudflare Pages Function using a service binding.

The Worker communicates with Cloudflare D1 to retrieve music metadata and manage visitor-specific information.

### Demo Sessions

Each visitor receives an isolated demo session identified by a secure, HTTP-only cookie.

- No registration or login is required.
- Playlists and favorites are associated with individual demo sessions.
- Demo data persists across page refreshes while the session remains valid.
- Sessions expire after seven days.
- A scheduled Cloudflare Worker task removes expired demo data.
- The Reset Demo feature clears the current visitor's playlists, favorites, and listening history without affecting other visitors.

### Music Playback

Audio recordings are served as static MP3 files through Cloudflare Pages.

Recording metadata is stored in D1, while the React player handles playback controls and queue management.

### API Protection

The public API includes request rate limiting for operations that modify demo data.

The application separates public music information from visitor-specific data and uses session-scoped database operations.

## Local Development

Install dependencies from the project root:

```bash
npm run install:all
```

Start the React frontend and Cloudflare Worker development server:

```bash
npm run dev
```

The React application uses Vite, while the backend uses Wrangler to simulate the Cloudflare Workers environment locally.

Local D1 migrations can be managed using Wrangler.

## Relationship to Private SoundVault

The full private SoundVault application uses React, Node.js, Express, PostgreSQL, and Sequelize.

It includes additional functionality such as local music library scanning, importing recordings, metadata matching, authentication, and user-specific music management.

The public showcase is independent of the private installation and does not access its database, music library, infrastructure, or credentials.

Selected features from the private application may be adapted for the public showcase over time.

## Development Status

**Current status: Public showcase deployed and operational.**

### Possible Future Improvements

- Album and release browsing
- Multiple artist credits per recording
- Library search and filtering
- Additional sample recordings
- Further interface and accessibility improvements
- Expanded automated testing

## Music Attribution

The demo features music by **Kevin MacLeod** from [Incompetech](https://incompetech.com/music/royalty-free/).

Tracks included:

- Morning
- Ether Disco
- Happy Alley
- Mesmerizing Galaxy Loop

All four recordings are licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).

The original audio recordings have not been modified.

## Project Goals

SoundVault Showcase demonstrates practical full-stack development through a publicly accessible, interactive music application.

The project highlights React component development, REST APIs, relational databases, session management, deployment, and integration with Cloudflare services.

The application is designed to operate within Cloudflare's free-tier usage limits through a small demonstration dataset and controlled resource usage.

The full private SoundVault application remains the primary project, with selected improvements adapted into the public showcase over time.