import { type ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`w-full max-w-none min-h-screen bg-[#f6f8fb] ${className}`}>
      <div className="mx-auto">
        {children}
      </div>
    </div>
  );
}
