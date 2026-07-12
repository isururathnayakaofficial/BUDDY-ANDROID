# 📱 Buddy - Easy Day Today

<div align="center">

![React Native](https://img.shields.io/badge/React%20Native-Expo-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-Backend-orange.svg)
![Node.js](https://img.shields.io/badge/Node.js-AI%20Backend-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)
![License](https://img.shields.io/badge/License-MIT-success.svg)

A modern AI-powered personal productivity application built with **React Native (Expo)**, **Firebase**, and **Node.js**, helping users organize daily life, manage notes, track todos, read technology articles, and interact with an intelligent AI assistant.

</div>

---

# 📖 Overview

Buddy is an all-in-one productivity companion designed to simplify everyday life.

The application combines note management, task planning, article discovery, cloud synchronization, and AI assistance into one seamless mobile experience.

Users can securely access their personal workspace from anywhere while all data remains synchronized through Firebase.

---

# 🚀 Download Android App

### 📦 APK Installation

You can install the latest Android build from Expo:

**Android Build**

https://expo.dev/accounts/isuru_rathnayaka/projects/buddy/builds/c578235e-bb76-454f-a225-72b40c8cf11f

---

# ✨ Features

---

## 🔐 Secure Authentication

Buddy provides secure authentication powered by Firebase Authentication.

### Features

- User Registration
- User Login
- Logout
- Secure Sessions
- Password Protection
- User Profile Management
- Protected Routes
- Persistent Authentication

### Technology

- Firebase Authentication
- Firebase SDK
- Secure Token Management

---

# 📝 Smart Notes

Create and manage notes effortlessly with automatic cloud synchronization.

### Features

- Create Notes
- Update Notes
- Delete Notes
- Auto Save
- Rich Note Storage
- Real-time Synchronization
- User Private Notes

### Technology

- Firebase Firestore
- React Native
- Debounced Auto Save

---

# ✅ Todo Management

Stay productive by organizing your daily tasks.

### Features

- Create Todos
- Edit Todos
- Delete Todos
- Complete Tasks
- Daily Planning
- Task Progress Tracking
- Real-time Updates

### Technology

- Firebase Firestore
- React Native State Management

---

# 🤖 AI Assistant

Buddy includes an intelligent AI assistant powered by a dedicated Node.js backend.

Instead of exposing AI API keys inside the mobile application, every AI request is securely processed through the backend.

### AI Features

- AI Chat Assistant
- Productivity Suggestions
- Question Answering
- Smart Recommendations
- Note Assistance
- Writing Assistance
- Content Summarization

---

# 🧠 AI Prompt Keyword Extraction

Before sending prompts to the AI service, Buddy intelligently extracts keywords from user messages.

Example:

Input

```
How can I improve my daily productivity while studying software engineering?
```

Extracted Keywords

```
productivity,
studying,
software engineering,
daily planning
```

These keywords are used for:

- AI context optimization
- Prompt enhancement
- Search indexing
- Recommendation generation
- Faster AI responses

---

# 🌐 External API Integrations

Buddy integrates several third-party APIs to enrich the user experience.

### News APIs

- NewsAPI
- GNews API

Used For

- Technology News
- Startup News
- AI Articles
- Programming Articles
- Industry Updates

---

# ⚙️ Node.js AI Backend

A dedicated backend server securely handles all AI-related operations.

### Responsibilities

- AI Prompt Processing
- Keyword Extraction
- AI API Communication
- Authentication Validation
- Request Filtering
- Prompt Optimization
- Response Formatting

### Backend Stack

- Node.js
- Express.js
- TypeScript
- Firebase Admin SDK

---

# 🔥 Firebase Backend

Buddy uses Firebase as its primary backend infrastructure.

## Firebase Authentication

Provides

- Registration
- Login
- User Management
- Secure Authentication

---

## Cloud Firestore

Stores

- Notes
- Todos
- User Profiles
- Saved Articles
- User Preferences

---

## Firebase Storage

Used for

- Images
- Documents
- User Files
- Media Uploads

---

## Firebase Cloud Functions

Used for

- Secure API Requests
- Third-party API Communication
- Background Tasks
- Event Processing

---

# 🏗️ Application Architecture

```

React Native (Expo)
│
├── Authentication
│
├── Notes
│
├── Todos
│
├── Articles
│
├── AI Chat
│
└── User Profile
│
▼
Firebase
│
├── Authentication
├── Firestore
├── Storage
└── Cloud Functions
│
▼
Node.js Backend
│
├── AI Prompt Processing
├── Keyword Extraction
├── AI API Integration
├── External APIs
└── Response Generation

```

---

# 🛠 Tech Stack

## Mobile

- React Native
- Expo
- TypeScript

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- Firebase Firestore

## Authentication

- Firebase Authentication

## Storage

- Firebase Storage

## AI

- AI API Integration
- Prompt Engineering
- Keyword Extraction

## External APIs

- NewsAPI
- GNews API

---

# 📂 Project Structure

```

Buddy/
│
├── app/
├── assets/
├── components/
├── screens/
├── navigation/
├── services/
├── hooks/
├── context/
├── firebase/
├── utils/
├── constants/
└── App.tsx

```

Backend

```

server/
│
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
├── ai/
│ ├── keywordExtractor.ts
│ ├── promptBuilder.ts
│ ├── aiService.ts
│
├── firebase/
└── server.ts

```

---

# 🔒 Security

Buddy follows modern security practices.

- Firebase Authentication
- Secure User Sessions
- Protected Firestore Rules
- Hidden AI API Keys
- Backend AI Processing
- Secure Cloud Functions
- User Data Isolation

---

# 🚀 Future Improvements

- Voice Assistant
- OCR Document Scanner
- Calendar Integration
- Offline Mode
- Push Notifications
- Habit Tracker
- AI Study Planner
- AI Schedule Generator
- AI Note Generator
- File Reader (PDF, DOCX, PPTX)
- Dark Mode
- Multi-language Support

---

# 📸 Screenshots

> Screenshots will be added soon.

---

# 👨‍💻 Developer

**G.D. Isuru Nirmal Rathnayaka**

Software Engineering Undergraduate

Full Stack Developer

React Native • Firebase • Node.js • TypeScript • AI Integration

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.

It helps support future development.

---

## 📄 License

This project is licensed under the MIT License.
