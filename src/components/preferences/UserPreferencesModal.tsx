
import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface UserPreferencesModalProps {
  open: boolean;
  onClose: () => void;
}

export const UserPreferencesModal: React.FC<UserPreferencesModalProps> = ({ open, onClose }) => {
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);
  const [uiScale, setUiScale] = useState(100);
  const [defaultTone, setDefaultTone] = useState("natural");

  // Fake save
  const handleSave = () => {
    window.toast?.success?.("Preferences saved! (Not yet persisted)");
    onClose();
  }

  return (
    <Drawer open={open} onOpenChange={v => !v && onClose()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Preferences</DrawerTitle>
          <DrawerDescription>Personalize your Linguista app experience</DrawerDescription>
        </DrawerHeader>
        <div className="space-y-6 px-6 py-3">
          <div>
            <div className="mb-1 font-medium">Theme</div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System Default</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="mb-1 font-medium">App Language</div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="App language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="zh">Chinese</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Enable Notifications</span>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div>
            <div className="mb-1 font-medium">Accessibility (UI Scale)</div>
            <Slider
              min={80}
              max={150}
              step={5}
              value={[uiScale]}
              onValueChange={vals => setUiScale(vals[0])}
              className="w-full"
            />
            <div className="text-xs mt-1 text-gray-400">{uiScale}%</div>
          </div>
          <div>
            <div className="mb-1 font-medium">Default Tone</div>
            <Select value={defaultTone} onValueChange={setDefaultTone}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Default tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="natural">Natural</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="direct">Direct</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DrawerFooter>
          <Button onClick={handleSave} className="bg-purple-700 text-white">Save</Button>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
