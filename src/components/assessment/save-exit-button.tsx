"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { logOut } from "@/app/actions/auth";

interface SaveExitButtonProps {
  onSave: () => Promise<void>;
}

export function SaveExitButton({ onSave }: SaveExitButtonProps) {
  const [saving, setSaving] = useState(false);

  const handleClick = async () => {
    setSaving(true);
    try {
      await onSave();
      await logOut();
    } catch {
      setSaving(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={saving}
      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800"
    >
      {saving ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <LogOut className="w-3.5 h-3.5" />
          Save & log out
        </>
      )}
    </Button>
  );
}
