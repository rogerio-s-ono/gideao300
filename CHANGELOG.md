# Gideão 300 — App · Changelog

## v4.0.2 — Restaurar backup à prova de falhas (2026-09-22)
Correção importante no fluxo **MAIS → Restaurar backup**, tornando-o seguro para a carga inicial (baseline do UAT) independente do estado do servidor.

### Problema corrigido
Antes, "Restaurar backup" gravava apenas na base local. No sync seguinte, o `pull()` (servidor = fonte da verdade) **sobrescrevia/corrompia** a base restaurada quando a planilha do servidor não estava vazia — resultando numa mistura inconsistente de registros. A carga inicial só funcionava se o Sheet estivesse previamente vazio (dependência de procedimento manual, frágil).

### Solução (bullet-proof)
- O backup restaurado passa a ser tratado como a **nova fonte da verdade**: o restore faz um **full-replace atômico no servidor** (`reset:true` + push em lote), depois `pull()` para reconciliar. Segue o mesmo padrão já usado em "Recarregar base".
- **Validação do JSON antes de tocar em qualquer dado** — arquivo inválido não apaga a base (mensagem clara "Arquivo JSON inválido. Nada foi alterado.").
- **Offline:** marca todos os registros como pendentes; o próximo sync faz *push antes de pull*, sem sobrescrever.
- Normaliza `camisaEstado`, `cota` e `datas` na importação; mensagens de sucesso/erro traduzidas (PT/ES).

### Validação
Testado no navegador real (Chromium + IndexedDB real) com o código do app: round-trip export→import idêntico; import 2× sem duplicar; JSON inválido não apaga a base; e — com servidor cheio de dados antigos — o restore corrigido mantém os 73 registros do baseline e o servidor passa a refletir exatamente a base restaurada (dados antigos apagados pelo reset).

## v4.0 — Release de produção: papéis, custódia do dinheiro e maturidade de UX (2026-09-22)
Marco de maturidade: o app consolida gestão de acessos, controle financeiro com rastreamento de custódia do dinheiro, e uma ampla rodada de refinamentos de UX. Validado via UAT antes do deploy.

### ⭐ Destaques
- **Perfis de acesso (3 papéis):** Usuário, Tesoureiro e Admin. Tesoureiro edita a Caixa; Admin gere usuários.
- **Caixa somente leitura para o Usuário:** todos veem o financeiro (transparência); só tesoureiro/admin editam.
- **Custódia do dinheiro:** cada pagamento em Dinheiro tem "Recebido por" (Pastor/Tesoureiro); marca-se "Entregue ao tesoureiro" (com data). O saldo em Dinheiro é dividido em "Com pastores" vs "Com tesoureiro". Despesas e movimentações em dinheiro indicam de qual custódia saíram.
- **Tela de Acessos:** gestão de usuários (adicionar/editar perfil/remover) com proteção do último admin; recurso "Ver como" para o admin visualizar o app como Tesoureiro/Usuário.
- **Extrato por bolso** com ordenação (recente/antigo) e filtro por custódia.

### Gestão / segurança
- Login corrigido e robusto: autoridade de acesso é o servidor (aba Admin); validação antes de abrir a UI; fallback se o login do Google não carregar; app OAuth publicado (sem lista de "Usuários de teste").
- Backend reforça permissões (escrita na Caixa exige admin/tesoureiro).

### UX (formulário e navegação)
- Formulário do Gideão reordenado (Nome/Telefone/Camisa/Pagamentos/Observação); número da camisa automático (maior+1) + botão "buscar número livre".
- Datas editáveis com calendário nativo (pagamento, entrega, confecção); formato dd/mês/aa.
- Comentário obrigatório para pagamento tipo "Outros".
- Botões dos modais padronizados (barra horizontal ícone + rótulo).
- Highlight + rolagem ao voltar de um modal (Gideões, Confecção, extrato e lançamentos da Caixa).
- Busca por nome também na Confecção.
- Versão do app visível na tela Mais.

### Notas
- Removidas: seção de conciliação bancária e a seção "por forma de pagamento" do Painel.
- Guia do usuário (com abas por tela) e checklist de UAT disponíveis.
- Persistência inalterada: Google Sheets (Apps Script) + login Google (aba Admin) + IndexedDB (offline-first).

---

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
