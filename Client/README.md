# 🎯 AgentSwot Frontend - React Application

> Modern React frontend for the AgentSwot AI-powered SWOT analysis platform

## 🚀 Features

- **Interactive Chat Interface**: Real-time conversation with AI agents
- **Dynamic Infographic Viewer**: Secure rendering of HTML/CSS/JS infographics
- **Session Management**: Persistent user sessions with authentication
- **Responsive Design**: Material-UI components optimized for all devices
- **TypeScript**: Full type safety with comprehensive type definitions
- **Real-time Updates**: Live chat with automatic message storage

## 🏗️ Tech Stack

- **React 18+**: Modern hooks and concurrent features
- **TypeScript 5.8+**: Strong typing for better development experience  
- **Material-UI (MUI)**: Professional component library
- **Vite**: Lightning-fast build tool with HMR
- **Axios**: HTTP client with request/response interceptors
- **React Router**: Client-side routing
- **React Hook Form**: Performant form handling

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ChatInterface.tsx       # Main chat component
│   ├── InfographicViewer.tsx   # Secure HTML renderer
│   ├── SessionForm.tsx         # Session creation
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useStorageApi.ts        # Unified API hook
│   ├── useMongoDBStorage.ts    # Database operations
│   └── ...
├── pages/              # Page-level components
│   ├── DashboardPage.tsx
│   ├── AuthPage.tsx
│   └── ...
├── services/           # API and utility services
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend services running (ADK + Storage servers)

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your backend URLs
```

### Development
```bash
# Start development server
npm run dev

# Run with type checking
npm run build

# Lint code
npm run lint
```

### Environment Variables
```env
VITE_STORAGE_API_URL=http://127.0.0.1:8001
VITE_APP_ENV=development
VITE_API_TIMEOUT=120000
```

## 🔧 Key Components

### ChatInterface
The main conversational interface that:
- Manages real-time chat with AI agents
- Processes and displays infographic content
- Handles message state and history
- Integrates with the Storage API

### InfographicViewer  
Secure rendering system that:
- Sandboxes HTML/CSS/JS content in iframes
- Provides export functionality (HTML download, new tab)
- Handles dynamic content detection and parsing
- Ensures XSS protection

### SessionForm
Session management component that:
- Creates new analysis sessions
- Validates API connectivity  
- Manages user authentication
- Handles session persistence

## 🎨 UI/UX Features

- **Dark/Light Themes**: Material-UI theming support
- **Responsive Layout**: Mobile-first design approach
- **Loading States**: Elegant loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback system

## 🔌 API Integration

The frontend communicates exclusively with the Storage Server through:

```typescript
// Unified API hook
const { sendMessage, createSession, getConversation } = useStorageApi();

// Example usage
const response = await sendMessage(sessionId, message);
const conversation = await getConversation(sessionId);
```

## 🧪 Testing

```bash
# Test API connectivity
npm run test:api

# Component testing (when available)
npm run test

# Build verification
npm run build && npm run preview
```

## 🛡️ Security Features

- **Content Security Policy**: Restrictive CSP for iframe content
- **Input Sanitization**: XSS protection on all inputs
- **Authentication**: JWT token management
- **HTTPS Enforcement**: Production security headers

## 📱 Browser Support

- Chrome 88+
- Firefox 78+  
- Safari 14+
- Edge 88+

## 🔄 Build & Deployment

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to static hosting
# (Build outputs to /dist directory)
```

## 🤝 Development Guidelines

### Code Style
- Use TypeScript for all new components
- Follow Material-UI design patterns
- Implement proper error boundaries
- Use React hooks over class components

### State Management
- Local state for component-specific data
- Context for shared application state  
- Custom hooks for reusable logic
- API state managed through useStorageApi

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed**
```bash
# Verify backend is running
curl http://localhost:8001/health
```

**Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript Errors**
```bash
# Check TypeScript configuration
npx tsc --noEmit
```

## 📚 Additional Resources

- [Material-UI Documentation](https://mui.com/)
- [React 18 Documentation](https://react.dev/)
- [Vite Configuration](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🔧 Advanced Configuration

### Custom ESLint Rules

For production applications, enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
