
import * as z from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  street: z.string().min(1, "Rua é obrigatória"),
  house_number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  postal_code: z.string().min(1, "CEP é obrigatório"),
  avatar_url: z.string()
    .nullable()
    .transform(url => {
      if (!url) return "";
      console.log("URL original do Dropbox:", url);
      
      let directUrl = url;
      if (url.includes('dropbox.com')) {
        try {
          let cleanUrl = url.split('?')[0];
          
          if (cleanUrl.includes('www.dropbox.com/s/')) {
            directUrl = cleanUrl
              .replace('www.dropbox.com/s/', 'dl.dropboxusercontent.com/s/') 
              + '?raw=1';
          } else if (cleanUrl.includes('www.dropbox.com/scl/')) {
            directUrl = cleanUrl
              .replace('www.dropbox.com/scl/', 'dl.dropboxusercontent.com/scl/') 
              + '?raw=1';
          }
          
          console.log("URL convertida para download direto:", directUrl);
        } catch (error) {
          console.error("Erro ao processar URL do Dropbox:", error);
          return url;
        }
      }
      return directUrl;
    })
    .optional(),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  bio: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  basic_info_updated_at: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
