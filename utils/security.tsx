import crypto from 'crypto';

export interface SecurityValidation {
  isValid: boolean;
  message: string;
}

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}

export const validatePassword = (password: string): SecurityValidation => {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  return { isValid: true, message: "" };
};

export const calculatePasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

  const getLabel = (): 'Weak' | 'Fair' | 'Good' | 'Strong' => {
    if (score <= 25) return 'Weak';
    if (score <= 50) return 'Fair';
    if (score <= 75) return 'Good';
    return 'Strong';
  };

  const getColor = (): string => {
    if (score <= 25) return 'bg-red-500';
    if (score <= 50) return 'bg-yellow-500';
    if (score <= 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return {
    score,
    label: getLabel(),
    color: getColor()
  };
};

export const hashPassword = (password: string): string => {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
};

export class RateLimiter {
  private attempts: Map<string, { count: number; timestamp: number }> = new Map();
  private readonly maxAttempts = 5;
  private readonly timeWindow = 15 * 60 * 1000; // 15 minutes

  public checkLimit(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier);

    if (!userAttempts) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (now - userAttempts.timestamp > this.timeWindow) {
      this.attempts.set(identifier, { count: 1, timestamp: now });
      return true;
    }

    if (userAttempts.count >= this.maxAttempts) {
      return false;
    }

    this.attempts.set(identifier, {
      count: userAttempts.count + 1,
      timestamp: userAttempts.timestamp,
    });
    return true;
  }

  public getRemainingAttempts(identifier: string): number {
    const userAttempts = this.attempts.get(identifier);
    if (!userAttempts) return this.maxAttempts;
    return Math.max(0, this.maxAttempts - userAttempts.count);
  }
}