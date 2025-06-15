
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BarChart2 } from "lucide-react";
import { AnalyticsCharts } from './AnalyticsCharts';
import { Button } from "../ui/button";

interface AnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-3xl bg-gradient-to-br from-black/95 via-purple-900/20 to-blue-900/10 backdrop-blur-xl border-purple-500/30 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <BarChart2 className="w-5 h-5 inline-block mr-2" />
          <span>Advanced Usage Analytics</span>
        </DialogTitle>
        <DialogDescription className="text-purple-300/70">Here's a professional overview of your translation activity.</DialogDescription>
      </DialogHeader>
      <div className="max-h-[70vh] overflow-y-auto pr-4 my-4">
        <AnalyticsCharts />
      </div>
      <DialogClose asChild>
        <Button variant="outline" className="mt-4">Close</Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);
