
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Download } from "lucide-react";

interface ExportDataModalProps {
  open: boolean;
  onClose: () => void;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({ open, onClose }) => {
  function handleExport() {
    // Simulate data export
    const data = [
      { date: "2025-06-15", words: 300, languages: 2 },
      { date: "2025-06-14", words: 540, languages: 4 },
    ];
    const csv = "Date,Words,Languages\n" + data.map(d => `${d.date},${d.words},${d.languages}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "linguista-usage-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Download className="inline w-5 h-5 mr-2" />
            Export Usage Data
          </DialogTitle>
          <DialogDescription>
            Export your activity as CSV for self-analysis or support.
          </DialogDescription>
        </DialogHeader>
        <div className="text-blue-200 my-4">
          Export your translated word and language usage history. Demo data only.
        </div>
        <button
          onClick={handleExport}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold mt-2"
        >
          Download CSV
        </button>
        <DialogClose asChild>
          <button className="w-full py-2 mt-2 rounded bg-gray-800 text-gray-200 font-semibold">Close</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
