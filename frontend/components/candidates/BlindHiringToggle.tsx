'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface BlindHiringToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BlindHiringToggle({ value, onChange }: BlindHiringToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
      <div className="flex items-center gap-2">
        <Switch id="blind-hiring" checked={value} onCheckedChange={onChange} />
        <Label htmlFor="blind-hiring" className="cursor-pointer">
          Blind Hiring Mode
        </Label>
      </div>
    </div>
  );
}
