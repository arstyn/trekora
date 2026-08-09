import { useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MultiSearchableSelectProps {
    options: { value: string; label: string }[];
    value?: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    allowCustom?: boolean;
    maxBadgesShown?: number;
}

export function MultiSearchableSelect({
    options,
    value = [],
    onChange,
    placeholder,
    searchPlaceholder = "Search...",
    disabled = false,
    allowCustom = true,
    maxBadgesShown = 3,
}: MultiSearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const selectedValues = Array.isArray(value) ? value : [];

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );

    const toggleOption = (optValue: string) => {
        if (selectedValues.includes(optValue)) {
            onChange(selectedValues.filter((v) => v !== optValue));
        } else {
            onChange([...selectedValues, optValue]);
        }
    };

    const removeValue = (optValue: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        onChange(selectedValues.filter((v) => v !== optValue));
    };

    const handleSelectAll = () => {
        const allFilteredValues = filteredOptions.map((o) => o.value);
        const combined = Array.from(new Set([...selectedValues, ...allFilteredValues]));
        onChange(combined);
    };

    const handleClearAll = () => {
        const filteredSet = new Set(filteredOptions.map((o) => o.value));
        onChange(selectedValues.filter((v) => !filteredSet.has(v)));
    };

    const handleAddCustom = () => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        if (!selectedValues.includes(trimmed)) {
            onChange([...selectedValues, trimmed]);
        }
        setSearchQuery("");
    };

    const isCustomCandidate =
        allowCustom &&
        searchQuery.trim().length > 0 &&
        !filteredOptions.some((o) => o.label.toLowerCase() === searchQuery.trim().toLowerCase()) &&
        !selectedValues.some((v) => v.toLowerCase() === searchQuery.trim().toLowerCase());

    const getLabel = (val: string) => {
        const found = options.find((o) => o.value === val);
        return found ? found.label : val;
    };

    const visibleValues = selectedValues.slice(0, maxBadgesShown);
    const hiddenCount = selectedValues.length - maxBadgesShown;

    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className="w-full justify-between min-h-[38px] h-auto py-1 px-2.5 text-left font-normal border bg-background hover:bg-accent hover:text-accent-foreground text-sm"
                >
                    <div className="flex flex-wrap gap-1 items-center max-w-[calc(100%-24px)] overflow-hidden">
                        {selectedValues.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            <>
                                {visibleValues.map((val) => (
                                    <Badge
                                        key={val}
                                        variant="secondary"
                                        className="text-xs px-2 py-0.5 flex items-center gap-1 font-normal bg-secondary text-secondary-foreground"
                                    >
                                        <span className="truncate max-w-[120px]">{getLabel(val)}</span>
                                        <X
                                            className="h-3 w-3 opacity-60 hover:opacity-100 cursor-pointer shrink-0"
                                            onClick={(e) => removeValue(val, e)}
                                        />
                                    </Badge>
                                ))}
                                {hiddenCount > 0 && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 font-normal">
                                        +{hiddenCount} more
                                    </Badge>
                                )}
                            </>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0 border shadow-md bg-popover text-popover-foreground rounded-md overflow-hidden"
                style={{ width: "var(--radix-popover-trigger-width)" }}
                align="start"
            >
                <div className="flex flex-col max-h-[260px]">
                    <div className="p-2 border-b space-y-1.5">
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-xs"
                        />
                        <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                            <span>{selectedValues.length} selected</span>
                            <div className="space-x-2">
                                <button
                                    type="button"
                                    onClick={handleSelectAll}
                                    className="hover:underline text-primary font-medium cursor-pointer"
                                >
                                    Select All
                                </button>
                                <span>•</span>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="hover:underline text-destructive font-medium cursor-pointer"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 max-h-[190px] space-y-0.5">
                        {filteredOptions.length === 0 && !isCustomCandidate ? (
                            <div className="py-4 text-center text-xs text-muted-foreground">
                                No options found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = selectedValues.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleOption(option.value)}
                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between cursor-pointer ${
                                            isSelected
                                                ? "bg-accent font-medium text-accent-foreground"
                                                : "text-foreground"
                                        }`}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                                    </button>
                                );
                            })
                        )}

                        {isCustomCandidate && (
                            <button
                                type="button"
                                onClick={handleAddCustom}
                                className="w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors hover:bg-accent text-primary font-medium flex items-center gap-1.5 cursor-pointer border-t mt-1 pt-1.5"
                            >
                                <Plus className="h-3.5 w-3.5 shrink-0" />
                                <span>Add "{searchQuery.trim()}"</span>
                            </button>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
