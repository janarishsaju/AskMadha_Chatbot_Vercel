# Bible Bot v6

An AI-powered bilingual Bible Chatbot that allows users to query and search both English and Tamil Bible texts. It leverages the Google Gemini API for intelligent, semantic search and language detection, providing accurate answers with biblical references.

## Project Structure

This repository is split into three main parts:

- `backend/`: The English Bible backend API (runs on port 3001). It handles natural language queries in English and routes Tanglish/Tamil queries to the Tamil Bible service.
- `Tamil Bible/`: The Tamil Bible API (runs on port 3000). It performs semantic search and LLM-based answering specifically using the Tamil Bible database.
- `frontend/`: A React/Vite-based frontend application (runs on port 5173). It provides the user interface for interacting with the chatbot.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm or yarn

## Installation

1. **Clone the repository** (if not already done).
2. **Install dependencies for all services**:

   ```bash
   # Install Backend dependencies
   cd backend
   npm install

   # Install Tamil Bible dependencies
   cd "../Tamil Bible"
   npm install

   # Install Frontend dependencies
   cd ../frontend
   npm install
   ```

## Environment Variables

You need a Google Gemini API key to run this project.

1. Navigate to the `backend/` directory.
2. Create a `.env` file and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
*(Note: The Tamil Bible service is configured to automatically load the `.env` file from the `backend/` directory.)*

## Running the Application (Windows)

For Windows users, you can easily start all three services simultaneously by running the provided batch script:

1. Double-click on `start.bat` located in the root directory.
   **OR** run it from your command prompt:
   ```cmd
   .\start.bat
   ```
2. Three separate terminal windows will open, starting:
   - Tamil Bible API on `http://localhost:3000`
   - English Bible Backend on `http://localhost:3001`
   - Frontend Dev Server on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173` to use the Bible Bot.

## Tech Stack

- **Backend / APIs**: Node.js, Express.js
- **Frontend**: React.js, Vite, TailwindCSS / Vanilla CSS, Lucide React
- **AI Integration**: Google Gemini API (`@google/generative-ai`)
- **Search**: Custom IDF-weighted scoring and LLM semantic retrieval
