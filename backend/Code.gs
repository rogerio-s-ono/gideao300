/************************************************************
 * Projeto Gideão 300 — Backend (Google Apps Script Web App)
 * Base de dados: aba "Gideoes" desta planilha.
 * Segurança: login Google (id_token) + allowlist de emails + token secreto.
 *
 * COMO CONFIGURAR (edite as 3 constantes abaixo):
 *  - SYNC_TOKEN: invente um texto secreto (ex.: uma senha longa). O MESMO valor
 *    deve ser colocado no app (constante SYNC_TOKEN).
 *  - CLIENT_ID: o OAuth Client ID criado no Google Cloud (termina em .apps.googleusercontent.com).
 *  - ALLOWED_EMAILS: lista dos emails Google autorizados (pastora, tesoureiro...).
 *
 * PUBLICAR: Implantar > Nova implantação > tipo "App da Web" >
 *   Executar como: Eu (o dono) | Quem tem acesso: Qualquer pessoa.
 *   Copie a URL /exec e coloque no app (SHEET_WEBAPP_URL).
 ************************************************************/

/* ============ SECRETS via Script Properties (SEM segredos no código versionado) ============
 * Os segredos são lidos das Script Properties do projeto (Configuração → Propriedades do script),
 * assim este arquivo pode ser versionado/deployado (clasp) sem expor nada. Grave-os UMA vez
 * executando setupSecrets() no editor (▶). Chaves: SYNC_TOKEN, GOOGLE_CLIENT_ID, ADMIN_FALLBACK. */
var _PROPS_CACHE = null;
function _props(){ if(!_PROPS_CACHE) _PROPS_CACHE = PropertiesService.getScriptProperties(); return _PROPS_CACHE; }
function SYNC_TOKEN(){ return _props().getProperty('SYNC_TOKEN') || ''; }
function CLIENT_ID(){ return _props().getProperty('GOOGLE_CLIENT_ID') || ''; }
// ADMIN_FALLBACK: emails admin separados por vírgula (semeia a aba Admin na 1ª vez).
function ADMIN_FALLBACK(){
  var raw = _props().getProperty('ADMIN_FALLBACK') || '';
  return raw.split(',').map(function(e){ return e.trim(); }).filter(function(e){ return e; });
}
// Compat: BOOTSTRAP_ADMIN = 1º email do ADMIN_FALLBACK; ALLOWED_EMAILS = todos; ADMIN_EMAILS = todos.
function BOOTSTRAP_ADMIN(){ var a=ADMIN_FALLBACK(); return a.length? [a[0]] : []; }
function ALLOWED_EMAILS(){ return ADMIN_FALLBACK(); }
function ADMIN_EMAILS(){ return ADMIN_FALLBACK(); }

/* Grave os segredos nas Script Properties — execute UMA vez no editor (▶ setupSecrets).
   Depois os valores reais são removidos daqui (ficam só nas Script Properties). */
function setupSecrets(){
  _props().setProperties({
    SYNC_TOKEN: 'COLE_O_TOKEN',
    GOOGLE_CLIENT_ID: 'COLE_O_CLIENT_ID',
    ADMIN_FALLBACK: 'rogerio.s.ono@gmail.com,tania.eustaqui@gmail.com'
  }, false);
  Logger.log('Secrets gravados. Chaves: ' + Object.keys(_props().getProperties()).join(', '));
}

const SHEET_NAME = 'Gideoes';
const ADMIN_SHEET = 'Admin';
const HEADERS = ['id','numero','nome','telefone','tamanho','cota','pagamentos_json',
                 'camisaEstado','datas_json','observacoes','aRevisar','textoOriginal',
                 'atualizadoEm','atualizadoPor','isento','criadoEm'];
// coleções financeiras (fase Caixa)
const DESP_SHEET='Despesas';
const DESP_HEADERS=['id','descricao','valor','data','categoria','bolso','obs','fotos_json','atualizadoEm','atualizadoPor','status','suspensoPor','suspensoEm'];
const MOV_SHEET='Movimentos';
const MOV_HEADERS=['id','de','para','valor','data','comentario','atualizadoEm','atualizadoPor','fotos_json'];
const EST_SHEET='Estoque';
const EST_HEADERS=['id','tamanho','delta','motivo','data','atualizadoEm','atualizadoPor'];

function _collSheet(name, headers){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(name);
  if(!sh){ sh=ss.insertSheet(name); }
  if(sh.getLastRow()===0){ sh.appendRow(headers); }
  // força a coluna 'data' como TEXTO puro (evita auto-conversão para Date)
  var di=headers.indexOf('data');
  if(di>=0){ try{ sh.getRange(1, di+1, sh.getMaxRows(), 1).setNumberFormat('@'); }catch(e){} }
  return sh;
}
function _collGetAll(name, headers){
  const sh=_collSheet(name, headers);
  const values=sh.getDataRange().getValues();
  const out=[];
  for(var r=1;r<values.length;r++){
    if(values[r][0]===''||values[r][0]===null) continue;
    var o={}; headers.forEach(function(h,i){ o[h]=values[r][i]; });
    o.id=Number(o.id); o.valor=Number(o.valor||0);
    // datas: se o Sheets converteu para Date, devolve como AAAA-MM-DD (texto)
    if(o.data instanceof Date){ o.data = Utilities.formatDate(o.data, Session.getScriptTimeZone(), 'yyyy-MM-dd'); }
    else if(o.data){ o.data = String(o.data).slice(0,10); }
    if('fotos_json' in o){ try{ o.fotos = o.fotos_json? JSON.parse(o.fotos_json):[]; }catch(_){ o.fotos=[]; } delete o.fotos_json; }
    out.push(o);
  }
  return out;
}
function _collUpsert(name, headers, arr, email, now, dels){
  const sh=_collSheet(name, headers);
  var values=sh.getDataRange().getValues();
  const idCol={}; for(var r=1;r<values.length;r++){ idCol[String(values[r][0])]=r+1; }
  // deleções primeiro (de baixo pra cima para não bagunçar índices)
  if(dels && dels.length){
    var rowsToDelete=dels.map(function(id){return idCol[String(id)];}).filter(Boolean).sort(function(a,b){return b-a;});
    rowsToDelete.forEach(function(rowIdx){ sh.deleteRows(rowIdx,1); });
    // recomputa índices
    values=sh.getDataRange().getValues(); for(var k in idCol) delete idCol[k];
    for(var r2=1;r2<values.length;r2++){ idCol[String(values[r2][0])]=r2+1; }
  }
  var saved=0;
  (arr||[]).forEach(function(o){
    o.atualizadoEm=now; o.atualizadoPor=email;
    if(o.fotos!==undefined && o.fotos_json===undefined){ o.fotos_json=JSON.stringify(o.fotos||[]); }
    var row=headers.map(function(h){ return o[h]!==undefined?o[h]:''; });
    var existing=idCol[String(o.id)];
    if(existing){ sh.getRange(existing,1,1,headers.length).setValues([row]); }
    else { sh.appendRow(row); }
    saved++;
  });
  return saved;
}

/* ---------- utilidades ---------- */
function _sheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh){ sh = ss.insertSheet(SHEET_NAME); }
  if(sh.getLastRow() === 0){ sh.appendRow(HEADERS); }
  return sh;
}
/* Aba Admin: controla QUEM entra e QUEM é admin. Cria com instruções + emails iniciais se não existir. */
function _adminSheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ADMIN_SHEET);
  if(!sh){
    sh = ss.insertSheet(ADMIN_SHEET);
    sh.getRange(1,1,1,3).setValues([['email','papel','nome']]).setFontWeight('bold');
    // popula com os emails iniciais (edite/adicione linhas conforme necessário)
    ALLOWED_EMAILS().forEach(function(e){
      var role = ADMIN_EMAILS().map(function(a){return a.toLowerCase();}).indexOf(String(e).toLowerCase())>=0 ? 'admin' : 'user';
      sh.appendRow([e, role]);
    });
    // instruções ao lado (coluna D)
    sh.getRange('D1').setValue('INSTRUÇÕES — Gestão de acesso').setFontWeight('bold');
    sh.getRange('D2').setValue('• Cada linha (colunas A/B) = um usuário autorizado a entrar no app.');
    sh.getRange('D3').setValue('• Coluna A = email Google (minúsculas). Coluna B = papel: "admin" ou "user".');
    sh.getRange('D4').setValue('• ADMIN: vê a seção Admin (sincronizar / enviar base / recarregar base).');
    sh.getRange('D5').setValue('• USER (normal): usa o app e sincroniza sozinho; sem a seção Admin.');
    sh.getRange('D6').setValue('• Para ADICIONAR usuário: acrescente uma nova linha com email + papel.');
    sh.getRange('D7').setValue('• Para REMOVER acesso: apague a linha do email.');
    sh.getRange('D8').setValue('• Para tornar admin: mude o papel da linha para "admin".');
    sh.getRange('D9').setValue('• IMPORTANTE (1ª vez de um email novo): no Google Cloud Console > Tela de');
    sh.getRange('D10').setValue('  consentimento OAuth, adicione o email em "Usuários de teste" (enquanto o');
    sh.getRange('D11').setValue('  app estiver em modo de teste). Sem isso o Google não deixa esse email logar.');
    sh.getRange('D12').setValue('• As mudanças valem no próximo login/sincronização (não precisa reimplantar).');
  }
  return sh;
}
/* retorna mapa {emailLower: 'admin'|'user'} da aba Admin */
function _accessMap(){
  const sh = _adminSheet();
  const values = sh.getDataRange().getValues();
  const map = {};
  for(var r=1; r<values.length; r++){
    var email = String(values[r][0]||'').trim().toLowerCase();
    if(!email) continue;
    map[email] = _normRole(values[r][1]);
  }
  return map;
}
// normaliza o papel para um dos 3 valores validos
function _normRole(v){
  var r = String(v||'user').trim().toLowerCase();
  if(r==='admin') return 'admin';
  if(r==='tesoureiro' || r==='tesorero') return 'tesoureiro';
  if(r==='viewer' || r==='visualizador' || r==='visor' || r==='readonly') return 'viewer';
  return 'user';
}
function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
/* Valida o id_token do Google e retorna {email, role} se autorizado (na aba Admin), ou null */
function _verify(idToken){
  if(!idToken) return null;
  try{
    const resp = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true });
    if(resp.getResponseCode() !== 200) return null;
    const info = JSON.parse(resp.getContentText());
    if(info.aud !== CLIENT_ID()) return null;
    if(info.exp && (Number(info.exp) * 1000) < Date.now()) return null;
    // email_verified: rejeita só se vier explicitamente false; se ausente, tolera (algumas contas não retornam)
    if(info.email_verified === false || info.email_verified === 'false') return null;
    var email = String(info.email||'').toLowerCase();
    var map = _accessMap();
    if(!(email in map)) return null;   // não está na aba Admin -> bloqueado
    return { email: email, role: map[email] };
  }catch(e){ return null; }
}

/* ---------- conversão linha <-> objeto ---------- */
function _rowToObj(row){
  var o = {};
  HEADERS.forEach(function(h,i){ o[h] = row[i]; });
  return {
    id: Number(o.id),
    numero: String(o.numero == null ? '' : o.numero),
    nome: o.nome || '',
    telefone: String(o.telefone == null ? '' : o.telefone),
    tamanho: o.tamanho || '',
    cota: Number(o.cota || 300),
    pagamentos: _parse(o.pagamentos_json, []),
    camisaEstado: Number(o.camisaEstado || 0),
    datas: _parse(o.datas_json, {}),
    observacoes: o.observacoes || '',
    aRevisar: o.aRevisar === true || o.aRevisar === 'true' || o.aRevisar === 1,
    textoOriginal: o.textoOriginal || '',
    atualizadoEm: o.atualizadoEm || '',
    atualizadoPor: o.atualizadoPor || '',
    isento: o.isento === true || o.isento === 'true' || o.isento === 1,
    criadoEm: o.criadoEm || ''
  };
}
function _parse(s, def){ try{ return s ? JSON.parse(s) : def; }catch(e){ return def; } }
function _objToRow(o){
  return [
    o.id, o.numero||'', o.nome||'', o.telefone||'', o.tamanho||'', o.cota||300,
    JSON.stringify(o.pagamentos||[]), o.camisaEstado||0, JSON.stringify(o.datas||{}),
    o.observacoes||'', !!o.aRevisar, o.textoOriginal||'',
    o.atualizadoEm||'', o.atualizadoPor||'', !!o.isento, o.criadoEm||''
  ];
}

/* ---------- gestao de usuarios (aba Admin) ---------- */
// conta quantos admins existem no mapa atual
function _countAdmins(map){
  var n=0; for(var k in map){ if(map[k]==='admin') n++; } return n;
}
// le a aba Admin como lista [{email, role, nome}] (coluna C = nome, opcional/retrocompativel)
function _usersList(sh){
  var values = sh.getDataRange().getValues();
  var out = [];
  for(var r=1; r<values.length; r++){
    var email = String(values[r][0]||'').trim().toLowerCase();
    if(!email) continue;
    var role = _normRole(values[r][1]);
    var nome = String((values[r][2]!=null?values[r][2]:'')||'').trim();  // col C (pode nao existir)
    out.push({email:email, role:role, nome:nome});
  }
  out.sort(function(a,b){ return a.email.localeCompare(b.email); });
  return out;
}
// executa listUsers/addUser/setRole/removeUser sobre a aba Admin (ja validado role=admin no doPost)
function _adminUsersAction(body){
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try{
    var sh = _adminSheet();
    var act = body.action;

    if(act === 'listUsers'){
      return _json({ok:true, users:_usersList(sh)});
    }

    if(act === 'replaceUsers'){
      // FULL-REPLACE dos acessos (restore de usuarios) — atomico, protege pelo menos 1 admin
      var incoming = Array.isArray(body.users) ? body.users : [];
      // normaliza e valida
      var rows = [];
      var seen = {};
      var hasAdmin = false;
      incoming.forEach(function(us){
        var em = String(us.email||'').trim().toLowerCase();
        if(!em || em.indexOf('@')<0) return;          // ignora invalidos
        if(seen[em]) return;                           // dedup
        seen[em] = true;
        var rl = _normRole(us.role);
        if(rl==='admin') hasAdmin = true;
        rows.push([em, rl, String(us.nome||'').trim()]);
      });
      if(rows.length===0) return _json({ok:false, error:'no_valid_users'});
      if(!hasAdmin) return _json({ok:false, error:'must_have_admin'});  // nunca deixa o app sem admin
      // reescreve a aba Admin: limpa dados (mantem cabecalho) e grava
      var lastR = sh.getLastRow();
      if(lastR > 1){ sh.getRange(2,1,lastR-1, Math.max(3, sh.getLastColumn())).clearContent(); }
      sh.getRange(2,1,rows.length,3).setValues(rows);
      return _json({ok:true, users:_usersList(sh)});
    }

    var target = String(body.email||'').trim().toLowerCase();
    if(!target || target.indexOf('@')<0) return _json({ok:false, error:'invalid_email'});
    var role = _normRole(body.role);
    var nome = String(body.nome||'').trim();  // opcional

    // localiza a linha do email (1-based) na aba Admin
    var values = sh.getDataRange().getValues();
    var rowIdx = 0;
    for(var r=1; r<values.length; r++){
      if(String(values[r][0]||'').trim().toLowerCase() === target){ rowIdx = r+1; break; }
    }
    var map = _accessMap();

    if(act === 'addUser'){
      if(rowIdx) return _json({ok:false, error:'already_exists'});
      sh.appendRow([target, role, nome]);   // email | papel | nome
    } else if(act === 'setRole'){
      if(!rowIdx) return _json({ok:false, error:'not_found'});
      // nao deixa rebaixar o ULTIMO admin (para qualquer papel nao-admin)
      if(map[target]==='admin' && role!=='admin' && _countAdmins(map)<=1){
        return _json({ok:false, error:'last_admin'});
      }
      sh.getRange(rowIdx, 2, 1, 1).setValue(role);         // col B = papel
      if(body.nome !== undefined){ sh.getRange(rowIdx, 3, 1, 1).setValue(nome); }  // col C = nome (se enviado)
    } else if(act === 'removeUser'){
      if(!rowIdx) return _json({ok:false, error:'not_found'});
      // nao deixa remover o ULTIMO admin
      if(map[target]==='admin' && _countAdmins(map)<=1){
        return _json({ok:false, error:'last_admin'});
      }
      sh.deleteRow(rowIdx);
    } else {
      return _json({ok:false, error:'unknown_action'});
    }

    return _json({ok:true, users:_usersList(sh)});
  } finally { lock.releaseLock(); }
}

/* ---------- endpoints ---------- */
// PULL: GET ?action=pull&token=...&idToken=...
function doGet(e){
  var p = (e && e.parameter) || {};
  // Segurança: NÃO depende mais do SYNC_TOKEN (que ficava exposto no frontend público).
  // A barreira real é o login Google (idToken) + allowlist na aba Admin, via _verify().
  var u = _verify(p.idToken);
  if(!u) return _json({ok:false, error:'unauthorized'});
  var sh = _sheet();
  var values = sh.getDataRange().getValues();
  var out = [];
  for(var r=1; r<values.length; r++){
    if(values[r][0] === '' || values[r][0] === null) continue;
    out.push(_rowToObj(values[r]));
  }
  return _json({ok:true, inscritos: out,
    despesas: _collGetAll(DESP_SHEET, DESP_HEADERS),
    movimentos: _collGetAll(MOV_SHEET, MOV_HEADERS),
    estoque: _collGetAll(EST_SHEET, EST_HEADERS),
    serverTime: new Date().toISOString(), user: u.email, role: u.role});
}

// PUSH: POST body {token, idToken, inscritos:[...]}
function doPost(e){
  var body = {};
  try{ body = JSON.parse(e.postData.contents); }catch(err){ return _json({ok:false, error:'bad_json'}); }
  // Segurança: NÃO depende mais do SYNC_TOKEN. Barreira = login Google (idToken) + allowlist (_verify).
  var u = _verify(body.idToken);
  if(!u) return _json({ok:false, error:'unauthorized'});
  var email = u.email;
  // ---- viewer (Visualizador) = SOMENTE LEITURA: rejeita qualquer escrita/ação via POST ----
  if(u.role === 'viewer'){ return _json({ok:false, error:'forbidden_readonly'}); }
  // ---- upload de imagem (foto de fatura) para o Google Drive ----
  if(body.action === 'upload'){
    try{
      var url = _uploadFoto(body.dataUrl, body.filename);
      return _json({ok:true, url:url, user:email});
    }catch(err){ return _json({ok:false, error:'upload_failed:'+err.message}); }
  }
  // ---- gestao de usuarios (tela de Admin) — SO admin ----
  if(body.action === 'listUsers' || body.action === 'addUser' || body.action === 'setRole' || body.action === 'removeUser' || body.action === 'replaceUsers'){
    if(u.role !== 'admin') return _json({ok:false, error:'forbidden'});
    try{ return _adminUsersAction(body); }
    catch(err){ return _json({ok:false, error:'admin_failed:'+err.message}); }
  }
  // ---- seguranca: dados financeiros (Caixa) por papel ----
  // (viewer ja foi bloqueado acima). Movimentacoes e DELETE de despesa: so admin/tesoureiro.
  // Criar/editar DESPESA: admin/tesoureiro E user (a pastora lanca faturas/recibos; nao apaga).
  var isCaixaMgr = (u.role==='admin' || u.role==='tesoureiro');
  var touchesMov = !!(body.movimentos || body.movimentosDel);
  var deletesDesp = !!(body.despesasDel && body.despesasDel.length);
  if((touchesMov || deletesDesp) && !isCaixaMgr){
    return _json({ok:false, error:'forbidden_caixa'});
  }
  var arr = body.inscritos || [];
  var sh = _sheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    // reset: apaga todas as linhas de dados (mantém o cabeçalho) antes de gravar
    if(body.reset === true){
      var last = sh.getLastRow();
      if(last > 1){ sh.deleteRows(2, last - 1); }
      // reset tambem das colecoes financeiras (backup completo)
      var shD = _collSheet(DESP_SHEET, DESP_HEADERS);
      var lastD = shD.getLastRow(); if(lastD > 1){ shD.deleteRows(2, lastD - 1); }
      var shM = _collSheet(MOV_SHEET, MOV_HEADERS);
      var lastM = shM.getLastRow(); if(lastM > 1){ shM.deleteRows(2, lastM - 1); }
      var shE = _collSheet(EST_SHEET, EST_HEADERS);
      var lastE = shE.getLastRow(); if(lastE > 1){ shE.deleteRows(2, lastE - 1); }
    }
    // deleção de inscritos por id (tombstones enviados pelo cliente) — apaga de baixo pra cima
    if(body.inscritosDel && body.inscritosDel.length){
      var delSet={}; body.inscritosDel.forEach(function(id){ delSet[String(id)]=1; });
      var vAll=sh.getDataRange().getValues();
      var rowsDel=[];
      for(var rr=1; rr<vAll.length; rr++){ if(delSet[String(vAll[rr][0])]) rowsDel.push(rr+1); }
      rowsDel.sort(function(a,b){return b-a;}).forEach(function(rowIdx){ sh.deleteRows(rowIdx,1); });
    }
    var values = sh.getDataRange().getValues();
    var idCol = {}; // id -> rowIndex(1-based)
    for(var r=1; r<values.length; r++){ idCol[String(values[r][0])] = r+1; }
    var now = new Date().toISOString();
    var saved = 0;
    arr.forEach(function(o){
      o.atualizadoEm = now;
      o.atualizadoPor = email;
      var row = _objToRow(o);
      var existing = idCol[String(o.id)];
      if(existing){ sh.getRange(existing, 1, 1, HEADERS.length).setValues([row]); }
      else { sh.appendRow(row); }
      saved++;
    });
    var savedDesp=0, savedMov=0, savedEst=0;
    if(body.despesas || body.despesasDel){ savedDesp=_collUpsert(DESP_SHEET, DESP_HEADERS, body.despesas||[], email, now, body.despesasDel||[]); }
    if(body.movimentos || body.movimentosDel){ savedMov=_collUpsert(MOV_SHEET, MOV_HEADERS, body.movimentos||[], email, now, body.movimentosDel||[]); }
    if(body.estoque || body.estoqueDel){ savedEst=_collUpsert(EST_SHEET, EST_HEADERS, body.estoque||[], email, now, body.estoqueDel||[]); }
    return _json({ok:true, saved: saved, savedDesp: savedDesp, savedMov: savedMov, savedEst: savedEst, serverTime: now, user: email, role: u.role});
  } finally {
    lock.releaseLock();
  }
}

/************************************************************
 * BACKUP DIÁRIO + RETENÇÃO
 * Crie um ACIONADOR de tempo para rodar dailyBackup() 1x/dia:
 *   Apps Script > Acionadores (relógio) > Adicionar acionador >
 *   função: dailyBackup | evento: Baseado em tempo > Diário > (ex. 2h-3h).
 *
 * Regra de retenção (executada no 1º backup de cada mês):
 *  - Mês corrente: backups diários (bkp_AAAA-MM-DD) vão se acumulando.
 *  - Mês anterior: mantém todos os diários.
 *  - 2 meses atrás: consolida — mantém só o ÚLTIMO dia, renomeado para bkp_AAAA-MM,
 *    e remove os demais diários daquele mês.
 *  - Meses mais antigos: já consolidados (1 aba bkp_AAAA-MM cada).
 ************************************************************/
function _pad2(n){ return (n<10?'0':'')+n; }
function _ym(d){ return d.getFullYear()+'-'+_pad2(d.getMonth()+1); }        // AAAA-MM
function _ymd(d){ return _ym(d)+'-'+_pad2(d.getDate()); }                   // AAAA-MM-DD

function dailyBackup(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    var today = new Date();
    var stamp = _ymd(today);
    // backup FULL: copia todas as abas de dados (Gideoes + Despesas + Movimentos + Admin)
    var dataSheets = [SHEET_NAME, DESP_SHEET, MOV_SHEET, EST_SHEET, ADMIN_SHEET];
    dataSheets.forEach(function(srcName){
      var src = ss.getSheetByName(srcName);
      if(!src) return;
      var name = 'bkp_' + stamp + '_' + srcName;   // ex.: bkp_2026-09-22_Gideoes
      var existing = ss.getSheetByName(name);
      if(existing) ss.deleteSheet(existing);        // re-execucao no mesmo dia: substitui
      src.copyTo(ss).setName(name);
    });
    // consolidação de 2 meses atrás (roda sempre; só age se houver diários a consolidar)
    _consolidateTwoMonthsAgo(ss, today);
  } finally {
    lock.releaseLock();
  }
}

function _consolidateTwoMonthsAgo(ss, today){
  // alvo = 2 meses atrás
  var target = new Date(today.getFullYear(), today.getMonth()-2, 1);
  var ymTarget = _ym(target);                    // AAAA-MM do mês a consolidar
  var prefixDay = 'bkp_' + ymTarget + '-';       // bkp_AAAA-MM-DD... do mês alvo

  var sheets = ss.getSheets();
  // agrupa as abas de backup diario do mes alvo por DATA (AAAA-MM-DD),
  // considerando o novo padrao 'bkp_AAAA-MM-DD_<Sheet>'
  var byDay = {};   // 'AAAA-MM-DD' -> [nomes de aba daquele dia]
  for(var i=0;i<sheets.length;i++){
    var nm = sheets[i].getName();
    if(nm.indexOf(prefixDay)!==0) continue;
    var day = nm.slice(4, 14);                    // extrai AAAA-MM-DD
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
    (byDay[day] = byDay[day] || []).push(nm);
  }
  var days = Object.keys(byDay).sort();           // ordena por data
  if(days.length<=1) return;                       // 0 ou 1 dia: nada a consolidar
  var keepDay = days[days.length-1];               // mantem o ULTIMO dia (conjunto completo)
  // remove todos os dias anteriores (todas as abas de cada dia)
  for(var d=0; d<days.length-1; d++){
    byDay[days[d]].forEach(function(tabName){
      var s = ss.getSheetByName(tabName); if(s) ss.deleteSheet(s);
    });
  }
}

/************************************************************
 * MIGRAÇÃO PONTUAL (rodar manualmente no editor Apps Script)
 * Converte pagamentos que caem no bolso "Outros" MAS sem comentário/nota
 * para tipo "Dinheiro" (eram dinheiro antigo registrado como Outros).
 *
 * USO SEGURO:
 *  1) Rode PRIMEIRO listarOutrosSemNota()  -> só LISTA no log (não altera nada).
 *     Confira a lista (nome, valor, data) no menu Ver > Registros de execução.
 *  2) Se estiver correto, rode converterOutrosSemNotaParaDinheiro()
 *     -> faz um BACKUP automático da aba antes e então converte.
 *
 * Critério: forma que mapeia para bolso 'outros' (Outros/Bizum/antigas) E nota vazia.
 * NÃO toca em pagamentos com nota (Outros legítimos) nem em Dinheiro/Cartão.
 ************************************************************/
// mesma regra de bolso do app (forma -> bolso)
function _bolsoDaForma(tipo){
  var s=String(tipo||'').toLowerCase();
  if(s==='dinheiro') return 'dinheiro';
  if(s==='cartão'||s==='cartao'||s.indexOf('máquina')>=0||s.indexOf('maquina')>=0||s.indexOf('ame')>=0||s==='pix') return 'banco';
  return 'outros';
}
function _isOutrosSemNota(p){
  if(_bolsoDaForma(p.tipo)!=='outros') return false;      // só o bolso Outros
  if(String(p.nota||'').trim()) return false;             // sem comentário
  var s=String(p.tipo||'').trim().toLowerCase();
  // só converte o GENÉRICO (vazio ou "outros"); exclui formas nomeadas (bizum, pix, transferencia, etc.)
  if(s==='' || s==='outros') return true;
  return false;
}
// idx da coluna pagamentos_json
function _payColIdx(){ return HEADERS.indexOf('pagamentos_json'); }

// (1) SÓ LISTA — não altera nada
function listarOutrosSemNota(){
  var sh=_sheet(); var col=_payColIdx();
  var values=sh.getDataRange().getValues();
  var total=0, gid=0;
  Logger.log('=== Candidatos: pagamentos em Outros SEM nota -> viram Dinheiro ===');
  for(var r=1;r<values.length;r++){
    var nome=values[r][HEADERS.indexOf('nome')];
    var arr; try{ arr=JSON.parse(values[r][col]||'[]'); }catch(e){ arr=[]; }
    (arr||[]).forEach(function(p){
      if(_isOutrosSemNota(p)){ total++; Logger.log('- '+nome+' | '+ (p.valor||0) +'€ | '+(p.data||'')+' | tipo="'+(p.tipo||'')+'"'); }
    });
  }
  Logger.log('=== TOTAL de pagamentos a converter: '+total+' ===');
  return total;
}

// (2) CONVERTE — faz backup antes
function converterOutrosSemNotaParaDinheiro(){
  var ss=SpreadsheetApp.getActiveSpreadsheet();
  var sh=_sheet(); var col=_payColIdx();
  var lock=LockService.getScriptLock(); lock.waitLock(30000);
  try{
    // BACKUP antes de alterar
    var bkpName='bkp_pre-migracao_'+_ymd(new Date());
    if(ss.getSheetByName(bkpName)) ss.deleteSheet(ss.getSheetByName(bkpName));
    sh.copyTo(ss).setName(bkpName);
    Logger.log('Backup criado: '+bkpName);

    var values=sh.getDataRange().getValues();
    var changedRows=0, changedPays=0;
    for(var r=1;r<values.length;r++){
      var arr; try{ arr=JSON.parse(values[r][col]||'[]'); }catch(e){ arr=null; }
      if(!arr || !arr.length) continue;
      var touched=false;
      arr.forEach(function(p){
        if(_isOutrosSemNota(p)){ p.tipo='Dinheiro'; changedPays++; touched=true; }
      });
      if(touched){
        sh.getRange(r+1, col+1, 1, 1).setValue(JSON.stringify(arr));
        changedRows++;
      }
    }
    Logger.log('Convertidos: '+changedPays+' pagamento(s) em '+changedRows+' Gideão(ões). Backup: '+bkpName);
    return {changedPays:changedPays, changedRows:changedRows, backup:bkpName};
  } finally { lock.releaseLock(); }
}

/************************************************************
 * UPLOAD DE FOTO DE FATURA -> Google Drive
 * Salva na pasta "Faturas Gideao 300" (cria se não existir),
 * deixa o arquivo acessível por link e retorna a URL.
 ************************************************************/
var FATURAS_FOLDER = 'Faturas Gideao 300';
function _faturasFolder(){
  var it = DriveApp.getFoldersByName(FATURAS_FOLDER);
  if(it.hasNext()) return it.next();
  return DriveApp.createFolder(FATURAS_FOLDER);
}
function _uploadFoto(dataUrl, filename){
  // dataUrl = "data:image/jpeg;base64,...."
  var parts = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/);
  if(!parts) throw new Error('dataUrl invalido');
  var mime = parts[1];
  var bytes = Utilities.base64Decode(parts[2]);
  var name = (filename || ('fatura_' + new Date().toISOString().replace(/[:.]/g,'-'))) ;
  var blob = Utilities.newBlob(bytes, mime, name);
  var folder = _faturasFolder();
  var file = folder.createFile(blob);
  try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(e){}
  // link direto de visualização
  return 'https://drive.google.com/file/d/' + file.getId() + '/view';
}
