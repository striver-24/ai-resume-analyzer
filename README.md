# 🎯 AI Resume Analyzer

A modern, AI-powered resume analysis platform built with React, powered by Google Cloud Platform, Neon PostgreSQL, and deployed on Vercel.

## ✨ Features

### Core Functionality
- **Smart Resume Analysis**: AI-powered resume scoring and feedback using Google Vertex AI
- **ATS Compatibility Check**: Ensure your resume passes Applicant Tracking Systems
- **Markdown Resume Editor**: Create and edit resumes using Markdown with live preview
- **AI-Powered Suggestions**: Apply AI improvements directly to your resume
- **Multiple Templates**: Choose from 5+ professional resume templates

### Technical Features
- **Secure Authentication**: Google OAuth integration
- **Cloud Storage**: Resume files stored securely in Google Cloud Storage
- **Real-time Analysis**: Instant feedback and improvement suggestions
- **User Dashboard**: Manage multiple resumes and track improvements
- **OCR Support**: Extract text from PDF and image resumes
- **Chat Interface**: Ask questions about your resume

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- [Neon PostgreSQL account](https://neon.tech)
- [Google Cloud Platform account](https://console.cloud.google.com)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-resume-analyzer

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Setup Guides below)

# Initialize database
psql "$DATABASE_URL" -f schema.sql

# Test database connection
npm run test:db

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[NEON_SETUP.md](./NEON_SETUP.md)** - Complete Neon database setup guide
- **[GCP_SETUP.md](./GCP_SETUP.md)** - Google Cloud Platform configuration
- **[VERTEX_AI_IMPLEMENTATION.md](./VERTEX_AI_IMPLEMENTATION.md)** - Vertex AI integration details
- **[RESUME_EDITOR_IMPLEMENTATION.md](./RESUME_EDITOR_IMPLEMENTATION.md)** - Markdown editor guide

## 🎨 Resume Editor

Create beautiful resumes using Markdown with live preview:

```markdown
---
name: Your Name
header:
  - text: email@example.com
    link: mailto:email@example.com
themeColor: '#2563eb'
---

## Experience
**Software Engineer** | Company | *2020 - Present*
- Led development of features serving 1M+ users
```

**Features**:
- ✅ Live preview as you type
- ✅ 5+ professional templates
- ✅ Apply AI suggestions automatically
- ✅ Export to PDF (coming soon)
- ✅ Syntax highlighting
- ✅ Easy formatting with Markdown

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Routing
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Vercel** - Serverless functions & hosting
- **Neon PostgreSQL** - Database
- **Google Cloud Storage** - File storage
- **Google OAuth 2.0** - Authentication
- **Vertex AI (Gemini)** - AI-powered analysis
- **Markdown-it** - Markdown parsing

## 🏗️ Architecture

```
Client (React) → API (Vercel) → Services (Neon, GCS, OAuth)
```

All client state management uses Zustand, which communicates with Vercel serverless functions. These functions integrate with:
- **Neon PostgreSQL** for data persistence
- **Google Cloud Storage** for file storage
- **Google OAuth** for authentication

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test:db      # Test database connection
npm run test:ai      # Test Vertex AI integration
npm run typecheck    # TypeScript type checking
npm run db:init      # Initialize database schema
```

## 🚢 Deployment

Deploy to Vercel in minutes:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
# ... add other variables

# Deploy to production
vercel --prod
```

See [GCP_SETUP.md](./GCP_SETUP.md) for complete deployment guide.

## 🔐 Environment Variables

Required environment variables (see `.env.example`):

```bash
# Database
DATABASE_URL=postgresql://...

# Google Cloud
GCP_PROJECT_ID=your-project-id
GCS_BUCKET_NAME=your-bucket
GOOGLE_APPLICATION_CREDENTIALS=./path/to/key.json

# OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Security
SESSION_SECRET=your-random-secret
```

## 🗂️ Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── auth/              # Authentication endpoints
│   ├── files/             # File storage endpoints
│   └── kv/                # Key-value store endpoints
├── app/
│   ├── lib/               # Utilities (auth, db, storage)
│   ├── routes/            # React Router routes
│   └── components/        # React components
├── public/                # Static assets
└── schema.sql             # Database schema
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: See `/docs` folder
- **Email**: your-email@example.com

---

Built with ❤️ using React, Neon, and Google Cloud Platform
