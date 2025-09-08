# SantéAI - Personal Health Assistant

SantéAI is a smart AI health assistant that grows more helpful the more users interact with it. Built with React Router v7, TypeScript, and shadcn/ui.

## Features

- **Natural Conversations**: Chat naturally about health concerns without forms
- **Adaptive Learning**: AI learns from every conversation to provide personalized guidance
- **Health Insights**: Get personalized recommendations based on conversation history
- **Privacy & Safety**: Secure data storage with emphasis on professional medical advice
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router v7
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd SanteIA
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
app/
├── routes/           # Page components
│   ├── login.tsx    # Login page
│   ├── signup.tsx   # Signup page
│   ├── chat.tsx     # Chat interface
├── components/       # Reusable components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   └── chat/        # Chat-specific components
├── lib/             # Utility functions
└── app.css          # Global styles
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm typecheck` - Run TypeScript type checking

## Key Components

### Chat Interface

- Real-time messaging with AI assistant
- Message history and persistence
- Typing indicators and loading states
- Mobile-responsive design

### Dashboard

- Health insights and analytics
- Quick actions and navigation
- User statistics and progress tracking
- Personalized recommendations

### Authentication

- Secure login and signup forms
- Password validation and requirements
- User profile management
- Session handling

## Health Disclaimer

⚠️ **Important**: SantéAI provides informational guidance only and is not a substitute for professional medical advice. Always consult with healthcare professionals for medical concerns, especially for urgent symptoms.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
