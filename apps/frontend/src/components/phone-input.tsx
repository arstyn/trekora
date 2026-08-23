import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { getCountries, getCountryCallingCode } from "react-phone-number-input/input";
import en from "react-phone-number-input/locale/en";

interface PhoneInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: { target: { name: string; value: string } }) => void;
    className?: string;
    placeholder?: string;
    defaultCountryCode?: string;
}

const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

export function PhoneInput({
    id,
    name,
    value,
    onChange,
    className,
    placeholder,
    defaultCountryCode = "+91",
}: PhoneInputProps) {
    const parseValue = (val: string) => {
        if (!val) return { code: defaultCountryCode, number: "" };
        const parts = val.trim().split(" ");
        if (parts.length > 1 && parts[0].startsWith("+")) {
            return { code: parts[0], number: parts.slice(1).join(" ") };
        }
        if (val.startsWith("+")) {
            const match = val.match(/^(\+\d{1,4})(\d*)$/);
            if (match) {
                return { code: match[1], number: match[2] };
            }
        }
        return { code: defaultCountryCode, number: val };
    };

    const [selectedCountry, setSelectedCountry] = useState<string>("IN");
    const [customCode, setCustomCode] = useState<string>(defaultCountryCode);
    const [number, setNumber] = useState("");
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const countryOptions = useMemo(() => {
        return getCountries().map((country) => {
            const callingCode = `+${getCountryCallingCode(country)}`;
            return {
                country,
                callingCode,
                label: `${en[country]} (${callingCode})`,
                flag: getFlagEmoji(country),
            };
        });
    }, []);

    // Sync from prop changes
    useEffect(() => {
        if (!value) {
            setNumber("");
            return;
        }
        
        const p = parseValue(value);
        setNumber(p.number);

        // Check if currently selected country matches the parsed code
        const currentCountryOpt = countryOptions.find(c => c.country === selectedCountry);
        if (currentCountryOpt && currentCountryOpt.callingCode === p.code) {
            return; // matches, keep current country to avoid jumping (e.g. US vs CA)
        }

        // Find a matching country for the code
        const newCountryOpt = countryOptions.find(c => c.callingCode === p.code);
        if (newCountryOpt) {
            setSelectedCountry(newCountryOpt.country);
        } else {
            setSelectedCountry("");
            setCustomCode(p.code);
        }
    }, [value, defaultCountryCode, countryOptions, selectedCountry]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value;
        setNumber(newNumber);
        const currentCode = selectedCountry 
            ? countryOptions.find(c => c.country === selectedCountry)?.callingCode || customCode 
            : customCode;
        triggerChange(currentCode, newNumber);
    };

    const handleCodeSelect = (countryISO: string, callingCode: string) => {
        setSelectedCountry(countryISO);
        setCustomCode(callingCode);
        setOpen(false);
        setSearchQuery("");
        triggerChange(callingCode, number);
    };

    const triggerChange = (currentCode: string, currentNumber: string) => {
        if (onChange && name) {
            const finalValue = currentNumber.trim() ? `${currentCode} ${currentNumber.trim()}` : "";
            onChange({ target: { name, value: finalValue } });
        }
    };

    const filteredOptions = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return countryOptions.filter(
            (opt) =>
                opt.label.toLowerCase().includes(query) ||
                opt.callingCode.includes(query)
        );
    }, [searchQuery, countryOptions]);

    const activeOption = countryOptions.find(c => c.country === selectedCountry) 
        || { flag: "🌐", callingCode: customCode, country: "", label: customCode };

    return (
        <div className={`flex gap-2 ${className || ""}`}>
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[120px] justify-between h-9 px-3"
                    >
                        <span className="flex items-center gap-2 truncate">
                            <span>{activeOption.flag}</span>
                            <span>{activeOption.callingCode}</span>
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <div className="flex flex-col h-[300px]">
                        <div className="p-2 border-b">
                            <Input
                                placeholder="Search country or code (e.g. +91)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 text-xs"
                                autoFocus
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="py-6 text-center text-xs text-muted-foreground">
                                    No country found.
                                </div>
                            ) : (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.country}
                                        type="button"
                                        onClick={() => handleCodeSelect(option.country, option.callingCode)}
                                        className={`w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-between cursor-pointer ${
                                            selectedCountry === option.country
                                                ? "bg-accent font-medium text-accent-foreground"
                                                : "text-foreground"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2 truncate">
                                            <span>{option.flag}</span>
                                            <span>{option.label}</span>
                                        </span>
                                        {selectedCountry === option.country && (
                                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
            <Input
                id={id}
                name={name}
                value={number}
                onChange={handleNumberChange}
                placeholder={placeholder}
                className="h-9 flex-1"
            />
        </div>
    );
}
