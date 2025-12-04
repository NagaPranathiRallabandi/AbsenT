# AbsenT - AI Attendance Calculator

AbsenT is an intelligent tool designed to streamline the attendance process by digitizing handwritten attendance sheets using the power of Google Gemini AI.

## 🚀 Features

- **Class Setup**: Easily import or manually input student lists to set up your class.
- **AI Capture**: Upload photos of handwritten attendance sheets. The app uses Google Gemini to automatically detect and extract roll numbers.
- **Verification**: Verify the extracted data against your class list to ensure accuracy.
- **Results**: Generate instant reports of presentees and absentees.

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Styling**: TailwindCSS
- **AI**: Google Gemini API
- **Deployment**: GitHub Pages

## 🏃‍♂️ Run Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AbsenT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

To deploy the application to GitHub Pages:

```bash
npm run deploy
```

This command builds the project and pushes it to the `gh-pages` branch.
