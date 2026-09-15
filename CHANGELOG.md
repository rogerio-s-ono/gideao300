# Gideão 300 — App · Changelog

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
