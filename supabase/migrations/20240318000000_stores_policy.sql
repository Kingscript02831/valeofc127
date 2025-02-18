
-- Habilita RLS para a tabela stores
ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes que possam estar causando conflito
DROP POLICY IF EXISTS "Permitir leitura pública de lojas" ON "public"."stores";

-- Cria uma nova política que permite leitura pública
CREATE POLICY "Permitir leitura pública de lojas"
ON "public"."stores"
FOR SELECT
TO public
USING (true);
