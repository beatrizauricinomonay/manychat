# InstaFlow

Dashboard estilo ManyChat para criar automações de resposta no Instagram
(mensagens diretas e comentários), com integração real via Instagram Graph
API.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- [React Flow](https://reactflow.dev) para o construtor visual de automações
- PostgreSQL (via [`postgres`](https://github.com/porsager/postgres)) como
  persistência dos fluxos e do histórico de execuções
- Rotas de API do Next.js fazendo o papel de backend (CRUD de fluxos,
  webhook do Instagram, envio de mensagens via Graph API)

## Como funciona

1. Você cria uma automação no dashboard (`/dashboard`), escolhendo um
   gatilho: nova DM, DM com palavra-chave ou comentário com palavra-chave.
2. No editor visual (`/dashboard/flows/[id]`), arraste blocos de ação
   (enviar texto, enviar imagem, respostas rápidas, aguardar, adicionar
   tag) da paleta à esquerda e conecte-os ao bloco de gatilho.
3. Ao ativar a automação, o webhook do Instagram (`/api/webhook/instagram`)
   passa a processar eventos reais: quando uma DM ou comentário bate com o
   gatilho de um fluxo ativo, o motor de execução (`src/lib/flowEngine.ts`)
   roda a cadeia de ações chamando a Graph API do Instagram.
4. O histórico de disparos fica disponível em `/dashboard/runs`.

## Configuração local

Requer um PostgreSQL rodando localmente (ou aponte `DATABASE_URL` para um
banco remoto, ex: o mesmo do seu deploy no Railway).

```bash
npm install
cp .env.example .env.local
# edite .env.local e preencha DATABASE_URL
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). As tabelas são criadas
automaticamente na primeira requisição — não precisa rodar migrations.

## Configurando o App no Meta for Developers

Para a integração real com o Instagram funcionar, você precisa de um App
no [Meta for Developers](https://developers.facebook.com/) com o produto
**Instagram** (Messaging API) configurado, uma conta profissional do
Instagram conectada a uma Página do Facebook, e:

1. **Access Token**: gere um token de acesso de longa duração da Página
   conectada à conta do Instagram (Graph API Explorer ou fluxo OAuth do
   seu App), com as permissões `instagram_basic`,
   `instagram_manage_messages` e `pages_messaging`. Coloque em
   `INSTAGRAM_ACCESS_TOKEN` no `.env.local`.
2. **App Secret**: encontrado em Configurações do App > Básico. Coloque em
   `INSTAGRAM_APP_SECRET` — usado para validar a assinatura
   (`X-Hub-Signature-256`) de cada webhook recebido, garantindo que os
   eventos realmente vieram da Meta.
3. **Verify Token**: um valor que você mesmo escolhe (qualquer string).
   Coloque em `INSTAGRAM_VERIFY_TOKEN` e use o mesmo valor ao cadastrar o
   webhook no painel da Meta.
4. **Webhook**: em Produtos > Webhooks > Instagram, cadastre a URL
   `https://SEU_DOMINIO/api/webhook/instagram`, informe o Verify Token do
   passo anterior e assine os campos `messages` (DMs) e `comments`.
   Localmente você pode expor a porta 3000 com uma ferramenta de túnel
   (ex.: `ngrok http 3000`) para testar o handshake.

> ⚠️ **Segurança**: nunca cole tokens de acesso diretamente em chats,
> commits ou issues. Se um token foi exposto acidentalmente, revogue-o e
> gere um novo imediatamente no painel do Meta for Developers. Este
> projeto lê os tokens exclusivamente de variáveis de ambiente
> (`.env.local`, que já está no `.gitignore`) — eles nunca ficam
> hard-coded no código-fonte.

## Limitações desta primeira versão

- Os fluxos são lineares (cada bloco tem uma única saída), sem
  ramificação condicional.
- O bloco "Aguardar" tem um teto de 10s por rodar em função serverless
  (sem fila/worker assíncrono ainda).
- Tags são registradas na cadeia de execução, mas ainda não há uma tela
  de gestão de contatos/segmentação por tag.

## Deploy (Railway)

1. **New Project → Deploy from GitHub repo** → selecione este repositório
   (branch `main`).
2. No mesmo projeto, clique em **+ New → Database → Add PostgreSQL**. O
   Railway injeta a variável `DATABASE_URL` automaticamente no serviço da
   aplicação — não precisa configurar nada manualmente.
3. No serviço da aplicação, aba **Variables**, adicione:
   - `INSTAGRAM_ACCESS_TOKEN`
   - `INSTAGRAM_APP_SECRET`
   - `INSTAGRAM_VERIFY_TOKEN`
4. Aba **Settings → Networking**, clique em **Generate Domain** para obter
   a URL pública.
5. Use essa URL (`https://SEU-DOMINIO/api/webhook/instagram`) para
   cadastrar o webhook no painel da Meta, como descrito acima.

Qualquer outro host compatível com Next.js + PostgreSQL também funciona
(Fly.io, Render, etc.) — só ajuste `DATABASE_URL` e as variáveis do
Instagram no painel do provedor escolhido, nunca no repositório.
