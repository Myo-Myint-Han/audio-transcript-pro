# Audio Transcript Pro

Professional audio transcription service supporting English and Myanmar languages.

## Features

- 🎤 **Audio Recording** - Record directly from your browser
- 📁 **File Upload** - Support for MP3, WAV, M4A, WebM, OGG, FLAC
- 🌍 **Multi-Language** - English and Myanmar language support
- 📥 **Multiple Formats** - Download as TXT, PDF, or DOCX
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📊 **Dashboard** - Manage all your transcriptions
- ⚡ **Real-time Processing** - Live progress updates

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Authentication**: JWT, bcryptjs
- **Transcription**: Hugging Face Whisper API (free)
- **UI Components**: Custom components with shadcn/ui style
- **File Handling**: React Dropzone, Formidable

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Hugging Face account (free)

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd audio-transcript-pro
```

2. Install dependencies

```bash
npm install
```

3. Set up environment variables

Create `.env` file:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000"
HUGGINGFACE_API_TOKEN="hf_your_token_here"
```

4. Initialize database

```bash
npx prisma generate
npx prisma db push
```

5. Run development server

```bash
npm run dev
```

Visit http://localhost:3000

## Usage

1. **Register** - Create a free account
2. **Login** - Sign in to your account
3. **Transcribe** - Upload audio or record directly
4. **Download** - Get your transcript in TXT, PDF, or DOCX

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.
