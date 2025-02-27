
import { ReactNode } from "react";

interface ChatProps {
  children?: ReactNode;
}

export function Chat({ children }: ChatProps) {
  return <div className="flex flex-col h-full">{children}</div>;
}
