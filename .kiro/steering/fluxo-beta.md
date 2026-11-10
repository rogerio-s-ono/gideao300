# Fluxo de trabalho: sempre publicar no Beta

## Regra
Ao **concluir** qualquer alteração de código, publique no **Beta** sem perguntar antes:

1. Aplique a alteração **somente em `beta/`** (nunca em `app.js`, `index.html`, `sw.js` etc. da raiz, que são a produção), salvo pedido explícito do usuário para mexer na produção.
2. Faça o bump de versão do beta nos 3 arquivos:
   - `beta/app.js` (`APP_VERSION`, ex.: `v4.1.6-beta3` -> `v4.1.6-beta4`)
   - `beta/sw.js` (`CACHE`, ex.: `gideao300-beta-v416b3` -> `gideao300-beta-v416b4`)
   - `beta/version.json`
3. Trabalhe em um branch a partir do `master` atualizado (nunca commitar direto no `master`). Não use nomes que comecem com `beta/`: já existe o branch `beta` e o push é recusado. Ex.: `beta-nome-da-mudanca`.
4. Abra o PR para o `master` e **faça o merge**, para o GitHub Pages publicar o Beta.
5. Verifique o resultado no `origin/master` (versão, cache e código novo presentes) e confirme que a produção continua intacta.
6. Avise o usuário que o Beta foi atualizado e o que ele deve testar no aparelho (a publicação leva de 1 a 3 minutos; se aparecer a versão antiga, fechar e reabrir o app).

## Produção
Promover o Beta para a produção (release) só quando o usuário pedir de forma explícita.

## Contexto útil
- Beta e produção usam o mesmo backend (`config.js` igual): dados marcados no Beta aparecem na produção.
- Diferenças esperadas entre Beta e produção: versão, `FEATURES_DEFAULT.whatsapp` (beta `false`, produção `true`), ícones `-beta` e nome do cache do `sw.js`.
- O app exige login Google: não dá para abrir a UI no sandbox. Valide a lógica com simulação em Node e peça ao usuário para conferir no aparelho.

## Procedimento de release (promover Beta -> Produção)
Só com pedido explícito do usuário. Seguir sempre estes passos (foi assim na v4.1.7):

1. Confirmar que a raiz (produção) não tem mudanças próprias desde a última release (`git diff --stat <tag-anterior> HEAD -- app.js index.html sw.js version.json`), para ser seguro sobrescrever com o beta.
2. Branch `release-vX.Y.Z` a partir do `master` atualizado. Copiar `beta/app.js` -> `app.js` e `beta/index.html` -> `index.html`, **preservando a identidade da produção**:
   - `APP_VERSION = 'vX.Y.Z'` (em `app.js`)
   - `FEATURES_DEFAULT = { whatsapp:true }` com o comentário "produção: feature LIGADA por padrão"
   - ícones sem `-beta` no `index.html` (`icon-192.png`)
   - `CACHE` do `sw.js` raiz = `gideao300-vXYZ` e `version.json` = `vX.Y.Z`
   - NÃO tocar em `manifest.json`, `config.js`, `seed.json`.
   - `sw.js`: NÃO copiar do beta (o beta tem `CACHE` e ícones `-beta` próprios). Aplicar na raiz as mesmas mudanças de lógica do `beta/sw.js` (ex.: precache com `cache:'reload'` + `skipWaiting` após instalar), mantendo `CACHE = 'gideao300-vXYZ'` e a lista de precache sem `-beta`. O `diff sw.js beta/sw.js` deve mostrar só `CACHE` e os 2 ícones.
3. Conferir que `diff app.js beta/app.js` mostra só versão + flag, e `diff index.html beta/index.html` só os ícones.
4. Testar o artefato da RAIZ (jsdom + servidor simulado lento) antes do merge.
5. PR com análise de impacto (backend/dados), merge, tag `vX.Y.Z` no `master`.
6. Bump do beta para `vX.Y.Z-beta1` (`beta/app.js`, `beta/sw.js`, `beta/version.json`) em PR separado.
7. Verificar `origin/master` (versão, cache, flag, ícones) e que backend/config/seed continuam intactos.
