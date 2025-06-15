
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Zap } from "lucide-react";
import { PerformanceCharts } from "./PerformanceCharts";
import { Button } from "../ui/button";

interface PerformanceModalProps {
  open: boolean;
  onClose: () => void;
}

export const PerformanceModal: React.FC<PerformanceModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-3xl bg-gradient-to-br from-black/95 via-blue-900/20 to-purple-900/10 backdrop-blur-xl border-blue-500/30 text-white">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <Zap className="inline w-5 h-5 mr-2" />
          <span>Neural Performance Dashboard</span>
        </DialogTitle>
        <DialogDescription className="text-blue-300/70">
          Real-time translation system stats.
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[70vh] overflow-y-auto pr-4 my-4">
        <PerformanceCharts />
      </div>
      <DialogClose asChild>
        <Button variant="outline" className="mt-4">Close</Button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);
