import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
    containerClassName?: string;
}

export function OptimizedImage({
    src,
    alt,
    className,
    fallback = "/placeholder.svg",
    containerClassName,
    ...props
}: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-muted/10",
                containerClassName,
            )}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                </div>
            )}
            <img
                src={hasError || !src ? fallback : src}
                alt={alt}
                className={cn(
                    "transition-all duration-500",
                    isLoading
                        ? "scale-105 blur-sm opacity-0"
                        : "scale-100 blur-0 opacity-100",
                    className,
                )}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setHasError(true);
                }}
                loading="lazy"
                {...props}
            />
        </div>
    );
}
