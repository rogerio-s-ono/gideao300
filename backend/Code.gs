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

const SYNC_TOKEN = 'TROQUE- POR-UM-SEGREDO-LONGO';
const CLIENT_ID  = 'COLE-AQUI-O-OAUTH-CLIENT-ID.apps.googleusercontent.com';
const ALLOWED_EMAILS = [
  'email-da-pastora@gmail.com',
  'seu-email@gmail.com'
];

const SHEET_NAME = 'Gideoes';
const ADMIN_SHEET = 'Admin';
const HEADERS = ['id','numero','nome','telefone','tamanho','cota','pagamentos_json',
                 'camisaEstado','datas_json','observacoes','aRevisar','textoOriginal',
                 'atualizadoEm','atualizadoPor'];
// coleções financeiras (fase Caixa)
const DESP_SHEET='Despesas';
const DESP_HEADERS=['id','descricao','valor','data','categoria','bolso','obs','atualizadoEm','atualizadoPor'];
const MOV_SHEET='Movimentos';
const MOV_HEADERS=['id','de','para','valor','data','comentario','atualizadoEm','atualizadoPor'];

function _collSheet(name, headers){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(name);
  if(!sh){ sh=ss.insertSheet(name); }
  if(sh.getLastRow()===0){ sh.appendRow(headers); }
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
    out.push(o);
  }
  return out;
}
function _collUpsert(name, headers, arr, email, now, dels){
  const sh=_collSheet(name, headers);
  const values=sh.getDataRange().getValues();
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
    sh.getRange(1,1,1,2).setValues([['email','papel']]).setFontWeight('bold');
    // popula com os emails iniciais (edite/adicione linhas conforme necessário)
    ALLOWED_EMAILS.forEach(function(e){
      var role = ADMIN_EMAILS.map(function(a){return a.toLowerCase();}).indexOf(String(e).toLowerCase())>=0 ? 'admin' : 'user';
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
    var role = String(values[r][1]||'user').trim().toLowerCase();
    map[email] = (role==='admin') ? 'admin' : 'user';
  }
  return map;
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
    if(info.aud !== CLIENT_ID) return null;
    if(info.exp && (Number(info.exp) * 1000) < Date.now()) return null;
    if(info.email_verified !== 'true' && info.email_verified !== true) return null;
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
    atualizadoPor: o.atualizadoPor || ''
  };
}
function _parse(s, def){ try{ return s ? JSON.parse(s) : def; }catch(e){ return def; } }
function _objToRow(o){
  return [
    o.id, o.numero||'', o.nome||'', o.telefone||'', o.tamanho||'', o.cota||300,
    JSON.stringify(o.pagamentos||[]), o.camisaEstado||0, JSON.stringify(o.datas||{}),
    o.observacoes||'', !!o.aRevisar, o.textoOriginal||'',
    o.atualizadoEm||'', o.atualizadoPor||''
  ];
}

/* ---------- endpoints ---------- */
// PULL: GET ?action=pull&token=...&idToken=...
function doGet(e){
  var p = (e && e.parameter) || {};
  if(p.token !== SYNC_TOKEN) return _json({ok:false, error:'bad_token'});
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
    serverTime: new Date().toISOString(), user: u.email, role: u.role});
}

// PUSH: POST body {token, idToken, inscritos:[...]}
function doPost(e){
  var body = {};
  try{ body = JSON.parse(e.postData.contents); }catch(err){ return _json({ok:false, error:'bad_json'}); }
  if(body.token !== SYNC_TOKEN) return _json({ok:false, error:'bad_token'});
  var u = _verify(body.idToken);
  if(!u) return _json({ok:false, error:'unauthorized'});
  var email = u.email;
  var arr = body.inscritos || [];
  var sh = _sheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    // reset: apaga todas as linhas de dados (mantém o cabeçalho) antes de gravar
    if(body.reset === true){
      var last = sh.getLastRow();
      if(last > 1){ sh.deleteRows(2, last - 1); }
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
    var savedDesp=0, savedMov=0;
    if(body.despesas || body.despesasDel){ savedDesp=_collUpsert(DESP_SHEET, DESP_HEADERS, body.despesas||[], email, now, body.despesasDel||[]); }
    if(body.movimentos || body.movimentosDel){ savedMov=_collUpsert(MOV_SHEET, MOV_HEADERS, body.movimentos||[], email, now, body.movimentosDel||[]); }
    return _json({ok:true, saved: saved, savedDesp: savedDesp, savedMov: savedMov, serverTime: now, user: email, role: u.role});
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
  var src = ss.getSheetByName(SHEET_NAME);
  if(!src) return;
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try{
    var today = new Date();
    var name = 'bkp_' + _ymd(today);
    // se já existe o backup de hoje, substitui (evita duplicar em re-execução)
    var existing = ss.getSheetByName(name);
    if(existing) ss.deleteSheet(existing);
    var copy = src.copyTo(ss);
    copy.setName(name);
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
  var prefixDay = 'bkp_' + ymTarget + '-';       // bkp_AAAA-MM-DD do mês alvo
  var monthlyName = 'bkp_' + ymTarget;           // nome consolidado

  var sheets = ss.getSheets();
  var dayTabs = [];
  for(var i=0;i<sheets.length;i++){
    var nm = sheets[i].getName();
    if(nm.indexOf(prefixDay)===0) dayTabs.push(nm);
  }
  if(dayTabs.length===0) return;                 // nada a consolidar (já feito ou sem dados)
  dayTabs.sort();                                // ordena por data (string AAAA-MM-DD)
  var lastDayTab = dayTabs[dayTabs.length-1];    // último dia do mês alvo

  // renomeia o último dia para o nome mensal (se ainda não existir um consolidado)
  if(!ss.getSheetByName(monthlyName)){
    ss.getSheetByName(lastDayTab).setName(monthlyName);
    // remove os demais dias
    for(var k=0;k<dayTabs.length-1;k++){ var s=ss.getSheetByName(dayTabs[k]); if(s) ss.deleteSheet(s); }
  } else {
    // já há consolidado: remove todos os diários remanescentes do mês alvo
    for(var j=0;j<dayTabs.length;j++){ var sj=ss.getSheetByName(dayTabs[j]); if(sj) ss.deleteSheet(sj); }
  }
}
