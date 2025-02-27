
-- Primeiro precisamos encontrar os IDs dos usuários
DO $$
DECLARE
    vinixxx_id UUID;
    marcos_id UUID;
    chat_id UUID;
BEGIN
    -- Obter o ID do usuário vinixxx
    SELECT id INTO vinixxx_id FROM auth.users WHERE email LIKE '%vinixxx%' OR raw_user_meta_data->>'username' = 'vinixxx' LIMIT 1;
    
    -- Obter o ID do usuário marcos.38
    SELECT id INTO marcos_id FROM auth.users WHERE email LIKE '%marcos.38%' OR raw_user_meta_data->>'username' = 'marcos.38' LIMIT 1;
    
    -- Se ambos os usuários existirem, criar a conversa
    IF vinixxx_id IS NOT NULL AND marcos_id IS NOT NULL THEN
        -- Criar o ID do chat combinando os IDs dos usuários em ordem alfabética
        SELECT CASE 
            WHEN vinixxx_id < marcos_id THEN vinixxx_id || '_' || marcos_id
            ELSE marcos_id || '_' || vinixxx_id
        END INTO chat_id;
        
        -- Verificar se o chat já existe
        IF NOT EXISTS (SELECT 1 FROM chats WHERE id = chat_id) THEN
            -- Criar a sala de chat
            INSERT INTO chats (id, created_at, updated_at)
            VALUES (chat_id, NOW(), NOW());
            
            -- Adicionar os participantes
            INSERT INTO chat_participants (chat_id, user_id, last_read_at, created_at)
            VALUES 
                (chat_id, vinixxx_id, NOW(), NOW()),
                (chat_id, marcos_id, NOW(), NOW());
            
            -- Adicionar algumas mensagens
            INSERT INTO messages (chat_id, sender_id, content, created_at, read)
            VALUES
                (chat_id, vinixxx_id, 'Olá Marcos, tudo bem?', NOW() - INTERVAL '1 hour', TRUE),
                (chat_id, marcos_id, 'Oi Vinixxx! Tudo ótimo e com você?', NOW() - INTERVAL '55 minutes', TRUE),
                (chat_id, vinixxx_id, 'Tudo bem também! Só queria saber se você vai no evento amanhã.', NOW() - INTERVAL '50 minutes', TRUE),
                (chat_id, marcos_id, 'Sim, estou planejando ir! Que horas você vai?', NOW() - INTERVAL '45 minutes', TRUE),
                (chat_id, vinixxx_id, 'Estou pensando em ir por volta das 19h. Poderíamos nos encontrar lá!', NOW() - INTERVAL '40 minutes', TRUE),
                (chat_id, marcos_id, 'Perfeito! 19h está ótimo para mim. Onde podemos nos encontrar?', NOW() - INTERVAL '35 minutes', TRUE),
                (chat_id, vinixxx_id, 'Que tal na entrada principal? Assim fica mais fácil.', NOW() - INTERVAL '30 minutes', TRUE),
                (chat_id, marcos_id, 'Combinado! Te vejo amanhã às 19h na entrada principal.', NOW() - INTERVAL '25 minutes', TRUE),
                (chat_id, vinixxx_id, 'Ótimo! Até amanhã então. 👍', NOW() - INTERVAL '20 minutes', TRUE),
                (chat_id, marcos_id, 'Até amanhã! 😄', NOW() - INTERVAL '15 minutes', FALSE);
                
            RAISE NOTICE 'Conversa criada com sucesso entre vinixxx e marcos.38!';
        ELSE
            RAISE NOTICE 'A conversa entre esses usuários já existe!';
        END IF;
    ELSE
        RAISE NOTICE 'Um ou ambos os usuários não foram encontrados!';
        RAISE NOTICE 'vinixxx_id: %, marcos_id: %', vinixxx_id, marcos_id;
    END IF;
END $$;

-- Caso não encontre os usuários pelo email/username, este é um fallback para criá-los manualmente
-- Só executará se a lógica acima não encontrar os usuários
DO $$
DECLARE
    vinixxx_id UUID := '00000000-0000-0000-0000-000000000001'; -- ID fictício para vinixxx
    marcos_id UUID := '00000000-0000-0000-0000-000000000002'; -- ID fictício para marcos.38
    chat_id UUID := vinixxx_id || '_' || marcos_id;
    user_count INTEGER;
BEGIN
    -- Verificar quantos usuários foram encontrados na primeira tentativa
    SELECT COUNT(*) INTO user_count FROM auth.users 
    WHERE (email LIKE '%vinixxx%' OR raw_user_meta_data->>'username' = 'vinixxx') 
    OR (email LIKE '%marcos.38%' OR raw_user_meta_data->>'username' = 'marcos.38');
    
    -- Se nenhum usuário foi encontrado, criar manualmente a conversa
    IF user_count < 2 THEN
        -- Verificar se o chat já existe
        IF NOT EXISTS (SELECT 1 FROM chats WHERE id = chat_id) THEN
            -- Criar a sala de chat
            INSERT INTO chats (id, created_at, updated_at)
            VALUES (chat_id, NOW(), NOW());
            
            -- Adicionar os participantes
            INSERT INTO chat_participants (chat_id, user_id, last_read_at, created_at)
            VALUES 
                (chat_id, vinixxx_id, NOW(), NOW()),
                (chat_id, marcos_id, NOW(), NOW());
            
            -- Adicionar algumas mensagens
            INSERT INTO messages (chat_id, sender_id, content, created_at, read)
            VALUES
                (chat_id, vinixxx_id, 'Olá Marcos, tudo bem?', NOW() - INTERVAL '1 hour', TRUE),
                (chat_id, marcos_id, 'Oi Vinixxx! Tudo ótimo e com você?', NOW() - INTERVAL '55 minutes', TRUE),
                (chat_id, vinixxx_id, 'Tudo bem também! Só queria saber se você vai no evento amanhã.', NOW() - INTERVAL '50 minutes', TRUE),
                (chat_id, marcos_id, 'Sim, estou planejando ir! Que horas você vai?', NOW() - INTERVAL '45 minutes', TRUE),
                (chat_id, vinixxx_id, 'Estou pensando em ir por volta das 19h. Poderíamos nos encontrar lá!', NOW() - INTERVAL '40 minutes', TRUE),
                (chat_id, marcos_id, 'Perfeito! 19h está ótimo para mim. Onde podemos nos encontrar?', NOW() - INTERVAL '35 minutes', TRUE),
                (chat_id, vinixxx_id, 'Que tal na entrada principal? Assim fica mais fácil.', NOW() - INTERVAL '30 minutes', TRUE),
                (chat_id, marcos_id, 'Combinado! Te vejo amanhã às 19h na entrada principal.', NOW() - INTERVAL '25 minutes', TRUE),
                (chat_id, vinixxx_id, 'Ótimo! Até amanhã então. 👍', NOW() - INTERVAL '20 minutes', TRUE),
                (chat_id, marcos_id, 'Até amanhã! 😄', NOW() - INTERVAL '15 minutes', FALSE);
                
            RAISE NOTICE 'Conversa criada manualmente com IDs fictícios!';
        ELSE
            RAISE NOTICE 'A conversa já existe com os IDs fictícios!';
        END IF;
    END IF;
END $$;
