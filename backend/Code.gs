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
const HEADERS = ['id','numero','nome','telefone','tamanho','cota','pagamentos_json',
                 'camisaEstado','datas_json','observacoes','aRevisar','textoOriginal',
                 'atualizadoEm','atualizadoPor'];

/* ---------- utilidades ---------- */
function _sheet(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if(!sh){ sh = ss.insertSheet(SHEET_NAME); }
  if(sh.getLastRow() === 0){ sh.appendRow(HEADERS); }
  return sh;
}
function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function _emailOk(email){
  if(!email) return false;
  email = String(email).toLowerCase();
  return ALLOWED_EMAILS.map(function(e){return e.toLowerCase();}).indexOf(email) >= 0;
}
/* Valida o id_token do Google (assinatura via endpoint tokeninfo) e retorna o email autorizado, ou null */
function _verify(idToken){
  if(!idToken) return null;
  try{
    const resp = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken),
      { muteHttpExceptions: true });
    if(resp.getResponseCode() !== 200) return null;
    const info = JSON.parse(resp.getContentText());
    // valida audience (nosso Client ID) e expiração
    if(info.aud !== CLIENT_ID) return null;
    if(info.exp && (Number(info.exp) * 1000) < Date.now()) return null;
    if(info.email_verified !== 'true' && info.email_verified !== true) return null;
    if(!_emailOk(info.email)) return null;
    return String(info.email).toLowerCase();
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
  var email = _verify(p.idToken);
  if(!email) return _json({ok:false, error:'unauthorized'});
  var sh = _sheet();
  var values = sh.getDataRange().getValues();
  var out = [];
  for(var r=1; r<values.length; r++){
    if(values[r][0] === '' || values[r][0] === null) continue;
    out.push(_rowToObj(values[r]));
  }
  return _json({ok:true, inscritos: out, serverTime: new Date().toISOString(), user: email});
}

// PUSH: POST body {token, idToken, inscritos:[...]}
function doPost(e){
  var body = {};
  try{ body = JSON.parse(e.postData.contents); }catch(err){ return _json({ok:false, error:'bad_json'}); }
  if(body.token !== SYNC_TOKEN) return _json({ok:false, error:'bad_token'});
  var email = _verify(body.idToken);
  if(!email) return _json({ok:false, error:'unauthorized'});
  var arr = body.inscritos || [];
  var sh = _sheet();
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
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
    return _json({ok:true, saved: saved, serverTime: now, user: email});
  } finally {
    lock.releaseLock();
  }
}
