# ⚡ ASCEND // Solo-Leveling Fitness System

**ASCEND** is a gamified RPG-style fitness tracking web application inspired by the *Solo Leveling* "System". Turn your real-life workouts, habits, and exercise routines into experience points (XP), stat points, rank-ups, and title achievements. 

Live your own leveling journey, track your daily quests, consult your personal AI Coach, and back up your progress securely.

---

## 🚀 Key Features

*   **🏆 Gamified RPG System:** Allocate stat points (Strength, Agility, Vitality, Intelligence, Sense) upon leveling up. Unlock new titles and advance your hunter rank as you gain XP from completing workouts.
*   **🤖 Gemini-Powered AI Coach:** Get personalized, dynamic weekly fitness plans, tailored guidance, and answers to your fitness and nutrition questions.
*   **📅 Daily Quest Log:** Automatically maps your weekly workout schedule into daily quests and checkpoints. Complete them to earn rewards, maintain your daily streak, and burn calories.
*   **🏋️ Exercise Library:** A library of exercises to track and learn proper movements, complete with MET-based calorie consumption calculation.
*   **☁️ Google Drive Backup & Sync:** Keep your progress safe. Export, import, and sync your character sheet data to your Google Drive account.
*   **🔒 Local First:** All progress is stored in your browser's local storage. Fully functional offline.

---

## 🛠️ Tech Stack

*   **Frontend Framework:** React 18 with TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI Integration:** Gemini API
*   **Authentication & Storage:** LocalStorage + Google Drive Sync API

---

## 📦 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jashwanth-gif/fitness.git
   cd fitness
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the root directory if you want to enable the AI Coach or Google Drive Sync.

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

