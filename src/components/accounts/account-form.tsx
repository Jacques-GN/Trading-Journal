"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ACCOUNT_COLORS } from "@/lib/enums";
import { colorOf } from "@/lib/enums";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AccountForm({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [broker, setBroker] = useState("");
  const [initialCapital, setInitialCapital] = useState("10000");
  const [color, setColor] = useState("emerald");
  const [isDefault, setIsDefault] = useState(true);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Nom requis");
      return;
    }
    const cap = parseFloat(initialCapital);
    if (isNaN(cap) || cap <= 0) {
      toast.error("Capital invalide");
      return;
    }
    try {
      await apiPost("/api/accounts", {
        name,
        broker: broker || null,
        initialCapital: cap,
        color,
        isDefault,
      });
      toast.success("Compte créé");
      setName("");
      setBroker("");
      setInitialCapital("10000");
      setColor("emerald");
      setIsDefault(true);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest">Nouveau compte</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Nom du compte *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Forex Primaire"
              className="border-white/10 bg-white/5"
            />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Courtier</Label>
            <Input
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              placeholder="IC Markets, Binance…"
              className="border-white/10 bg-white/5"
            />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Capital initial ($)</Label>
            <Input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(e.target.value)}
              className="border-white/10 bg-white/5 font-mono"
            />
          </div>
          <div>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Couleur d'accent</Label>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_COLORS.map((c) => {
                const co = colorOf(c);
                const active = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border-2 transition-all",
                      active ? "border-white" : "border-transparent"
                    )}
                    style={{ background: `oklch(0.3 0 0)` }}
                  >
                    <span className={cn("h-5 w-5 rounded-full", co.dot)} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/5 bg-white/[0.02] p-3">
            <div>
              <p className="text-sm font-medium">Compte par défaut</p>
              <p className="text-[11px] text-muted-foreground">Sera sélectionné au démarrage</p>
            </div>
            <Switch checked={isDefault} onCheckedChange={setIsDefault} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10">
            Annuler
          </Button>
          <Button onClick={save} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
            Créer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
