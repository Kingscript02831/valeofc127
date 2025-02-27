
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, "HH:mm");
  } else if (isYesterday(dateObj)) {
    return "Ontem " + format(dateObj, "HH:mm");
  } else if (dateObj.getFullYear() === new Date().getFullYear()) {
    return format(dateObj, "dd/MM HH:mm");
  } else {
    return format(dateObj, "dd/MM/yyyy HH:mm");
  }
}

export function getRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), {
    addSuffix: true,
    locale: ptBR,
  });
}
