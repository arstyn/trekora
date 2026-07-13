import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ILead } from "@/types/lead/lead.entity";
import { LeadForm } from "./lead-form";
import { User, Building2, ArrowLeft } from "lucide-react";

type CreateLeadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (handleSaveLead: boolean, lead: ILead) => void;
  setOpenCustomerCreateModal: (open: boolean) => void;
};

export function CreateLeadModal({
  open,
  onOpenChange,
  onSave,
  setOpenCustomerCreateModal,
}: CreateLeadModalProps) {
  const [selectedType, setSelectedType] = useState<"individual" | "company" | null>(null);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) {
      setSelectedType(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {selectedType === "individual"
                ? "New Individual Lead"
                : selectedType === "company"
                ? "New Company Lead"
                : "Create New Lead"}
            </span>
            {selectedType && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(null)}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {!selectedType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <button
              onClick={() => setSelectedType("individual")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:border-primary hover:bg-accent/40 transition-all duration-300 group text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                <User className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Individual Lead</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  For solo travelers, couples, families, or personal bookings
                </p>
              </div>
            </button>

            <button
              onClick={() => setSelectedType("company")}
              className="flex flex-col items-center justify-center p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm hover:border-primary hover:bg-accent/40 transition-all duration-300 group text-center space-y-4"
            >
              <div className="p-4 rounded-full bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Company Lead</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  For corporate clients, organizations, business trips, or retreats
                </p>
              </div>
            </button>
          </div>
        ) : (
          <LeadForm
            isCreating={true}
            onSave={onSave}
            onClose={handleOpenChange}
            setOpenCustomerCreateModal={setOpenCustomerCreateModal}
            defaultLeadType={selectedType}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
