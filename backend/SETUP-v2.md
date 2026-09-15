# Setup v2.0 — Persistência online (Google Sheets + Login Google)

Faça estes passos **na sua conta Google** (a base ficará na sua conta). ~15 min.
No final, me mande os 3 valores marcados com 📋.

---

## Passo 1 — Criar a planilha
1. Acesse https://sheets.google.com → **Em branco** (nova planilha).
2. Renomeie a planilha para **"Gideão 300 - Base"** (nome livre).
3. Renomeie a **aba** (guia inferior) de "Página1" para **`Gideoes`** (sem acento).
   - (Não precisa criar as colunas — o script cria o cabeçalho sozinho.)

## Passo 2 — Colar o Apps Script
1. Na planilha: menu **Extensões → Apps Script**.
2. Apague o conteúdo padrão e **cole todo o conteúdo do arquivo `backend/Code.gs`** (eu forneço).
3. No topo do script, edite as 3 constantes:
   - `SYNC_TOKEN` → invente um segredo longo (ex.: `gideao-2026-xY7k...`). 📋 (guarde para me passar)
   - `CLIENT_ID` → você vai obter no Passo 4; deixe o placeholder por enquanto.
   - `ALLOWED_EMAILS` → os emails Google autorizados (o da pastora e o seu). 📋
4. **Salve** (ícone de disquete).

## Passo 3 — Publicar como Web App
1. No editor do Apps Script: botão **Implantar → Nova implantação**.
2. Engrenagem ⚙️ → tipo **App da Web**.
3. Configuração:
   - **Executar como:** Eu (seu email).
   - **Quem pode acessar:** **Qualquer pessoa**.
4. **Implantar** → o Google vai pedir para **autorizar permissões** (é normal; é o seu próprio script acessando a sua planilha). Autorize.
   - Se aparecer "Google não verificou este app", clique em **Avançado → Acessar (nome) (não seguro)** — é seu próprio script, pode prosseguir.
5. Copie a **URL do app da Web** (termina em `/exec`). 📋

## Passo 4 — Criar o OAuth Client ID (para o login Google)
1. Acesse https://console.cloud.google.com → crie/seleciona um projeto (ex.: "Gideao300").
2. Menu → **APIs e serviços → Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo** → Criar.
   - Preencha nome do app ("Gideão 300"), email de suporte e email do desenvolvedor. Salve/continue até concluir.
   - Em **Usuários de teste**, adicione os emails autorizados (pastora + você). (Enquanto o app estiver "em teste", só esses conseguem logar — perfeito.)
3. Menu → **APIs e serviços → Credenciais → Criar credenciais → ID do cliente OAuth**:
   - Tipo: **Aplicativo da Web**.
   - Nome: "Gideao300 Web".
   - **Origens JavaScript autorizadas** → adicione:
     - `https://rogerio-s-ono.github.io`
   - (Não precisa de "URI de redirecionamento" para o método que vou usar.)
   - Criar → copie o **ID do cliente** (termina em `.apps.googleusercontent.com`). 📋
4. Volte ao Apps Script (Passo 2) e cole esse Client ID na constante `CLIENT_ID`. **Salve** e **reimplante** (Implantar → Gerenciar implantações → editar → Nova versão).

---

## Me envie (pode ser aqui):
- 📋 **SHEET_WEBAPP_URL** = a URL /exec do Passo 3
- 📋 **GOOGLE_CLIENT_ID** = o ID do cliente do Passo 4
- 📋 **SYNC_TOKEN** = o segredo que você definiu no Passo 2
- 📋 **Emails autorizados** = os que você colocou em ALLOWED_EMAILS

Com esses valores eu conecto o app (login + sincronização) e migro os 70 Gideões atuais para a planilha.

> Observação de segurança: o SYNC_TOKEN é um segredo. Se preferir não colá-lo no chat, me avise que eu deixo um campo de configuração para você preencher direto no código depois. (O Client ID e a URL não são secretos.)

---

## Gestão de usuários — aba "Admin" (v2.3+)
Quem entra no app e quem é admin agora é controlado por uma **aba `Admin`** na planilha (não mais só no código). O script cria essa aba automaticamente na primeira execução, já com os emails iniciais.

**Estrutura da aba `Admin`:**
| email | papel |
|---|---|
| rogerio.s.ono@gmail.com | admin |
| tania.eustaqui@gmail.com | user |

- **papel = `admin`**: entra no app + vê a seção Admin (sincronizar / enviar base / recarregar base).
- **papel = `user`**: entra e usa o app, sincroniza sozinho; **sem** a seção Admin.
- Email **fora** da aba → **não entra**.

**Como adicionar um usuário normal:** acrescente uma linha com o email (coluna A) e `user` (coluna B).
**Como adicionar um admin:** acrescente a linha com `admin`, ou mude o papel de uma linha existente para `admin`.
**Como remover acesso:** apague a linha do email.

As mudanças valem no **próximo login/sincronização** — não precisa reimplantar o script.

> ⚠️ 1ª vez de um email NOVO: enquanto o app OAuth estiver em "modo de teste", o Google exige que o email também esteja em **Google Cloud Console → Tela de consentimento OAuth → Usuários de teste**. Adicione lá também. (Quando/se você "publicar" o app OAuth, esse passo deixa de ser necessário.)

