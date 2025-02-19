
-- Adiciona coluna location_id à tabela products
ALTER TABLE public.products
ADD COLUMN location_id UUID REFERENCES public.locations(id);

-- Adiciona índice para melhorar performance de buscas
CREATE INDEX idx_products_location_id ON public.products(location_id);

-- Garante que apenas usuários autenticados podem atualizar location_id
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
