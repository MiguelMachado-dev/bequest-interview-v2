# Bequest Interview Question

![Bequest Document Editor](https://github.com/user-attachments/assets/8a6af3ec-b5d0-43c1-af3f-09b572b9f41d)

## Project Overview

This is a document editor application built with NestJS (backend) and React (frontend). The application allows users to create, edit, and manage legal documents with the ability to add and remove clauses.

### Features

- **Document Management**: Create, read, update, and delete documents
- **Rich Text Editing**: Full-featured document editor using Syncfusion's DocumentEditor
- **Clause Management**: Add and remove predefined legal clauses to documents
- **Real-time Updates**: Changes are saved automatically

### Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Syncfusion Document Editor
- **Backend**: NestJS, TypeORM, SQLite
- **Tools**: Nx (monorepo management)

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application

### Start the Backend Server

```sh
npx nx serve backend
```

The backend API will be available at: http://localhost:3000/api

### Start the Frontend Development Server

```sh
npx nx serve frontend
```

The frontend application will be available at: http://localhost:4200

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get a specific document
- `POST /api/documents` - Create a new document
- `PUT /api/documents/:id` - Update a document
- `DELETE /api/documents/:id` - Delete a document

## Project Structure

```
apps/
├── backend/           # NestJS backend application
│   ├── src/
│   │   ├── app/       # App module
│   │   ├── documents/ # Documents module (CRUD operations)
│   │   └── main.ts    # Application entry point
│   └── .database/     # SQLite database
└── frontend/          # React frontend application
    ├── src/
    │   ├── app/       # Main application components
    │   ├── components/# Reusable UI components
    │   ├── hooks/     # Custom React hooks
    │   └── utils/     # Utility functions
    └── public/        # Static assets
```

## Development

This project uses Nx for monorepo management. You can use Nx commands to run tasks across the workspace:

```sh
# Run tests
npx nx test frontend
npx nx test backend

# Build for production
npx nx build frontend
npx nx build backend
```
