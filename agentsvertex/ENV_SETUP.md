# AgentSwot Storage Server Environment Setup

## Security Note
**IMPORTANT**: Never commit actual environment variables to Git. The `.env` file contains sensitive information like database credentials and JWT secrets.

## Setup Instructions

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual configuration:
   ```bash
   # Required - MongoDB Atlas connection string
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
   
   # Required - JWT secret for authentication (use a strong, random string)
   JWT_SECRET_KEY=your_super_secret_jwt_key_at_least_32_characters_long
   ```

## Required Environment Variables

- **MONGODB_URI**: MongoDB Atlas connection string with credentials
- **JWT_SECRET_KEY**: Secret key for JWT token signing (minimum 32 characters)

## Optional Environment Variables

- **DB_NAME**: Database name (default: "agentswot")
- **ADK_BASE_URL**: ADK server URL (default: "http://127.0.0.1:8000")
- **STORAGE_SERVER_HOST**: Server host (default: "0.0.0.0")
- **STORAGE_SERVER_PORT**: Server port (default: "8001")
- **ENVIRONMENT**: Environment type (default: "development")

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` for security
2. **Use strong JWT secrets** - Generate random strings with at least 32 characters
3. **Rotate secrets regularly** - Update MongoDB passwords and JWT secrets periodically
4. **Use different secrets per environment** - Development, staging, and production should have different credentials

## Generating Secure JWT Secret

```python
import secrets
jwt_secret = secrets.token_urlsafe(32)
print(jwt_secret)
```

Or use online tools like: https://generate-secret.vercel.app/32