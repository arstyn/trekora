import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

/**
 * Convert relative file URL to absolute backend URL for file serving
 */
export function getFileUrl(relativeUrl: string): string {
	const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
	
	// Remove '/api' from base URL since our relative URL already includes '/api'
	const backendBaseUrl = BASE_URL.replace('/api', '');
	
	// Handle both relative URLs that start with '/api' and absolute URLs
	if (relativeUrl.startsWith('http')) {
		return relativeUrl; // Already absolute
	}
	
	if (relativeUrl.startsWith('/api')) {
		return `${backendBaseUrl}${relativeUrl.replace('/api', '')}`;
	}
	
	return `${backendBaseUrl}${relativeUrl}`;
}
