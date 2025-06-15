import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { getPasswordStrengthColor, getPasswordStrengthLabel } from '@/lib/password-security';

interface PasswordStrengthMeterProps {
  score: number;
  feedback: string[];
  isLeaked?: boolean;
  isCheckingLeak?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  score,
  feedback,
  isLeaked,
  isCheckingLeak
}) => {
  const strengthColor = getPasswordStrengthColor(score);
  const strengthLabel = getPasswordStrengthLabel(score);
  const progressValue = (score / 5) * 100;

  // Map score to progress bar color
  let progressBarColor =
    score <= 1 ? 'bg-red-500' :
    score <= 2 ? 'bg-orange-500' :
    score <= 3 ? 'bg-yellow-500' :
    score <= 4 ? 'bg-blue-500' :
    'bg-green-500';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Password Strength
        </span>
        <span className={`text-sm font-medium ${strengthColor}`}>
          {strengthLabel}
        </span>
      </div>
      
      <div className="h-2 rounded-full bg-secondary w-full overflow-hidden">
        <div
          className={`h-2 transition-all duration-300 ${progressBarColor}`}
          style={{
            width: `${progressValue}%`
          }}
        />
      </div>
      
      {/* Leak Detection Status */}
      {isCheckingLeak && (
        <div className="flex items-center space-x-2 text-sm text-blue-400">
          <Shield className="w-4 h-4 animate-spin" />
          <span>Checking for security breaches...</span>
        </div>
      )}
      
      {!isCheckingLeak && isLeaked !== undefined && (
        <div className={`flex items-center space-x-2 text-sm ${
          isLeaked ? 'text-red-400' : 'text-green-400'
        }`}>
          {isLeaked ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span>This password has appeared in data breaches</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Password not found in known breaches</span>
            </>
          )}
        </div>
      )}
      
      {/* Feedback */}
      {feedback.length > 0 && (
        <div className="space-y-1">
          {feedback.map((item, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm text-orange-400">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
