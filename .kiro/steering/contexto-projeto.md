# Contexto do projeto — Gideão 300 (retomar sessões)

> Atualizado em 2026-11-10. Se algo aqui divergir do código, o código vence. Procedimentos de Beta/release: ver `fluxo-beta.md`.

## O que é
PWA de gestão do **Projeto Gideão 300** (Casa Fuerte Church): inscritos (Gideões), pagamentos da cota (300 €), camisas (confecção/entrega), Caixa (despesas, movimentações, extrato por bolso), avisos por WhatsApp, auditoria. Português (PT) e espanhol (ES). Usuário fala português.

## Arquitetura (sem build, arquivos estáticos)
- Repositório `rogerio-s-ono/gideao300`, publicado no **GitHub Pages**: produção na **raiz** (`app.js`, `index.html`, `sw.js`...) e Beta em **`beta/`**.
- **Um backend só** (`backend/Code.gs`, Google Apps Script + Google Sheets) e **a mesma planilha** para Beta e produção (`config.js` igual). Dados criados no Beta aparecem na produção.
- Login Google (lista de acessos na aba Admin da planilha). Offline-first: IndexedDB local + fila de pendências (`localStorage gd_pending*`) + sync (`pushPending`/`pull`/`syncNow`).
- O app (`app.js`) é um arquivo grande; i18n no objeto `I18N` (pt/es). Beta e produção devem ser **idênticos em código**; diferem só em: `APP_VERSION`, `FEATURES_DEFAULT.whatsapp` (beta false / prod true), ícones `-beta`, `CACHE` e lista de precache do `sw.js`.
- `CHANGELOG.md` parou na v4.0.4: o histórico real está nos **PRs e tags** (`git tag`, `gh api repos/rogerio-s-ono/gideao300/pulls?state=all`).

## Estado atual (2026-11-10)
- **Produção: v4.1.8** (tag `v4.1.8`). **Beta: v4.1.8-beta1** (base pós-release, sem mudanças funcionais).
- Releases recentes: v4.1.7 (PR #11) e v4.1.8 (PR #15). Cada mudança do Beta tem PR com análise e testes na descrição.

## Regras de negócio decididas com o usuário (não reverter sem perguntar)
- **Folha "Adicionar pagamento"** (modal): valor sugerido = saldo (sem seleção/foco automático); **Tipo e "Recebido por" começam vazios e são obrigatórios** (erro por campo); data ao lado do valor; fechar com dados pergunta; linha nova fica "NÃO SALVO" até *Salvar* do Gideão. "Entregue ao tesoureiro" fica na linha de cada pagamento em Dinheiro (só admin/tesoureiro).
- **Cartão da cota** (completa/parcial/sem pagamento/isento). Cota completa (mesmo não salva) **esconde** o botão de adicionar e o Isento.
- **Isento**: checkbox na linha do título (direita, posição fixa); só aparece sem pagamentos (ou se já marcado); conta como alteração ao sair sem salvar; vale como cota completa.
- **Número da camisa**: novo Gideão sem pagamento → pergunta e fica s/n; novo parcial → s/n; cota completa sem número → bloqueia o salvar (vale para todos, inclusive antigos). Apagar só na **criação**. Lupa: lista 10 livres + "Mostrar mais 10", sem limite.
- **Caixa**: sem faixa "Custódia"; no **Extrato · Dinheiro**: "Saldo total" + linhas **Pastor** e **Tesoureiro** (subtotal + filtro; marcado = tag colorida; tocar no outro **troca**; tocar no marcado mostra tudo; nunca os dois). Subtotais saem das mesmas linhas do total; despesa suspensa fora; movimentações têm custódia (saída = origem; entrada em dinheiro = Tesoureiro).
- **Gideões**: subtotais nos chips de filtro. **Confecção**: "Todos" alterna (pode ficar sem filtro).
- **Atualização de versão**: login atualiza sozinho (máx. 2 tentativas/versão, depois clique manual); `applyUpdate` renova cache HTTP e faz o SW novo assumir.

## Armadilhas já encontradas (economizam tempo)
- GitHub Pages serve tudo com `cache-control: max-age=600` → afeta SW/atualização e testes de "publicou e já vale".
- `sw.js` **não** se copia do beta para a raiz (CACHE e ícones próprios): aplicar a mesma lógica manualmente.
- Branch do beta **não pode** começar com `beta/` (já existe o branch `beta`; o push é recusado): usar `beta-nome`.
- Clone local já ficou corrompido uma vez (`bad object HEAD`, falta o `.pack`): `git fetch origin` resolveu.
- Sandbox: `/tmp` não persiste entre comandos; `file:` e servidor em segundo plano são bloqueados no navegador do Playwright MCP. Para testes, usar Node: **jsdom + fake-indexeddb** (lógica/DOM) e **playwright-core + `/usr/local/bin/chrome`** com `launchPersistentContext` + `HOME` próprio (SW/cache reais). **Não usar `page.route`** (desliga o cache HTTP). Criar as pastas de teste em `/projects/sandbox/_algo` e **apagar** depois.
- `git`/`gh`: PR só via `gh api` (REST); `gh pr create` falha.
- O usuário usa também o **Kiro-cli** em outra sessão; este diretório `.kiro/steering` vale para os dois.

## Pendências e ideias em aberto
- **Validar no iPhone/PWA instalado** a atualização automática (testada só em Chrome desktop headless).
- O app **não impede número de camisa repetido** (oferecido, não pedido).
- O Painel ainda tem o detalhe de Custódia na linha "Dinheiro ▼" (só com o cálculo corrigido; remover se o usuário pedir).
- Backlog antigo: flags remotas via servidor (`applyRemoteFlags`, hoje só local por dispositivo).
- Mockups da folha de pagamento ficaram só no sandbox (`/projects/sandbox/mockups`, `.kiro/artifacts/screenshots`), fora do repositório.

## Como retomar
1. `git fetch && git log --oneline -15` e `git tag --sort=-creatordate | head` para ver o estado; `gh api repos/rogerio-s-ono/gideao300/pulls?state=all` para o histórico.
2. Ler este arquivo e `fluxo-beta.md`. Trabalhar no **Beta**, em branch novo + PR + merge; só mexer na produção com pedido explícito.
