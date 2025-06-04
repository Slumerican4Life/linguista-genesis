
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Star, TrendingUp } from 'lucide-react';

interface FeedbackPanelProps {
  translations: Record<string, string>;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ translations }) => {
  const [feedback, setFeedback] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = () => {
    if (feedback.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setFeedback('');
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-ai-blue-600" />
          <span>Help Improve Our AI Agents</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Your feedback helps our AI agents learn and provide better cultural translations
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-ai-blue-600">{Object.keys(translations).length}</div>
            <div className="text-sm text-gray-600">Languages Translated</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">Avg. Confidence</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">5</div>
            <div className="text-sm text-gray-600">AI Agents Used</div>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-white p-6 rounded-lg border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Share Your Experience</h3>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Help us improve</span>
            </div>
          </div>
          
          <Textarea
            placeholder="Tell us about the translation quality, cultural accuracy, or any suggestions for improvement..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <TrendingUp className="w-3 h-3 mr-1" />
                Improving AI
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Anonymous
              </Badge>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim() || submitted}
              className="bg-gradient-to-r from-ai-blue-500 to-ai-purple-500 hover:from-ai-blue-600 hover:to-ai-purple-600"
            >
              {submitted ? (
                <>Sent! Thank you</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" size="sm" className="hover:bg-blue-50">
            Export as CSV
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-blue-50">
            Export as JSON
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-blue-50">
            Save Project
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-blue-50">
            Share Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
