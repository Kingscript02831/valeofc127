
import { toast } from "sonner";

export const useSupabaseError = () => {
  const handleError = (error: Error | null, customMessage?: string) => {
    if (error) {
      console.error('Supabase error:', error);
      toast.error(customMessage || 'Ocorreu um erro. Por favor, tente novamente.');
      return true;
    }
    return false;
  };

  return { handleError };
};
