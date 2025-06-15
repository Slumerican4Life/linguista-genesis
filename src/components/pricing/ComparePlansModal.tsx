
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Zap, Rocket, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComparePlansModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
    {
      id: 'free',
      name: 'Free Tier',
      icon: <Star className="w-6 h-6" />,
      price: '$0',
      features: {
        'Words per month': '500',
        'Languages': '5',
        'Tone options': 'Basic',
        'Support': 'Community',
        'File uploads': false,
        'Translation history': false,
        'API access': false,
        'Custom tone creation': false,
        'Team collaboration': false,
        'Dedicated account manager': false,
      },
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: <Zap className="w-6 h-6" />,
      price: '$19.99/mo',
      features: {
        'Words per month': '100,000',
        'Languages': '30',
        'Tone options': 'All',
        'Support': 'Priority email',
        'File uploads': true,
        'Translation history': true,
        'API access': false,
        'Custom tone creation': false,
        'Team collaboration': false,
        'Dedicated account manager': false,
      },
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <Rocket className="w-6 h-6" />,
      price: '$29.99/mo',
      features: {
        'Words per month': 'Unlimited',
        'Languages': '35',
        'Tone options': 'All',
        'Support': 'Priority chat',
        'File uploads': true,
        'Translation history': true,
        'API access': true,
        'Custom tone creation': true,
        'Team collaboration': true,
        'Dedicated account manager': false,
      },
    },
    {
      id: 'business',
      name: 'Business',
      icon: <Building className="w-6 h-6" />,
      price: '$59.99/mo',
      features: {
        'Words per month': 'Unlimited',
        'Languages': '40+',
        'Tone options': 'All',
        'Support': 'Phone',
        'File uploads': true,
        'Translation history': true,
        'API access': true,
        'Custom tone creation': true,
        'Team collaboration': true,
        'Dedicated account manager': true,
      },
    }
  ];

const allFeatures = [
    'Words per month',
    'Languages',
    'Tone options',
    'Support',
    'File uploads',
    'Translation history',
    'API access',
    'Custom tone creation',
    'Team collaboration',
    'Dedicated account manager',
];

export const ComparePlansModal: React.FC<ComparePlansModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black/80 border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-200">Compare Plans</DialogTitle>
          <DialogDescription className="text-purple-300/70">
            Find the perfect plan for your translation needs.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-purple-500/30">
                <TableHead className="text-left text-white font-semibold">Features</TableHead>
                {plans.map(plan => (
                  <TableHead key={plan.id} className="text-center text-white font-semibold">
                    {plan.name}
                    {plan.popular && <Badge className="ml-2 bg-purple-600 text-white">Popular</Badge>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-purple-500/30">
                <TableCell className="font-semibold text-purple-200">Price</TableCell>
                {plans.map(plan => (
                  <TableCell key={plan.id} className="text-center font-bold text-lg">{plan.price}</TableCell>
                ))}
              </TableRow>
              {allFeatures.map(feature => (
                <TableRow key={feature} className="border-b border-purple-500/30">
                  <TableCell className="font-medium text-purple-200">{feature}</TableCell>
                  {plans.map(plan => (
                    <TableCell key={plan.id} className="text-center">
                      {typeof plan.features[feature as keyof typeof plan.features] === 'boolean' ? (
                        plan.features[feature as keyof typeof plan.features] ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-400 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{plan.features[feature as keyof typeof plan.features]}</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell></TableCell>
                {plans.map(plan => (
                  <TableCell key={plan.id} className="text-center p-4">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      {plan.id === 'free' ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
};
