
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Briefcase, Heart, Zap, Users, Crown } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: string;
  onToneChange: (tone: string) => void;
}

const toneOptions = [
  {
    id: 'natural',
    name: 'Natural',
    description: 'Balanced, conversational tone',
    icon: Heart,
    color: 'bg-green-100 text-green-700 border-green-200',
    example: 'Friendly and approachable'
  },
  {
    id: 'formal',
    name: 'Formal',
    description: 'Professional, business-appropriate',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    example: 'Corporate communications'
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Relaxed, everyday language',
    icon: Users,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    example: 'Social media friendly'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Engaging, marketing-focused',
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    example: 'Advertising and campaigns'
  },
  {
    id: 'genz',
    name: 'Gen Z',
    description: 'Trendy, youth-oriented slang',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    example: 'TikTok and Instagram'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Sophisticated, premium feel',
    icon: Crown,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    example: 'High-end brands'
  }
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  onToneChange
}) => {
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center space-x-2">
        <Sparkles className="w-4 h-4" />
        <span>Translation Tone & Style</span>
      </Label>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {toneOptions.map(tone => {
          const IconComponent = tone.icon;
          const isSelected = selectedTone === tone.id;
          
          return (
            <Button
              key={tone.id}
              variant="outline"
              onClick={() => onToneChange(tone.id)}
              className={`h-auto p-4 flex flex-col items-start space-y-2 transition-all duration-200 ${
                isSelected
                  ? 'border-2 border-ai-blue-400 bg-ai-blue-50 shadow-md transform scale-[1.02]'
                  : 'hover:border-ai-blue-200 hover:bg-ai-blue-25'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${tone.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-gray-900">{tone.name}</span>
                </div>
                {isSelected && (
                  <Badge variant="default" className="bg-ai-blue-500 text-white">
                    Selected
                  </Badge>
                )}
              </div>
              
              <div className="text-left w-full space-y-1">
                <p className="text-sm text-gray-600">{tone.description}</p>
                <p className="text-xs text-gray-500 italic">"{tone.example}"</p>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Tone Preview */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Selected tone: </span>
          <span className="text-ai-blue-600 font-semibold">
            {toneOptions.find(t => t.id === selectedTone)?.name}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {toneOptions.find(t => t.id === selectedTone)?.description}
        </p>
      </div>
    </div>
  );
};
