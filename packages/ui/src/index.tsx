import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ children }: { children: React.ReactNode }) {
  return <button className="bg-blue-500 text-white px-4 py-2 rounded">{children}</button>;
}
