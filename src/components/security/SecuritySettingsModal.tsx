
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SecuritySettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({ open, onClose }) => {
  const [password, setPassword] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  // Simulate password save
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Password changed (demo only)");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Security Settings</DialogTitle>
          <DialogDescription>Manage your password and account access options.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handlePasswordChange} className="space-y-4 mt-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Change Password</label>
            <Input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center mt-2">
            <label className="mr-2 font-medium">Two-Factor Authentication</label>
            <Button type="button" onClick={() => {
              setTwoFAEnabled((v) => !v);
              toast.info("This would configure 2FA in a real app!");
            }} variant={twoFAEnabled ? "default" : "outline"}>
              {twoFAEnabled ? "Enabled" : "Enable"}
            </Button>
          </div>
          {/* Simulate login activity/history */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-2 mt-4 text-sm text-blue-200">
            <b>Recent Login Activity</b>
            <ul className="mt-1 list-disc list-inside">
              <li>2025-06-14 · Chrome · New York, USA</li>
              <li>2025-06-10 · iPhone · Paris, France</li>
              <li className="opacity-50">[More shown in real app]</li>
            </ul>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-purple-700 text-white">Change Password</Button>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

