import type { ImgHTMLAttributes } from "react";

export function LogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src="/logo.svg" alt="Trekora Logo" {...props} />;
}
