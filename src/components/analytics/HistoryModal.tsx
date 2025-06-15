
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { History } from "lucide-react";

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ open, onClose }) => (
  <Dialog open={open} onOpenChange={v => !v && onClose()}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          <History className="w-5 h-5 inline-block mr-2" />
          Translation History
        </DialogTitle>
        <DialogDescription>
          Recent translations and activities (demo)
        </DialogDescription>
      </DialogHeader>
      <div className="overflow-x-auto rounded bg-black/50 my-4">
        <table className="min-w-full text-blue-200 text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Action</th>
              <th className="px-3 py-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-1">2025-06-15</td>
              <td className="px-3 py-1">Translate</td>
              <td className="px-3 py-1">"Hello world" → Spanish, French</td>
            </tr>
            <tr>
              <td className="px-3 py-1">2025-06-14</td>
              <td className="px-3 py-1">Bulk Export</td>
              <td className="px-3 py-1">Exported usage history (CSV)</td>
            </tr>
            <tr className="opacity-50">
              <td className="px-3 py-1" colSpan={3}>
                [More entries available in production]
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <DialogClose asChild>
        <button className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-200 font-semibold">Close</button>
      </DialogClose>
    </DialogContent>
  </Dialog>
);
