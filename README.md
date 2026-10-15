# SoundVault Showcase

A public portfolio demonstration of SoundVault, a music library and streaming application built with React and JavaScript.

This showcase is a smaller, independent version of the private SoundVault project, designed to demonstrate frontend development, backend APIs, database operations, and music playback.

## Live Demo

Coming soon — Cloudflare deployment in progress.

## Planned Demo Features

- Browse and search a small music library
- Play real sample audio recordings
- Playback controls and queue management
- Favorite and unfavorite recordings
- Create, edit, and delete playlists
- Isolated demo sessions for each visitor
- Persistent demo data across page refreshes
- Reset Demo functionality
- Backend API requests and database CRUD operations

The showcase will contain approximately 5–10 sample recordings and will not require visitors to register personal accounts.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Cloudflare Workers
- Node.js / Express (existing implementation being adapted)
- REST APIs

### Database
- Cloudflare D1 (planned)
- SQLite-based relational data

### Hosting and Deployment
- Cloudflare Free
- Cloudflare Static Assets
- GitHub Actions (planned CI/CD)

## Demo Architecture

The public application will use a small shared library of sample recordings and temporary, isolated visitor sessions.

Visitor-specific data, such as favorites and playlists, will be stored in Cloudflare D1. Visitors will be able to reset their demo session without affecting other users.

Sample audio files will be hosted as static assets and will support actual playback.

The application is designed to operate entirely within Cloudflare's free-tier limits. To maintain a $0 hosting cost, the demo will use limited data, controlled resource usage, and no paid infrastructure.

## Relationship to Private SoundVault

The full private SoundVault application uses React, Node.js, Express, PostgreSQL, and Sequelize.

It includes additional functionality such as local music library scanning, importing recordings, metadata matching, authentication, and user-specific music management.

The public showcase is completely independent of the private installation and does not access its database, music library, infrastructure, or credentials.

## Development Status

**Current phase: Cloudflare Workers foundation completed; D1 migration pending.**

- [x] Establish independent public showcase repository
- [x] Initialize Cloudflare Workers backend
- [x] Test initial authentication and API connectivity
- [ ] Integrate Cloudflare D1
- [ ] Implement isolated visitor sessions
- [ ] Add demo library and playable sample audio
- [ ] Implement public demo functionality
- [ ] Add Reset Demo feature
- [ ] Complete security and functionality testing
- [ ] Configure GitHub Actions CI/CD
- [ ] Deploy and verify live demo

## Project Goals

This showcase is intended to demonstrate practical full-stack development while providing a publicly accessible example of SoundVault.

The full private application remains the primary project, with selected improvements adapted into the public showcase over time.
