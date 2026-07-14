# Warborn — portal MMORPG

Portal em Next.js inspirado nos sites clássicos de MMORPG: home responsiva, notícias, eventos, status, ranking, loja e conta compartilhada entre site e jogo.

O idioma padrão é `en-US`. O seletor oferece inglês e português; visitantes persistem a escolha em cookie e jogadores autenticados também salvam a preferência no campo `accounts.locale`. Nomes canônicos de classes e itens não são traduzidos.

## Rodando localmente

```bash
npm install
copy .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`. O banco SQLite é criado automaticamente em `data/warborn.db` no primeiro acesso/cadastro.

## Conta compartilhada com o jogo

A tabela `accounts` em `src/lib/db.ts` é a fonte única de identidade. Ela contém `account_id`, `nickname`, `email`, `password_hash`, `status` e `role`. O cadastro usa bcrypt com custo 12 e a sessão do site usa cookie HTTP-only assinado.

Para ligar ao banco real do jogo, adapte somente `src/lib/db.ts` para o driver do servidor (SQL Server, MySQL ou PostgreSQL) e mantenha a interface usada em `src/app/actions/auth.ts`. Antes de publicar, confirme obrigatoriamente:

1. O nome e a estrutura exatos da tabela de contas do emulador/servidor.
2. O algoritmo de senha esperado pelo cliente/servidor do jogo. Não troque bcrypt por hash legado sem avaliar a segurança; quando necessário, mantenha uma credencial moderna para o site e um campo compatível isolado para o jogo.
3. Transação atômica ao gravar em tabelas diferentes, índices únicos para ID/e-mail e usuário SQL com permissões mínimas.
4. `SESSION_SECRET` aleatório em produção, HTTPS, rate limiting, recuperação de senha e verificação de e-mail.

## Comandos

- `npm run dev` — desenvolvimento
- `npm run build` — compilação de produção
- `npm start` — servidor de produção
- `npm run lint` — validação estática
