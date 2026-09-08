import React, { useState } from "react";
import { Shield, Eye, Bot, History, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  updateUserPrivacyPreferences,
  UserPrivacyPreferences,
} from "@/features/intelligence/privacy.service";

interface UserPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialPrefs?: UserPrivacyPreferences;
}

export const UserPrivacyModal: React.FC<UserPrivacyModalProps> = ({
  isOpen,
  onClose,
  userId,
  initialPrefs,
}) => {
  const [personalization, setPersonalization] = useState(
    initialPrefs?.enablePersonalization ?? true,
  );
  const [aiAssistance, setAiAssistance] = useState(initialPrefs?.enableAiAssistance ?? true);
  const [searchHistory, setSearchHistory] = useState(initialPrefs?.enableSearchHistory ?? true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateUserPrivacyPreferences(userId, {
      enablePersonalization: personalization,
      enableAiAssistance: aiAssistance,
      enableSearchHistory: searchHistory,
    });
    setIsSaving(false);

    if (success) {
      toast.success("Privacy preferences updated.");
      onClose();
    } else {
      toast.error("Failed to save privacy options.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-card border rounded-3xl p-6 shadow-xl max-w-md w-full space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <span className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Privacy & Personalization Controls
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-secondary/30 rounded-xl border flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-primary" /> Personalized Recommendations
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tailor housing match feed using stated preferences and saved listings.
              </p>
            </div>
            <input
              type="checkbox"
              checked={personalization}
              onChange={(e) => setPersonalization(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-xl border flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-primary" /> AI Tenant Assistant
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Enable AI-generated listing summaries, viewing guidance, and property analysis.
              </p>
            </div>
            <input
              type="checkbox"
              checked={aiAssistance}
              onChange={(e) => setAiAssistance(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-xl border flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <History className="h-4 w-4 text-primary" /> Search & Activity History
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Store recent search queries locally to streamline multi-session house hunting.
              </p>
            </div>
            <input
              type="checkbox"
              checked={searchHistory}
              onChange={(e) => setSearchHistory(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-primary cursor-pointer"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xl text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/95 flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
            Save Consent Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
