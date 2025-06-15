
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BarChart2 } from "lucide-react";

interface AnalyticsModalProps {
  open: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          <BarChart2 className="w-5 h-5 inline-block mr-2" />
          Usage Analytics
        </DialogTitle>
        <DialogDescription>Here's an overview of your recent neural translation activity:</DialogDescription>
      </DialogHeader>
      <div className="my-4">
        <div className="text-lg font-bold text-white">Statistics (Demo)</div>
        <ul className="text-blue-200 space-y-1 mt-2">
          <li><span className="font-bold">Words Translated:</span> 5,200 this month</li>
          <li><span className="font-bold">Unique Languages Used:</span> 8</li>
          <li><span className="font-bold">Longest Streak:</span> 19 days</li>
          <li><span className="font-bold">Peak Day:</span> Friday</li>
        </ul>
      </div>
      <DialogClose asChild>
        <button className="w-full py-2 mt-2 rounded bg-blue-700 text-white font-semibold">Close</button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);
