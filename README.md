# nixonbrazil — publicação pública

Endereço: **https://nixonbrazil.page/**

Este repositório hospeda a edição estática pública do nixonbrazil. Deve permanecer
**público**: o plano atual do GitHub não oferece Pages para repositórios privados.
A privacidade do trabalho editorial não torna o site uma publicação privada.

Os arquivos de `site/` virão exclusivamente de uma compilação verificada da
branch `main` do projeto editorial. Não incluir rascunhos, relatórios internos,
credenciais nem o histórico editorial neste repositório de publicação.

`release.json` identifica a versão aprovada da fonte e os hashes dos arquivos.
Antes de publicar, execute `node scripts/verify-package.mjs`. Depois de sincronizar
a `main`, acione **Publicar edição verificada** em Actions. O fluxo publica somente
`site/` e testa o endereço público sem autenticação. Um push não publica sozinho.

A publicação só está concluída quando o domínio abre com HTTPS válido e as páginas
e recursos respondem sem exigir conta. Um commit sincronizado ou um servidor
respondendo 404 não basta. Use `node scripts/check-public.mjs` para conferir.
