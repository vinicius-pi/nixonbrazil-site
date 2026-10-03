# nixonbrazil — Richard Nixon em português

**[Visite nixonbrazil.page](https://nixonbrazil.page/)**

Criado em 2025, o nixonbrazil é uma publicação histórica brasileira independente
dedicada à vida, às ideias e à Presidência de Richard Nixon. Reúne ensaios em
português, um acervo de documentos e um olhar brasileiro sobre as relações entre
os dois países.

O projeto combina três frentes de trabalho:

- **Pesquisa e escrita:** consulta à Nixon Library/NARA, ao *Foreign Relations of
  the United States* e a registros oficiais, com referências e acesso às fontes.
- **Design editorial:** composição sóbria, tipografia serifada, marinho e vermelho
  contido, fotografias de arquivo e páginas adaptadas a telas menores.
- **Desenvolvimento web:** geração estática com Astro, HTML, CSS e JavaScript;
  busca e filtros no acervo, RSS, sitemap e publicação pelo GitHub Pages.

Este repositório apresenta a edição pública gerada e os controles de publicação.
O projeto é independente, sem vínculo oficial com a Richard Nixon Foundation,
a Richard Nixon Presidential Library ou a NARA.

## Publicação e manutenção

### Edição pública

Este repositório hospeda a edição estática pública do nixonbrazil. Deve permanecer
**público**: o plano atual do GitHub não oferece Pages para repositórios privados.
A privacidade do trabalho editorial não torna o site uma publicação privada.

Os arquivos de `site/` vêm exclusivamente de uma compilação verificada da
branch `main` do projeto editorial. Não incluir rascunhos, relatórios internos,
credenciais nem o histórico editorial neste repositório de publicação.

`release.json` identifica a versão aprovada da fonte e os hashes dos arquivos.
Antes de publicar, execute `node scripts/verify-package.mjs`. Depois de sincronizar
a `main`, acione **Publicar edição verificada** em Actions. O fluxo publica somente
`site/` e testa o endereço público sem autenticação. Um push não publica sozinho.

A publicação só está concluída quando o domínio abre com HTTPS válido e as páginas
e recursos respondem sem exigir conta. Um commit sincronizado ou um servidor
respondendo 404 não basta. Use `node scripts/check-public.mjs` para conferir.

## Verificação contínua e recuperação

[Verificar site público](https://github.com/vinicius-pi/nixonbrazil-site/actions/workflows/health.yml)
roda diariamente às 12:23 UTC (09:23 em Brasília), sujeito à disponibilidade do
GitHub, e também aceita execução manual. Não instala um monitor no computador.
Compara todos os arquivos com o manifesto do último deploy bem-sucedido, exige
HTTPS válido e verifica o 404. A execução registra a versão e o horário conferidos.

- `node scripts/check-public.mjs`: compara com o pacote local, usado após publicar.
- `node scripts/check-public.mjs --deployed`: resolve a edição efetivamente publicada; não confunde uma atualização ainda não publicada da main com falha do site.
- `node --test scripts/health-check.test.mjs`: verifica também versões antigas, respostas incorretas, falha de rede e ausência de evidência do deploy.

Uma falha aparece na execução do Actions. Não há correção automática. O GitHub
pode atrasar jobs e desativar agendamentos de repositórios públicos inativos;
confira a data real do último resultado, não apenas sua cor.

Para recuperar uma edição anterior, restaure `site/` e `release.json` juntos em
um novo commit, confira o pacote e publique novamente. Preserve a edição anterior
e o histórico; sincronizar ou reverter commits sem publicar não altera o site.
