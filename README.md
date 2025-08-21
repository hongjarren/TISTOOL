# TIS Validation Tool

A modern, responsive form validation application built with React, TypeScript, and MongoDB integration for secure data storage.

## 🚀 Features

- **Real-time Form Validation**: Instant feedback on form field validation
- **MongoDB Integration**: Secure data storage with MongoDB Atlas
- **Draft Saving**: Automatic draft saving to localStorage
- **Toast Notifications**: User-friendly success/error notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Security Features**: Input sanitization, rate limiting, and data validation
- **TypeScript**: Full type safety throughout the application

## 🛠️ Technologies Used

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Security middleware** (Helmet, CORS, Rate Limiting)
- **Input validation** and sanitization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB Atlas account (or local MongoDB instance)
- Git (for version control)

## 🚦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hongjarren/TISTOOL.git
   cd TISTOOL
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env`
   - Update the environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   VITE_API_URL=http://localhost:5000
   VITE_MONGODB_URI=your_mongodb_connection_string
   ```

4. **Start the application:**
   
   **Development mode (Frontend + Backend):**
   ```bash
   npm run dev
   ```
   
   **Frontend only:**
   ```bash
   npm run dev:frontend
   ```
   
   **Backend only:**
   ```bash
   npm run server
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 Form Validation Rules

- **Name**: 2+ characters, letters and spaces only
- **Product Line**: Format: XX-99 (2-4 letters, dash, 2-4 numbers)
- **ER Code**: Format: ER followed by 6 digits (e.g., ER123456)
- **Description**: 10-500 characters
- **Model Number**: Format: 2 letters + 4 digits + optional letter (e.g., AB1234C)

## 🔧 API Endpoints

- `POST /api/submissions` - Create new submission
- `GET /api/submissions` - Get all submissions (with pagination)
- `GET /api/submissions/:id` - Get single submission
- `DELETE /api/submissions/:id` - Delete submission
- `GET /api/health` - Health check endpoint

## 🏗️ Project Structure

```
├── server/                 # Backend server code
│   └── index.js           # Express server setup
├── src/                   # Frontend source code
│   ├── components/        # React components
│   │   ├── TISValidationTool.tsx
│   │   ├── ValidationField.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Toast.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useToast.ts
│   ├── models/           # TypeScript interfaces
│   │   └── FormSubmission.ts
│   ├── services/         # API services
│   │   └── apiService.ts
│   └── ...
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service
3. Update environment variables in your hosting platform

### Backend (Heroku/Railway/DigitalOcean)
1. Set up environment variables
2. Deploy the server directory
3. Ensure MongoDB connection string is properly configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues & Support

If you encounter any issues or have questions, please [create an issue](https://github.com/hongjarren/TISTOOL/issues) on GitHub.

## 📈 Future Enhancements

- [ ] Data export functionality (CSV/PDF)
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] User authentication and roles
- [ ] Audit trail functionality
- [ ] Bulk data import
- [ ] Dashboard with analytics
