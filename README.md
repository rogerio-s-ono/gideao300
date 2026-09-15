# Projeto Gideão 300 — App

App offline (PWA) para gestão de inscritos, pagamentos e camisas do Projeto Gideão 300.
Aplicación offline (PWA) para la gestión de inscritos, pagos y camisetas del Proyecto Gedeón 300.

- Cota fixa por pessoa / Cuota fija por persona: **300 €**
- Funciona offline / Funciona sin conexión
- Dados salvos no próprio celular / Datos guardados en el propio móvil (IndexedDB)
- Idiomas / Idiomas: Português · Español

---

## 1) Publicar por link (GitHub Pages) — quem monta / quien lo monta

1. Crie uma conta em https://github.com (grátis) — pode entrar com o Google.
   Crea una cuenta en https://github.com (gratis) — puedes entrar con Google.
2. Crie um repositório novo, ex.: `gideao300` (marque **Public**).
   Crea un repositorio nuevo, ej.: `gideao300` (marca **Public**).
3. Envie os arquivos desta pasta `app/` para o repositório (botão **Add file → Upload files**):
   Sube los archivos de esta carpeta `app/` al repositorio (**Add file → Upload files**):
   - `index.html`, `app.js`, `sw.js`, `manifest.json`, `seed.json`, `icon-192.png`, `icon-512.png`
4. No repositório: **Settings → Pages → Branch: main / (root) → Save**.
   En el repositorio: **Settings → Pages → Branch: main / (root) → Save**.
5. Aguarde ~1 minuto. O link ficará assim:
   Espera ~1 minuto. El enlace quedará así:
   `https://SEU-USUARIO.github.io/gideao300/`
6. Envie esse link aos pastores pelo WhatsApp.
   Envía ese enlace a los pastores por WhatsApp.

> Alternativa sem GitHub: dá para hospedar grátis no Netlify (arrastar a pasta em https://app.netlify.com/drop).
> Alternativa sin GitHub: puedes alojarlo gratis en Netlify (arrastra la carpeta en https://app.netlify.com/drop).

---

## 2) Instalar no celular — cada pastor / cada pastor

**Android (Chrome):**
1. Abra o link no Chrome. / Abre el enlace en Chrome.
2. Menu (⋮) → **Adicionar à tela inicial** / **Añadir a pantalla de inicio**.
3. Vai aparecer um ícone "Gideão 300" como um app.
   Aparecerá un icono "Gedeón 300" como una app.

**iPhone (Safari):**
1. Abra o link no Safari. / Abre el enlace en Safari.
2. Botão compartilhar (□↑) → **Adicionar à Tela de Início** / **Añadir a pantalla de inicio**.

Depois de instalado, funciona **sem internet**.
Una vez instalado, funciona **sin conexión**.

---

## 3) Como usar / Cómo usar

- **Inscritos:** lista com busca e filtros (Pagos, Parciais, Pendentes, A entregar, A revisar).
- **+ (botão azul):** cadastrar novo inscrito. O número já vem preenchido em sequência (pode alterar ou deixar sem número).
- **Pagamentos parcelados:** dentro de cada pessoa, adicione cada pagamento (valor + tipo + data). O app soma e mostra **Pago / faltam X€ / Pendente** sozinho.
- **Camisa pronta / entregue:** marque os interruptores.
- **A revisar:** marca os casos em dúvida (já vieram marcados os que tinham perguntas na planilha).
- **Painel:** total de inscritos vs. meta 300, quantidade por tamanho (para a gráfica), arrecadado × a receber, por forma de pagamento.
- **Mais:** exportar Excel (CSV), baixar backup, restaurar backup, imprimir/PDF.

### Sincronizar entre líderes / Sincronizar entre líderes
Como cada celular guarda seus próprios dados, para juntar as informações:
Como cada móvil guarda sus propios datos, para unir la información:
1. Um líder vai em **Mais → Baixar backup (JSON)**. / Un líder va a **Más → Descargar copia (JSON)**.
2. Envia o arquivo pelo WhatsApp/Drive. / Envía el archivo por WhatsApp/Drive.
3. O outro vai em **Mais → Restaurar backup** e escolhe o arquivo. / El otro va a **Más → Restaurar copia** y elige el archivo.

> Atenção: restaurar **substitui** os dados do celular. Combine quem é a "fonte" oficial.
> Atención: restaurar **reemplaza** los datos del móvil. Acuerden quién es la "fuente" oficial.

---

## Arquivos / Archivos
| Arquivo | Função |
|---|---|
| `index.html` | Interface do app |
| `app.js` | Lógica (dados, pagamentos, painel, backup) |
| `sw.js` | Service worker (offline) |
| `manifest.json` | Configuração do app instalável |
| `seed.json` | Dados iniciais importados da planilha (70 inscritos) |
| `icon-192.png`, `icon-512.png` | Ícones do app |

Dados iniciais: 70 inscritos, 35 pagos, 2 parciais, 33 pendentes, 16 camisas entregues, arrecadado 10.750 € de 21.000 € (meta 300 × 300 €).
