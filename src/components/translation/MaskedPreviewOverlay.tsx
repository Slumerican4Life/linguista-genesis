
import React, { useState, useEffect } from "react";
import { X, Globe, Languages, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";

interface MaskedPreviewOverlayProps {
  url: string;
  languages: string[];
  defaultLanguage?: string;
  onClose: () => void;
}

export const MaskedPreviewOverlay: React.FC<MaskedPreviewOverlayProps> = ({
  url,
  languages,
  defaultLanguage,
  onClose,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>(
    defaultLanguage || (languages.length > 0 ? languages[0] : "en")
  );
  const [originalHtml, setOriginalHtml] = useState<string | null>(null);
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAndTranslate = async () => {
      setLoading(true);
      try {
        // Fetch original HTML content (proxy to avoid CORS issues may be needed)
        const resp = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`); // Placeholder endpoint
        if (!resp.ok) throw new Error("Unable to fetch site content.");
        const html = await resp.text();
        if (!isMounted) return;
        setOriginalHtml(html);

        // Now ask backend to re-translate all text nodes (simulate by replacing dummy)
        const translateResp = await fetch("/api/mock-ai-translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html,
            targetLang: selectedLang,
          }),
        });
        if (!translateResp.ok) throw new Error("AI translation failed.");
        const data = await translateResp.json();
        if (!isMounted) return;
        setTranslatedHtml(data.translatedHtml);
      } catch (e: any) {
        toast.error("Preview failed: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAndTranslate();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [url, selectedLang]);

  return (
    <div className="fixed bottom-4 right-4 z-[3000] bg-black/90 border border-purple-700 rounded-lg shadow-lg w-[370px] md:w-[500px] max-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-purple-900/90 rounded-t-lg border-b border-purple-700">
        <div className="flex items-center gap-2 text-purple-100">
          <Globe className="w-5 h-5" />
          <span className="font-bold">Masked Site Preview</span>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose}>
          <X className="w-5 h-5 text-purple-200" />
        </Button>
      </div>
      {/* Controls */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-black/40 border-b border-purple-800">
        <Languages className="w-4 h-4 text-purple-300" />
        <select
          className="bg-purple-950 text-purple-200 py-1 px-2 rounded-md text-sm"
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
        <span className="text-xs text-purple-400 ml-auto">
          Powered by Neural AI
        </span>
      </div>
      {/* Preview */}
      <div className="flex-1 overflow-auto bg-black p-4">
        <div className="text-xs text-purple-300 mb-2">
          Showing <b>{selectedLang.toUpperCase()}</b> + <b>English</b> preview below.
        </div>
        {loading ? (
          <div className="text-purple-200 animate-pulse py-12 text-center">
            <Eye className="w-8 h-8 mx-auto mb-2 animate-bounce" />
            Loading live translation preview...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simulate dual-language preview */}
            {translatedHtml && originalHtml ? (
              <div>
                <div className="mb-2 border-b border-purple-700 pb-1 font-semibold uppercase text-purple-400">
                  AI Translation ({selectedLang.toUpperCase()})
                </div>
                <div
                  className="text-base leading-relaxed text-white mb-5"
                  style={{ borderLeft: "3px solid #a78bfa", paddingLeft: 6 }}
                  dangerouslySetInnerHTML={{ __html: translatedHtml }}
                />
                <div className="mb-1 border-b border-purple-700 pb-1 font-semibold uppercase text-purple-400">
                  English (original)
                </div>
                <div
                  className="text-base leading-relaxed text-purple-300"
                  dangerouslySetInnerHTML={{ __html: originalHtml }}
                />
              </div>
            ) : (
              <div className="text-purple-400 text-center py-8">
                No preview available for this site.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-4 pb-2 text-right">
        {/* Allow resizing in future */}
        <span className="text-xs text-purple-400">Beta — Contextual AI translation</span>
      </div>
    </div>
  );
};
