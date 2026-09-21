# Gideão 300 — App · Changelog

## v3.0 — Fase Caixa: gestão financeira (2026-09-21)
Marco: o app deixa de ser só gestão de inscritos/confecção e passa a ter **controle financeiro completo do projeto**. A fase Caixa, validada em beta, foi promovida a produção.

### ⭐ Destaque — Caixa (financeiro, acesso só admin)
Nova área financeira do Projeto Gideão 300, com:
- **3 bolsos** — Dinheiro, Banco e Outros — com saldo por bolso.
- **Despesas** — registro com descrição, valor, data, categoria, bolso e observação; **foto da fatura** anexada (câmera + compressão no navegador → upload para o Google Drive via Apps Script → link salvo; 1 a 3 fotos, miniatura clicável no card).
- **Movimentações (De → Para)** — transferências entre bolsos, para refletir depósitos e movimentações reais.
- **Extrato por bolso** — clicar no card do bolso lista os lançamentos por data (entradas, despesas e movimentações) com saldo corrente; despesas e movimentações são clicáveis para detalhe.
- **Conciliação** — visão que ajuda a bater o dinheiro do projeto com o que está em cada bolso.
- **Formas de pagamento** mapeadas para bolso (Cartão/Dinheiro/Outros); padrão de pagamento = Dinheiro.

### Backend
- Novas abas na planilha: **Despesas** e **Movimentos**, sincronizadas (pull/push) via Apps Script.
- Upload de foto para o Drive (pasta "Faturas Gideao 300"), com **tratamento robusto de erro** — se o upload falha, o salvamento é abortado e o usuário é avisado (não finge sucesso).
- Datas normalizadas (coluna texto no Sheets + coerção Date→AAAA-MM-DD) para exibição consistente.

### Outras melhorias
- **Versão do app** visível na tela **Mais** (entre Usuário e Sincronização) e na tela de login.
- Confecção: contador dentro dos chips de filtro (badge colorido) e linha de **Total geral** por status no resumo por tamanho.
- Estabilidade do banner "nova versão" (handler de atualização simples e resiliente).

### Migração / notas
- App unificado: a pasta de beta (/beta/) foi descontinuada — a Caixa agora vive na versão principal.
- Persistência inalterada: Google Sheets (via Apps Script) + login Google (allowlist na aba Admin) + IndexedDB (offline-first). Dados preservados.

---

## v1.0.0 — Baseline (2026-09-15)
Primeira versão estável, validada em navegador. App PWA offline (PT/ES) para gestão do Projeto Gideão 300 da Casa Fuerte Church.

### Funcionalidades
- **Gideões (lista):** busca por nome, número e telefone, com busca insensível a acentos/ç. Cartões slim (tamanho·telefone·valor na meta; status Pago/Entregue à direita). Cadastro rápido com número sequencial padrão. Ordenação por número (Pr. Marciano #00 primeiro). Dois modos de visualização: cards e tabela.
- **Confecção:** estados da camisa por pílulas exclusivas (A fazer / Em confecção / Pronta / Entregue) com gate de pagamento (só quem pagou 300€ completo entra); datas por etapa (registro automático de hoje, editável, exibidas abaixo de cada toggle em cinza claro dd/mmm, com DD/MM/YY no hover); alterações pendentes com botão Salvar no topo e modal de confirmação ao sair; clicar no nome abre o card na aba Gideões; filtro só reaplica após salvar; KPIs (A fazer/Em confecção/Prontas/Entregues/Pendente pagamento) + resumo por tamanho.
- **Painel:** meta 300 com dinheiro arrecadado na barra; KPIs; totais por tamanho; financeiro por forma de pagamento.
- **Mais:** exportar CSV, backup/restore JSON (validado round-trip), imprimir/PDF (gera a lista de Gideões), reset.
- **Pagamentos parcelados:** cota fixa 300€, múltiplos pagamentos (valor+tipo+data, data padrão hoje), status Pago/Parcial/Pendente calculado.
- **Identidade visual:** logo Casa Fuerte + capacete "Yo soy uno de los 300" no header (centralizado, dourado); ícone do app com o guerreiro espartano; fontes Cormorant Garamond + Jost; paleta neutra/dourada da igreja. Idiomas PT/ES.
- **Offline:** service worker (cache v18), IndexedDB, instalável (manifest + ícones).

### Dados iniciais (seed)
70 inscritos importados da planilha; cota 300€.

### Ordem das tabs
Gideões · Confecção · Painel · Mais
