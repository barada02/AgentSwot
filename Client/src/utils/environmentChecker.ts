/**
 * Environment and Configuration Checker
 * Validates MongoDB connection settings and environment variables
 */

export class EnvironmentChecker {
  
  static checkEnvironmentVariables(): {
    isValid: boolean;
    issues: string[];
    config: Record<string, string | undefined>;
  } {
    const issues: string[] = [];
    const config = {
      MONGODB_URI: import.meta.env.VITE_MONGODB_URI,
      DB_NAME: import.meta.env.VITE_DB_NAME,
      SESSIONS_COLLECTION: import.meta.env.VITE_SESSIONS_COLLECTION,
      MESSAGES_COLLECTION: import.meta.env.VITE_MESSAGES_COLLECTION,
      INFOGRAPHICS_COLLECTION: import.meta.env.VITE_INFOGRAPHICS_COLLECTION,
      USERS_COLLECTION: import.meta.env.VITE_USERS_COLLECTION,
      API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      APP_ENV: import.meta.env.VITE_APP_ENV,
    };

    // Check MongoDB URI
    if (!config.MONGODB_URI) {
      issues.push('VITE_MONGODB_URI is not set in .env file');
    } else if (!config.MONGODB_URI.startsWith('mongodb')) {
      issues.push('VITE_MONGODB_URI does not appear to be a valid MongoDB connection string');
    } else if (config.MONGODB_URI.includes('username:password')) {
      issues.push('VITE_MONGODB_URI contains placeholder credentials - please replace with real values');
    }

    // Check database name
    if (!config.DB_NAME) {
      issues.push('VITE_DB_NAME is not set (will default to "agentswot")');
    }

    // Check collections (these have defaults so just warn)
    if (!config.SESSIONS_COLLECTION) {
      console.log('ℹ️ VITE_SESSIONS_COLLECTION not set, using default: "sessions"');
    }

    return {
      isValid: issues.length === 0,
      issues,
      config,
    };
  }

  static validateMongoDBURI(uri: string): {
    isValid: boolean;
    issues: string[];
    details: {
      protocol?: string;
      username?: string;
      host?: string;
      database?: string;
      options?: string[];
    };
  } {
    const issues: string[] = [];
    const details: any = {};

    try {
      // Basic format check
      if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        issues.push('URI must start with mongodb:// or mongodb+srv://');
        return { isValid: false, issues, details };
      }

      details.protocol = uri.startsWith('mongodb+srv://') ? 'mongodb+srv' : 'mongodb';

      // Extract parts using regex
      const uriRegex = /^mongodb(\+srv)?:\/\/(?:([^:]+):([^@]+)@)?([^\/]+)\/([^?]+)?(?:\?(.+))?$/;
      const match = uri.match(uriRegex);

      if (!match) {
        issues.push('Invalid MongoDB URI format');
        return { isValid: false, issues, details };
      }

      const [, , username, password, host, database, optionsStr] = match;

      details.username = username;
      details.host = host;
      details.database = database || 'test';

      if (optionsStr) {
        details.options = optionsStr.split('&');
      }

      // Validate components
      if (!host) {
        issues.push('Host is missing from URI');
      }

      if (username && !password) {
        issues.push('Username provided but password is missing');
      }

      if (username && (username === 'username' || password === 'password')) {
        issues.push('URI contains placeholder credentials');
      }

      // Check for required Atlas options
      if (details.protocol === 'mongodb+srv') {
        const hasRetryWrites = details.options?.some((opt: string) => opt.includes('retryWrites'));
        const hasWriteConcern = details.options?.some((opt: string) => opt.includes('w=majority'));
        
        if (!hasRetryWrites) {
          console.log('ℹ️ Consider adding retryWrites=true for better reliability');
        }
        
        if (!hasWriteConcern) {
          console.log('ℹ️ Consider adding w=majority for write acknowledgment');
        }
      }

    } catch (error) {
      issues.push(`Failed to parse URI: ${error}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      details,
    };
  }

  static logEnvironmentStatus(): void {
    console.log('🔍 Checking environment configuration...');
    
    const envCheck = this.checkEnvironmentVariables();
    
    console.log('📊 Environment Variables:');
    Object.entries(envCheck.config).forEach(([key, value]) => {
      if (key === 'MONGODB_URI' && value) {
        // Mask sensitive URI
        const masked = value.replace(/\/\/[^@]+@/, '//*****:*****@');
        console.log(`  ${key}: ${masked}`);
      } else {
        console.log(`  ${key}: ${value || 'NOT SET'}`);
      }
    });

    if (envCheck.issues.length > 0) {
      console.log('⚠️ Environment Issues:');
      envCheck.issues.forEach(issue => console.log(`  - ${issue}`));
    } else {
      console.log('✅ Environment configuration looks good');
    }

    // Validate MongoDB URI if present
    if (envCheck.config.MONGODB_URI) {
      console.log('🔍 Validating MongoDB URI...');
      const uriCheck = this.validateMongoDBURI(envCheck.config.MONGODB_URI);
      
      console.log('📊 MongoDB URI Details:');
      console.log(`  Protocol: ${uriCheck.details.protocol}`);
      console.log(`  Host: ${uriCheck.details.host}`);
      console.log(`  Database: ${uriCheck.details.database}`);
      console.log(`  Username: ${uriCheck.details.username ? 'Present' : 'Not set'}`);
      
      if (uriCheck.details.options) {
        console.log(`  Options: ${uriCheck.details.options.join(', ')}`);
      }

      if (uriCheck.issues.length > 0) {
        console.log('⚠️ MongoDB URI Issues:');
        uriCheck.issues.forEach(issue => console.log(`  - ${issue}`));
      } else {
        console.log('✅ MongoDB URI format is valid');
      }
    }
  }

  static getQuickDiagnostic(): string {
    const envCheck = this.checkEnvironmentVariables();
    
    if (!envCheck.config.MONGODB_URI) {
      return '❌ MongoDB URI not configured - Please set VITE_MONGODB_URI in .env file';
    }

    const uriCheck = this.validateMongoDBURI(envCheck.config.MONGODB_URI);
    
    if (!uriCheck.isValid) {
      return `❌ MongoDB URI invalid: ${uriCheck.issues[0]}`;
    }

    if (envCheck.issues.length > 0) {
      return `⚠️ Configuration issues: ${envCheck.issues.length} warnings`;
    }

    return '✅ Environment configuration is ready';
  }
}

export default EnvironmentChecker;