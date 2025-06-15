
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BillingHistory } from './BillingHistory';
import { Button } from '../ui/button';
import { User } from '@supabase/supabase-js';

interface BillingModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export const BillingModal: React.FC<BillingModalProps> = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-black/95 via-purple-900/20 to-blue-900/10 backdrop-blur-xl border-purple-500/30 text-white">
        <DialogHeader>
          <DialogTitle>Billing & Invoices</DialogTitle>
          <DialogDescription>
            Here is your complete billing history. For more options, visit the customer portal.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4">
          <BillingHistory userId={user?.id} />
        </div>
        <DialogClose asChild>
          <Button variant="outline" className="mt-4">Close</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
