# Sushrusa E-Clinic Frontend

A modern telemedicine and e-clinic platform built with React, TypeScript, and Vite.

**Live URL**: https://sushrusa-eclinic.netlify.app/

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui (UI components)
- React Router v6 (routing)
- TanStack Query (server state)
- React Hook Form + Zod (forms & validation)
- Axios (HTTP client)
- Recharts (charts)
- jsPDF + html2canvas (PDF generation)

## Prerequisites

- Node.js >= 18.x
- npm or bun

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/bmahakud/SushrusaEClinicFrontEnd.git
cd SushrusaEClinicFrontEnd
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Environment configuration

Create a `.env` file in the root directory and set your backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:8000
```

> For production, point this to your deployed backend URL.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 5. Build for production

```bash
npm run build
```

Output goes to the `dist/` folder.

### 6. Preview production build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Route-level page components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and API client setup
├── types/            # TypeScript type definitions
└── main.tsx          # App entry point
public/               # Static assets
```

## Key Features

- Patient registration, login, and profile management
- Doctor discovery and appointment booking
- Slot management system
- Online consultation workflow
- Prescription generation and PDF export
- Role-based dashboards (Patient / Doctor / Admin)

## API Documentation

See the following guides for backend integration details:

- `API_INTEGRATION_GUIDE.md` — general API usage
- `API_ENDPOINTS_LIST.md` — full endpoint reference
- `PRESCRIPTION_INTEGRATION_GUIDE.md` — prescription flow
- `SLOT_SYSTEM_README.md` — slot booking system
- `DEPLOYMENT_GUIDE.md` — deployment instructions

## Linting

```bash
npm run lint
```

## Deployment

The frontend is deployed on Netlify. See `DEPLOYMENT_GUIDE.md` for full deployment steps.
