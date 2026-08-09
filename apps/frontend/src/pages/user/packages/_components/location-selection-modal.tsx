import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, Globe, Check, Plus, X, Search, Building2, Landmark, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { countries } from "@/pages/user/customers/_components/countries";
import { getAllStates, getDistricts } from "india-state-district";

export interface PackageLocationValue {
    type: "local" | "international";
    countries: string[];
    states: string[];
    cities: string[];
}

interface LocationSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    value: PackageLocationValue;
    onChange: (val: PackageLocationValue) => void;
}

export function LocationSelectionModal({
    open,
    onOpenChange,
    value,
    onChange,
}: LocationSelectionModalProps) {
    const initialType = value?.type || "local";
    const [tempType, setTempType] = useState<"local" | "international">(initialType);
    const [includeStates, setIncludeStates] = useState<boolean>(
        value?.states && value.states.length > 0 ? true : initialType === "local"
    );
    const [tempCountries, setTempCountries] = useState<string[]>(value?.countries || ["India"]);
    const [tempStates, setTempStates] = useState<string[]>(value?.states || []);
    const [tempCities, setTempCities] = useState<string[]>(value?.cities || []);

    const [countrySearch, setCountrySearch] = useState("");
    const [stateSearch, setStateSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [showAllCountries, setShowAllCountries] = useState(false);
    const [cityStateMap, setCityStateMap] = useState<Record<string, string>>({});
    const [stateCityInputs, setStateCityInputs] = useState<Record<string, string>>({});

    // Sync when modal opens
    useEffect(() => {
        if (open) {
            const currentType = value?.type || "local";
            setTempType(currentType);
            const shouldIncludeStates = value?.states && value.states.length > 0 ? true : currentType === "local";
            setIncludeStates(shouldIncludeStates);
            setTempCountries(value?.countries?.length ? value.countries : (currentType === "local" ? ["India"] : []));
            setTempStates(value?.states || []);
            setTempCities(value?.cities || []);
            setCountrySearch("");
            setStateSearch("");
            setCitySearch("");
            setShowAllCountries(false);
            setStateCityInputs({});
        }
    }, [open, value]);

    // Handle Type switch
    const handleTypeSelect = (type: "local" | "international") => {
        setTempType(type);
        if (type === "local") {
            setTempCountries(["India"]);
            setIncludeStates(true);
        } else {
            if (tempCountries.length === 1 && tempCountries[0] === "India") {
                setTempCountries([]);
            }
            setIncludeStates(false);
            setTempStates([]);
        }
    };

    // Filtered countries
    const filteredCountries = useMemo(() => {
        const query = countrySearch.toLowerCase().trim();
        if (!query) return countries;
        return countries.filter(
            (c) => c.label.toLowerCase().includes(query) || c.value.toLowerCase().includes(query)
        );
    }, [countrySearch]);

    // Displayed countries (limited to 40 unless search active or expanded)
    const displayedCountries = useMemo(() => {
        if (showAllCountries || countrySearch.trim() !== "") {
            return filteredCountries;
        }
        return filteredCountries.slice(0, 40);
    }, [filteredCountries, showAllCountries, countrySearch]);

    // Indian states options
    const indianStateOptions = useMemo(() => {
        return getAllStates().map((s) => ({ value: s.name, label: s.name, code: s.code }));
    }, []);

    const filteredIndianStates = useMemo(() => {
        const query = stateSearch.toLowerCase().trim();
        if (!query) return indianStateOptions;
        return indianStateOptions.filter((s) => s.label.toLowerCase().includes(query));
    }, [stateSearch, indianStateOptions]);

    // Districts and cities grouped per selected state (for both local and international)
    const stateDistrictsMap = useMemo(() => {
        const allStates = getAllStates();
        const query = citySearch.toLowerCase().trim();

        return tempStates.map((stateName) => {
            const stateObj = allStates.find((s) => s.name === stateName);
            let districts: string[] = [];
            if (stateObj) {
                districts = getDistricts(stateObj.code);
            }
            const filtered = query
                ? districts.filter((d) => d.toLowerCase().includes(query))
                : districts;

            // Assigned cities for this state
            const assignedCities = tempCities.filter((c) => {
                if (districts.includes(c)) return true;
                return cityStateMap[c] === stateName;
            });

            return {
                stateName,
                allDistricts: districts,
                filteredDistricts: filtered,
                assignedCities,
            };
        });
    }, [tempStates, tempCities, cityStateMap, citySearch]);

    // Flat set of all suggested districts or assigned cities across all selected states
    const allSuggestedOrAssignedCitiesSet = useMemo(() => {
        const set = new Set<string>();
        stateDistrictsMap.forEach((group) => {
            group.allDistricts.forEach((d) => set.add(d));
            group.assignedCities.forEach((c) => set.add(c));
        });
        return set;
    }, [stateDistrictsMap]);

    // Cities that are selected/entered but don't belong to any selected state section
    const customCities = useMemo(() => {
        const query = citySearch.toLowerCase().trim();
        const customList = tempCities.filter((c) => !allSuggestedOrAssignedCitiesSet.has(c));
        if (!query) return customList;
        return customList.filter((c) => c.toLowerCase().includes(query));
    }, [tempCities, allSuggestedOrAssignedCitiesSet, citySearch]);

    // Country selection toggle
    const toggleCountry = (countryName: string) => {
        if (tempCountries.includes(countryName)) {
            setTempCountries(tempCountries.filter((c) => c !== countryName));
        } else {
            setTempCountries([...tempCountries, countryName]);
        }
    };

    // State selection toggle
    const toggleState = (stateName: string) => {
        if (tempStates.includes(stateName)) {
            setTempStates(tempStates.filter((s) => s !== stateName));
        } else {
            setTempStates([...tempStates, stateName]);
        }
    };

    // City selection toggle
    const toggleCity = (cityName: string) => {
        if (tempCities.includes(cityName)) {
            setTempCities(tempCities.filter((c) => c !== cityName));
        } else {
            setTempCities([...tempCities, cityName]);
        }
    };

    // Custom tag addition
    const addCustomState = () => {
        const trimmed = stateSearch.trim();
        if (trimmed && !tempStates.includes(trimmed)) {
            setTempStates([...tempStates, trimmed]);
            setStateSearch("");
        }
    };

    const addCityToState = (stateName: string, cityName: string) => {
        const trimmed = cityName.trim();
        if (!trimmed) return;
        if (!tempCities.includes(trimmed)) {
            setTempCities((prev) => [...prev, trimmed]);
        }
        setCityStateMap((prev) => ({ ...prev, [trimmed]: stateName }));
    };

    const addCustomCity = () => {
        const trimmed = citySearch.trim();
        if (trimmed && !tempCities.includes(trimmed)) {
            setTempCities([...tempCities, trimmed]);
            if (tempStates.length === 1) {
                setCityStateMap((prev) => ({ ...prev, [trimmed]: tempStates[0] }));
            }
            setCitySearch("");
        }
    };

    const handleSave = () => {
        const finalStates = includeStates ? tempStates : [];
        onChange({
            type: tempType,
            countries: tempType === "local" ? ["India"] : tempCountries,
            states: finalStates,
            cities: tempCities,
        });
        onOpenChange(false);
    };

    const handleClearAll = () => {
        setTempCountries(tempType === "local" ? ["India"] : []);
        setTempStates([]);
        setTempCities([]);
        setCityStateMap({});
        setStateCityInputs({});
    };

    const isIndiaSelected = tempType === "local" || tempCountries.includes("India");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl w-full max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border shadow-2xl rounded-xl">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" />
                        <span>Package Locations</span>
                    </div>
                    <DialogTitle className="text-xl font-bold">Configure Destinations</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Select the countries, states, and cities where this package will be offered.
                    </DialogDescription>
                </DialogHeader>

                {/* Main Single Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Location Type Selector */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-foreground">Package Scope</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => handleTypeSelect("local")}
                                className={`flex items-center justify-center gap-3 p-3.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                                    tempType === "local"
                                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                                        : "border-border hover:bg-accent text-muted-foreground"
                                }`}
                            >
                                <MapPin className="h-5 w-5 shrink-0" />
                                <div className="text-left">
                                    <div className="font-semibold text-foreground">Local (India)</div>
                                    <div className="text-[11px] text-muted-foreground">Domestic Indian travel packages</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeSelect("international")}
                                className={`flex items-center justify-center gap-3 p-3.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                                    tempType === "international"
                                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-sm"
                                        : "border-border hover:bg-accent text-muted-foreground"
                                }`}
                            >
                                <Globe className="h-5 w-5 shrink-0" />
                                <div className="text-left">
                                    <div className="font-semibold text-foreground">International</div>
                                    <div className="text-[11px] text-muted-foreground">Global destination packages</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Optional State Switch */}
                    <div className="flex items-center justify-between p-3.5 rounded-lg border bg-muted/20">
                        <div className="space-y-0.5">
                            <Label htmlFor="include-states" className="text-sm font-medium cursor-pointer">
                                Include State / Region Selection
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Turn off to skip selecting states and add important cities directly.
                            </p>
                        </div>
                        <Switch
                            id="include-states"
                            checked={includeStates}
                            onCheckedChange={(checked) => {
                                setIncludeStates(checked);
                                if (!checked) setTempStates([]);
                            }}
                        />
                    </div>

                    {/* International Countries Selection */}
                    {tempType === "international" && (
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-primary" />
                                    <span>Select Countries ({tempCountries.length} selected)</span>
                                </Label>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search country (e.g., UAE, France, Thailand)..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                            <div className="border rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 bg-background">
                                {displayedCountries.map((c) => {
                                    const isSelected = tempCountries.includes(c.value);
                                    return (
                                        <Tooltip key={c.value}>
                                            <TooltipTrigger asChild>
                                                <button
                                                    type="button"
                                                    title={c.label}
                                                    onClick={() => toggleCountry(c.value)}
                                                    className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                                                        isSelected
                                                            ? "bg-primary/10 border-primary text-primary font-medium"
                                                            : "border-transparent hover:bg-accent text-foreground"
                                                    }`}
                                                >
                                                    <span className="truncate">{c.label}</span>
                                                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-xs">
                                                {c.label}
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                            </div>

                            {filteredCountries.length > 40 && !countrySearch.trim() && (
                                <div className="flex justify-center pt-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAllCountries(!showAllCountries)}
                                        className="text-xs text-primary gap-1 hover:bg-primary/10 cursor-pointer"
                                    >
                                        {showAllCountries ? (
                                            <>
                                                <ChevronUp className="h-3.5 w-3.5" />
                                                Show Less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3.5 w-3.5" />
                                                Show More ({filteredCountries.length - 40} more countries)
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* States / Regions Selection (If Switch ON) */}
                    {includeStates && (
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-semibold flex items-center gap-2">
                                    <Landmark className="h-4 w-4 text-primary" />
                                    <span>Select States / Regions ({tempStates.length} selected)</span>
                                </Label>
                            </div>

                            <div className="relative flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={
                                            isIndiaSelected
                                                ? "Search Indian state (e.g., Kerala, Goa)..."
                                                : "Search or type state/region name..."
                                        }
                                        value={stateSearch}
                                        onChange={(e) => setStateSearch(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomState();
                                            }
                                        }}
                                        className="pl-9 h-9 text-xs"
                                    />
                                </div>
                                {stateSearch.trim() && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        onClick={addCustomState}
                                        className="h-9 text-xs gap-1 shrink-0"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                        Add Custom State
                                    </Button>
                                )}
                            </div>

                            {isIndiaSelected ? (
                                <div className="border rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 bg-background">
                                    {filteredIndianStates.map((s) => {
                                        const isSelected = tempStates.includes(s.value);
                                        return (
                                            <Tooltip key={s.value}>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        type="button"
                                                        title={s.label}
                                                        onClick={() => toggleState(s.value)}
                                                        className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                                                            isSelected
                                                                ? "bg-primary/10 border-primary text-primary font-medium"
                                                                : "border-transparent hover:bg-accent text-foreground"
                                                        }`}
                                                    >
                                                        <span className="truncate">{s.label}</span>
                                                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-xs">
                                                    {s.label}
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground p-3 border rounded-lg bg-muted/10">
                                    Type region/state names above and press Enter or click <strong>Add Custom State</strong>.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cities / Destinations Selection */}
                    <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <span>Select Cities / Destinations ({tempCities.length} selected)</span>
                            </Label>
                        </div>

                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search or type city name (e.g., Dubai, Paris, Kochi)..."
                                    value={citySearch}
                                    onChange={(e) => setCitySearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addCustomCity();
                                        }
                                    }}
                                    className="pl-9 h-9 text-xs"
                                />
                            </div>
                            {citySearch.trim() && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    onClick={addCustomCity}
                                    className="h-9 text-xs gap-1 shrink-0"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add City
                                </Button>
                            )}
                        </div>

                        {/* District & City suggestions grouped per selected state */}
                        {stateDistrictsMap.length > 0 && (
                            <div className="space-y-4">
                                {stateDistrictsMap.map((group) => {
                                    const selectedInStateCount = group.assignedCities.length;
                                    return (
                                        <div key={group.stateName} className="space-y-3 p-3.5 rounded-xl border bg-muted/10">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                                    <Landmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    {group.stateName}
                                                    {selectedInStateCount > 0 && (
                                                        <Badge variant="secondary" className="text-[10px] py-0 h-4 px-1.5 bg-primary/15 text-primary font-normal">
                                                            {selectedInStateCount} selected
                                                        </Badge>
                                                    )}
                                                </span>
                                                {group.allDistricts.length > 0 && (
                                                    <span className="text-[11px] text-muted-foreground">
                                                        {group.filteredDistricts.length} suggested districts
                                                    </span>
                                                )}
                                            </div>

                                            {/* Pre-defined districts grid (if available e.g. Indian states) */}
                                            {group.filteredDistricts.length > 0 && (
                                                <div className="border rounded-md p-2 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-1.5 bg-background">
                                                    {group.filteredDistricts.map((d) => {
                                                        const isSelected = tempCities.includes(d);
                                                        return (
                                                            <Tooltip key={d}>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        type="button"
                                                                        title={d}
                                                                        onClick={() => {
                                                                            toggleCity(d);
                                                                            if (!tempCities.includes(d)) {
                                                                                setCityStateMap((prev) => ({ ...prev, [d]: group.stateName }));
                                                                            }
                                                                        }}
                                                                        className={`text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer border ${
                                                                            isSelected
                                                                                ? "bg-primary/10 border-primary text-primary font-medium"
                                                                                : "border-transparent hover:bg-accent text-foreground"
                                                                        }`}
                                                                    >
                                                                        <span className="truncate">{d}</span>
                                                                        {isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="text-xs">
                                                                    {d}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Inline input to add cities/districts directly to this state */}
                                            <div className="flex gap-2 items-center">
                                                <Input
                                                    placeholder={`Add city / district to ${group.stateName}...`}
                                                    value={stateCityInputs[group.stateName] || ""}
                                                    onChange={(e) => setStateCityInputs({ ...stateCityInputs, [group.stateName]: e.target.value })}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            const val = stateCityInputs[group.stateName];
                                                            if (val) {
                                                                addCityToState(group.stateName, val);
                                                                setStateCityInputs({ ...stateCityInputs, [group.stateName]: "" });
                                                            }
                                                        }
                                                    }}
                                                    className="h-8 text-xs bg-background"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        const val = stateCityInputs[group.stateName];
                                                        if (val) {
                                                            addCityToState(group.stateName, val);
                                                            setStateCityInputs({ ...stateCityInputs, [group.stateName]: "" });
                                                        }
                                                    }}
                                                    className="h-8 text-xs gap-1 shrink-0"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                    Add to {group.stateName}
                                                </Button>
                                            </div>

                                            {/* Selected cities/districts in this state */}
                                            {group.assignedCities.length > 0 && (
                                                <div className="space-y-1.5 pt-1">
                                                    <span className="text-[11px] font-medium text-muted-foreground">
                                                        Cities in {group.stateName}:
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border bg-background">
                                                        {group.assignedCities.map((c) => (
                                                            <Badge key={c} variant="secondary" className="text-xs gap-1 font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                                                                <Building2 className="h-3 w-3" />
                                                                <span>{c}</span>
                                                                <X
                                                                    className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 ml-0.5"
                                                                    onClick={() => toggleCity(c)}
                                                                />
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Custom / Other Selected Cities */}
                        {customCities.length > 0 && (
                            <div className="space-y-1.5 p-2.5 rounded-lg border bg-muted/10">
                                <span className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                    <Building2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Other / Custom Cities ({customCities.length})
                                </span>
                                <div className="flex flex-wrap gap-1.5 bg-background p-2 rounded-md border">
                                    {customCities.map((c) => (
                                        <Badge key={c} variant="secondary" className="text-xs gap-1 font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                                            <span>{c}</span>
                                            <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 ml-0.5" onClick={() => toggleCity(c)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Selections Badges Summary */}
                    <div className="space-y-2 border-t pt-4 bg-muted/20 p-4 rounded-xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                            Active Selections Summary
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {tempCountries.map((c) => (
                                <Badge key={`c-${c}`} variant="secondary" className="text-xs gap-1 font-normal bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200">
                                    <Globe className="h-3 w-3" />
                                    <span>{c}</span>
                                    <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 ml-0.5" onClick={() => toggleCountry(c)} />
                                </Badge>
                            ))}
                            {includeStates && tempStates.map((s) => (
                                <Badge key={`s-${s}`} variant="secondary" className="text-xs gap-1 font-normal bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200">
                                    <Landmark className="h-3 w-3" />
                                    <span>{s}</span>
                                    <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 ml-0.5" onClick={() => toggleState(s)} />
                                </Badge>
                            ))}
                            {tempCities.map((ct) => (
                                <Badge key={`ct-${ct}`} variant="secondary" className="text-xs gap-1 font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                                    <Building2 className="h-3 w-3" />
                                    <span>{ct}</span>
                                    <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 ml-0.5" onClick={() => toggleCity(ct)} />
                                </Badge>
                            ))}

                            {tempCountries.length === 0 && tempStates.length === 0 && tempCities.length === 0 && (
                                <span className="text-xs text-muted-foreground italic">No locations selected yet.</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-4 border-t bg-muted/30 flex items-center justify-between sm:justify-between">
                    <Button type="button" variant="ghost" size="sm" onClick={handleClearAll} className="text-xs text-destructive hover:bg-destructive/10">
                        Clear All
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
                            Cancel
                        </Button>
                        <Button type="button" size="sm" onClick={handleSave} className="text-xs gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Apply Locations
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
