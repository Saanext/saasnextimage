import type { SVGProps } from "react";

export function SaasNextLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      aria-label="SAASNEXT Logo"
      {...props}
    >
      <text
        x="10"
        y="40"
        fontFamily="Inter, sans-serif"
        fontSize="35"
        fontWeight="bold"
        fill="currentColor"
      >
        SAAS
        <tspan fill="hsl(var(--primary))">NEXT</tspan>
      </text>
    </svg>
  );
}
