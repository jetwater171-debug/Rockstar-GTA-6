# Produção do checkout Rockstar

O checkout usa somente `/api/checkout/create`, `/api/checkout/status` e `/api/pix/webhook`. A rota de sandbox foi removida.

Antes do deploy:

1. Execute `supabase/admin-backend.sql` no projeto Supabase da Rockstar.
2. Configure as variáveis de `.env.example`, principalmente `APP_GUARD_SECRET`, `APP_ADMIN_PASSWORD`, Supabase e `DISPATCH_CRON_TOKEN`.
3. No painel, habilite apenas gateways com credenciais válidas e configure um `webhookToken` diferente para cada gateway. Bravo Pay usa também assinatura HMAC.
4. Aponte postbacks para `https://SEU-DOMINIO/api/pix/webhook?gateway=NOME&token=TOKEN` quando o gateway não usar automaticamente a URL configurada.
5. Gere um PIX de valor baixo pelo teste de gateways, confira status, webhook, reconciliação e fila antes de abrir tráfego.

O worker da Vercel chama `/api/jobs/dispatch` a cada minuto. A Edge Function em `supabase/functions/dispatch-worker` pode ser usada como contingência, com `DISPATCH_TARGET_URL` e `DISPATCH_TOKEN`.
