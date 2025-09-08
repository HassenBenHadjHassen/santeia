# SanteIA Server

A robust MVVC (Model-View-View-Controller) TypeScript Node.js API server with Express.js.

## Features

- **MVVC Architecture**: Clean separation of concerns with Models, Views, Controllers, and Services
- **TypeScript**: Full type safety and modern JavaScript features
- **Express.js**: Fast, unopinionated web framework
- **Database**: Prisma ORM with MongoDB support
- **AI Integration**: Llama 3.1 405B Instruct model via Hugging Face Inference API (latest v2.7.0)
- **Chat System**: Full conversation management with AI responses
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Validation**: Joi-based request validation
- **Error Handling**: Comprehensive error handling middleware
- **Testing**: Jest testing framework with TypeScript support
- **Development**: Hot reload with ts-node-dev
- **Code Quality**: ESLint configuration

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database configuration
│   └── environment.ts # Environment variables
├── controllers/      # Request handlers
│   ├── BaseController.ts
│   ├── UserController.ts
│   ├── LLMController.ts
│   └── ConversationController.ts
├── middleware/       # Express middleware
│   ├── errorHandler.ts
│   ├── security.ts
│   └── validation.ts
├── models/          # Data models
│   ├── BaseModel.ts
│   └── User.ts
├── repositories/    # Database access layer
│   ├── BaseRepository.ts
│   ├── UserRepository.ts
│   ├── ConversationRepository.ts
│   └── LLMRepository.ts
├── routes/          # API routes
│   ├── index.ts
│   ├── userRoutes.ts
│   ├── llmRoutes.ts
│   └── conversationRoutes.ts
├── services/        # Business logic
│   ├── BaseService.ts
│   ├── UserService.ts
│   ├── LLMService.ts
│   └── ConversationService.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── views/           # Response formatting
│   ├── BaseView.ts
│   └── UserView.ts
├── __tests__/       # Test files
│   ├── setup.ts
│   └── UserService.test.ts
├── app.ts           # Express app configuration
└── index.ts         # Server entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp env.example .env
```

3. Update environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
HOST=localhost
DATABASE_URL=mongodb://localhost:27017/santeia_db
HUGGINGFACE_API_KEY=your-huggingface-api-key
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-405B-Instruct
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

4. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### Development

Start the development server with hot reload:

```bash
npm run dev
```

### Production

Build and start the production server:

```bash
npm run build
npm start
```

### Testing

Run tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test -- --coverage
```

### Linting

Run ESLint:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

## API Endpoints

### Health Check

- `GET /api/health` - Server health status

### Users

- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (with pagination and filtering)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### AI/LLM

- `POST /api/llm/generate` - Generate text using Llama 3.1 405B (uses latest textGeneration API)
- `GET /api/llm/model-info` - Get model information

### Conversations

- `POST /api/conversations` - Create a new conversation
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `POST /api/conversations/:id/messages` - Send message to conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Example API Usage

#### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }'
```

#### Get All Users

```bash
curl http://localhost:3000/api/users?page=1&limit=10&role=USER
```

#### Generate AI Text

```bash
curl -X POST http://localhost:3000/api/llm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What are the benefits of regular exercise?",
    "userId": "user-id-here",
    "maxTokens": 256,
    "temperature": 0.7
  }'
```

#### Create Conversation

```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Health Questions",
    "userId": "user-id-here"
  }'
```

#### Send Message to Conversation

```bash
curl -X POST http://localhost:3000/api/conversations/conversation-id/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "What should I eat for a healthy breakfast?",
    "conversationId": "conversation-id-here",
    "userId": "user-id-here"
  }'
```

## Architecture

### MVVC Pattern

- **Models**: Data structures and business rules (`src/models/`)
- **Views**: Response formatting and presentation (`src/views/`)
- **Controllers**: Request handling and orchestration (`src/controllers/`)
- **Services**: Business logic and data operations (`src/services/`)
- **Repositories**: Database access layer with Prisma (`src/repositories/`)

### Key Components

1. **Base Classes**: Abstract base classes for common functionality
2. **Repository Pattern**: Clean separation of database operations from business logic
3. **Middleware**: Reusable Express middleware for security, validation, and error handling
4. **Type Safety**: Comprehensive TypeScript interfaces and types
5. **Error Handling**: Centralized error handling with custom error classes
6. **Validation**: Request validation using Joi schemas
7. **Security**: Multiple layers of security including rate limiting, CORS, and input sanitization
8. **AI Integration**: Seamless integration with Llama 3.1 405B via Hugging Face Inference API (latest v2.7.0)

## Environment Variables

| Variable         | Description                               | Default               |
| ---------------- | ----------------------------------------- | --------------------- |
| `NODE_ENV`       | Environment (development/production/test) | development           |
| `PORT`           | Server port                               | 3000                  |
| `HOST`           | Server host                               | localhost             |
| `DB_HOST`        | Database host                             | localhost             |
| `DB_PORT`        | Database port                             | 5432                  |
| `DB_NAME`        | Database name                             | -                     |
| `DB_USER`        | Database username                         | -                     |
| `DB_PASSWORD`    | Database password                         | -                     |
| `JWT_SECRET`     | JWT secret key                            | -                     |
| `JWT_EXPIRES_IN` | JWT expiration time                       | 24h                   |
| `CORS_ORIGIN`    | Allowed CORS origins                      | http://localhost:3000 |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

ISC
