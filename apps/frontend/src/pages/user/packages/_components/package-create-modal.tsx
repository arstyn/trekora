import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Sliders, Sparkles } from "lucide-react";

type PackageCreateModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: "normal" | "advanced") => void;
};

export function PackageCreateModal({
    open,
    onOpenChange,
    onSelect,
}: PackageCreateModalProps) {
    const handleOpenChange = (val: boolean) => {
        onOpenChange(val);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between text-2xl font-bold tracking-tight text-foreground">
                        <span>Select Package Type</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                    <button
                        onClick={() => onSelect("normal")}
                        className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:border-primary/80 hover:bg-accent/40 hover:shadow-md transition-all duration-300 group text-center space-y-5"
                    >
                        <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                            <Sliders className="h-9.5 w-9.5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-xl tracking-tight text-foreground">Normal Package</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Simplified version containing basic info, package tiers, payment structure, and cancellation tiers.
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => onSelect("advanced")}
                        className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:border-primary/80 hover:bg-accent/40 hover:shadow-md transition-all duration-300 group text-center space-y-5"
                    >
                        <div className="p-4 rounded-full bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="h-9.5 w-9.5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-bold text-xl tracking-tight text-foreground">Advanced Package</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Comprehensive version featuring multi-day itinerary, inclusions/exclusions, detailed transport/logistics, and custom requirements.
                            </p>
                        </div>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
