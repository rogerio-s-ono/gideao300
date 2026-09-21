/* Projeto Gideão 300 — app offline (IndexedDB) */
'use strict';

const COTA = 300;
const META = 300;
const APP_VERSION = 'v3.2';
const TAMANHOS = ['XS','S','S/M','M','L','XL','XXL','2XL','3XL',''];
const TIPOS = ['Cartão','Dinheiro','Outros'];
// mapeia forma de pagamento -> bolso (Dinheiro/Banco/Outros). Preserva leitura de formas antigas.
function bolsoDaForma(tipo){
  const s=(tipo||'').toLowerCase();
  if(s==='dinheiro') return 'dinheiro';
  if(s==='cartão'||s==='cartao'||s.indexOf('cartão/máquina')>=0||s.indexOf('cartao/maquina')>=0||s.indexOf('ame')>=0||s==='pix'||s.indexOf('máquina')>=0||s.indexOf('maquina')>=0) return 'banco';
  return 'outros'; // Outros, Bizum, e qualquer forma antiga não bancária
}
const BOLSOS = ['dinheiro','banco','outros'];
const EST = { AFAZER:0, EMCONF:1, PRONTA:2, ENTREGUE:3 };
const estKey = e => ['est0','est1','est2','est3'][e||0];
const estColor = e => ['var(--grey)','var(--amber)','#7a6a45','var(--green)'][e||0];

/* ---------- i18n ---------- */
const I18N = {
  pt:{
    appTitle:'Projeto Gideão 300', buscar:'Buscar por nome...',
    navLista:'Gideões', navPainel:'Painel', navMais:'Mais',
    novoInscrito:'Novo inscrito', editarInscrito:'Editar inscrito',
    numero:'Número', tamanho:'Tamanho', nome:'Nome', telefone:'Telefone',
    pagamentos:'Pagamentos (cota 300€)', valor:'Valor (€)', tipo:'Tipo', data:'Data',
    addPagamento:'+ Pagamento', comentarioOutros:'Comentário (Outros)', camisaPronta:'Camisa pronta', camisaEntregue:'Camisa entregue',
    aRevisar:'A revisar', observacoes:'Observações', textoOriginal:'Texto original',
    salvar:'Salvar', excluir:'Excluir', cancelar:'Cancelar',
    porTamanho:'Por tamanho (para a gráfica)', financeiro:'Financeiro',
    dadosBackup:'Dados e backup', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Baixar backup (JSON)',
    restaurarBackup:'Restaurar backup (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'O backup permite passar os dados entre os líderes (WhatsApp, Drive). Importar substitui os dados atuais.',
    zerar:'Apagar tudo e recarregar dados iniciais',
    fPago:'Pagos', fParcial:'Parciais', fPend:'Pendentes', fEntregue:'A entregar', fRevisar:'A revisar', fTodos:'Todos',
    sPago:'Pago', sPend:'Pendente',
    inscritos:'Inscritos', meta:'Meta', arrecadado:'Arrecadado', pendente:'A receber',
    prontas:'Prontas', entregues:'Entregues', aReceber:'Falta receber',
    saldoPago:'Pago — cota completa', saldoFalta:'Faltam {v}€', saldoPend:'Nenhum pagamento',
    faltam:'faltam {v}€', semNumero:'s/n', confirmDel:'Excluir este inscrito?',
    confirmReset:'Apagar TODOS os dados e recarregar a lista inicial? Faça um backup antes.',
    confirmRestore:'Restaurar vai substituir os dados atuais. Continuar?',
    nomeObrig:'Informe o nome.', metaSub:'{n} de 300 inscritos', porFormaPag:'Por forma de pagamento',
    vazio:'Nenhum inscrito encontrado.',
    thNum:'Nº', thNome:'Nome', thTam:'Tam.', thTel:'Telefone', thPago:'Pago', thStatus:'Status',
    thPronta:'Pronta', thEntregue:'Entregue', thRevisar:'Rev.', thCamisa:'Camisa',
    navConfeccao:'Confecção', camisa:'Camisa', camisaStatus:'Estado da camisa',
    est0:'A fazer', est1:'Em confecção', est2:'Pronta', est3:'Entregue',
    cAfazer:'A fazer', cEmConf:'Em confecção', cPronta:'Prontas', cEntregue:'Entregues',
    avancar:'Tocar para avançar', porTamanhoConf:'Resumo por tamanho', totalConf:'Total', totalGeral:'Total geral',
    verConfeccao:'Abrir na Confecção',
    pendPag:'Pendente pagamento', pago:'Pago', alteracoesSalvas:'Alterações salvas',
    semAlteracoes:'Sem alterações', confirmSairConf:'Há alterações não salvas. Sair mesmo assim?',
    projeto:'Projeto Gideão', alteracoesNaoSalvas:'Alterações não salvas',
    confirmSairMsg:'Você alterou o estado de algumas camisas mas ainda não salvou. O que deseja fazer?',
    salvarESair:'Salvar e sair', descartarSair:'Descartar alterações', continuarEditando:'Continuar editando', de:'de',
    confirmSairForm:'Você alterou os dados deste Gideão mas ainda não salvou. O que deseja fazer?',
    editarData:'Editar data',
    estAbbr1:'Conf.', estAbbr2:'Pronta', estAbbr3:'Entreg.',
    novaVersao:'Nova versão disponível', atualizar:'Atualizar', atualizando:'Atualizando…',
    loginSub:'Entre com sua conta Google autorizada', loginFoot:'Acesso restrito aos líderes do projeto',
    naoAutorizado:'Este email não está autorizado a usar o app. Fale com o responsável.',
    conta:'Conta e sincronização', usuario:'Usuário', versao:'Versão', sincronizacao:'Sincronização', admin:'Admin',
    sincronizarAgora:'Sincronizar agora', sair:'Sair', enviarBase:'Enviar base completa à planilha',
    recarregarBase:'Recarregar base original (zera tudo)',
    navAcessos:'Acessos', acessosNota:'Quem pode entrar no app. As mudanças valem no próximo login.',
    grupoAdmins:'Administradores', grupoUsers:'Usuários',
    novoUsuario:'Novo usuário', editarUsuario:'Editar usuário', editar:'Editar',
    perfil:'Perfil', papelUser:'Usuário', papelAdmin:'Admin', adicionar:'Adicionar', remover:'Remover',
    confirmRemoverUser:'Remover o acesso de {e}?',
    errJaExiste:'Este email já está na lista.', errEmailInvalido:'Email inválido.',
    errUltimoAdmin:'Não é possível: precisa haver ao menos um admin.', errUserFalhou:'Falha ao atualizar usuários.',
    confirmRecarregar:'Isto APAGA tudo (planilha e app) e recarrega os 70 Gideões originais. Usar só para reiniciar os testes. Continuar?',
    syncOk:'Sincronizado', syncPend:'Pendente', syncOff:'Offline', syncErr:'Erro', syncing:'Sincronizando…',
    navCaixa:'Caixa', saldoProjeto:'Saldo do projeto', bolsoDinheiro:'Dinheiro', bolsoBanco:'Banco', bolsoOutros:'Outros',
    conciliacaoBanco:'Conciliação bancária', saldoBancoCalc:'Saldo em banco (calculado)', saldoBancoReal:'Saldo real do banco',
    diferenca:'Diferença', lancamentos:'Lançamentos', despesas:'Despesas', movimentacoes:'Movimentações',
    novaDespesa:'Nova despesa', editarDespesa:'Editar despesa', descricao:'Descrição', categoria:'Categoria', pagoDe:'Pago de (bolso)', observacao:'Observação',
    novaMovimentacao:'Nova movimentação', editarMovimentacao:'Editar movimentação', de:'De', para:'Para', comentario:'Comentário',
    arrecadadoLabel:'Arrecadado', despesasLabel:'Despesas', semLancamentos:'Nenhum lançamento', confirmDelDesp:'Excluir esta despesa?', confirmDelMov:'Excluir esta movimentação?',
    extrato:'Extrato', saldoAtual:'Saldo atual', entrada:'Entrada', despesa:'Despesa', movimentacao:'Movimentação', pagamentoDe:'Pagamento',
    fotosFatura:'Fotos da fatura (até 3)', tirarFoto:'📷 Tirar/anexar foto', verFoto:'Ver foto', enviandoFoto:'Enviando foto…', maxFotos:'Máximo de 3 fotos.',
    fotoSemConexao:'Sem conexão para enviar a foto. Conecte-se à internet e tente salvar novamente (ou remova a foto para salvar sem ela).',
    fotoFalhou:'Não foi possível enviar a foto. A despesa NÃO foi salva. Tente de novo ou remova a foto.'
  },
  es:{
    appTitle:'Proyecto Gedeón 300', buscar:'Buscar por nombre...',
    navLista:'Gedeones', navPainel:'Panel', navMais:'Más',
    novoInscrito:'Nuevo inscrito', editarInscrito:'Editar inscrito',
    numero:'Número', tamanho:'Talla', nome:'Nombre', telefone:'Teléfono',
    pagamentos:'Pagos (cuota 300€)', valor:'Importe (€)', tipo:'Tipo', data:'Fecha',
    addPagamento:'+ Pago', comentarioOutros:'Comentario (Otros)', camisaPronta:'Camiseta lista', camisaEntregue:'Camiseta entregada',
    aRevisar:'Por revisar', observacoes:'Observaciones', textoOriginal:'Texto original',
    salvar:'Guardar', excluir:'Eliminar', cancelar:'Cancelar',
    porTamanho:'Por talla (para la imprenta)', financeiro:'Finanzas',
    dadosBackup:'Datos y copia', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Descargar copia (JSON)',
    restaurarBackup:'Restaurar copia (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'La copia permite pasar los datos entre los líderes (WhatsApp, Drive). Importar reemplaza los datos actuales.',
    zerar:'Borrar todo y recargar datos iniciales',
    fPago:'Pagados', fParcial:'Parciales', fPend:'Pendientes', fEntregue:'Por entregar', fRevisar:'Por revisar', fTodos:'Todos',
    sPago:'Pagado', sPend:'Pendiente',
    inscritos:'Inscritos', meta:'Meta', arrecadado:'Recaudado', pendente:'Por cobrar',
    prontas:'Listas', entregues:'Entregadas', aReceber:'Falta cobrar',
    saldoPago:'Pagado — cuota completa', saldoFalta:'Faltan {v}€', saldoPend:'Sin pagos',
    faltam:'faltan {v}€', semNumero:'s/n', confirmDel:'¿Eliminar este inscrito?',
    confirmReset:'¿Borrar TODOS los datos y recargar la lista inicial? Haz una copia antes.',
    confirmRestore:'Restaurar reemplazará los datos actuales. ¿Continuar?',
    nomeObrig:'Indica el nombre.', metaSub:'{n} de 300 inscritos', porFormaPag:'Por forma de pago',
    vazio:'Ningún inscrito encontrado.',
    thNum:'Nº', thNome:'Nombre', thTam:'Talla', thTel:'Teléfono', thPago:'Pagado', thStatus:'Estado',
    thPronta:'Lista', thEntregue:'Entreg.', thRevisar:'Rev.', thCamisa:'Camiseta',
    navConfeccao:'Confección', camisa:'Camiseta', camisaStatus:'Estado de la camiseta',
    est0:'Por hacer', est1:'En confección', est2:'Lista', est3:'Entregada',
    cAfazer:'Por hacer', cEmConf:'En confección', cPronta:'Listas', cEntregue:'Entregadas',
    avancar:'Toca para avanzar', porTamanhoConf:'Resumen por talla', totalConf:'Total', totalGeral:'Total general',
    verConfeccao:'Abrir en Confección',
    pendPag:'Pago pendiente', pago:'Pagado', alteracoesSalvas:'Cambios guardados',
    semAlteracoes:'Sin cambios', confirmSairConf:'Hay cambios sin guardar. ¿Salir de todos modos?',
    projeto:'Proyecto Gedeón', alteracoesNaoSalvas:'Cambios sin guardar',
    confirmSairMsg:'Has cambiado el estado de algunas camisetas pero aún no lo has guardado. ¿Qué deseas hacer?',
    salvarESair:'Guardar y salir', descartarSair:'Descartar cambios', continuarEditando:'Seguir editando', de:'de',
    confirmSairForm:'Has cambiado los datos de este Gedeón pero aún no lo has guardado. ¿Qué deseas hacer?',
    editarData:'Editar fecha',
    estAbbr1:'Conf.', estAbbr2:'Lista', estAbbr3:'Entreg.',
    novaVersao:'Nueva versión disponible', atualizar:'Actualizar', atualizando:'Actualizando…',
    loginSub:'Entra con tu cuenta Google autorizada', loginFoot:'Acceso restringido a los líderes del proyecto',
    naoAutorizado:'Este correo no está autorizado a usar la app. Habla con el responsable.',
    conta:'Cuenta y sincronización', usuario:'Usuario', versao:'Versión', sincronizacao:'Sincronización', admin:'Admin',
    sincronizarAgora:'Sincronizar ahora', sair:'Salir', enviarBase:'Enviar base completa a la hoja',
    recarregarBase:'Recargar base original (borra todo)',
    navAcessos:'Accesos', acessosNota:'Quién puede entrar en la app. Los cambios valen en el próximo inicio de sesión.',
    grupoAdmins:'Administradores', grupoUsers:'Usuarios',
    novoUsuario:'Nuevo usuario', editarUsuario:'Editar usuario', editar:'Editar',
    perfil:'Perfil', papelUser:'Usuario', papelAdmin:'Admin', adicionar:'Añadir', remover:'Quitar',
    confirmRemoverUser:'¿Quitar el acceso de {e}?',
    errJaExiste:'Este correo ya está en la lista.', errEmailInvalido:'Correo inválido.',
    errUltimoAdmin:'No es posible: debe haber al menos un admin.', errUserFalhou:'Error al actualizar usuarios.',
    confirmRecarregar:'Esto BORRA todo (hoja y app) y recarga los 70 Gedeones originales. Usar solo para reiniciar las pruebas. ¿Continuar?',
    syncOk:'Sincronizado', syncPend:'Pendiente', syncOff:'Sin conexión', syncErr:'Error', syncing:'Sincronizando…',
    navCaixa:'Caja', saldoProjeto:'Saldo del proyecto', bolsoDinheiro:'Efectivo', bolsoBanco:'Banco', bolsoOutros:'Otros',
    conciliacaoBanco:'Conciliación bancaria', saldoBancoCalc:'Saldo en banco (calculado)', saldoBancoReal:'Saldo real del banco',
    diferenca:'Diferencia', lancamentos:'Movimientos', despesas:'Gastos', movimentacoes:'Traspasos',
    novaDespesa:'Nuevo gasto', editarDespesa:'Editar gasto', descricao:'Descripción', categoria:'Categoría', pagoDe:'Pagado de (bolsa)', observacao:'Observación',
    novaMovimentacao:'Nuevo traspaso', editarMovimentacao:'Editar traspaso', de:'De', para:'A', comentario:'Comentario',
    arrecadadoLabel:'Recaudado', despesasLabel:'Gastos', semLancamentos:'Sin movimientos', confirmDelDesp:'¿Eliminar este gasto?', confirmDelMov:'¿Eliminar este traspaso?',
    extrato:'Extracto', saldoAtual:'Saldo actual', entrada:'Entrada', despesa:'Gasto', movimentacao:'Traspaso', pagamentoDe:'Pago',
    fotosFatura:'Fotos de la factura (hasta 3)', tirarFoto:'📷 Tomar/adjuntar foto', verFoto:'Ver foto', enviandoFoto:'Enviando foto…', maxFotos:'Máximo de 3 fotos.',
    fotoSemConexao:'Sin conexión para enviar la foto. Conéctate a internet e intenta guardar de nuevo (o quita la foto para guardar sin ella).',
    fotoFalhou:'No se pudo enviar la foto. El gasto NO se guardó. Intenta de nuevo o quita la foto.'
  }
};
let lang = localStorage.getItem('lang') || 'pt';
const t = (k,vars) => { let s=(I18N[lang][k]||k); if(vars) for(const p in vars) s=s.replace('{'+p+'}',vars[p]); return s; };

/* ---------- IndexedDB ---------- */
const DB_NAME='gideao300', STORE='inscritos', STORE_DESP='despesas', STORE_MOV='movimentos';
let db;
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,2);
    r.onupgradeneeded=e=>{ const d=e.target.result;
      if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains(STORE_DESP)) d.createObjectStore(STORE_DESP,{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains(STORE_MOV)) d.createObjectStore(STORE_MOV,{keyPath:'id',autoIncrement:true});
    };
    r.onsuccess=e=>{db=e.target.result;res();};
    r.onerror=e=>rej(e);
  });
}
function tx(mode){ return db.transaction(STORE,mode).objectStore(STORE); }
function getAll(){ return new Promise((res,rej)=>{ try{ const r=tx('readonly').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error||new Error('db_getAll')); }catch(e){ rej(e); } }); }
function put(rec){ return new Promise((res,rej)=>{ try{ const r=tx('readwrite').put(rec); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error||new Error('db_put')); }catch(e){ rej(e); } }); }
function del(id){ return new Promise((res,rej)=>{ try{ const r=tx('readwrite').delete(id); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error||new Error('db_del')); }catch(e){ rej(e); } }); }
function clearAll(){ return new Promise((res,rej)=>{ try{ const r=tx('readwrite').clear(); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error||new Error('db_clear')); }catch(e){ rej(e); } }); }
// helpers genéricos por store (despesas/movimentos)
function sx(store,mode){ return db.transaction(store,mode).objectStore(store); }
function sGetAll(store){ return new Promise((res,rej)=>{ try{ const r=sx(store,'readonly').getAll(); r.onsuccess=()=>res(r.result||[]); r.onerror=()=>rej(r.error||new Error('db_getAll')); }catch(e){ rej(e); } }); }
function sPut(store,rec){ return new Promise((res,rej)=>{ try{ const r=sx(store,'readwrite').put(rec); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error||new Error('db_put')); }catch(e){ rej(e); } }); }
function sDel(store,id){ return new Promise((res,rej)=>{ try{ const r=sx(store,'readwrite').delete(id); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error||new Error('db_del')); }catch(e){ rej(e); } }); }
function sClear(store){ return new Promise((res,rej)=>{ try{ const r=sx(store,'readwrite').clear(); r.onsuccess=()=>res(); r.onerror=()=>rej(r.error||new Error('db_clear')); }catch(e){ rej(e); } }); }

async function migrate(){
  const all=await getAll();
  for(const i of all){
    if(i.camisaEstado===undefined){
      i.camisaEstado = i.camisaEntregue ? EST.ENTREGUE : (i.camisaPronta ? EST.PRONTA : EST.AFAZER);
      delete i.camisaPronta; delete i.camisaEntregue;
      await put(i);
    }
  }
}

async function seedIfEmpty(){
  const all=await getAll();
  if(all.length) return;
  try{
    const resp=await fetch('seed.json');
    const data=await resp.json();
    for(const i of data.inscritos){ await put(i); }
  }catch(e){ console.warn('seed falhou',e); }
}

/* ---------- helpers ---------- */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const somaPago=i=>(i.pagamentos||[]).reduce((a,p)=>a+(+p.valor||0),0);
function statusPag(i){ const s=somaPago(i); if(s>=i.cota) return 'pago'; if(s>0) return 'parcial'; return 'pend'; }
// calcula os 3 bolsos (dinheiro/banco/outros), saldo do projeto e formas
function computeCaixa(inscritos, despesas, movimentos){
  const bolso={dinheiro:0,banco:0,outros:0};
  const forma={'Cartão':0,'Dinheiro':0,'Outros':0};
  // entradas (pagamentos dos Gideões) -> bolso pela forma
  (inscritos||[]).forEach(i=>(i.pagamentos||[]).forEach(p=>{
    const v=+p.valor||0; const b=bolsoDaForma(p.tipo); bolso[b]+=v;
    // consolidação por forma (mapeia antigas para as 3)
    if(b==='banco') forma['Cartão']+=v; else if(b==='dinheiro') forma['Dinheiro']+=v; else forma['Outros']+=v;
  }));
  const arrecadado = bolso.dinheiro+bolso.banco+bolso.outros;
  // movimentações: realocam entre bolsos (não mudam o total)
  (movimentos||[]).forEach(m=>{ const v=+m.valor||0; if(bolso[m.de]!==undefined) bolso[m.de]-=v; if(bolso[m.para]!==undefined) bolso[m.para]+=v; });
  // despesas: saem do bolso escolhido
  let despTotal=0;
  (despesas||[]).forEach(d=>{ const v=+d.valor||0; despTotal+=v; const b=d.bolso||'banco'; if(bolso[b]!==undefined) bolso[b]-=v; });
  const saldoProjeto = arrecadado - despTotal;
  return { bolso, arrecadado, despTotal, saldoProjeto, forma };
}
function hoje(){ const d=new Date(); const off=d.getTimezoneOffset(); const l=new Date(d.getTime()-off*60000); return l.toISOString().slice(0,10); }
// remove acentos/diacríticos para busca (é->e, ã->a, ç->c, ñ->n...)
function norm(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
// ordem por número: '' ou NaN vão para o fim; 0 ('00') fica no início (corrige 0||9999)
function numOrder(v){ const n=parseInt(v); return isNaN(n)?9999:n; }
// exibe o número com 2 dígitos (0..9 -> 00..09); vazio -> "s/n"; mantém não-numéricos como estão
function fmtNum(v){
  const s=(v==null?'':String(v)).trim();
  if(s==='') return t('semNumero');
  const n=parseInt(s,10);
  return (!isNaN(n) && n>=0 && n<10 && /^\d+$/.test(s)) ? ('0'+n) : s;
}

let state={ view:'lista', filter:'todos', q:'', editing:null, draftPays:[], viewMode: localStorage.getItem('viewMode')||'cards', confFilter:'todos', confHighlight:null, confDirty:{}, scrollPos:{} };

/* ---------- render lista ---------- */
const FILTERS=[['todos','fTodos'],['pago','fPago'],['parcial','fParcial'],['pend','fPend'],['entregar','fEntregue'],['revisar','fRevisar']];
function renderFilters(){
  $('#filters').innerHTML=FILTERS.map(([k,l])=>`<div class="chip ${state.filter===k?'active':''}" data-f="${k}">${t(l)}</div>`).join('');
  $$('#filters .chip').forEach(c=>c.onclick=()=>{state.filter=c.dataset.f;renderFilters();renderList();});
}
async function getFiltered(){
  const all=(await getAll()).sort((a,b)=>{
    const na=numOrder(a.numero), nb=numOrder(b.numero);
    return na-nb || a.nome.localeCompare(b.nome);
  });
  const q=state.q.toLowerCase();
  const qn=norm(state.q);  // busca sem acento
  return all.filter(i=>{
    if(q){
      const qd=q.replace(/\D/g,'');  // dígitos da busca (para telefone)
      const telDigits=(i.telefone||'').replace(/\D/g,'');
      const matchNome=norm(i.nome).includes(qn);
      const matchNum=(i.numero||'').includes(q);
      const matchTel=qd.length>=3 && telDigits.includes(qd);
      if(!matchNome && !matchNum && !matchTel) return false;
    }
    const st=statusPag(i);
    switch(state.filter){
      case 'pago': return st==='pago';
      case 'parcial': return st==='parcial';
      case 'pend': return st==='pend';
      case 'entregar': return i.camisaEstado!==EST.ENTREGUE;
      case 'revisar': return i.aRevisar;
      default: return true;
    }
  });
}
async function renderList(){
  const cardsEl=$('#list'), tableEl=$('#listTable');
  const isTable=state.viewMode==='table';
  cardsEl.classList.toggle('hidden',isTable);
  tableEl.classList.toggle('hidden',!isTable);
  const filtered=await getFiltered();
  if(isTable) return renderTable(filtered,tableEl);
  if(!filtered.length){ cardsEl.innerHTML=`<div class="empty">${t('vazio')}</div>`; return; }
  cardsEl.innerHTML=filtered.map(i=>{
    const st=statusPag(i), soma=somaPago(i), falta=i.cota-soma;
    // badges à direita: pagamento + entregue/estado camisa (+ revisar)
    const right=[];
    if(st==='pago') right.push(`<span class="b pago">${t('sPago')}</span>`);
    else if(st==='parcial') right.push(`<span class="b parcial">${t('faltam',{v:falta})}</span>`);
    else right.push(`<span class="b pend">${t('sPend')}</span>`);
    if(st==='pago'){
      if(i.camisaEstado===EST.EMCONF) right.push(`<span class="b parcial">${t('est1')}</span>`);
      else if(i.camisaEstado===EST.PRONTA) right.push(`<span class="b pronta">${t('est2')}</span>`);
      else if(i.camisaEstado===EST.ENTREGUE) right.push(`<span class="b entregue">${t('est3')}</span>`);
    }
    if(i.aRevisar) right.push(`<span class="b revisar">${t('aRevisar')}</span>`);
    // meta em texto simples: tamanho · telefone · valor
    const metaParts=[];
    if(i.tamanho) metaParts.push(esc(i.tamanho));
    if(i.telefone) metaParts.push(esc(i.telefone));
    metaParts.push(`${soma}€ / ${i.cota}€`);
    return `<div class="card" data-id="${i.id}">
      <div class="num">${fmtNum(i.numero)}</div>
      <div class="info">
        <div class="nome">${esc(i.nome)}</div>
        <div class="meta">${metaParts.join(' · ')}</div>
      </div>
      <div class="badges">${right.join('')}</div>
    </div>`;
  }).join('');
  $$('#list .card').forEach(c=>c.onclick=()=>openModal(+c.dataset.id));
}
function renderTable(filtered,el){
  if(!filtered.length){ el.innerHTML=`<div class="empty">${t('vazio')}</div>`; return; }
  const head=`<tr>
    <th>${t('thNum')}</th><th>${t('thNome')}</th><th>${t('thTam')}</th><th>${t('thTel')}</th>
    <th class="c">${t('thPago')}</th><th>${t('thStatus')}</th>
    <th>${t('thCamisa')}</th><th class="c">${t('thRevisar')}</th></tr>`;
  const body=filtered.map(i=>{
    const st=statusPag(i), soma=somaPago(i), falta=i.cota-soma;
    const stTxt=st==='pago'?t('sPago'):st==='parcial'?t('faltam',{v:falta}):t('sPend');
    const stClass=st==='pago'?'st-pago':st==='parcial'?'st-parcial':'st-pend';
    return `<tr data-id="${i.id}">
      <td>${fmtNum(i.numero)}</td>
      <td>${esc(i.nome)}</td>
      <td>${esc(i.tamanho||'')}</td>
      <td>${esc(i.telefone||'')}</td>
      <td class="c">${soma}€</td>
      <td class="${stClass}">${stTxt}</td>
      <td style="color:${estColor(i.camisaEstado)};font-weight:500">${t(estKey(i.camisaEstado))}</td>
      <td class="c">${i.aRevisar?'<span class="rev">!</span>':''}</td>
    </tr>`;
  }).join('');
  el.innerHTML=`<table class="grid"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  el.querySelectorAll('tbody tr').forEach(r=>r.onclick=()=>openModal(+r.dataset.id));
}
function esc(s){ return (s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

/* ---------- painel ---------- */
async function renderPainel(){
  const all=await getAll();
  const n=all.length;
  const pagos=all.filter(i=>statusPag(i)==='pago').length;
  const parcial=all.filter(i=>statusPag(i)==='parcial').length;
  const pend=all.filter(i=>statusPag(i)==='pend').length;
  const prontas=all.filter(i=>(i.camisaEstado||0)>=EST.PRONTA).length;
  const entregues=all.filter(i=>(i.camisaEstado||0)===EST.ENTREGUE).length;
  const arrec=all.reduce((a,i)=>a+somaPago(i),0);
  const totalCota=all.reduce((a,i)=>a+i.cota,0);
  const areceber=totalCota-arrec;
  const pct=Math.min(100,Math.round(n/META*100));
  $('#kpis').innerHTML=`
    <div class="kpi progress">
      <div class="prog-head"><div class="n">${n} / ${META}</div><div class="prog-money"><span class="pm-v">${arrec.toLocaleString('pt-PT')}€</span><span class="pm-l">${t('arrecadado')}</span></div></div>
      <div class="l">${t('inscritos')} · ${t('meta')}</div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="prog-foot"><span>${arrec.toLocaleString('pt-PT')}€ ${t('de')} ${totalCota.toLocaleString('pt-PT')}€</span><span>${t('aReceber')}: ${areceber.toLocaleString('pt-PT')}€</span></div>
    </div>
    <div class="kpi"><div class="n" style="color:var(--green)">${pagos}</div><div class="l">${t('fPago')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--amber)">${parcial}</div><div class="l">${t('fParcial')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--grey)">${pend}</div><div class="l">${t('fPend')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--accent)">${entregues}</div><div class="l">${t('entregues')}</div></div>
  `;
  // por tamanho
  const bySize={};
  all.forEach(i=>{ const s=(i.tamanho||'—').trim()||'—'; bySize[s]=(bySize[s]||0)+1; });
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  const keys=Object.keys(bySize).sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  $('#sizegrid').innerHTML=keys.map(s=>`<div class="sizecell"><div class="v">${bySize[s]}</div><div class="s">${esc(s)}</div></div>`).join('');
  // financeiro
  const byForma={};
  all.forEach(i=>(i.pagamentos||[]).forEach(p=>{const f=p.tipo||'—';byForma[f]=(byForma[f]||0)+(+p.valor||0);}));
  let fin=`
    <div class="tot-row"><span>${t('arrecadado')}</span><b style="color:var(--green)">${arrec}€</b></div>
    <div class="tot-row"><span>${t('aReceber')}</span><b style="color:var(--amber)">${areceber}€</b></div>
    <div class="tot-row"><span>${t('prontas')}</span><b>${prontas}</b></div>
    <h3 style="margin:14px 0 4px;font-size:14px;color:var(--muted)">${t('porFormaPag')}</h3>`;
  fin+=Object.keys(byForma).sort((a,b)=>byForma[b]-byForma[a]).map(f=>`<div class="tot-row"><span>${esc(f)}</span><b>${byForma[f]}€</b></div>`).join('');
  $('#fin').innerHTML=fin;
}

/* ---------- confecção ---------- */
// [filtro key, label i18n, classe do badge de cor]
const CONF_FILTERS=[['todos','fTodos',''],['0','cAfazer','cb-grey'],['1','cEmConf','cb-amber'],['2','cPronta','cb-gold'],['3','cEntregue','cb-green'],['pend','pendPag','cb-red']];
function renderConfFilters(counts){
  const cc=counts||{};
  $('#confFilters').innerHTML=CONF_FILTERS.map(([k,l,cls])=>{
    const n=(cc[k]!=null)?cc[k]:0;
    return `<div class="chip ${state.confFilter===k?'active':''}" data-f="${k}">${t(l)} <span class="cbadge ${cls}">${n}</span></div>`;
  }).join('');
  $$('#confFilters .chip').forEach(c=>c.onclick=()=>{state.confFilter=c.dataset.f;renderConfeccao();});
}
async function renderConfeccao(){
  const all=await getAll();
  const c=[0,0,0,0]; let pendPagCount=0;
  all.forEach(i=>{
    if(statusPag(i)!=='pago'){ pendPagCount++; return; }  // sem pagamento completo -> não entra em nenhuma etapa
    c[i.camisaEstado||0]++;
  });
  // contagens para os badges dos filtros (contador dentro do chip)
  const counts={ todos: all.length, '0':c[0], '1':c[1], '2':c[2], '3':c[3], pend:pendPagCount };
  renderConfFilters(counts);
  renderConfList();
  // resumo por tamanho x estado (para produção): pagos por tamanho e status
  const bySize={}; const totCol=[0,0,0,0];
  all.forEach(i=>{ if(statusPag(i)!=='pago') return; const s=(i.tamanho||'—').trim()||'—'; if(!bySize[s])bySize[s]=[0,0,0,0]; const e=i.camisaEstado||0; bySize[s][e]++; totCol[e]++; });
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  const keys=Object.keys(bySize).sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  const totGeral=totCol[0]+totCol[1]+totCol[2]+totCol[3];
  let html=`<div class="tablewrap"><table class="grid"><thead><tr><th>${t('thTam')}</th><th class="c">${t('cAfazer')}</th><th class="c">${t('cEmConf')}</th><th class="c">${t('cPronta')}</th><th class="c">${t('cEntregue')}</th><th class="c">${t('totalConf')}</th></tr></thead><tbody>`;
  keys.forEach(s=>{const a=bySize[s];const tot=a[0]+a[1]+a[2]+a[3];html+=`<tr><td>${esc(s)}</td><td class="c">${a[0]||''}</td><td class="c">${a[1]||''}</td><td class="c">${a[2]||''}</td><td class="c">${a[3]||''}</td><td class="c"><b>${tot}</b></td></tr>`;});
  html+=`</tbody><tfoot><tr><td>${t('totalGeral')}</td><td class="c">${totCol[0]}</td><td class="c">${totCol[1]}</td><td class="c">${totCol[2]}</td><td class="c">${totCol[3]}</td><td class="c">${totGeral}</td></tr></tfoot></table></div>`;
  $('#confSize').innerHTML=html;
}
async function renderConfList(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero)||a.nome.localeCompare(b.nome));
  const f=state.confFilter;
  const filtered=all.filter(i=>{
    if(f==='todos') return true;
    // filtro "pendente de pagamento": Gideões sem pagamento completo
    if(f==='pend') return statusPag(i)!=='pago';
    // mantém visível qualquer card em edição, para não sumir ao trocar status antes de salvar
    if(i.id in state.confDirty) return true;
    // gate de pagamento: sem pagamento completo não entra em nenhuma etapa (A fazer/Em conf/Pronta/Entregue)
    if(statusPag(i)!=='pago') return false;
    return (i.camisaEstado||0)===+f;
  });
  const el=$('#confList');
  if(!filtered.length){ el.innerHTML=`<div class="empty">${t('vazio')}</div>`; return; }
  const EST_LABELS=['est0','est1','est2','est3'];
  el.innerHTML=filtered.map(i=>{
    const pago = statusPag(i)==='pago';
    const e = effEstado(i);
    const datas = effDatas(i);
    const dirty = i.id in state.confDirty;
    const hl = state.confHighlight===i.id ? 'style="outline:2px solid var(--accent)"' : '';
    const pillCols = EST_LABELS.map((k,idx)=>{
      const dateBelow = (idx>=1 && datas[idx]) ? `
        <span class="dchip" data-id="${i.id}" data-st="${idx}" title="${t(estKey(idx))}: ${fmtFull(datas[idx])}">
          <span class="dc-val">${fmtShort(datas[idx])}</span>
          <svg class="dc-cal" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V9h14z"/></svg>
          <input type="date" class="dl-input" data-id="${i.id}" data-st="${idx}" value="${datas[idx]}">
        </span>` : '';
      return `<div class="pill-col">
        <div class="pill-st ${e===idx?'on e'+idx:''}" data-id="${i.id}" data-est="${idx}">${t(k)}</div>
        ${dateBelow}
      </div>`;
    }).join('');
    return `<div class="confcard ${dirty?'dirty':''} ${pago?'':'locked'}" data-id="${i.id}" ${hl}>
      <div class="top">
        <div class="num">${fmtNum(i.numero)}</div>
        <div class="nm">
          <div class="nome"><span class="conf-name-link" data-id="${i.id}">${esc(i.nome)}</span> ${i.tamanho?`<span class="tam" style="font-size:12px">${esc(i.tamanho)}</span>`:''} ${dirty?'<span class="dirtydot"></span>':''}</div>
          <div class="sub"><span class="paytag ${pago?'ok':'no'}">${pago?t('pago'):t('pendPag')}</span></div>
        </div>
      </div>
      ${pago?`<div class="pills">${pillCols}</div>`:''}
    </div>`;
  }).join('');
  // clique nas pílulas — muda estado e grava data (hoje) da etapa se ainda não tiver
  $$('#confList .pill-st').forEach(p=>p.onclick=()=>{
    const id=+p.dataset.id, est=+p.dataset.est;
    const rec=all.find(x=>x.id===id);
    if(statusPag(rec)!=='pago') return;
    setDirtyEstado(rec, est);
    updateSaveBtn(); renderConfList();
  });
  // clicar na data/ícone abre o seletor
  $$('#confList .dchip').forEach(ch=>ch.onclick=(ev)=>{
    const inp=ch.querySelector('.dl-input');
    if(inp.showPicker) inp.showPicker(); else inp.focus();
  });
  // clicar no nome -> abre o card editável na aba Gideões
  $$('#confList .conf-name-link').forEach(nm=>nm.onclick=(ev)=>{
    ev.stopPropagation();
    const id=+nm.dataset.id;
    if(dirtyCount()>0){ pendingView='__editFromConf__'+id; $('#confirmModal').classList.remove('hidden'); }
    else { doSetView('lista'); openModal(id); }
  });
  $$('#confList .dl-input').forEach(inp=>inp.onchange=()=>{
    const id=+inp.dataset.id, st=+inp.dataset.st;
    const rec=all.find(x=>x.id===id);
    setDirtyData(rec, st, inp.value);
    updateSaveBtn(); renderConfList();
  });
}

// ----- estado efetivo (dirty ou salvo) -----
function effEstado(i){ const dd=state.confDirty[i.id]; return dd? dd.estado : (i.camisaEstado||0); }
function effDatas(i){ const dd=state.confDirty[i.id]; return dd? dd.datas : (i.datas||{}); }
function ensureDirty(rec){
  if(!(rec.id in state.confDirty)){
    state.confDirty[rec.id]={ estado: rec.camisaEstado||0, datas: Object.assign({}, rec.datas||{}) };
  }
  return state.confDirty[rec.id];
}
function isCleanVsSaved(rec){
  const d=state.confDirty[rec.id]; if(!d) return true;
  const origEstado=rec.camisaEstado||0; const origDatas=rec.datas||{};
  if(d.estado!==origEstado) return false;
  for(const k of [1,2,3]){ if((d.datas[k]||'')!==(origDatas[k]||'')) return false; }
  return true;
}
function setDirtyEstado(rec, est){
  const d=ensureDirty(rec);
  d.estado=est;
  // grava data (hoje) para etapas 1/2/3 ainda sem data
  if(est>=1 && !d.datas[est]) d.datas[est]=hoje();
  // remove datas de etapas acima do estado atual (retrocedeu)
  for(const st of [1,2,3]){ if(st>est) delete d.datas[st]; }
  if(isCleanVsSaved(rec)) delete state.confDirty[rec.id];
}
function setDirtyData(rec, st, val){
  const d=ensureDirty(rec);
  if(val) d.datas[st]=val; else delete d.datas[st];
  if(isCleanVsSaved(rec)) delete state.confDirty[rec.id];
}
function fmtDate(iso){ if(!iso) return ''; const [y,m,dd]=iso.split('-'); return `${dd}/${m}/${y}`; }
const MESES={pt:['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],
             es:['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']};
function toISODate(v){
  if(!v) return '';
  if(v instanceof Date){ const off=v.getTimezoneOffset(); return new Date(v.getTime()-off*60000).toISOString().slice(0,10); }
  let s=String(v).trim();
  // pega só a parte AAAA-MM-DD de um ISO/datetime; se vier com 'T' ou espaço, corta
  const m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return m[1]+'-'+m[2]+'-'+m[3];
  // dd/mm/aaaa -> aaaa-mm-dd
  const b=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if(b){ const y=b[3].length===2?'20'+b[3]:b[3]; return y+'-'+b[2].padStart(2,'0')+'-'+b[1].padStart(2,'0'); }
  return s;
}
function fmtShort(iso){ iso=toISODate(iso); if(!iso) return ''; const p=iso.split('-'); if(p.length<3) return iso; return `${p[2]}/${(MESES[lang]||MESES.pt)[(+p[1])-1]||p[1]}`; }
function fmtFull(iso){ iso=toISODate(iso); if(!iso) return ''; const p=iso.split('-'); if(p.length<3) return iso; return `${p[2]}/${p[1]}/${p[0].slice(2)}`; }

function dirtyCount(){ return Object.keys(state.confDirty).length; }
function updateSaveBtn(){
  const btn=$('#btnSaveConf');
  const show = state.view==='confeccao' && dirtyCount()>0;
  btn.classList.toggle('hidden',!show);
}
async function saveConf(){
  const all=await getAll();
  for(const id in state.confDirty){
    const rec=all.find(x=>x.id===+id);
    if(rec){
      const d=state.confDirty[id];
      rec.camisaEstado=d.estado;
      // limpa datas de etapas acima do estado atual (retrocedeu) e mantém as válidas
      const datas={};
      for(const st of [1,2,3]){ if(st<=d.estado && d.datas[st]) datas[st]=d.datas[st]; }
      rec.datas=datas;
      rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
      await put(rec);
      markPending(rec.id);
    }
  }
  state.confDirty={};
  updateSaveBtn();
  renderConfeccao();
  if(ONLINE_ENABLED) syncNow();
}

/* ---------- modal ---------- */
async function openModal(id){
  const all=await getAll();
  let rec=id?all.find(x=>x.id===id):null;
  state.editing=rec?rec.id:null;
  state.draftPays=rec?JSON.parse(JSON.stringify(rec.pagamentos||[])):[];
  $('#modalTitle').textContent=rec?t('editarInscrito'):t('novoInscrito');
  // default número sequencial
  let nextNum='';
  if(!rec){
    const nums=all.map(x=>parseInt(x.numero)).filter(x=>!isNaN(x));
    nextNum=nums.length?String(Math.max(...nums)+1).padStart(2,'0'):'01';
  }
  $('#f-numero').value=rec?(rec.numero||''):nextNum;
  $('#f-numero').placeholder=nextNum||'auto';
  fillSelect('#f-tamanho',TAMANHOS,rec?rec.tamanho:'');
  fillSelect('#p-tipo',TIPOS,'Dinheiro');
  if($('#p-outros-wrap')){ $('#p-outros-wrap').classList.add('hidden'); $('#p-comentario').value=''; }
  $('#f-nome').value=rec?rec.nome:'';
  $('#f-telefone').value=rec?(rec.telefone||''):'';
  const estAtual = rec?(rec.camisaEstado||0):0;
  $('#f-camisa-txt').textContent=t(estKey(estAtual));
  $('#f-camisa-txt').style.color=estColor(estAtual);
  $('#camisaStatusLine').dataset.pid = rec?rec.id:'';
  $('#f-revisar').checked=rec?!!rec.aRevisar:false;
  $('#f-obs').value=rec?(rec.observacoes||''):'';
  $('#f-orig').textContent=rec?(rec.textoOriginal||'—'):'—';
  const restanteOpen=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  $('#p-valor').value = restanteOpen>0 ? String(restanteOpen) : ''; $('#p-data').value=hoje();
  $('#del').style.display=rec?'block':'none';
  renderPays();
  $('#modal').classList.remove('hidden');
  const sheet=$('#modal .sheet'); if(sheet) sheet.scrollTop=0;
  state.formSnapshot=formSnapshot();
}
function formSnapshot(){
  return JSON.stringify({
    numero:$('#f-numero').value.trim(), nome:$('#f-nome').value.trim(),
    telefone:$('#f-telefone').value.trim(), tamanho:$('#f-tamanho').value,
    revisar:$('#f-revisar').checked, obs:$('#f-obs').value.trim(),
    pays:state.draftPays
  });
}
function formDirty(){ return state.formSnapshot!==undefined && state.formSnapshot!==formSnapshot(); }
function fillSelect(sel,opts,val){
  $(sel).innerHTML=opts.map(o=>`<option value="${o}" ${o===val?'selected':''}>${o||'—'}</option>`).join('');
}
function renderPays(){
  const soma=state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  const falta=COTA-soma;
  $('#paysList').innerHTML=state.draftPays.map((p,idx)=>`<div class="pay"><span>${p.valor}€ · ${esc(p.tipo||'—')}${p.tipo==='Outros'&&p.nota?' ('+esc(p.nota)+')':''}${p.data?' · '+p.data:''}</span><button class="del" data-i="${idx}">×</button></div>`).join('');
  $$('#paysList .del').forEach(b=>b.onclick=()=>{state.draftPays.splice(+b.dataset.i,1);renderPays();});
  const box=$('#saldoBox');
  if(soma>=COTA){ box.style.background='var(--soft-green)';box.style.color='var(--green)';box.textContent=t('saldoPago'); }
  else if(soma>0){ box.style.background='var(--soft-amber)';box.style.color='var(--amber)';box.textContent=t('saldoFalta',{v:falta}); }
  else { box.style.background='var(--soft-grey)';box.style.color='var(--grey)';box.textContent=t('saldoPend'); }
  // esconde a área de adicionar pagamento quando a cota já está completa
  const ap=$('#addPayArea'); if(ap) ap.classList.toggle('hidden', soma>=COTA);
}
$('#addPay').onclick=()=>{
  const v=parseFloat(($('#p-valor').value||'').replace(',','.'));
  if(!v||v<=0) return;
  const tipo=$('#p-tipo').value;
  const nota=(tipo==='Outros')? ($('#p-comentario').value||'').trim() : '';
  state.draftPays.push({valor:v,tipo,data:$('#p-data').value||hoje(),nota});
  const restante=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  $('#p-valor').value = restante>0 ? String(restante) : '';
  $('#p-data').value=hoje();
  $('#p-comentario').value='';
  renderPays();
};
// mostra o campo de comentário só quando "Outros"
document.addEventListener('change',(e)=>{ if(e.target && e.target.id==='p-tipo'){ $('#p-outros-wrap').classList.toggle('hidden', e.target.value!=='Outros'); } });
$('#save').onclick=async()=>{
  const nome=$('#f-nome').value.trim();
  if(!nome){ alert(t('nomeObrig')); return; }
  const all=await getAll();
  let rec=state.editing?all.find(x=>x.id===state.editing):{cota:COTA,textoOriginal:''};
  rec.numero=$('#f-numero').value.trim();
  rec.nome=nome;
  rec.telefone=$('#f-telefone').value.trim();
  rec.tamanho=$('#f-tamanho').value;
  rec.cota=COTA;
  rec.pagamentos=state.draftPays;
  if(rec.camisaEstado===undefined) rec.camisaEstado=0;
  rec.aRevisar=$('#f-revisar').checked;
  rec.observacoes=$('#f-obs').value.trim();
  if(!('motivoRevisar' in rec)) rec.motivoRevisar='';
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await put(rec);
  markPending(rec.id!=null?rec.id:newId);
  closeModal(); refresh();
  if(ONLINE_ENABLED) syncNow();
};
$('#del').onclick=async()=>{ if(!state.editing) return; if(!confirm(t('confirmDel'))) return; await del(state.editing); closeModal(); refresh(); };
$('#cancel').onclick=()=>tryCloseModal();
$('#modalBack').onclick=()=>tryCloseModal();
$('#modal').addEventListener('click',(e)=>{ if(e.target.id==='modal') tryCloseModal(); });  // clicar no fundo
$('#camisaStatusLine').onclick=()=>{
  const pid=$('#camisaStatusLine').dataset.pid;
  closeModal();
  state.confFilter='todos';
  state.confHighlight=pid?+pid:null;
  setView('confeccao');
};
function closeModal(){ $('#modal').classList.add('hidden'); state.editing=null; state.draftPays=[]; state.formSnapshot=undefined; }
// fecha o modal do Gideão; se houver alterações não salvas, pergunta antes
function tryCloseModal(){
  if(formDirty()){ $('#formConfirm').classList.remove('hidden'); }
  else closeModal();
}
$('#fcSave').onclick=async()=>{
  const nome=$('#f-nome').value.trim();
  if(!nome){ alert(t('nomeObrig')); return; }
  $('#formConfirm').classList.add('hidden');
  $('#save').click();
};
$('#fcDiscard').onclick=()=>{ $('#formConfirm').classList.add('hidden'); closeModal(); };
$('#fcCancel').onclick=()=>{ $('#formConfirm').classList.add('hidden'); };

/* ---------- export / backup ---------- */
function download(name,content,type){
  const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
}
async function exportCsv(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero));
  const head=['Numero','Nome','Telefone','Tamanho','Cota','Pago','Saldo','Status','Formas','Camisa','A revisar','Observacoes'];
  const rows=all.map(i=>{
    const soma=somaPago(i); const st=statusPag(i);
    const formas=[...new Set((i.pagamentos||[]).map(p=>p.tipo).filter(Boolean))].join('; ');
    return [i.numero||'',i.nome,i.telefone||'',i.tamanho||'',i.cota,soma,i.cota-soma,
      st==='pago'?'Pago':st==='parcial'?'Parcial':'Pendente',formas,
      t(estKey(i.camisaEstado)),i.aRevisar?'Sim':'',(i.observacoes||'').replace(/\n/g,' ')];
  });
  const csv='\uFEFF'+[head,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';')).join('\r\n');
  download('gideao300.csv',csv,'text/csv;charset=utf-8');
}
async function backup(){
  const all=await getAll();
  download('gideao300-backup-'+new Date().toISOString().slice(0,10)+'.json',
    JSON.stringify({projeto:'Projeto Gideão 300',cota:COTA,exportadoEm:new Date().toISOString(),inscritos:all},null,2),
    'application/json');
}
$('#btnExportXlsx').onclick=exportCsv;
$('#btnBackup').onclick=backup;
async function buildPrint(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero)||a.nome.localeCompare(b.nome));
  const rows=all.map(i=>{
    const soma=somaPago(i), st=statusPag(i);
    const stTxt=st==='pago'?t('sPago'):st==='parcial'?t('faltam',{v:i.cota-soma}):t('sPend');
    const camisa = statusPag(i)==='pago' ? t(estKey(i.camisaEstado||0)) : t('pendPag');
    return `<tr>
      <td>${esc(fmtNum(i.numero))}</td>
      <td>${esc(i.nome)}</td>
      <td>${esc(i.tamanho||'')}</td>
      <td>${esc(i.telefone||'')}</td>
      <td>${soma}€</td>
      <td>${stTxt}</td>
      <td>${camisa}</td>
    </tr>`;
  }).join('');
  const arrec=all.reduce((a,i)=>a+somaPago(i),0);
  const pagos=all.filter(i=>statusPag(i)==='pago').length;
  const hoje2=new Date().toLocaleDateString(lang==='es'?'es-ES':'pt-PT');
  $('#printArea').innerHTML=`
    <h1>Projeto Gideão 300 — ${lang==='es'?'Lista de Gedeones':'Lista de Gideões'}</h1>
    <div class="p-sub">Casa Fuerte Church · ${hoje2} · ${all.length} inscritos</div>
    <table>
      <thead><tr><th>${t('thNum')}</th><th>${t('thNome')}</th><th>${t('thTam')}</th><th>${t('thTel')}</th><th>${t('thPago')}</th><th>${t('thStatus')}</th><th>${t('thCamisa')}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="pf">
      <span><b>${t('inscritos')}:</b> ${all.length}/${META}</span>
      <span><b>${t('fPago')}:</b> ${pagos}</span>
      <span><b>${t('arrecadado')}:</b> ${arrec.toLocaleString('pt-PT')}€</span>
    </div>`;
}
$('#btnImprimir').onclick=async()=>{ await buildPrint(); window.print(); };
$('#fileRestore').onchange=async e=>{
  const f=e.target.files[0]; if(!f) return;
  if(!confirm(t('confirmRestore'))){ e.target.value=''; return; }
  const txt=await f.text();
  try{
    const data=JSON.parse(txt); const arr=data.inscritos||data;
    await clearAll();
    let idc=1; for(const i of arr){ i.id=idc++; i.cota=i.cota||COTA; await put(i); }
    refresh(); alert('OK');
  }catch(err){ alert('JSON inválido'); }
  e.target.value='';
};
$('#btnReset') && ($('#btnReset').onclick=async()=>{ if(!confirm(t('confirmReset'))) return; await clearAll(); await seedIfEmpty(); refresh(); });

/* ---------- navegação / idioma ---------- */
/* ---------- CAIXA (financeiro, só admin) ---------- */
const CATEGORIAS=['Camisas','Material','Outros'];
const BOLSO_LABEL={dinheiro:'Dinheiro',banco:'Banco',outros:'Outros'};
let caixaState={ despesas:[], movimentos:[], tab:'despesas', editDesp:null, editMov:null, draftFotos:[] };
function eur(n){ return (Math.round((+n||0)*100)/100).toLocaleString('pt-PT')+' €'; }

async function loadCaixa(){
  caixaState.despesas = await sGetAll(STORE_DESP);
  caixaState.movimentos = await sGetAll(STORE_MOV);
}
async function renderCaixa(){
  await loadCaixa();
  const inscritos = await getAll();
  const c = computeCaixa(inscritos, caixaState.despesas, caixaState.movimentos);
  $('#cxSaldoProjeto').textContent = eur(c.saldoProjeto);
  $('#cxSaldoSub').textContent = `${t('arrecadadoLabel')} ${eur(c.arrecadado)} − ${t('despesasLabel')} ${eur(c.despTotal)}`;
  $('#cxDinheiro').textContent = eur(c.bolso.dinheiro);
  $('#cxBanco').textContent = eur(c.bolso.banco);
  $('#cxOutros').textContent = eur(c.bolso.outros);
  $('#cxBancoCalc').textContent = eur(c.bolso.banco);
  // conciliação
  const realStr=$('#cxBancoReal').value; const real=parseFloat((realStr||'').replace(/[^\d.,-]/g,'').replace(',','.'));
  const diffEl=$('#cxDiff');
  if(realStr && !isNaN(real)){ const d=real-c.bolso.banco; diffEl.textContent=eur(d)+(Math.abs(d)<0.005?' ✓':''); diffEl.className=Math.abs(d)<0.005?'diff-ok':'diff-bad'; }
  else { diffEl.textContent='—'; diffEl.className=''; }
  renderCaixaTabs(); renderCaixaList(c);
}
function renderCaixaTabs(){
  $$('#cxTabs .tab2').forEach(el=>{ el.classList.toggle('on', el.dataset.cx===caixaState.tab); el.onclick=()=>{ caixaState.tab=el.dataset.cx; renderCaixa(); }; });
}
function renderCaixaList(){
  const el=$('#cxList');
  if(caixaState.tab==='despesas'){
    const arr=caixaState.despesas.slice().sort((a,b)=>(b.data||'').localeCompare(a.data||''));
    if(!arr.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; return; }
    el.innerHTML=arr.map(d=>`<div class="cx-item" data-id="${d.id}" data-k="desp">
      <div><div class="desc">${esc(d.descricao||'—')}</div><div class="meta">${fmtShort(d.data)} · ${esc(BOLSO_LABEL[d.bolso]||d.bolso||'')}${d.categoria?' · '+esc(d.categoria):''}${d.obs?' · '+esc(d.obs):''}${(d.fotos&&d.fotos.length)?' · 📷'+d.fotos.length:''}</div></div>
      <div class="amt out">−${eur(d.valor)}</div></div>`).join('');
    el.querySelectorAll('.cx-item').forEach(it=>it.onclick=()=>openDesp(+it.dataset.id));
  } else {
    const arr=caixaState.movimentos.slice().sort((a,b)=>(b.data||'').localeCompare(a.data||''));
    if(!arr.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; return; }
    el.innerHTML=arr.map(m=>`<div class="cx-item" data-id="${m.id}" data-k="mov">
      <div><div class="desc">${esc(BOLSO_LABEL[m.de]||m.de)} → ${esc(BOLSO_LABEL[m.para]||m.para)}</div><div class="meta">${fmtShort(m.data)}${m.comentario?' · '+esc(m.comentario):''}</div></div>
      <div class="amt mov">${eur(m.valor)}</div></div>`).join('');
    el.querySelectorAll('.cx-item').forEach(it=>it.onclick=()=>openMov(+it.dataset.id));
  }
}
/* --- modal despesa --- */
function openDesp(id){
  const d = id? caixaState.despesas.find(x=>x.id===id) : null;
  caixaState.editDesp = d? d.id : null;
  $('#despTitle').textContent = d? t('editarDespesa') : t('novaDespesa');
  $('#d-desc').value = d? (d.descricao||'') : '';
  $('#d-valor').value = d? d.valor : '';
  $('#d-data').value = d? (d.data||hoje()) : hoje();
  fillSelect('#d-categoria', CATEGORIAS, d? d.categoria : 'Camisas');
  fillSelect('#d-bolso', BOLSOS.map(b=>BOLSO_LABEL[b]), d? BOLSO_LABEL[d.bolso] : 'Banco');
  $('#d-obs').value = d? (d.obs||'') : '';
  caixaState.draftFotos = (d && Array.isArray(d.fotos)) ? d.fotos.map(u=>({url:u})) : [];
  renderDraftFotos();
  $('#despDel').classList.toggle('hidden', !d);
  $('#despModal').classList.remove('hidden');
}
function bolsoFromLabel(lbl){ for(const b of BOLSOS){ if(BOLSO_LABEL[b]===lbl) return b; } return 'banco'; }
/* --- fotos de fatura --- */
function compressImage(file, maxDim, quality){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>{ const img=new Image(); img.onload=()=>{
      let {width:w,height:h}=img; const scale=Math.min(1, maxDim/Math.max(w,h));
      w=Math.round(w*scale); h=Math.round(h*scale);
      const cv=document.createElement('canvas'); cv.width=w; cv.height=h;
      cv.getContext('2d').drawImage(img,0,0,w,h);
      res(cv.toDataURL('image/jpeg', quality));
    }; img.onerror=rej; img.src=fr.result; };
    fr.onerror=rej; fr.readAsDataURL(file);
  });
}
function renderDraftFotos(){
  const el=$('#d-fotos'); if(!el) return;
  el.innerHTML=(caixaState.draftFotos||[]).map((f,idx)=>{
    const src = f.dataUrl || thumbFromUrl(f.url);
    return `<div class="foto-thumb"><img src="${src}" alt="foto" class="foto-open" data-i="${idx}"><button type="button" class="rm" data-i="${idx}">×</button></div>`;
  }).join('');
  el.querySelectorAll('.rm').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation(); caixaState.draftFotos.splice(+b.dataset.i,1); renderDraftFotos(); });
  el.querySelectorAll('.foto-open').forEach(im=>im.onclick=()=>{ const f=caixaState.draftFotos[+im.dataset.i]; openFoto(f); });
  const addBtn=$('#d-addFoto'); if(addBtn) addBtn.style.display=(caixaState.draftFotos.length>=3)?'none':'block';
}
function openFoto(f){
  if(!f) return;
  if(f.url){ window.open(f.url, '_blank'); return; }   // foto já no Drive -> abre em nova aba
  // foto local (ainda não enviada) -> lightbox com o dataUrl
  const lb=$('#fotoLightbox'), img=$('#fotoLightImg');
  if(lb && img){ img.src=f.dataUrl; lb.classList.remove('hidden'); }
}
function thumbFromUrl(url){ if(!url) return ''; const m=url.match(/\/d\/([^/]+)\//); return m? ('https://drive.google.com/thumbnail?id='+m[1]) : url; }
$('#fotoLightClose') && ($('#fotoLightClose').onclick=()=>$('#fotoLightbox').classList.add('hidden'));
$('#fotoLightbox') && ($('#fotoLightbox').addEventListener('click',e=>{ if(e.target.id==='fotoLightbox') $('#fotoLightbox').classList.add('hidden'); }));
$('#d-addFoto') && ($('#d-addFoto').onclick=()=>{ if((caixaState.draftFotos||[]).length>=3){ alert(t('maxFotos')); return; } $('#d-fotoInput').click(); });
$('#d-fotoInput') && ($('#d-fotoInput').onchange=async(e)=>{
  const file=e.target.files && e.target.files[0]; if(!file) return;
  try{ const dataUrl=await compressImage(file, 1280, 0.7); caixaState.draftFotos.push({dataUrl}); renderDraftFotos(); }
  catch(err){ alert('Erro ao processar a foto'); }
  e.target.value='';
});
$('#despSave') && ($('#despSave').onclick=async()=>{
  const desc=$('#d-desc').value.trim(); const v=parseFloat(($('#d-valor').value||'').replace(',','.'));
  if(!desc||!v||v<=0){ alert(t('nomeObrig')); return; }
  // sobe fotos novas (dataUrl) para o Drive -> obtém URLs
  const btn=$('#despSave'); const orig=btn.textContent;
  // valida upload das fotos ANTES de salvar; se alguma falhar, aborta e avisa (não finge que subiu)
  const pendentes=caixaState.draftFotos.filter(f=>!f.url && f.dataUrl);
  if(pendentes.length){
    if(!ONLINE_ENABLED || !auth.idToken || !navigator.onLine){
      alert(t('fotoSemConexao'));   // precisa de internet para enviar a foto
      return;
    }
    btn.disabled=true; btn.textContent=t('enviandoFoto');
    for(const f of pendentes){
      let d=null, err=null;
      try{
        const resp=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
          body:JSON.stringify({token:CFG.SYNC_TOKEN, idToken:auth.idToken, action:'upload', dataUrl:f.dataUrl, filename:'fatura_'+Date.now()+'.jpg'})}, 45000);
        try{ d=await resp.json(); }catch(_){ err='resposta inválida do servidor'; }
      }catch(e){ err=e && e.message ? e.message : 'falha de rede'; }
      if(!d || !d.ok || !d.url){
        btn.disabled=false; btn.textContent=orig;
        alert(t('fotoFalhou') + (err? ('\n('+err+')') : (d && d.error? ('\n('+d.error+')') : '')));
        return;   // ABORTA o salvamento — foto não subiu, não deixa achar que subiu
      }
      f.url=d.url; delete f.dataUrl;   // sucesso confirmado
    }
    btn.disabled=false; btn.textContent=orig;
  }
  const all=caixaState.despesas; let rec=caixaState.editDesp? all.find(x=>x.id===caixaState.editDesp):{};
  rec.descricao=desc; rec.valor=v; rec.data=$('#d-data').value||hoje(); rec.categoria=$('#d-categoria').value;
  rec.bolso=bolsoFromLabel($('#d-bolso').value); rec.obs=$('#d-obs').value.trim();
  rec.fotos=(caixaState.draftFotos||[]).map(f=>f.url).filter(Boolean);
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await sPut(STORE_DESP, rec); markPendingKV('desp', rec.id!=null?rec.id:newId);
  $('#despModal').classList.add('hidden'); await renderCaixa(); if(ONLINE_ENABLED) syncNow();
});
$('#despDel') && ($('#despDel').onclick=async()=>{ if(!caixaState.editDesp) return; if(!confirm(t('confirmDelDesp'))) return; await sDel(STORE_DESP, caixaState.editDesp); markPendingKV('desp_del', caixaState.editDesp); $('#despModal').classList.add('hidden'); await renderCaixa(); if(ONLINE_ENABLED) syncNow(); });
$('#despCancel') && ($('#despCancel').onclick=()=>$('#despModal').classList.add('hidden'));
$('#despBack') && ($('#despBack').onclick=()=>$('#despModal').classList.add('hidden'));
$('#despModal') && $('#despModal').addEventListener('click',e=>{ if(e.target.id==='despModal') $('#despModal').classList.add('hidden'); });
/* --- modal movimentação --- */
function openMov(id){
  const m = id? caixaState.movimentos.find(x=>x.id===id) : null;
  caixaState.editMov = m? m.id : null;
  $('#movTitle').textContent = m? t('editarMovimentacao') : t('novaMovimentacao');
  fillSelect('#m-de', BOLSOS.map(b=>BOLSO_LABEL[b]), m? BOLSO_LABEL[m.de] : 'Dinheiro');
  fillSelect('#m-para', BOLSOS.map(b=>BOLSO_LABEL[b]), m? BOLSO_LABEL[m.para] : 'Banco');
  $('#m-valor').value = m? m.valor : '';
  $('#m-data').value = m? (m.data||hoje()) : hoje();
  $('#m-comentario').value = m? (m.comentario||'') : '';
  $('#movDel').classList.toggle('hidden', !m);
  $('#movModal').classList.remove('hidden');
}
$('#movSave') && ($('#movSave').onclick=async()=>{
  const de=bolsoFromLabel($('#m-de').value), para=bolsoFromLabel($('#m-para').value);
  const v=parseFloat(($('#m-valor').value||'').replace(',','.'));
  if(de===para){ alert('Origem e destino devem ser diferentes.'); return; }
  if(!v||v<=0){ alert(t('nomeObrig')); return; }
  const all=caixaState.movimentos; let rec=caixaState.editMov? all.find(x=>x.id===caixaState.editMov):{};
  rec.de=de; rec.para=para; rec.valor=v; rec.data=$('#m-data').value||hoje(); rec.comentario=$('#m-comentario').value.trim();
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await sPut(STORE_MOV, rec); markPendingKV('mov', rec.id!=null?rec.id:newId);
  $('#movModal').classList.add('hidden'); await renderCaixa(); if(ONLINE_ENABLED) syncNow();
});
$('#movDel') && ($('#movDel').onclick=async()=>{ if(!caixaState.editMov) return; if(!confirm(t('confirmDelMov'))) return; await sDel(STORE_MOV, caixaState.editMov); markPendingKV('mov_del', caixaState.editMov); $('#movModal').classList.add('hidden'); await renderCaixa(); if(ONLINE_ENABLED) syncNow(); });
$('#movCancel') && ($('#movCancel').onclick=()=>$('#movModal').classList.add('hidden'));
$('#movBack') && ($('#movBack').onclick=()=>$('#movModal').classList.add('hidden'));
$('#movModal') && $('#movModal').addEventListener('click',e=>{ if(e.target.id==='movModal') $('#movModal').classList.add('hidden'); });
$('#fabCaixa') && ($('#fabCaixa').onclick=()=>{ caixaState.tab==='despesas'? openDesp(null) : openMov(null); });
$('#cxBancoReal') && ($('#cxBancoReal').oninput=()=>renderCaixa());
// marcador de pendência para sync das novas coleções (chave composta)
function markPendingKV(kind,id){ const p=JSON.parse(localStorage.getItem('gd_pending_cx')||'{}'); p[kind+':'+id]=1; localStorage.setItem('gd_pending_cx',JSON.stringify(p)); }

/* --- Extrato por bolso --- */
async function openExtrato(bolso){
  const inscritos=await getAll();
  const lanc=[]; // {data, tipo, desc, valor(sinal), kind, refId}
  // entradas (pagamentos que caem neste bolso)
  inscritos.forEach(i=>(i.pagamentos||[]).forEach((p,idx)=>{
    if(bolsoDaForma(p.tipo)!==bolso) return;
    lanc.push({ data:p.data||'', tipo:t('entrada'), desc:`${t('pagamentoDe')} — ${i.nome}${p.tipo==='Outros'&&p.nota?' ('+p.nota+')':''}`, valor:(+p.valor||0), kind:'pag' });
  }));
  // despesas pagas deste bolso
  caixaState.despesas.forEach(d=>{ if((d.bolso||'banco')!==bolso) return; lanc.push({ data:d.data||'', tipo:t('despesa'), desc:d.descricao||'—', valor:-(+d.valor||0), kind:'desp', refId:d.id }); });
  // movimentações que afetam este bolso
  caixaState.movimentos.forEach(m=>{
    if(m.para===bolso) lanc.push({ data:m.data||'', tipo:t('movimentacao'), desc:`${BOLSO_LABEL[m.de]} → ${BOLSO_LABEL[m.para]}${m.comentario?' · '+m.comentario:''}`, valor:(+m.valor||0), kind:'mov', refId:m.id });
    if(m.de===bolso) lanc.push({ data:m.data||'', tipo:t('movimentacao'), desc:`${BOLSO_LABEL[m.de]} → ${BOLSO_LABEL[m.para]}${m.comentario?' · '+m.comentario:''}`, valor:-(+m.valor||0), kind:'mov', refId:m.id });
  });
  // ordena CRONOLOGICO crescente para calcular saldo corrente
  lanc.sort((a,b)=>toISODate(a.data).localeCompare(toISODate(b.data)));
  let bal=0; lanc.forEach(l=>{ bal+=l.valor; l.bal=bal; });
  const saldoFinal=bal;
  // exibe recente no topo
  lanc.reverse();
  $('#extTitle').textContent=`${t('extrato')} · ${BOLSO_LABEL[bolso]}`;
  $('#extSaldo').textContent=eur(saldoFinal);
  const el=$('#extList');
  if(!lanc.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; }
  else el.innerHTML=lanc.map(l=>{
    const pos=l.valor>=0; const clk=(l.kind==='desp'||l.kind==='mov');
    return `<div class="ext-item ${clk?'clickable':''}" ${clk?`data-kind="${l.kind}" data-id="${l.refId}"`:''}>
      <div><div class="e-d"><span class="ext-tag">${l.tipo}</span>${esc(l.desc)}</div><div class="e-m">${fmtShort(l.data)}</div></div>
      <div class="e-right"><div class="e-v ${pos?'pos':'neg'}">${pos?'+':'−'}${eur(Math.abs(l.valor))}</div><div class="e-bal">${eur(l.bal)}</div></div>
    </div>`;
  }).join('');
  el.querySelectorAll('.ext-item.clickable').forEach(it=>it.onclick=()=>{
    const kind=it.dataset.kind, id=+it.dataset.id;
    $('#extratoModal').classList.add('hidden');
    if(kind==='desp') openDesp(id); else if(kind==='mov') openMov(id);
  });
  $('#extratoModal').classList.remove('hidden');
  const sh=$('#extratoModal .sheet'); if(sh) sh.scrollTop=0;
}
document.addEventListener('click',(e)=>{
  const b=e.target.closest && e.target.closest('#view-caixa .bolso');
  if(b && b.dataset.bolso && state.view==='caixa'){ openExtrato(b.dataset.bolso); }
});
$('#extBack') && ($('#extBack').onclick=()=>$('#extratoModal').classList.add('hidden'));
$('#extratoModal') && $('#extratoModal').addEventListener('click',e=>{ if(e.target.id==='extratoModal') $('#extratoModal').classList.add('hidden'); });

function doSetView(v){
  // guarda a posição de scroll da tab atual
  if(state.view){ state.scrollPos = state.scrollPos||{}; state.scrollPos[state.view]=window.scrollY; }
  state.view=v;
  ['lista','painel','confeccao','caixa','acessos','mais'].forEach(x=>$('#view-'+x).classList.toggle('hidden',x!==v));
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  $('#fab').classList.toggle('hidden', v!=='lista');
  const fc=$('#fabCaixa'); if(fc) fc.classList.toggle('hidden', v!=='caixa');
  if(v==='painel') renderPainel();
  if(v==='confeccao') renderConfeccao();
  if(v==='caixa') renderCaixa();
  if(v==='acessos') loadUsers();
  updateSaveBtn();
  // restaura a posição de scroll específica desta tab
  const y=(state.scrollPos&&state.scrollPos[v])||0;
  requestAnimationFrame(()=>window.scrollTo(0,y));
}
let pendingView=null;
function setView(v){
  // proteger alterações não salvas ao sair da Confecção
  if(state.view==='confeccao' && v!=='confeccao' && dirtyCount()>0){
    pendingView=v;
    $('#confirmModal').classList.remove('hidden');
    return;
  }
  doSetView(v);
}
function resolvePending(){
  if(!pendingView) return;
  const pv=pendingView; pendingView=null;
  if(pv.startsWith('__editFromConf__')){ const id=+pv.replace('__editFromConf__',''); doSetView('lista'); openModal(id); }
  else doSetView(pv);
}
$('#confirmSave').onclick=async()=>{ $('#confirmModal').classList.add('hidden'); await saveConf(); resolvePending(); };
$('#confirmDiscard').onclick=()=>{ $('#confirmModal').classList.add('hidden'); state.confDirty={}; updateSaveBtn(); resolvePending(); };
$('#confirmCancel').onclick=()=>{ $('#confirmModal').classList.add('hidden'); pendingView=null; };
$('#btnSaveConf').onclick=saveConf;
$$('nav button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('#fab').onclick=()=>openModal(null);
$('#q').oninput=e=>{ state.q=e.target.value; $('#qClear').classList.toggle('hidden', !e.target.value); renderList(); };
$('#qClear') && ($('#qClear').onclick=()=>{ const q=$('#q'); q.value=''; state.q=''; $('#qClear').classList.add('hidden'); renderList(); q.focus(); });

// view mode toggle (cards / table)
function applyViewMode(){
  $$('#viewtoggle button').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.viewMode));
}
$$('#viewtoggle button').forEach(b=>b.onclick=()=>{
  state.viewMode=b.dataset.mode; localStorage.setItem('viewMode',state.viewMode);
  applyViewMode(); renderList();
});

function applyLang(){
  document.documentElement.lang=lang;
  $$('[data-i]').forEach(el=>el.textContent=t(el.dataset.i));
  $$('[data-i-ph]').forEach(el=>el.placeholder=t(el.dataset.iPh));
  $('#q').placeholder=t('buscar');
  $$('.lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  renderFilters();
}
$$('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();refresh();});

async function refresh(){
  const all=await getAll();
  $('#metaSub').textContent=t('metaSub',{n:all.length});
  if(state.view==='lista') await renderList();
  else if(state.view==='painel') await renderPainel();
  else if(state.view==='confeccao') await renderConfeccao();
}

/* ---------- atualização (via version.json — confiável) ---------- */
let bannerShown=false;
function showUpdateBanner(){
  if(bannerShown) return;
  bannerShown=true;
  const b=$('#updateBanner');
  $('#updateMsg').textContent=t('novaVersao');
  $('#updateBtn').textContent=t('atualizar');
  b.classList.remove('hidden');
  $('#updateBtn').onclick=async()=>{
    $('#updateBtn').disabled=true;
    $('#updateBtn').textContent=t('atualizando');
    try{
      // limpa caches e atualiza o service worker para garantir código novo
      if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); }
      if('serviceWorker' in navigator){ const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.update().catch(()=>{}))); }
    }catch(e){}
    // recarrega forçando rede
    setTimeout(()=>{ location.reload(); }, 300);
  };
}
async function checkVersion(){
  try{
    const r=await fetchTimeout('version.json?ts='+Date.now(), {cache:'no-store'}, 8000);
    if(!r.ok) return;
    const data=await r.json();
    if(data && data.version && data.version!==APP_VERSION){ showUpdateBanner(); }
  }catch(e){ /* offline: ignora */ }
}
async function registerSWWithUpdate(){
  try{ await navigator.serviceWorker.register('sw.js'); }catch(e){}
  // detecção de versão por polling do version.json (independe do timing do SW)
  checkVersion();
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) checkVersion(); });
  setInterval(checkVersion, 30*60*1000);
}

/* ---------- v2: config, login Google (GIS) e sincronização ---------- */
/* ---------- v2: config, login Google (GIS) e sincronização ---------- */
const CFG = window.GIDEAO_CONFIG || {};
const ONLINE_ENABLED = !!(CFG.SHEET_WEBAPP_URL && CFG.GOOGLE_CLIENT_ID);
let auth = { idToken:null, email:null, role:null };

function parseJwt(tok){ try{ return JSON.parse(atob(tok.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return {}; } }

function onGoogleCredential(resp){
  const jwt = resp && resp.credential;
  if(!jwt) return;
  const claims = parseJwt(jwt);
  const email = (claims.email||'').toLowerCase();
  const allowed = (CFG.ALLOWED_EMAILS||[]).map(e=>e.toLowerCase());
  if(allowed.length && allowed.indexOf(email)<0){
    const el=$('#loginError'); el.textContent=t('naoAutorizado'); el.classList.remove('hidden');
    try{ google.accounts.id.disableAutoSelect(); }catch(e){}
    return;
  }
  auth.idToken = jwt; auth.email = email;
  sessionStorage.setItem('gd_idtoken', jwt);
  sessionStorage.setItem('gd_email', email);
  hideLoginGate();
  startAppAfterLogin();
}
function isBetaEnv(){ return location.pathname.indexOf('/beta/')>=0 || location.pathname.indexOf('/beta')>=0; }
function applyEnvBadges(){
  // versão na tela de login
  const lv=$('#loginVer'); if(lv) lv.textContent = APP_VERSION;
  // selo BETA no header (só no ambiente beta)
  const bb=$('#betaBadge'); if(bb) bb.classList.toggle('hidden', !isBetaEnv());
}
function initGoogleLogin(){
  applyEnvBadges();
  if(!ONLINE_ENABLED){ hideLoginGate(); startAppAfterLogin(); return; }
  // se já temos token de sessão válido, tenta usar (será revalidado no 1º sync)
  const saved = sessionStorage.getItem('gd_idtoken');
  const savedEmail = sessionStorage.getItem('gd_email');
  if(saved && savedEmail){
    const c=parseJwt(saved);
    if(c.exp && c.exp*1000 > Date.now()+60000){ auth.idToken=saved; auth.email=savedEmail; hideLoginGate(); startAppAfterLogin(); return; }
  }
  showLoginGate();
  const tryInit=()=>{
    if(!(window.google && google.accounts && google.accounts.id)){ return setTimeout(tryInit,200); }
    google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: onGoogleCredential });
    google.accounts.id.renderButton($('#gsiBtn'), { theme:'filled_black', size:'large', shape:'pill', text:'signin_with' });
    google.accounts.id.prompt();
  };
  tryInit();
}
function showLoginGate(){ $('#loginGate').classList.remove('hidden'); }
function hideLoginGate(){ $('#loginGate').classList.add('hidden'); }
function applyAdminUI(){
  // admin = papel vindo do servidor (aba Admin da planilha); fallback: config.js ADMIN_EMAILS
  let isAdmin;
  if(auth.role){ isAdmin = (auth.role==='admin'); }
  else { isAdmin = (CFG.ADMIN_EMAILS||[]).map(e=>e.toLowerCase()).indexOf((auth.email||'').toLowerCase())>=0; }
  const adminEl=$('#adminSection'); if(adminEl) adminEl.classList.toggle('hidden', !isAdmin);
  const navC=$('#navCaixa'); if(navC) navC.classList.toggle('hidden', !isAdmin);
  const navA=$('#navAcessos'); if(navA) navA.classList.toggle('hidden', !isAdmin);
  if(isAdmin) loadUsers();
}

/* ---------- Acessos: gestao de usuarios (so admin) ---------- */
let accessUsers=[];          // cache da ultima lista
let accEditing=null;         // email em edicao (null = novo)

async function usersApi(action, extra){
  const body=Object.assign({token:CFG.SYNC_TOKEN, idToken:auth.idToken, action:action}, extra||{});
  const r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
  const data=await r.json();
  if(!data.ok) throw new Error(data.error||'admin_failed');
  return data;
}
function renderAccess(){
  const box=$('#accessGroups'); if(!box) return;
  const admins=accessUsers.filter(u=>u.role==='admin');
  const users =accessUsers.filter(u=>u.role!=='admin');
  const group=(title,arr)=>{
    if(!arr.length) return '';
    const rows=arr.map(u=>`<div class="access-row" data-email="${esc(u.email)}">
      <div class="who">
        ${u.nome?`<div class="nm">${esc(u.nome)}</div>`:''}
        <div class="em">${esc(u.email)}</div>
      </div>
      <button class="edit-btn" aria-label="${t('editar')}" title="${t('editar')}">
        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </button>
    </div>`).join('');
    return `<div class="access-group">
      <p class="access-group-title">${title} (${arr.length})</p>
      <div class="access-card">${rows}</div>
    </div>`;
  };
  box.innerHTML = group(t('grupoAdmins'),admins) + group(t('grupoUsers'),users);
  box.querySelectorAll('.access-row .edit-btn').forEach(b=>b.onclick=()=>{
    const email=b.closest('.access-row').dataset.email;
    openAccessModal(accessUsers.find(u=>u.email===email)||null);
  });
}
async function loadUsers(){
  if(!ONLINE_ENABLED||!auth.idToken) return;
  try{ const d=await usersApi('listUsers'); accessUsers=d.users||[]; renderAccess(); }
  catch(e){ /* silencioso: mantem lista anterior */ }
}
function accSetError(code){
  const el=$('#accError'); if(!el) return;
  if(!code){ el.classList.add('hidden'); el.textContent=''; return; }
  const m={already_exists:'errJaExiste',invalid_email:'errEmailInvalido',last_admin:'errUltimoAdmin'}[code]||'errUserFalhou';
  el.textContent=t(m); el.classList.remove('hidden');
}
function openAccessModal(u){
  accEditing = u ? u.email : null;
  accSetError(null);
  $('#accTitle').textContent = u ? t('editarUsuario') : t('novoUsuario');
  const em=$('#acc-email'); em.value = u ? u.email : ''; em.disabled = !!u;   // email read-only ao editar
  $('#acc-nome').value = u ? (u.nome||'') : '';
  $('#acc-role').value = u ? u.role : 'user';
  $('#accDel').classList.toggle('hidden', !u);   // Remover so ao editar
  $('#accSave').textContent = u ? t('salvar') : t('adicionar');
  $('#accessModal').classList.remove('hidden');
}
function closeAccessModal(){ $('#accessModal').classList.add('hidden'); accEditing=null; }
async function accSave(){
  const email=(accEditing || ($('#acc-email').value||'').trim().toLowerCase());
  const nome=($('#acc-nome').value||'').trim();
  const role=$('#acc-role').value||'user';
  if(!email || email.indexOf('@')<0){ accSetError('invalid_email'); return; }
  const action = accEditing ? 'setRole' : 'addUser';
  try{
    const d=await usersApi(action,{email:email, role:role, nome:nome});
    accessUsers=d.users||accessUsers; renderAccess(); closeAccessModal();
  }catch(e){ accSetError(String(e.message)); }
}
async function accRemove(){
  if(!accEditing) return;
  if(!confirm(t('confirmRemoverUser',{e:accEditing}))) return;
  try{
    const d=await usersApi('removeUser',{email:accEditing});
    accessUsers=d.users||accessUsers; renderAccess(); closeAccessModal();
  }catch(e){ accSetError(String(e.message)); }
}

function logout(){
  sessionStorage.removeItem('gd_idtoken'); sessionStorage.removeItem('gd_email');
  auth={idToken:null,email:null};
  try{ google.accounts.id.disableAutoSelect(); }catch(e){}
  location.reload();
}

/* ----- sync ----- */
let syncState='off';
let syncStartedAt=0;
function setSync(s){
  syncState=s;
  const el=$('#syncStatus'); if(!el) return;
  el.className=''; 
  const map={ok:['ok','syncOk'],pend:['pend','syncPend'],off:['off','syncOff'],err:['err','syncErr'],syncing:['pend','syncing']};
  const m=map[s]||map.off; el.classList.add(m[0]); el.textContent=t(m[1]);
}
function markPending(id){
  const p=JSON.parse(localStorage.getItem('gd_pending')||'{}'); p[id]=1;
  localStorage.setItem('gd_pending', JSON.stringify(p));
}
function pendingIds(){ return Object.keys(JSON.parse(localStorage.getItem('gd_pending')||'{}')); }
function clearPending(){ localStorage.removeItem('gd_pending'); }

// fetch com timeout — evita ficar preso em "Sincronizando" se a rede/Apps Script travar
async function fetchTimeout(url, opts, ms){
  ms = ms || 20000;
  const ctrl = new AbortController();
  const timer = setTimeout(()=>ctrl.abort(), ms);
  try{
    const r = await fetch(url, Object.assign({}, opts, {signal: ctrl.signal, redirect:'follow'}));
    return r;
  } finally { clearTimeout(timer); }
}

async function pull(){
  if(!ONLINE_ENABLED || !auth.idToken) return;
  const url = CFG.SHEET_WEBAPP_URL + '?action=pull&token=' + encodeURIComponent(CFG.SYNC_TOKEN) +
              '&idToken=' + encodeURIComponent(auth.idToken);
  const r = await fetchTimeout(url, {method:'GET'});
  const data = await r.json();
  if(!data.ok) throw new Error(data.error||'pull_failed');
  if(data.role){ auth.role=data.role; applyAdminUI(); }
  // reconcilia: servidor como verdade (só a pastora escreve); preserva pendentes locais não enviados
  const pend = pendingIds();
  const localAll = await getAll();
  const localById = {}; localAll.forEach(i=>localById[i.id]=i);
  await clearAll();
  let maxId=0;
  for(const s of data.inscritos){
    // se há alteração local pendente para esse id, mantém a local (será enviada no push)
    if(pend.indexOf(String(s.id))>=0 && localById[s.id]){ await put(localById[s.id]); }
    else { await put(s); }
    if(s.id>maxId) maxId=s.id;
  }
  // registros locais novos (criados offline) que ainda não estão no servidor
  for(const i of localAll){ if(!data.inscritos.find(s=>s.id===i.id)){ await put(i); } }
  // ---- coleções financeiras (despesas/movimentos) ----
  const pcx=JSON.parse(localStorage.getItem('gd_pending_cx')||'{}');
  const pendKeys=Object.keys(pcx);
  await reconcileColl(STORE_DESP, data.despesas||[], 'desp', pendKeys);
  await reconcileColl(STORE_MOV, data.movimentos||[], 'mov', pendKeys);
  return data;
}
async function reconcileColl(store, serverArr, kind, pendKeys){
  const local=await sGetAll(store);
  const localById={}; local.forEach(x=>localById[x.id]=x);
  const pendIds=pendKeys.filter(k=>k.indexOf(kind+':')===0).map(k=>+k.split(':')[1]);
  const delIds=pendKeys.filter(k=>k.indexOf(kind+'_del:')===0).map(k=>+k.split(':')[1]);
  await sClear(store);
  for(const s of serverArr){
    if(delIds.indexOf(s.id)>=0) continue;                 // apagado localmente (aguarda push do delete)
    if(pendIds.indexOf(s.id)>=0 && localById[s.id]) await sPut(store, localById[s.id]); // edição local pendente
    else await sPut(store, s);
  }
  // itens locais criados offline ainda não no servidor
  for(const l of local){ if(!serverArr.find(s=>s.id===l.id) && delIds.indexOf(l.id)<0) await sPut(store, l); }
}
async function pushPending(){
  if(!ONLINE_ENABLED || !auth.idToken) return;
  const ids=pendingIds();
  const pcx=JSON.parse(localStorage.getItem('gd_pending_cx')||'{}');
  const cxKeys=Object.keys(pcx);
  if(!ids.length && !cxKeys.length) return;
  const payload={token:CFG.SYNC_TOKEN, idToken:auth.idToken};
  // inscritos pendentes
  if(ids.length){ const all=await getAll(); payload.inscritos=all.filter(i=>ids.indexOf(String(i.id))>=0); }
  // despesas/movimentos pendentes + deleções
  const despAll=await sGetAll(STORE_DESP), movAll=await sGetAll(STORE_MOV);
  const despIds=cxKeys.filter(k=>k.indexOf('desp:')===0).map(k=>+k.split(':')[1]);
  const despDel=cxKeys.filter(k=>k.indexOf('desp_del:')===0).map(k=>+k.split(':')[1]);
  const movIds=cxKeys.filter(k=>k.indexOf('mov:')===0).map(k=>+k.split(':')[1]);
  const movDel=cxKeys.filter(k=>k.indexOf('mov_del:')===0).map(k=>+k.split(':')[1]);
  if(despIds.length) payload.despesas=despAll.filter(d=>despIds.indexOf(d.id)>=0);
  if(despDel.length) payload.despesasDel=despDel;
  if(movIds.length) payload.movimentos=movAll.filter(m=>movIds.indexOf(m.id)>=0);
  if(movDel.length) payload.movimentosDel=movDel;
  const r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload)});
  const data=await r.json();
  if(!data.ok) throw new Error(data.error||'push_failed');
  clearPending();
  localStorage.removeItem('gd_pending_cx');
  return data;
}
async function serverCount(){
  const url = CFG.SHEET_WEBAPP_URL + '?action=pull&token=' + encodeURIComponent(CFG.SYNC_TOKEN) +
              '&idToken=' + encodeURIComponent(auth.idToken);
  const r = await fetchTimeout(url, {method:'GET'});
  const data = await r.json();
  if(!data.ok) throw new Error(data.error||'pull_failed');
  return data.inscritos ? data.inscritos.length : 0;
}
async function pushAll(records){
  if(!records.length) return;
  // envia em lotes para não estourar limites
  for(let k=0;k<records.length;k+=40){
    const chunk=records.slice(k,k+40);
    const r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify({token:CFG.SYNC_TOKEN, idToken:auth.idToken, inscritos:chunk})});
    const data=await r.json();
    if(!data.ok) throw new Error(data.error||'push_failed');
  }
}
async function syncNow(){
  if(!ONLINE_ENABLED){ setSync('off'); return; }
  if(!navigator.onLine){ setSync('off'); scheduleRetry(); return; }
  if(syncState==='syncing'){
    // proteção: se ficou "syncing" há muito tempo (>40s), destrava e permite nova tentativa
    if(syncStartedAt && (Date.now()-syncStartedAt) > 40000){ syncState='off'; }
    else return;
  }
  syncStartedAt = Date.now();
  // watchdog: se por algum motivo travar, força erro e destrava depois de 35s
  let done=false;
  const watchdog = setTimeout(()=>{ if(!done){ setSync('err'); scheduleRetry(); } }, 35000);
  try{
    setSync('syncing');
    // envia pendências primeiro (se houver)
    await pushPending();
    // 1 pull: reconcilia e descobre se o servidor está vazio
    const data = await pull();
    // primeira vez: servidor vazio -> sobe a base completa (local atual ou seed.json)
    if(data && (!data.inscritos || data.inscritos.length===0)){
      let base = await getAll();
      if(base.length===0){
        try{ const seed=await (await fetch('seed.json')).json();
          base = seed.inscritos.map(i=>({...i, cota:i.cota||COTA, camisaEstado:(i.camisaEstado===undefined?0:i.camisaEstado)})); }catch(e){ base=[]; }
        for(const i of base){ await put(i); }
      }
      if(base.length){ await pushAll(base); clearPending(); await pull(); }
    }
    setSync(pendingIds().length? 'pend':'ok');
    retryDelay=0;                       // sucesso -> zera backoff
    await refresh();
    // garante o re-render da lista (mesmo caminho de quando se clica num filtro)
    if(state.view==='lista'){ renderFilters(); await renderList(); }
  }catch(e){
    if(String(e.message)==='unauthorized'){ showLoginGate(); setSync('err'); }
    else { setSync('err'); scheduleRetry(); }   // falha de rede/servidor/db -> re-tenta sozinho
  }finally{
    done=true; clearTimeout(watchdog); syncStartedAt=0;
    if(syncState==='syncing') setSync('err');   // salvaguarda: nunca deixa preso em syncing
  }
}
/* retentativa automática com backoff (5s,15s,30s,60s...) até sincronizar — usuário nunca precisa agir */
let retryDelay=0, retryTimer=null;
function scheduleRetry(){
  if(!ONLINE_ENABLED) return;
  if(retryTimer) return;               // já há uma retentativa agendada
  const steps=[5000,15000,30000,60000,120000];
  const delay=steps[Math.min(retryDelay, steps.length-1)]; retryDelay++;
  retryTimer=setTimeout(()=>{ retryTimer=null; if(navigator.onLine) syncNow(); else setSync('off'); }, delay);
}
/* sincronização periódica leve enquanto o app está aberto e online (near-real-time) */
let periodicTimer=null;
function startPeriodicSync(){
  if(periodicTimer) return;
  periodicTimer=setInterval(()=>{ if(navigator.onLine && document.visibilityState==='visible' && syncState!=='syncing') syncNow(); }, 3*60*1000);
}

/* ---------- boot ---------- */
let appStarted=false;
async function startAppAfterLogin(){
  if(appStarted){ if(ONLINE_ENABLED) syncNow(); return; }
  appStarted=true;
  await openDB();
  if(!ONLINE_ENABLED){ await seedIfEmpty(); }  // offline puro (v1): usa seed local. Online: servidor é a fonte (pull).
  await migrate();
  applyLang();
  applyViewMode();
  const vEl=$('#appVersion'); if(vEl) vEl.textContent=APP_VERSION;
  const avEl=$('#acctVersion'); if(avEl) avEl.textContent=APP_VERSION;
  const emEl=$('#acctEmail'); if(emEl) emEl.textContent=auth.email||'—';
  applyAdminUI();
  setView('lista');
  refresh();
  if('serviceWorker' in navigator){ try{ await registerSWWithUpdate(); }catch(e){} }
  if(ONLINE_ENABLED){
    setSync('off');
    syncNow();
    window.addEventListener('online', ()=>{ retryDelay=0; syncNow(); });
    window.addEventListener('offline', ()=>setSync('off'));
    document.addEventListener('visibilitychange',()=>{ if(!document.hidden) syncNow(); });
    startPeriodicSync();
  } else { setSync('off'); }
}
$('#btnLogout') && ($('#btnLogout').onclick=logout);
$('#btnSyncNow') && ($('#btnSyncNow').onclick=syncNow);
$('#btnPushAll') && ($('#btnPushAll').onclick=async()=>{
  if(!ONLINE_ENABLED||!auth.idToken){ return; }
  try{ setSync('syncing'); const all=await getAll(); await pushAll(all); clearPending(); await pull(); setSync('ok'); refresh(); alert('OK'); }
  catch(e){ setSync('err'); alert('Erro: '+e.message); }
});
$('#btnReloadBase') && ($('#btnReloadBase').onclick=async()=>{
  if(!confirm(t('confirmRecarregar'))) return;
  try{
    setSync('syncing');
    // 1) carrega os 70 originais do seed.json
    const seed=await (await fetch('seed.json?ts='+Date.now())).json();
    const base=seed.inscritos.map(i=>({...i, cota:i.cota||COTA, camisaEstado:(i.camisaEstado===undefined?0:i.camisaEstado), datas:i.datas||{}}));
    // 2) zera base local e repovoa
    await clearAll(); clearPending();
    for(const i of base){ await put(i); }
    // 3) zera a planilha (reset) e sobe os 70 em lote
    if(ONLINE_ENABLED && auth.idToken){
      const first=base.slice(0,40), rest=base.slice(40);
      let r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({token:CFG.SYNC_TOKEN, idToken:auth.idToken, reset:true, inscritos:first})}, 30000);
      let data=await r.json(); if(!data.ok) throw new Error(data.error||'reset_failed');
      if(rest.length) await pushAll(rest);
      await pull();
    }
    setSync('ok'); refresh(); alert('OK — base recarregada ('+base.length+')');
  }catch(e){ setSync('err'); alert('Erro: '+e.message); }
});
$('#btnAddAccess') && ($('#btnAddAccess').onclick=()=>openAccessModal(null));
$('#accSave') && ($('#accSave').onclick=accSave);
$('#accDel') && ($('#accDel').onclick=accRemove);
$('#accCancel') && ($('#accCancel').onclick=closeAccessModal);
$('#accBack') && ($('#accBack').onclick=closeAccessModal);

(function(){ initGoogleLogin(); })();
