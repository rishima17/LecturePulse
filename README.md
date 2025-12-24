##LecturePulse 🎓



LecturePulse is a real-time student feedback application designed to bridge the gap between teachers and students during lectures. It allows teachers to gauge class understanding instantly and enables students to provide anonymous feedback without fear of interruption. 

Live Demo:-https://lecturepulse.vercel.app/

🚀 Features



Real-time Feedback: Students can indicate their status (Deep Understanding, Following, Confused) in real-time.


Teacher Dashboard: Manage lecture sessions and view active sessions.

Analytics: Visualize session data with interactive charts (Understanding Distribution, Attention Index, Confusion Timeline).

Anonymous Participation: Encourages honest feedback from students.

Modern UI: Built with a sleek, glassmorphism-inspired design.

🛠️ Tech Stack


Frontend Framework: React + Vite

Styling: Tailwind CSS v4, Framer Motion

Routing: React Router DOM

Charts: Recharts

Icons: Lucide React

Notifications: Sonner

📦 Installation


Clone the repository

git clone https://github.com/yourusername/lecture-pulse.git

cd lecture-pulse

Install dependencies

npm install

Start the development server

npm run dev

🚦 Usage


Teacher Flow:

Go to `/login` and log in with your credentials.

Create a new session from the Dashboard.

Share the Session Code with students.

Monitor live feedback and view analytics after the session.

Student Flow:

Go to `/student`.

Enter the Session Code provided by the teacher.

Tap the buttons to provide real-time feedback during the lecture.


📂 Project Structure

`src/pages`: Application views (Landing, Login, Dashboard, StudentFeedback, Analytics)

`src/components`: Reusable UI components

`src/context`: State management (AuthContext)

`src/utils`: Helper functions (storage, analytics)


📜 Scripts

`npm run dev`: Start the development server

`npm run build`: Build for production

`npm run preview`: Preview the production build

`npm run lint`: Run ESLint

