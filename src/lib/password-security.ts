
interface PasswordStrength {
  score: number;
  feedback: string[];
  isStrong: boolean;
}

interface LeakCheckResult {
  isLeaked: boolean;
  count?: number;
}

// Check if password appears in known data breaches using HaveIBeenPwned API
export async function checkPasswordLeak(password: string): Promise<LeakCheckResult> {
  try {
    // Hash the password with SHA-1
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Use k-anonymity: only send first 5 characters of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    if (!response.ok) {
      // If API fails, THROW an error instead of failing silently.
      console.warn('Password leak check API unavailable');
      throw new Error('Security check is temporarily unavailable. Please try again in a moment.');
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    for (const line of lines) {
      const [hashSuffix, count] = line.trim().split(':');
      if (hashSuffix === suffix) {
        return { isLeaked: true, count: parseInt(count, 10) };
      }
    }
    
    return { isLeaked: false };
  } catch (error) {
    console.warn('Password leak check failed:', error);
    // Re-throw a user-friendly error.
    if (error instanceof Error && error.message.startsWith('Security check')) {
      throw error;
    }
    throw new Error('Could not perform security check. Please ensure you are connected to the internet.');
  }
}

// Enhanced password strength checking
export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else if (password.length >= 8) {
    score += 1;
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  // Character variety checks
  if (!/[a-z]/.test(password)) {
    feedback.push('Include lowercase letters');
  } else {
    score += 1;
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Include uppercase letters');
  } else {
    score += 1;
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Include numbers');
  } else {
    score += 1;
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Include special characters (!@#$%^&*)');
  } else {
    score += 1;
  }
  
  // Common pattern checks
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score -= 1;
  }
  
  if (/123|abc|qwe|password|admin/i.test(password)) {
    feedback.push('Avoid common patterns and dictionary words');
    score -= 2;
  }
  
  // Sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Avoid sequential characters');
    score -= 1;
  }
  
  const isStrong = score >= 4 && feedback.length === 0;
  
  return {
    score: Math.max(0, Math.min(5, score)),
    feedback,
    isStrong
  };
}

// Get password strength color for UI
export function getPasswordStrengthColor(score: number): string {
  if (score <= 1) return 'text-red-400';
  if (score <= 2) return 'text-orange-400';
  if (score <= 3) return 'text-yellow-400';
  if (score <= 4) return 'text-blue-400';
  return 'text-green-400';
}

// Get password strength label
export function getPasswordStrengthLabel(score: number): string {
  if (score <= 1) return 'Very Weak';
  if (score <= 2) return 'Weak';
  if (score <= 3) return 'Fair';
  if (score <= 4) return 'Good';
  return 'Strong';
}
