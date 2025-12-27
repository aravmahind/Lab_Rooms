# LabRooms

LabRooms is a collaborative workspace application designed to facilitate real-time code sharing, file management, whiteboarding, and team communication. It provides a seamless experience for developers and teams to collaborate effectively in a virtual environment.

## Features
- **Code Sharing**: Share and edit code in real-time with syntax highlighting and language detection.
- **File Management**: Upload, view, and download files directly in the workspace.
- **Whiteboard**: Collaborate visually with an interactive whiteboard.
- **Team Chat**: Communicate with team members using the built-in chat feature.
- **Room Management**: Create, join, and manage rooms with unique codes.
- **Cloud Integration**: File uploads are stored securely using Cloudinary.

---

## 🏗 System Architecture

LabRooms follows a **modular full-stack architecture** with a clear separation between frontend, backend, database, and cloud services.  
This design ensures scalability, maintainability, and real-time collaboration performance.

### High-Level Architecture Diagram

![LabRooms Architecture](./docs/architecture.png)

### Architecture Overview
- **Frontend (React + TypeScript)**  
  Handles user interface, real-time collaboration features, and communication with the backend.

- **Backend (Node.js + Express)**  
  Provides REST APIs for authentication, room management, file handling, and collaboration logic.

- **Database (MongoDB)**  
  Stores user data, room information, messages, and file metadata.

- **Cloudinary**  
  Used for secure cloud-based file storage and retrieval.

---

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/LabRooms.git
   ```
2. Navigate to the project directory:
   ```bash
   cd LabRooms
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     VITE_API_URL=http://localhost:5000
     VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
     VITE_CLOUDINARY_API_KEY=your_api_key
     VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
     MONGO_URI=your_mongo_connection_string
     ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Socket.IO
- **Backend**: Node.js, Express, MongoDB
- **Cloud Services**: Cloudinary for file storage
- **Editor**: Monaco Editor for code editing

## Folder Structure
```
LabRooms/
├── backend/                # Backend code
│   ├── controllers/        # API controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Express server setup
├── frontend/               # Frontend code
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # Tailwind CSS styles
│   │   └── main.tsx        # React entry point
│   └── public/             # Static assets
└── README.md               # Project documentation
```

## Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the project for production.
- `npm start`: Start the production server.

