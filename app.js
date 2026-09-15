/* Projeto Gideão 300 — app offline (IndexedDB) */
'use strict';

const COTA = 300;
const META = 300;
const APP_VERSION = 'v1.27';
const TAMANHOS = ['XS','S','S/M','M','L','XL','XXL','2XL','3XL',''];
const TIPOS = ['Dinheiro','Cartão/Máquina','Bizum','Cartão AME','Pix','Outro'];
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
    addPagamento:'+ Pagamento', camisaPronta:'Camisa pronta', camisaEntregue:'Camisa entregue',
    aRevisar:'A revisar', observacoes:'Observações', textoOriginal:'Texto original',
    salvar:'Salvar', excluir:'Excluir', cancelar:'Cancelar',
    porTamanho:'Por tamanho (para a gráfica)', financeiro:'Financeiro',
    dadosBackup:'Dados e backup', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Baixar backup (JSON)',
    restaurarBackup:'Restaurar backup (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'O backup permite passar os dados entre os líderes (WhatsApp, Drive). Importar substitui os dados atuais.',
    zerar:'Apagar tudo e recarregar dados iniciais',
    fPago:'Pagos', fParcial:'Parciais', fPend:'Pendentes', fEntregue:'A entregar', fRevisar:'A revisar', fTodos:'Todos',
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
    avancar:'Tocar para avançar', porTamanhoConf:'Resumo por tamanho', totalConf:'Total',
    verConfeccao:'Abrir na Confecção',
    pendPag:'Pendente pagamento', pago:'Pago', alteracoesSalvas:'Alterações salvas',
    semAlteracoes:'Sem alterações', confirmSairConf:'Há alterações não salvas. Sair mesmo assim?',
    projeto:'Projeto Gideão', alteracoesNaoSalvas:'Alterações não salvas',
    confirmSairMsg:'Você alterou o estado de algumas camisas mas ainda não salvou. O que deseja fazer?',
    salvarESair:'Salvar e sair', descartarSair:'Descartar alterações', continuarEditando:'Continuar editando', de:'de',
    confirmSairForm:'Você alterou os dados deste Gideão mas ainda não salvou. O que deseja fazer?',
    editarData:'Editar data',
    estAbbr1:'Conf.', estAbbr2:'Pronta', estAbbr3:'Entreg.',
    novaVersao:'Nova versão disponível', atualizar:'Atualizar', atualizando:'Atualizando…'
  },
  es:{
    appTitle:'Proyecto Gedeón 300', buscar:'Buscar por nombre...',
    navLista:'Gedeones', navPainel:'Panel', navMais:'Más',
    novoInscrito:'Nuevo inscrito', editarInscrito:'Editar inscrito',
    numero:'Número', tamanho:'Talla', nome:'Nombre', telefone:'Teléfono',
    pagamentos:'Pagos (cuota 300€)', valor:'Importe (€)', tipo:'Tipo', data:'Fecha',
    addPagamento:'+ Pago', camisaPronta:'Camiseta lista', camisaEntregue:'Camiseta entregada',
    aRevisar:'Por revisar', observacoes:'Observaciones', textoOriginal:'Texto original',
    salvar:'Guardar', excluir:'Eliminar', cancelar:'Cancelar',
    porTamanho:'Por talla (para la imprenta)', financeiro:'Finanzas',
    dadosBackup:'Datos y copia', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Descargar copia (JSON)',
    restaurarBackup:'Restaurar copia (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'La copia permite pasar los datos entre los líderes (WhatsApp, Drive). Importar reemplaza los datos actuales.',
    zerar:'Borrar todo y recargar datos iniciales',
    fPago:'Pagados', fParcial:'Parciales', fPend:'Pendientes', fEntregue:'Por entregar', fRevisar:'Por revisar', fTodos:'Todos',
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
    avancar:'Toca para avanzar', porTamanhoConf:'Resumen por talla', totalConf:'Total',
    verConfeccao:'Abrir en Confección',
    pendPag:'Pago pendiente', pago:'Pagado', alteracoesSalvas:'Cambios guardados',
    semAlteracoes:'Sin cambios', confirmSairConf:'Hay cambios sin guardar. ¿Salir de todos modos?',
    projeto:'Proyecto Gedeón', alteracoesNaoSalvas:'Cambios sin guardar',
    confirmSairMsg:'Has cambiado el estado de algunas camisetas pero aún no lo has guardado. ¿Qué deseas hacer?',
    salvarESair:'Guardar y salir', descartarSair:'Descartar cambios', continuarEditando:'Seguir editando', de:'de',
    confirmSairForm:'Has cambiado los datos de este Gedeón pero aún no lo has guardado. ¿Qué deseas hacer?',
    editarData:'Editar fecha',
    estAbbr1:'Conf.', estAbbr2:'Lista', estAbbr3:'Entreg.',
    novaVersao:'Nueva versión disponible', atualizar:'Actualizar', atualizando:'Actualizando…'
  }
};
let lang = localStorage.getItem('lang') || 'pt';
const t = (k,vars) => { let s=(I18N[lang][k]||k); if(vars) for(const p in vars) s=s.replace('{'+p+'}',vars[p]); return s; };

/* ---------- IndexedDB ---------- */
const DB_NAME='gideao300', STORE='inscritos';
let db;
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=e=>{ const d=e.target.result; if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE,{keyPath:'id',autoIncrement:true}); };
    r.onsuccess=e=>{db=e.target.result;res();};
    r.onerror=e=>rej(e);
  });
}
function tx(mode){ return db.transaction(STORE,mode).objectStore(STORE); }
function getAll(){ return new Promise(res=>{ const r=tx('readonly').getAll(); r.onsuccess=()=>res(r.result||[]); }); }
function put(rec){ return new Promise(res=>{ const r=tx('readwrite').put(rec); r.onsuccess=()=>res(r.result); }); }
function del(id){ return new Promise(res=>{ const r=tx('readwrite').delete(id); r.onsuccess=()=>res(); }); }
function clearAll(){ return new Promise(res=>{ const r=tx('readwrite').clear(); r.onsuccess=()=>res(); }); }

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
function hoje(){ const d=new Date(); const off=d.getTimezoneOffset(); const l=new Date(d.getTime()-off*60000); return l.toISOString().slice(0,10); }
// remove acentos/diacríticos para busca (é->e, ã->a, ç->c, ñ->n...)
function norm(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
// ordem por número: '' ou NaN vão para o fim; 0 ('00') fica no início (corrige 0||9999)
function numOrder(v){ const n=parseInt(v); return isNaN(n)?9999:n; }

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
    if(st==='pago') right.push(`<span class="b pago">${t('fPago')}</span>`);
    else if(st==='parcial') right.push(`<span class="b parcial">${t('faltam',{v:falta})}</span>`);
    else right.push(`<span class="b pend">${t('fPend')}</span>`);
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
      <div class="num">${i.numero||t('semNumero')}</div>
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
    const stTxt=st==='pago'?t('fPago'):st==='parcial'?t('faltam',{v:falta}):t('fPend');
    const stClass=st==='pago'?'st-pago':st==='parcial'?'st-parcial':'st-pend';
    return `<tr data-id="${i.id}">
      <td>${i.numero||t('semNumero')}</td>
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
const CONF_FILTERS=[['todos','fTodos'],['0','cAfazer'],['1','cEmConf'],['2','cPronta'],['3','cEntregue']];
function renderConfFilters(){
  $('#confFilters').innerHTML=CONF_FILTERS.map(([k,l])=>`<div class="chip ${state.confFilter===k?'active':''}" data-f="${k}">${t(l)}</div>`).join('');
  $$('#confFilters .chip').forEach(c=>c.onclick=()=>{state.confFilter=c.dataset.f;renderConfFilters();renderConfList();});
}
async function renderConfeccao(){
  const all=await getAll();
  const c=[0,0,0,0]; let pendPagCount=0;
  all.forEach(i=>{
    if(statusPag(i)!=='pago'){ pendPagCount++; return; }  // sem pagamento completo -> não entra em nenhuma etapa
    c[i.camisaEstado||0]++;
  });
  $('#confKpis').innerHTML=`
    <div class="kpi"><div class="n" style="color:var(--grey)">${c[0]}</div><div class="l">${t('cAfazer')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--amber)">${c[1]}</div><div class="l">${t('cEmConf')}</div></div>
    <div class="kpi"><div class="n" style="color:#7a6a45">${c[2]}</div><div class="l">${t('cPronta')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--green)">${c[3]}</div><div class="l">${t('cEntregue')}</div></div>
    <div class="kpi"><div class="n" style="color:var(--red)">${pendPagCount}</div><div class="l">${t('pendPag')}</div></div>`;
  renderConfFilters();
  renderConfList();
  // resumo por tamanho x estado (para produção): mostra pendentes de produção (a fazer + em confecção) por tamanho
  const bySize={};
  all.forEach(i=>{ if(statusPag(i)!=='pago') return; const s=(i.tamanho||'—').trim()||'—'; if(!bySize[s])bySize[s]=[0,0,0,0]; bySize[s][i.camisaEstado||0]++; });
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  const keys=Object.keys(bySize).sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  let html=`<div class="tablewrap"><table class="grid"><thead><tr><th>${t('thTam')}</th><th class="c">${t('cAfazer')}</th><th class="c">${t('cEmConf')}</th><th class="c">${t('cPronta')}</th><th class="c">${t('cEntregue')}</th><th class="c">${t('totalConf')}</th></tr></thead><tbody>`;
  keys.forEach(s=>{const a=bySize[s];const tot=a[0]+a[1]+a[2]+a[3];html+=`<tr><td>${esc(s)}</td><td class="c">${a[0]||''}</td><td class="c">${a[1]||''}</td><td class="c">${a[2]||''}</td><td class="c">${a[3]||''}</td><td class="c"><b>${tot}</b></td></tr>`;});
  html+=`</tbody></table></div>`;
  $('#confSize').innerHTML=html;
}
async function renderConfList(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero)||a.nome.localeCompare(b.nome));
  const f=state.confFilter;
  const filtered=all.filter(i=>{
    if(f==='todos') return true;
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
        <div class="num">${i.numero||t('semNumero')}</div>
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
function fmtShort(iso){ if(!iso) return ''; const [y,m,dd]=iso.split('-'); return `${dd}/${(MESES[lang]||MESES.pt)[(+m)-1]}`; }
function fmtFull(iso){ if(!iso) return ''; const [y,m,dd]=iso.split('-'); return `${dd}/${m}/${y.slice(2)}`; }

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
      await put(rec);
    }
  }
  state.confDirty={};
  updateSaveBtn();
  renderConfeccao();
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
  fillSelect('#p-tipo',TIPOS,'');
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
  $('#paysList').innerHTML=state.draftPays.map((p,idx)=>`<div class="pay"><span>${p.valor}€ · ${esc(p.tipo||'—')}${p.data?' · '+p.data:''}</span><button class="del" data-i="${idx}">×</button></div>`).join('');
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
  state.draftPays.push({valor:v,tipo:$('#p-tipo').value,data:$('#p-data').value||hoje(),nota:''});
  const restante=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  $('#p-valor').value = restante>0 ? String(restante) : '';
  $('#p-data').value=hoje();
  renderPays();
};
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
  await put(rec);
  closeModal(); refresh();
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
    const stTxt=st==='pago'?t('fPago'):st==='parcial'?t('faltam',{v:i.cota-soma}):t('fPend');
    const camisa = statusPag(i)==='pago' ? t(estKey(i.camisaEstado||0)) : t('pendPag');
    return `<tr>
      <td>${esc(i.numero||t('semNumero'))}</td>
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
$('#btnReset').onclick=async()=>{ if(!confirm(t('confirmReset'))) return; await clearAll(); await seedIfEmpty(); refresh(); };

/* ---------- navegação / idioma ---------- */
function doSetView(v){
  // guarda a posição de scroll da tab atual
  if(state.view){ state.scrollPos = state.scrollPos||{}; state.scrollPos[state.view]=window.scrollY; }
  state.view=v;
  ['lista','painel','confeccao','mais'].forEach(x=>$('#view-'+x).classList.toggle('hidden',x!==v));
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  $('#fab').style.display=v==='lista'?'block':'none';
  if(v==='painel') renderPainel();
  if(v==='confeccao') renderConfeccao();
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
$('#q').oninput=e=>{state.q=e.target.value;renderList();};

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
  if(state.view==='lista') renderList();
  if(state.view==='painel') renderPainel();
}

/* ---------- boot ---------- */
/* ---------- atualização (service worker) ---------- */
function showUpdateBanner(worker){
  const b=$('#updateBanner');
  $('#updateMsg').textContent=t('novaVersao');
  $('#updateBtn').textContent=t('atualizar');
  b.classList.remove('hidden');
  $('#updateBtn').onclick=()=>{
    $('#updateBtn').disabled=true;
    $('#updateBtn').textContent=t('atualizando');
    try{ worker.postMessage('skipWaiting'); }catch(e){}
    // fallback: se o controllerchange não disparar em 1.8s, recarrega mesmo assim
    setTimeout(()=>{ window.location.reload(); }, 1800);
  };
}
async function registerSWWithUpdate(){
  const reg=await navigator.serviceWorker.register('sw.js');
  if(reg.waiting && navigator.serviceWorker.controller) showUpdateBanner(reg.waiting);
  reg.addEventListener('updatefound',()=>{
    const nw=reg.installing;
    if(!nw) return;
    nw.addEventListener('statechange',()=>{
      if(nw.state==='installed' && navigator.serviceWorker.controller){ showUpdateBanner(nw); }
    });
  });
  let refreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(refreshing) return; refreshing=true; window.location.reload();
  });
  setInterval(()=>reg.update().catch(()=>{}), 60*60*1000);
  document.addEventListener('visibilitychange',()=>{ if(!document.hidden) reg.update().catch(()=>{}); });
}

/* ---------- boot ---------- */
(async function(){
  await openDB();
  await seedIfEmpty();
  await migrate();
  applyLang();
  applyViewMode();
  const vEl=$('#appVersion'); if(vEl) vEl.textContent=APP_VERSION;
  setView('lista');
  refresh();
  if('serviceWorker' in navigator){ try{ await registerSWWithUpdate(); }catch(e){} }
})();
