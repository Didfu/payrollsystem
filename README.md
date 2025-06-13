# 🧾 SwiftLink

A clean, full-stack Employee Payroll Management app built using Next.js (App Router), Firebase Auth, and Firestore.

---

✨ Features

Authentication: Secure email/password login via Firebase.

Employee CRUD: Add, edit, delete employee profiles.

Dynamic Payroll:

Define basic pay, allowances, deductions.

Auto-calc gross/net salary.


Payslip Generation:

View/download monthly payslips.

Yearly summary view.


Realtime UI: Calculations update instantly with client-side React Hooks.

Role-Based Access: Admin-only routes enforced via middleware.

Firestore Security Rules: Locked down to prevent unauthorized access.

---

⚙️ Setup Instructions

1. Clone and install

git clone https://github.com/Didfu/payrollsystem.git
cd payrollsystem
npm install

2. Configure Firebase

1. Create a Firebase project.


2. Enable Email/Password Auth and Firestore.


3. Copy your Firebase config snippet.


4. Paste into firebase/firebaseConfig.js:



export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // …
};

3. Run locally

npm run dev
# App: http://localhost:3000


---

🚓 Deployment

Suggested: Vercel or Firebase Hosting.

Vercel: Just connect your GitHub repo and deploy.

Firebase Hosting:

1. Install CLI: npm install -g firebase-tools


2. firebase login, then firebase init


3. Select Hosting, configure output directory (e.g., .next)


4. firebase deploy





---

🔐 Security

Firebase Rules ensure only authenticated users access data.

UI components are protected by route guards.

No payroll data is exposed client -side without permission.



---

🌱 Future Enhancements

Export payslips as PDF

Send automated salary emails

Add overtime & attendance tracking

Role-differentiated views: Employee vs Admin

Integrate with payroll services (e.g., QuickBooks)



---

🤍 Contributing

We welcome contributions! Feel free to open issues or submit PRs:

1. Fork it 🚧


2. Create a feature branch (git checkout -b new-feature)


3. Make your changes & commit


4. Push and submit a Pull Request!




---

📄 License

Licensed under the MIT License. See LICENSE.md for details.


---

🤝 Acknowledgements

Next.js

Firebase

Tailwind CSS

Inspired by open-source payroll apps



---

