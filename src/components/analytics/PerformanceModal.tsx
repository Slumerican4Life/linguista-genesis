
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Zap } from "lucide-react";

interface PerformanceModalProps {
  open: boolean;
  onClose: () => void;
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>
          <Zap className="inline w-5 h-5 mr-2" />
          Neural Performance
        </DialogTitle>
        <DialogDescription>
          Real-time translation system stats (demo data)
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2 p-2 rounded bg-black/60 mb-2 text-blue-200">
        <div>
          <b>Avg. Response Time:</b> 0.34s
        </div>
        <div>
          <b>System Uptime:</b> 99.98%
        </div>
        <div>
          <b>Translation Accuracy:</b> 98.7%
        </div>
      </div>
      <DialogClose asChild>
        <button className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-200 font-semibold">Close</button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);
