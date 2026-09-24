/* Projeto Gideão 300 — app offline (IndexedDB) */
'use strict';

const COTA = 300;
const META = 300;
const APP_VERSION = 'v4.1.1-beta16';
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
    appTitle:'Projeto Gideão 300', buscar:'Buscar por nome...', buscarAvancado:'Busca avançada (nome, obs, notas, tamanho)...', buscaAvancada:'Busca avançada', buscaAvancadaHint:'(inclui observação, notas e tamanho)', avancada:'Avançada',
    navLista:'Gideões', navPainel:'Painel', navMais:'Mais',
    novoInscrito:'Novo inscrito', editarInscrito:'Editar inscrito',
    numero:'Número', tamanho:'Tamanho', nome:'Nome', telefone:'Telefone',
    pagamentos:'Pagamentos (cota 300€)', valor:'Valor (€)', tipo:'Tipo', data:'Data',
    addPagamento:'+ Pagamento', comentarioOutros:'Comentário (Outros)', camisaPronta:'Camisa pronta', camisaEntregue:'Camisa entregue',
    adicionarPagamento:'Adicionar pagamento', adicionarEstePagamento:'Adicionar este pagamento',
    comentarioObrigatorio:'Para o tipo "Outros", informe um comentário.',
    maisRecente:'Mais recente', maisAntigo:'Mais antigo',
    pagamentoNaoAdicionado:'Há um valor de pagamento digitado que não foi adicionado. Adicionar antes de salvar?',
    aRevisar:'A revisar', observacoes:'Observações', textoOriginal:'Texto original',
    salvar:'Salvar', excluir:'Excluir', cancelar:'Cancelar', confirmar:'Confirmar',
    restaurar:'Restaurar', excluirGideaoT:'Excluir Gideão?', excluirDespT:'Excluir despesa?', excluirMovT:'Excluir movimentação?', restaurarBackupT:'Restaurar backup?', restaurarUsersT:'Restaurar usuários?', recarregarBaseT:'Recarregar base original?', pagamentoNaoAddT:'Pagamento não adicionado', adicionarESalvar:'Adicionar e salvar', salvarSemAdd:'Salvar sem adicionar',
    origemDestinoIguais:'Origem e destino devem ser diferentes.', okGenerico:'Feito.', erroGenerico:'Erro', okRecarregada:'Base recarregada ({n}).',
    suspender:'Suspender', reativar:'Reativar', suspensa:'Suspensa', suspenderDespT:'Suspender despesa?', confirmSuspenderDesp:'A despesa fica no histórico como suspensa e sai do saldo. O tesoureiro pode reativar ou excluir de vez.', despSuspensa:'Despesa suspensa.', despReativada:'Despesa reativada.',
    porTamanho:'Por tamanho (para a gráfica)', financeiro:'Financeiro',
    dadosBackup:'Dados e backup', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Baixar backup (JSON)',
    restaurarBackup:'Restaurar backup (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'O backup permite passar os dados entre os líderes (WhatsApp, Drive). Importar substitui os dados atuais.',
    zerar:'Apagar tudo e recarregar dados iniciais',
    fPago:'Pagos', fParcial:'Parciais', fPend:'Pendentes', fEntregue:'A entregar', fRevisar:'A revisar', fTodos:'Todos', fIsento:'Isentos', isentoChk:'Isento', isentoNota:'Isento — não paga a cota.',
    sPago:'Pago', sPend:'Pendente', sIsento:'Isento', tsCriado:'criado', tsAtual:'atual.',
    inscritos:'Inscritos', meta:'Meta', arrecadado:'Arrecadado', pendente:'A receber',
    prontas:'Prontas', entregues:'Entregues', aReceber:'Falta receber', faltaMeta:'Faltam', cotasLabel:'cotas',
    metaCampanha:'Meta do Projeto Gideão', arrecadadoPor:'arrecadado por', pessoasLabel:'pessoas', deLabel:'de', aInscrever:'a inscrever', pagaramLabel:'pagaram', aReceberLabel:'a receber',
    saldoLabel:'saldo', custodiaLabel:'Custódia do dinheiro', pastoresLabel:'pastores', tesoureiroLabel:'tesoureiro',
    faseProduzido:'Produzido', faseProduzir:'A produzir', fasePotencial:'Potencial',
    confeccaoCamisas:'Confecção de camisas', entreguesNote:'camisas entregues', prontasAguardando:'prontas aguardando entrega',
    saldoPago:'Pago — cota completa', saldoFalta:'Faltam {v}€', saldoPend:'Nenhum pagamento',
    faltam:'faltam {v}€', semNumero:'s/n', confirmDel:'Excluir este inscrito?',
    confirmReset:'Apagar TODOS os dados e recarregar a lista inicial? Faça um backup antes.',
    confirmRestore:'Restaurar vai substituir os dados atuais. Continuar?',
    jsonInvalido:'Arquivo JSON inválido. Nada foi alterado.', okRestaurado:'OK — backup restaurado ({n} inscritos).', erroRestaurar:'Erro ao restaurar',
    backupUsuarios:'Backup de usuários (Acessos)', baixarBackupUsers:'Baixar backup de usuários (JSON)', restaurarBackupUsers:'Restaurar usuários (JSON)',
    backupUsersNota:'Exclusivo do admin. Restaurar substitui a lista de acessos atual (mantém sempre ao menos um admin).',
    confirmRestoreUsers:'Restaurar vai substituir a lista de usuários (acessos) atual. Continuar?',
    erroPrecisaAdmin:'O backup precisa conter ao menos um admin.', erroSemUsuarios:'Nenhum usuário válido no arquivo.',
    nomeObrig:'Informe o nome.', metaSub:'{n} de 300 inscritos', porFormaPag:'Por forma de pagamento',
    vazio:'Nenhum inscrito encontrado.',
    thNum:'Nº', thNome:'Nome', thTam:'Tam.', thTel:'Telefone', thPago:'Pago', thStatus:'Status',
    thPronta:'Pronta', thEntregue:'Entregue', thRevisar:'Rev.', thCamisa:'Camisa',
    navConfeccao:'Confecção', camisa:'Camisa', camisaStatus:'Estado da camisa:',
    est0:'A fazer', est1:'Em confecção', est2:'Pronta', est3:'Entregue',
    cAfazer:'A fazer', cEmConf:'Em confecção', cPronta:'Prontas', cEntregue:'Entregues',
    avancar:'Tocar para avançar', porTamanhoConf:'Resumo por tamanho', totalConf:'Total', totalGeral:'Total geral',
    estoqueTitulo:'Estoque de camisas', estoqueLabel:'Estoque', estColEstoque:'Estoque', estColProjecao:'Projeção', estColEstado:'Estado',
    estOk:'OK', estComprar:'Comprar', estFaltam:'Faltam {n}', estFaltaAgora:'Falta agora (impacta produção)', estUrgente:'comprar com urgência', estComprarPreventivo:'Comprar para não faltar', estCompraOk:'Estoque em dia — nada a comprar',
    estVazio:'Sem dados de estoque ainda.', estLegenda:'Estoque = disponível (ajustes − consumido pela produção). A fazer = camisas por produzir. Projeção = A fazer + pendentes. Estado: OK cobre a projeção · Comprar cobre "A fazer" mas não a projeção · Faltam já impacta produção.',
    ajustarEstoque:'Ajustar estoque', ajustar:'Ajustar', disponivelAtual:'Disponível atual', estMotivo:'Motivo (opcional)', estHistorico:'Histórico de ajustes', estiloExtrato:'estilo extrato', saldoCorrente:'saldo', semAjustes:'Sem ajustes ainda.', estInformeQtd:'Informe uma quantidade (+ ou −).', estAjusteOk:'Estoque ajustado.',
    verConfeccao:'Abrir na Confecção',
    pendPag:'Pendente pagamento', pago:'Pago', alteracoesSalvas:'Alterações salvas',
    semAlteracoes:'Sem alterações', confirmSairConf:'Há alterações não salvas. Sair mesmo assim?',
    projeto:'Projeto Gideão', alteracoesNaoSalvas:'Alterações não salvas',
    confirmSairMsg:'Você alterou o estado de algumas camisas mas ainda não salvou. O que deseja fazer?',
    salvarESair:'Salvar e sair', descartarSair:'Descartar alterações', continuarEditando:'Continuar editando', de:'de',
    confirmSairForm:'Você alterou os dados deste Gideão mas ainda não salvou. O que deseja fazer?',
    editarData:'Editar data',
    estAbbr1:'Conf.', estAbbr2:'Pronta', estAbbr3:'Entreg.',
    novaVersao:'Nova versão disponível', atualizar:'Atualizar', atualizando:'Atualizando…', atualizarPara:'Atualizar para nova versão disponível',
    loginSub:'Entre com sua conta Google autorizada', loginFoot:'Acesso restrito aos líderes do projeto',
    naoAutorizado:'Este email não está autorizado a usar o app. Fale com o responsável.',
    verificandoAcesso:'Verificando acesso…',
    loginGoogleFalhou:'Não foi possível carregar o login do Google. Verifique a conexão e tente de novo.',
    recarregar:'Recarregar', erroLogin:'Erro ao entrar',
    conta:'Conta e sincronização', usuario:'Usuário', versao:'Versão', sincronizacao:'Sincronização', ultimaSync:'Última sincronização', admin:'Admin',
    sincronizarAgora:'Sincronizar agora', sair:'Sair', enviarBase:'Enviar base completa à planilha',
    recarregarBase:'Recarregar base original (zera tudo)',
    navAcessos:'Acessos', acessosNota:'Quem pode entrar no app. As mudanças valem no próximo login.',
    grupoAdmins:'Administradores', grupoUsers:'Usuários', grupoTesoureiros:'Tesoureiros', grupoViewers:'Visualizadores',
    verComo:'Ver como', verComoEu:'Admin (eu)', vendoComo:'Vendo como: {r}', voltarPerfil:'Voltar ao meu perfil',
    verComoBloqueio:'Você está no modo "Ver como". Saia dele para poder editar.',
    entregueTesoureiro:'Entregue ao tesoureiro', detalheDinheiro:'Detalhe do Dinheiro',
    recebidoPor:'Recebido por', recebidoDireto:'Recebido pelo tesoureiro', detalheCustodia:'Detalhe por custódia', custodia:'Custódia',
    comPastores:'Com pastores', comTesoureiro:'Com tesoureiro',
    saiuDe:'Saiu de (dinheiro)', saiuDeCustodia:'Saiu da custódia (dinheiro)', origemPastor:'Pastor', origemTesoureiro:'Tesoureiro',
    novoUsuario:'Novo usuário', editarUsuario:'Editar usuário', editar:'Editar',
    perfil:'Perfil', papelUser:'Usuário', papelAdmin:'Admin', papelTesoureiro:'Tesoureiro', papelViewer:'Visualizador', viewerBloqueio:'Perfil Visualizador: acesso somente leitura.', adicionar:'Adicionar', remover:'Remover',
    processando:'Processando…', confirmarRemocao:'Confirmar remoção',
    confirmRemoverUser:'Remover o acesso de {e}?',
    errJaExiste:'Este email já está na lista.', errEmailInvalido:'Email inválido.',
    errUltimoAdmin:'Não é possível: precisa haver ao menos um admin.', errUserFalhou:'Falha ao atualizar usuários.',
    confirmRecarregar:'Isto APAGA tudo (planilha e app) e recarrega os 70 Gideões originais. Usar só para reiniciar os testes. Continuar?',
    syncOk:'Sincronizado', syncPend:'Pendente', syncOff:'Offline', syncErr:'Erro', syncing:'Sincronizando…',
    navCaixa:'Caixa', saldoProjeto:'Saldo do projeto', bolsoDinheiro:'Dinheiro', bolsoBanco:'Banco', bolsoOutros:'Outros',
    somenteLeitura:'Somente leitura',
    conciliacaoBanco:'Conciliação bancária', saldoBancoCalc:'Saldo em banco (calculado)', saldoBancoReal:'Saldo real do banco',
    diferenca:'Diferença', lancamentos:'Lançamentos', despesas:'Despesas', movimentacoes:'Movimentações',
    novaDespesa:'Nova despesa', editarDespesa:'Editar despesa', descricao:'Descrição', categoria:'Categoria', pagoDe:'Pago de (bolso)', observacao:'Observação',
    novaMovimentacao:'Nova movimentação', editarMovimentacao:'Editar movimentação', de:'De', para:'Para', comentario:'Comentário',
    arrecadadoLabel:'Arrecadado', despesasLabel:'Despesas', semLancamentos:'Nenhum lançamento', confirmDelDesp:'Excluir esta despesa?', confirmDelMov:'Excluir esta movimentação?',
    extrato:'Extrato', saldoAtual:'Saldo atual', entrada:'Entrada', despesa:'Despesa', movimentacao:'Movimentação', pagamentoDe:'Pagamento',
    fotosFatura:'Comprovante — foto ou PDF (até 3)', tirarFoto:'📎 Anexar comprovante (foto ou PDF)', verFoto:'Ver comprovante', enviandoFoto:'Enviando anexo…', maxFotos:'Máximo de 3 anexos.', pdfGrande:'PDF muito grande (máx. 5 MB). Reduza o arquivo e tente novamente.', anexarComprovante:'Anexar comprovante',
    fotoSemConexao:'Sem conexão para enviar a foto. Conecte-se à internet e tente salvar novamente (ou remova a foto para salvar sem ela).',
    fotoFalhou:'Não foi possível enviar a foto. A despesa NÃO foi salva. Tente de novo ou remova a foto.'
  },
  es:{
    appTitle:'Proyecto Gedeón 300', buscar:'Buscar por nombre...', buscarAvancado:'Búsqueda avanzada (nombre, obs, notas, talla)...', buscaAvancada:'Búsqueda avanzada', buscaAvancadaHint:'(incluye observación, notas y talla)', avancada:'Avanzada',
    navLista:'Gedeones', navPainel:'Panel', navMais:'Más',
    novoInscrito:'Nuevo inscrito', editarInscrito:'Editar inscrito',
    numero:'Número', tamanho:'Talla', nome:'Nombre', telefone:'Teléfono',
    pagamentos:'Pagos (cuota 300€)', valor:'Importe (€)', tipo:'Tipo', data:'Fecha',
    addPagamento:'+ Pago', comentarioOutros:'Comentario (Otros)', camisaPronta:'Camiseta lista', camisaEntregue:'Camiseta entregada',
    adicionarPagamento:'Añadir pago', adicionarEstePagamento:'Añadir este pago',
    comentarioObrigatorio:'Para el tipo "Otros", indica un comentario.',
    maisRecente:'Más reciente', maisAntigo:'Más antiguo',
    pagamentoNaoAdicionado:'Hay un valor de pago escrito que no fue añadido. ¿Añadir antes de guardar?',
    aRevisar:'Por revisar', observacoes:'Observaciones', textoOriginal:'Texto original',
    salvar:'Guardar', excluir:'Eliminar', cancelar:'Cancelar', confirmar:'Confirmar',
    restaurar:'Restaurar', excluirGideaoT:'¿Eliminar Gedeón?', excluirDespT:'¿Eliminar gasto?', excluirMovT:'¿Eliminar movimiento?', restaurarBackupT:'¿Restaurar copia?', restaurarUsersT:'¿Restaurar usuarios?', recarregarBaseT:'¿Recargar base original?', pagamentoNaoAddT:'Pago no añadido', adicionarESalvar:'Añadir y guardar', salvarSemAdd:'Guardar sin añadir',
    origemDestinoIguais:'Origen y destino deben ser diferentes.', okGenerico:'Hecho.', erroGenerico:'Error', okRecarregada:'Base recargada ({n}).',
    suspender:'Suspender', reativar:'Reactivar', suspensa:'Suspendida', suspenderDespT:'¿Suspender gasto?', confirmSuspenderDesp:'El gasto queda en el historial como suspendido y sale del saldo. El tesorero puede reactivar o eliminar del todo.', despSuspensa:'Gasto suspendido.', despReativada:'Gasto reactivado.',
    porTamanho:'Por talla (para la imprenta)', financeiro:'Finanzas',
    dadosBackup:'Datos y copia', exportarExcel:'Exportar Excel (CSV)', baixarBackup:'Descargar copia (JSON)',
    restaurarBackup:'Restaurar copia (JSON)', imprimirPdf:'Imprimir / PDF',
    backupNota:'La copia permite pasar los datos entre los líderes (WhatsApp, Drive). Importar reemplaza los datos actuales.',
    zerar:'Borrar todo y recargar datos iniciales',
    fPago:'Pagados', fParcial:'Parciales', fPend:'Pendientes', fEntregue:'Por entregar', fRevisar:'Por revisar', fTodos:'Todos', fIsento:'Exentos', isentoChk:'Exento', isentoNota:'Exento — no paga la cuota.',
    sPago:'Pagado', sPend:'Pendiente', sIsento:'Exento', tsCriado:'creado', tsAtual:'act.',
    inscritos:'Inscritos', meta:'Meta', arrecadado:'Recaudado', pendente:'Por cobrar',
    prontas:'Listas', entregues:'Entregadas', aReceber:'Falta cobrar', faltaMeta:'Faltan', cotasLabel:'cuotas',
    metaCampanha:'Meta del Proyecto Gedeón', arrecadadoPor:'recaudado por', pessoasLabel:'personas', deLabel:'de', aInscrever:'por inscribir', pagaramLabel:'pagaron', aReceberLabel:'por cobrar',
    saldoLabel:'saldo', custodiaLabel:'Custodia del efectivo', pastoresLabel:'pastores', tesoureiroLabel:'tesorero',
    faseProduzido:'Producido', faseProduzir:'Por producir', fasePotencial:'Potencial',
    confeccaoCamisas:'Confección de camisetas', entreguesNote:'camisetas entregadas', prontasAguardando:'listas esperando entrega',
    saldoPago:'Pagado — cuota completa', saldoFalta:'Faltan {v}€', saldoPend:'Sin pagos',
    faltam:'faltan {v}€', semNumero:'s/n', confirmDel:'¿Eliminar este inscrito?',
    confirmReset:'¿Borrar TODOS los datos y recargar la lista inicial? Haz una copia antes.',
    confirmRestore:'Restaurar reemplazará los datos actuales. ¿Continuar?',
    jsonInvalido:'Archivo JSON inválido. No se cambió nada.', okRestaurado:'OK — copia restaurada ({n} inscritos).', erroRestaurar:'Error al restaurar',
    backupUsuarios:'Copia de usuarios (Accesos)', baixarBackupUsers:'Descargar copia de usuarios (JSON)', restaurarBackupUsers:'Restaurar usuarios (JSON)',
    backupUsersNota:'Exclusivo del admin. Restaurar reemplaza la lista de accesos actual (mantiene siempre al menos un admin).',
    confirmRestoreUsers:'Restaurar reemplazará la lista de usuarios (accesos) actual. ¿Continuar?',
    erroPrecisaAdmin:'La copia debe contener al menos un admin.', erroSemUsuarios:'Ningún usuario válido en el archivo.',
    nomeObrig:'Indica el nombre.', metaSub:'{n} de 300 inscritos', porFormaPag:'Por forma de pago',
    vazio:'Ningún inscrito encontrado.',
    thNum:'Nº', thNome:'Nombre', thTam:'Talla', thTel:'Teléfono', thPago:'Pagado', thStatus:'Estado',
    thPronta:'Lista', thEntregue:'Entreg.', thRevisar:'Rev.', thCamisa:'Camiseta',
    navConfeccao:'Confección', camisa:'Camiseta', camisaStatus:'Estado de la camiseta:',
    est0:'Por hacer', est1:'En confección', est2:'Lista', est3:'Entregada',
    cAfazer:'Por hacer', cEmConf:'En confección', cPronta:'Listas', cEntregue:'Entregadas',
    avancar:'Toca para avanzar', porTamanhoConf:'Resumen por talla', totalConf:'Total', totalGeral:'Total general',
    estoqueTitulo:'Stock de camisetas', estoqueLabel:'Stock', estColEstoque:'Stock', estColProjecao:'Proyección', estColEstado:'Estado',
    estOk:'OK', estComprar:'Comprar', estFaltam:'Faltan {n}', estFaltaAgora:'Falta ahora (afecta producción)', estUrgente:'comprar con urgencia', estComprarPreventivo:'Comprar para no faltar', estCompraOk:'Stock al día — nada que comprar',
    estVazio:'Sin datos de stock aún.', estLegenda:'Stock = disponible (ajustes − consumido por producción). Por hacer = camisetas por producir. Proyección = Por hacer + pendientes. Estado: OK cubre la proyección · Comprar cubre "Por hacer" pero no la proyección · Faltan ya afecta producción.',
    ajustarEstoque:'Ajustar stock', ajustar:'Ajustar', disponivelAtual:'Disponible actual', estMotivo:'Motivo (opcional)', estHistorico:'Historial de ajustes', estiloExtrato:'estilo extracto', saldoCorrente:'saldo', semAjustes:'Sin ajustes aún.', estInformeQtd:'Indica una cantidad (+ o −).', estAjusteOk:'Stock ajustado.',
    verConfeccao:'Abrir en Confección',
    pendPag:'Pago pendiente', pago:'Pagado', alteracoesSalvas:'Cambios guardados',
    semAlteracoes:'Sin cambios', confirmSairConf:'Hay cambios sin guardar. ¿Salir de todos modos?',
    projeto:'Proyecto Gedeón', alteracoesNaoSalvas:'Cambios sin guardar',
    confirmSairMsg:'Has cambiado el estado de algunas camisetas pero aún no lo has guardado. ¿Qué deseas hacer?',
    salvarESair:'Guardar y salir', descartarSair:'Descartar cambios', continuarEditando:'Seguir editando', de:'de',
    confirmSairForm:'Has cambiado los datos de este Gedeón pero aún no lo has guardado. ¿Qué deseas hacer?',
    editarData:'Editar fecha',
    estAbbr1:'Conf.', estAbbr2:'Lista', estAbbr3:'Entreg.',
    novaVersao:'Nueva versión disponible', atualizar:'Actualizar', atualizando:'Actualizando…', atualizarPara:'Actualizar a la nueva versión disponible',
    loginSub:'Entra con tu cuenta Google autorizada', loginFoot:'Acceso restringido a los líderes del proyecto',
    naoAutorizado:'Este correo no está autorizado a usar la app. Habla con el responsable.',
    verificandoAcesso:'Verificando acceso…',
    loginGoogleFalhou:'No se pudo cargar el inicio de sesión de Google. Revisa la conexión e inténtalo de nuevo.',
    recarregar:'Recargar', erroLogin:'Error al entrar',
    conta:'Cuenta y sincronización', usuario:'Usuario', versao:'Versión', sincronizacao:'Sincronización', ultimaSync:'Última sincronización', admin:'Admin',
    sincronizarAgora:'Sincronizar ahora', sair:'Salir', enviarBase:'Enviar base completa a la hoja',
    recarregarBase:'Recargar base original (borra todo)',
    navAcessos:'Accesos', acessosNota:'Quién puede entrar en la app. Los cambios valen en el próximo inicio de sesión.',
    grupoAdmins:'Administradores', grupoUsers:'Usuarios', grupoTesoureiros:'Tesoreros', grupoViewers:'Visores',
    verComo:'Ver como', verComoEu:'Admin (yo)', vendoComo:'Viendo como: {r}', voltarPerfil:'Volver a mi perfil',
    verComoBloqueio:'Estás en modo "Ver como". Sal de él para poder editar.',
    entregueTesoureiro:'Entregado al tesorero', detalheDinheiro:'Detalle del Efectivo',
    recebidoPor:'Recibido por', recebidoDireto:'Recibido por el tesorero', detalheCustodia:'Detalle por custodia', custodia:'Custodia',
    comPastores:'Con pastores', comTesoureiro:'Con tesorero',
    saiuDe:'Salió de (efectivo)', saiuDeCustodia:'Salió de la custodia (efectivo)', origemPastor:'Pastor', origemTesoureiro:'Tesorero',
    novoUsuario:'Nuevo usuario', editarUsuario:'Editar usuario', editar:'Editar',
    perfil:'Perfil', papelUser:'Usuario', papelAdmin:'Admin', papelTesoureiro:'Tesorero', papelViewer:'Visor', viewerBloqueio:'Perfil Visor: acceso solo lectura.', adicionar:'Añadir', remover:'Quitar',
    processando:'Procesando…', confirmarRemocao:'Confirmar eliminación',
    confirmRemoverUser:'¿Quitar el acceso de {e}?',
    errJaExiste:'Este correo ya está en la lista.', errEmailInvalido:'Correo inválido.',
    errUltimoAdmin:'No es posible: debe haber al menos un admin.', errUserFalhou:'Error al actualizar usuarios.',
    confirmRecarregar:'Esto BORRA todo (hoja y app) y recarga los 70 Gedeones originales. Usar solo para reiniciar las pruebas. ¿Continuar?',
    syncOk:'Sincronizado', syncPend:'Pendiente', syncOff:'Sin conexión', syncErr:'Error', syncing:'Sincronizando…',
    navCaixa:'Caja', saldoProjeto:'Saldo del proyecto', bolsoDinheiro:'Efectivo', bolsoBanco:'Banco', bolsoOutros:'Otros',
    somenteLeitura:'Solo lectura',
    conciliacaoBanco:'Conciliación bancaria', saldoBancoCalc:'Saldo en banco (calculado)', saldoBancoReal:'Saldo real del banco',
    diferenca:'Diferencia', lancamentos:'Movimientos', despesas:'Gastos', movimentacoes:'Traspasos',
    novaDespesa:'Nuevo gasto', editarDespesa:'Editar gasto', descricao:'Descripción', categoria:'Categoría', pagoDe:'Pagado de (bolsa)', observacao:'Observación',
    novaMovimentacao:'Nuevo traspaso', editarMovimentacao:'Editar traspaso', de:'De', para:'A', comentario:'Comentario',
    arrecadadoLabel:'Recaudado', despesasLabel:'Gastos', semLancamentos:'Sin movimientos', confirmDelDesp:'¿Eliminar este gasto?', confirmDelMov:'¿Eliminar este traspaso?',
    extrato:'Extracto', saldoAtual:'Saldo actual', entrada:'Entrada', despesa:'Gasto', movimentacao:'Traspaso', pagamentoDe:'Pago',
    fotosFatura:'Comprobante — foto o PDF (hasta 3)', tirarFoto:'📎 Adjuntar comprobante (foto o PDF)', verFoto:'Ver comprobante', enviandoFoto:'Enviando adjunto…', maxFotos:'Máximo de 3 adjuntos.', pdfGrande:'PDF demasiado grande (máx. 5 MB). Reduce el archivo e intenta de nuevo.', anexarComprovante:'Adjuntar comprobante',
    fotoSemConexao:'Sin conexión para enviar la foto. Conéctate a internet e intenta guardar de nuevo (o quita la foto para guardar sin ella).',
    fotoFalhou:'No se pudo enviar la foto. El gasto NO se guardó. Intenta de nuevo o quita la foto.'
  }
};
let lang = localStorage.getItem('lang') || 'pt';
const t = (k,vars) => { let s=(I18N[lang][k]||k); if(vars) for(const p in vars) s=s.replace('{'+p+'}',vars[p]); return s; };
// seta o rótulo de um botão .act preservando o ícone (mexe só no <span>, não no textContent)
function btnLabel(elOrSel, txt){ const b=(typeof elOrSel==='string')?$(elOrSel):elOrSel; if(!b) return; const sp=b.querySelector('span'); if(sp) sp.textContent=txt; else b.textContent=txt; }

/* ---------- IndexedDB ---------- */
const DB_NAME='gideao300', STORE='inscritos', STORE_DESP='despesas', STORE_MOV='movimentos', STORE_EST='estoque';
let db;
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(DB_NAME,3);
    r.onupgradeneeded=e=>{ const d=e.target.result;
      if(!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains(STORE_DESP)) d.createObjectStore(STORE_DESP,{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains(STORE_MOV)) d.createObjectStore(STORE_MOV,{keyPath:'id',autoIncrement:true});
      if(!d.objectStoreNames.contains(STORE_EST)) d.createObjectStore(STORE_EST,{keyPath:'id',autoIncrement:true});
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

/* ---------- UI: confirmação (modal) e toast (feedback) — substitui confirm()/alert() nativos ---------- */
// confirmDialog(titulo,msg,{perigo,okText,cancelText}) -> Promise<bool>
function confirmDialog(titulo, msg, opts){
  opts=opts||{};
  return new Promise((resolve)=>{
    const m=$('#appConfirm'); if(!m){ resolve(window.confirm(msg||titulo)); return; }
    const perigo=!!opts.perigo;
    $('#acTitle').textContent=titulo||'';
    $('#acMsg').textContent=msg||'';
    const iw=$('#acIconWrap'); iw.classList.remove('danger','warn'); iw.classList.add(perigo?'danger':'warn');
    $('#acIconDanger').classList.toggle('hidden', !perigo);
    $('#acIconWarn').classList.toggle('hidden', perigo);
    const ok=$('#acOk'); ok.textContent=opts.okText || (perigo? t('excluir') : t('confirmar'));
    ok.className='btn '+(perigo?'danger':'primary'); ok.id='acOk';
    const cancel=$('#acCancel'); cancel.textContent=opts.cancelText || t('cancelar');
    const close=(val)=>{ m.classList.add('hidden'); ok.onclick=null; cancel.onclick=null; m.onclick=null; resolve(val); };
    ok.onclick=()=>close(true);
    cancel.onclick=()=>close(false);
    m.onclick=(e)=>{ if(e.target===m) close(false); };   // clicar no fundo = cancela
    m.classList.remove('hidden');
  });
}
// toast(msg, tipo) — tipo: 'ok' | 'err' | 'info' (default info). Some em ~2.6s.
let _toastTimer=null;
function toast(msg, tipo){
  const wrap=$('#toastWrap'); if(!wrap){ return; }
  tipo=tipo||'info';
  const icon = tipo==='ok' ? '<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>'
             : tipo==='err' ? '<path d="M12 2 1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>'
             : '<path d="M11 7h2v2h-2V7zm0 4h2v6h-2v-6zm1-9a10 10 0 100 20 10 10 0 000-20z"/>';
  wrap.innerHTML=`<div class="toast ${tipo}"><svg class="ti" viewBox="0 0 24 24">${icon}</svg><span>${esc(msg)}</span></div>`;
  const el=wrap.querySelector('.toast');
  requestAnimationFrame(()=>el.classList.add('show'));
  if(_toastTimer) clearTimeout(_toastTimer);
  _toastTimer=setTimeout(()=>{ if(el){ el.classList.remove('show'); setTimeout(()=>{ if(wrap.contains(el)) wrap.innerHTML=''; },250); } }, 2600);
}
const somaPago=i=>(i.pagamentos||[]).reduce((a,p)=>a+(+p.valor||0),0);
const isIsento=i=>!!(i&&i.isento);
function statusPag(i){ if(isIsento(i)) return 'isento'; const s=somaPago(i); if(s>=i.cota) return 'pago'; if(s>0) return 'parcial'; return 'pend'; }
// pode entrar na confecção/produção: quem pagou a cota OU é isento (pastor/convidado)
const podeProduzir=i=>statusPag(i)==='pago' || isIsento(i);
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
  // --- item 7: quebra do DINHEIRO por custódia (com pastores vs com tesoureiro) ---
  // entradas em dinheiro: entregue ao tesoureiro -> teso; senao -> pastor
  var cashPastor=0, cashTeso=0;
  (inscritos||[]).forEach(i=>(i.pagamentos||[]).forEach(p=>{
    if(bolsoDaForma(p.tipo)!=='dinheiro') return;
    var v=+p.valor||0;
    // mesma regra da etiqueta (payCustody): tesoureiro se recebido direto OU já entregue
    if(payCustody(p)==='teso') cashTeso+=v; else cashPastor+=v;
  }));
  // despesas em dinheiro: reduzem a custódia de origem (pastor/tesoureiro; default tesoureiro)
  (despesas||[]).forEach(d=>{
    if((d.bolso||'banco')!=='dinheiro') return;
    var v=+d.valor||0;
    if(d.origemCusto==='pastor') cashPastor-=v; else cashTeso-=v;
  });
  // movimentações que SAEM do dinheiro (depósito): reduzem a custódia de origem (default tesoureiro), SEM transbordo
  (movimentos||[]).forEach(m=>{
    var v=+m.valor||0;
    if(m.de==='dinheiro'){ if(m.origemCusto==='pastor') cashPastor-=v; else cashTeso-=v; }
    if(m.para==='dinheiro'){ cashTeso+=v; }  // entrada em dinheiro via movimentação vai p/ tesoureiro
  });
  // movimentações: realocam entre bolsos (não mudam o total)
  (movimentos||[]).forEach(m=>{ const v=+m.valor||0; if(bolso[m.de]!==undefined) bolso[m.de]-=v; if(bolso[m.para]!==undefined) bolso[m.para]+=v; });
  // despesas: saem do bolso escolhido
  let despTotal=0;
  (despesas||[]).forEach(d=>{ if(d.status==='suspenso') return; const v=+d.valor||0; despTotal+=v; const b=d.bolso||'banco'; if(bolso[b]!==undefined) bolso[b]-=v; });
  const saldoProjeto = arrecadado - despTotal;
  return { bolso, arrecadado, despTotal, saldoProjeto, forma, cashPastor:cashPastor, cashTeso:cashTeso };
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

let state={ view:'lista', filter:'todos', q:'', qAdv: localStorage.getItem('qAdv')==='1', editing:null, draftPays:[], viewMode: localStorage.getItem('viewMode')||'cards', confFilter:'todos', confQ:'', confHighlight:null, listHighlight:null, confDirty:{}, scrollPos:{}, sizePhaseSel:'fazer' };

/* ---------- render lista ---------- */
const FILTERS=[['todos','fTodos'],['pago','fPago'],['parcial','fParcial'],['pend','fPend'],['entregar','fEntregue'],['isento','fIsento'],['revisar','fRevisar']];
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
      let matched = matchNome || matchNum || matchTel;
      // busca avançada (aditiva): observação + notas dos pagamentos + tamanho
      if(!matched && state.qAdv){
        const matchObs=norm(i.observacoes).includes(qn);
        const matchTam=norm(i.tamanho).includes(qn);
        const matchNota=(i.pagamentos||[]).some(p=>norm(p.nota).includes(qn));
        matched = matchObs || matchTam || matchNota;
      }
      if(!matched) return false;
    }
    const st=statusPag(i);
    switch(state.filter){
      case 'pago': return st==='pago';
      case 'parcial': return st==='parcial';
      case 'pend': return st==='pend';
      case 'isento': return st==='isento';
      case 'entregar': return podeProduzir(i) && i.camisaEstado===EST.PRONTA;
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
    if(st==='isento'){ /* isento: sem tag no card (discreto) */ }
    else if(st==='pago') right.push(`<span class="b pago">${t('sPago')}</span>`);
    else if(st==='parcial') right.push(`<span class="b parcial">${t('faltam',{v:falta})}</span>`);
    else right.push(`<span class="b pend">${t('sPend')}</span>`);
    if(st==='pago' || st==='isento'){
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
  // highlight + scroll no card de onde viemos (ao fechar o modal)
  if(state.listHighlight!=null){
    const card=cardsEl.querySelector(`.card[data-id="${state.listHighlight}"]`);
    if(card){
      card.classList.add('hl');
      requestAnimationFrame(()=>{ try{ card.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){ card.scrollIntoView(); } });
      const id=state.listHighlight;
      setTimeout(()=>{ const c2=cardsEl.querySelector(`.card[data-id="${id}"]`); if(c2) c2.classList.remove('hl'); }, 3000);
    }
    state.listHighlight=null;   // consome (não re-destaca em re-renders)
  }
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
  const isentos=all.filter(i=>statusPag(i)==='isento').length;
  const prontas=all.filter(i=>(i.camisaEstado||0)>=EST.PRONTA).length;
  const entregues=all.filter(i=>(i.camisaEstado||0)===EST.ENTREGUE).length;
  const arrec=all.reduce((a,i)=>a+somaPago(i),0);
  // "a receber" NÃO inclui isentos (não devem nada): soma o que falta só dos não-isentos
  const areceber=all.reduce((a,i)=> isIsento(i)? a : a+Math.max(0,(i.cota||COTA)-somaPago(i)), 0);
  const totalCota=all.reduce((a,i)=>a+i.cota,0);
  const pct=Math.min(100,Math.round(n/META*100));
  // --- META: termometro financeiro + 2 aneis (inscritos e pagos) ---
  const metaFin = META * COTA;                     // 300 x 300 = 90.000
  const pctFin = metaFin>0 ? Math.min(100, arrec/metaFin*100) : 0;
  const faltaFin = Math.max(0, metaFin - arrec);
  const cotasFalta = Math.max(0, META - pagos);
  const pagantes = pagos + parcial;                // pessoas que já contribuíram (pago + parcial)
  const aInscrever = Math.max(0, META - n);
  const aReceberN = Math.max(0, n - pagos - isentos);   // não pagos, excluindo isentos (não devem)
  const pctInsc = Math.round(n/META*100);
  const pctPagos = n>0 ? Math.round(pagos/n*100) : 0;
  // termometro: tubo y 10..170 (160px), bulbo 188
  const tT=10, tH=160, tB=tT+tH;
  const fH = Math.round(tH * pctFin/100), fY = tB - fH;
  // dasharray dos aneis (circunferencia ~100)
  const dInsc = Math.min(100, pctInsc);
  const dPagos = Math.min(100, pctPagos);
  $('#metaThermo').innerHTML=`
      <h3 class="pnl-h3">${t('metaCampanha')}</h3>
      <div class="thermo-body">
        <svg class="thermo-svg" width="82" height="222" viewBox="0 0 82 222" aria-label="Termômetro da meta">
          <rect x="28" y="${tT}" width="20" height="${tH}" rx="10" fill="#efe6d3"/>
          <circle cx="38" cy="188" r="22" fill="#efe6d3"/>
          <rect x="31" y="${fY}" width="14" height="${fH}" rx="7" fill="url(#thg)"/>
          <circle cx="38" cy="188" r="16" fill="#c08a2d"/>
          <defs><linearGradient id="thg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d9a441"/><stop offset="1" stop-color="#c08a2d"/></linearGradient></defs>
          <text x="38" y="194" text-anchor="middle" font-size="15" fill="#fff" font-weight="bold">${Math.round(pctFin)}%</text>
          <line x1="50" y1="${tT}"       x2="57" y2="${tT}"       stroke="#c9bfa8" stroke-width="1.5"/><text x="60" y="${tT+4}"  font-size="9" fill="#a99f88">${Math.round(metaFin/1000)}k</text>
          <line x1="50" y1="${tT+tH*.25}" x2="55" y2="${tT+tH*.25}" stroke="#d8cfbc"/><text x="58" y="${tT+tH*.25+3}" font-size="7.5" fill="#bdb39c">75%</text>
          <line x1="50" y1="${tT+tH*.5}"  x2="57" y2="${tT+tH*.5}"  stroke="#c9bfa8" stroke-width="1.5"/><text x="60" y="${tT+tH*.5+3}"  font-size="9" fill="#a99f88">${Math.round(metaFin/2000)}k</text>
          <line x1="50" y1="${tT+tH*.75}" x2="55" y2="${tT+tH*.75}" stroke="#d8cfbc"/><text x="58" y="${tT+tH*.75+3}" font-size="7.5" fill="#bdb39c">25%</text>
          <line x1="50" y1="${tB}"        x2="57" y2="${tB}"        stroke="#c9bfa8" stroke-width="1.5"/><text x="60" y="${tB+3}"  font-size="9" fill="#a99f88">0</text>
        </svg>
        <div class="thermo-info">
          <div class="big">${arrec.toLocaleString('pt-PT')} €</div>
          <div class="of">${t('de')} ${metaFin.toLocaleString('pt-PT')} € · ${t('meta')} ${META}×${COTA}€</div>
          <div class="by">${t('arrecadadoPor')} <b>${pagantes} ${t('pessoasLabel')}</b></div>
          <div><span class="falta-pill">${t('faltaMeta')} ${faltaFin.toLocaleString('pt-PT')} € · ${cotasFalta} ${t('cotasLabel')}</span></div>
        </div>
      </div>
      <div class="meta-rings">
        <div class="mring">
          <svg width="92" height="92" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#efe6d3" stroke-width="5"/>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#c08a2d" stroke-width="5" stroke-dasharray="${dInsc} ${100-dInsc}" stroke-dashoffset="25" stroke-linecap="round" transform="rotate(-90 21 21)"/>
            <text x="21" y="19.5" text-anchor="middle" font-size="8" font-weight="bold" fill="#1f1f1f">${n}</text>
            <text x="21" y="26" text-anchor="middle" font-size="3.4" fill="#6f6a63">${t('deLabel')} ${META}</text>
          </svg>
          <div class="mring-cap">${t('inscritos')} · ${pctInsc}%</div>
          <div class="mring-out">${aInscrever} ${t('aInscrever')}</div>
        </div>
        <div class="mring">
          <svg width="92" height="92" viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#efe6d3" stroke-width="5"/>
            <circle cx="21" cy="21" r="15.9" fill="none" stroke="#3f7d54" stroke-width="5" stroke-dasharray="${dPagos} ${100-dPagos}" stroke-dashoffset="25" stroke-linecap="round" transform="rotate(-90 21 21)"/>
            <text x="21" y="19.5" text-anchor="middle" font-size="8" font-weight="bold" fill="#1f1f1f">${pagos}</text>
            <text x="21" y="26" text-anchor="middle" font-size="3.4" fill="#6f6a63">${t('pagaramLabel')}</text>
          </svg>
          <div class="mring-cap">${t('fPago')} · ${pctPagos}%</div>
          <div class="mring-out">${aReceberN} ${t('aReceberLabel')}</div>
        </div>
      </div>
    `;
  // por tamanho — 3 fases: Produzido (pronta+entregue) / A produzir (pago, a fazer+em confecção) / Potencial (pendente)
  const bySize={}; let totProd=0, totFazer=0, totPot=0;
  all.forEach(i=>{
    const s=(i.tamanho||'—').trim()||'—';
    if(!bySize[s]) bySize[s]={prod:0,fazer:0,pot:0,tot:0};
    const pago = podeProduzir(i);                   // pago OU isento → entra na produção
    const est = i.camisaEstado||0;
    let fase;
    if(pago && est>=EST.PRONTA) fase='prod';        // já existe (pronta/entregue)
    else if(pago) fase='fazer';                     // pago/isento, ainda a produzir
    else fase='pot';                                // pendente de pagamento
    bySize[s][fase]++; bySize[s].tot++;
    if(fase==='prod') totProd++; else if(fase==='fazer') totFazer++; else totPot++;
  });
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  const keys=Object.keys(bySize).sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  const maxTot=Math.max(1,...keys.map(s=>bySize[s].tot));
  // fase selecionada (default 'fazer' = A produzir): controla em qual segmento aparece o número destacado
  const sel = (state.sizePhaseSel==='prod'||state.sizePhaseSel==='fazer'||state.sizePhaseSel==='pot') ? state.sizePhaseSel : 'fazer';
  const phases=`
    <div class="size-phases">
      <div class="sphase a ${sel==='prod'?'sel':''}" data-ph="prod"><div class="n">${totProd}</div><div class="l">${t('faseProduzido')}</div></div>
      <div class="sphase b ${sel==='fazer'?'sel':''}" data-ph="fazer"><div class="n">${totFazer}</div><div class="l">${t('faseProduzir')}</div></div>
      <div class="sphase c ${sel==='pot'?'sel':''}" data-ph="pot"><div class="n">${totPot}</div><div class="l">${t('fasePotencial')}</div></div>
    </div>`;
  const bars=keys.map(s=>{
    const b=bySize[s];
    const wp=(b.prod/maxTot*100).toFixed(1), wf=(b.fazer/maxTot*100).toFixed(1), wo=(b.pot/maxTot*100).toFixed(1);
    // valor da fase selecionada; badge só quando > 0, no segmento equivalente
    const selVal = sel==='prod'? b.prod : sel==='fazer'? b.fazer : b.pot;
    const badge = selVal>0 ? `<span class="prod-badge ph-${sel}">${selVal}</span>` : '';
    const hostP = sel==='prod'? ' badge-host':'', hostF = sel==='fazer'? ' badge-host':'', hostO = sel==='pot'? ' badge-host':'';
    return `<div class="size-bar">
      <span class="sb-lbl">${esc(s)}</span>
      <span class="sb-track">
        <i class="seg-prod${hostP}" style="width:${wp}%;background:var(--green)" title="${t('faseProduzido')}: ${b.prod}">${sel==='prod'?badge:''}</i>
        <i class="seg-prod${hostF}" style="width:${wf}%;background:var(--accent)" title="${t('faseProduzir')}: ${b.fazer}">${sel==='fazer'?badge:''}</i>
        <i class="seg-prod${hostO}" style="width:${wo}%;background:#e2d3b0" title="${t('fasePotencial')}: ${b.pot}">${sel==='pot'?badge:''}</i>
      </span>
      <span class="sb-val">${b.tot}</span>
    </div>`;
  }).join('');
  const legend=`
    <div class="size-legend">
      <span><i class="sw" style="background:var(--green)"></i> ${t('faseProduzido')}</span>
      <span><i class="sw" style="background:var(--accent)"></i> ${t('faseProduzir')}</span>
      <span><i class="sw" style="background:#e2d3b0"></i> ${t('fasePotencial')}</span>
    </div>`;
  const prontasNaoEntr = Math.max(0, prontas - entregues);
  const confNote = `<div class="conf-note"><b>${entregues} ${t('entreguesNote')}</b>${prontasNaoEntr>0?` · ${prontasNaoEntr} ${t('prontasAguardando')}`:''}</div>`;
  $('#sizegrid').innerHTML = phases + bars + legend + confNote;
  // clique nas caixas de subtotal -> seleciona a fase cujo número é destacado nas barras
  $$('#sizegrid .sphase').forEach(el=>el.onclick=()=>{ state.sizePhaseSel = el.dataset.ph; renderPainel(); });
  // financeiro (A1: saldo herói + donut de bolsos + custódia expansível)
  const despAll = await sGetAll(STORE_DESP);
  const movAll  = await sGetAll(STORE_MOV);
  const cx = computeCaixa(all, despAll, movAll);
  const din=cx.bolso.dinheiro||0, ban=cx.bolso.banco||0, out=cx.bolso.outros||0;
  // para o desenho do donut/barras usamos valores não-negativos (um bolso pode ficar negativo
  // se saíram despesas/movimentos além do saldo daquele bolso — mostramos o valor real no texto,
  // mas o arco não pode ser negativo)
  const dP=Math.max(0,din), bP=Math.max(0,ban), oP=Math.max(0,out);
  const totBolso = (dP+bP+oP) || 1;
  const pDin=dP/totBolso*100, pBan=bP/totBolso*100, pOut=oP/totBolso*100;
  // dasharray do donut (circunf ~100); offsets acumulados a partir de 25 (topo, sentido horário)
  const offBan = 25 - pDin;
  const offOut = 25 - pDin - pBan;
  const maxB = Math.max(dP,bP,oP,1);
  const custPastor=cx.cashPastor||0, custTeso=cx.cashTeso||0;
  const cpP=Math.max(0,custPastor), ctP=Math.max(0,custTeso), custTot=(cpP+ctP)||1;
  const custOpen = (state.finCustOpen===true);   // lembra estado (default FECHADO)
  $('#fin').innerHTML=`
    <div class="fin-hero">
      <svg width="112" height="112" viewBox="0 0 42 42" aria-label="Composição do saldo">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#efe6d3" stroke-width="6"/>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--accent)" stroke-width="6" stroke-dasharray="${pDin.toFixed(1)} ${(100-pDin).toFixed(1)}" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#5b4a8a" stroke-width="6" stroke-dasharray="${pBan.toFixed(1)} ${(100-pBan).toFixed(1)}" stroke-dashoffset="${offBan.toFixed(1)}" transform="rotate(-90 21 21)"/>
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#8a6d3b" stroke-width="6" stroke-dasharray="${pOut.toFixed(1)} ${(100-pOut).toFixed(1)}" stroke-dashoffset="${offOut.toFixed(1)}" transform="rotate(-90 21 21)"/>
        <text x="21" y="20.5" text-anchor="middle" font-size="5" font-weight="bold" fill="#1f1f1f">${Math.round(cx.saldoProjeto).toLocaleString('pt-PT')}€</text>
        <text x="21" y="25.5" text-anchor="middle" font-size="3" fill="#6f6a63">${t('saldoLabel')}</text>
      </svg>
      <div class="fin-hero-num">
        <div class="fin-lbl">${t('saldoProjeto')}</div>
        <div class="fin-val">${Math.round(cx.saldoProjeto).toLocaleString('pt-PT')} €</div>
        <div class="fin-sub">${t('arrecadado')} ${Math.round(cx.arrecadado).toLocaleString('pt-PT')} € − ${t('despesas')} ${Math.round(cx.despTotal).toLocaleString('pt-PT')} €</div>
      </div>
    </div>
    <div class="fin-compo">
      <div class="fin-row exp ${custOpen?'open':''}" id="finDinRow">
        <span class="lft"><i class="fdot" style="background:var(--accent)"></i> ${t('bolsoDinheiro')} <span class="caret">▼</span></span>
        <span class="fmini"><i style="width:${(dP/maxB*100).toFixed(0)}%;background:var(--accent)"></i></span>
        <b>${Math.round(din).toLocaleString('pt-PT')} €</b>
      </div>
      <div class="fin-drill ${custOpen?'':'hidden'}" id="finCust">
        <div class="fd-h">${t('custodiaLabel')}</div>
        <div class="fd-bar"><div style="width:${(cpP/custTot*100).toFixed(0)}%;background:#0050CA"></div><div style="width:${(ctP/custTot*100).toFixed(0)}%;background:var(--green)"></div></div>
        <div class="fd-row">
          <span class="seg"><i class="fdotc" style="background:#0050CA"></i> ${t('pastoresLabel')} <b>${Math.round(custPastor).toLocaleString('pt-PT')} €</b></span>
          <span class="seg"><i class="fdotc" style="background:var(--green)"></i> ${t('tesoureiroLabel')} <b>${Math.round(custTeso).toLocaleString('pt-PT')} €</b></span>
        </div>
      </div>
      <div class="fin-row"><span class="lft"><i class="fdot" style="background:#5b4a8a"></i> ${t('bolsoBanco')}</span><span class="fmini"><i style="width:${(bP/maxB*100).toFixed(0)}%;background:#5b4a8a"></i></span><b>${Math.round(ban).toLocaleString('pt-PT')} €</b></div>
      <div class="fin-row"><span class="lft"><i class="fdot" style="background:#8a6d3b"></i> ${t('bolsoOutros')}</span><span class="fmini"><i style="width:${(oP/maxB*100).toFixed(0)}%;background:#8a6d3b"></i></span><b>${Math.round(out).toLocaleString('pt-PT')} €</b></div>
    </div>`;
  const dinRow=$('#finDinRow');
  if(dinRow) dinRow.onclick=()=>{ const d=$('#finCust'); const open=d.classList.toggle('hidden')===false; dinRow.classList.toggle('open',open); state.finCustOpen=open; };
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
    if(!podeProduzir(i)){ pendPagCount++; return; }  // sem cota completa e não isento -> não entra em nenhuma etapa
    c[i.camisaEstado||0]++;
  });
  // contagens para os badges dos filtros (contador dentro do chip)
  const counts={ todos: all.length, '0':c[0], '1':c[1], '2':c[2], '3':c[3], pend:pendPagCount };
  renderConfFilters(counts);
  renderConfList();
  // resumo por tamanho x estado (para produção): pagos por tamanho e status
  const bySize={}; const totCol=[0,0,0,0];
  all.forEach(i=>{ if(!podeProduzir(i)) return; const s=(i.tamanho||'—').trim()||'—'; if(!bySize[s])bySize[s]=[0,0,0,0]; const e=i.camisaEstado||0; bySize[s][e]++; totCol[e]++; });
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  const keys=Object.keys(bySize).sort((a,b)=>{const ia=order.indexOf(a),ib=order.indexOf(b);return (ia<0?99:ia)-(ib<0?99:ib);});
  const totGeral=totCol[0]+totCol[1]+totCol[2]+totCol[3];
  let html=`<div class="tablewrap"><table class="grid"><thead><tr><th>${t('thTam')}</th><th class="c">${t('cAfazer')}</th><th class="c">${t('cEmConf')}</th><th class="c">${t('cPronta')}</th><th class="c">${t('cEntregue')}</th><th class="c">${t('totalConf')}</th></tr></thead><tbody>`;
  keys.forEach(s=>{const a=bySize[s];const tot=a[0]+a[1]+a[2]+a[3];html+=`<tr><td>${esc(s)}</td><td class="c">${a[0]||''}</td><td class="c">${a[1]||''}</td><td class="c">${a[2]||''}</td><td class="c">${a[3]||''}</td><td class="c"><b>${tot}</b></td></tr>`;});
  html+=`</tbody><tfoot><tr><td>${t('totalGeral')}</td><td class="c">${totCol[0]}</td><td class="c">${totCol[1]}</td><td class="c">${totCol[2]}</td><td class="c">${totCol[3]}</td><td class="c">${totGeral}</td></tr></tfoot></table></div>`;
  $('#confSize').innerHTML=html;
  caixaState.estoque = await sGetAll(STORE_EST);
  renderEstoque(all);
}
// ---- Estoque de camisas por tamanho ----
// saldo de ajustes por tamanho (Σ delta dos movimentos)
function estoqueSaldo(tam){ return (caixaState.estoque||[]).filter(a=>String(a.tamanho)===String(tam)).reduce((s,a)=>s+(+a.delta||0),0); }
// calcula, por tamanho: disponivel, aFazer, projecao, estado
function computeEstoque(inscritos){
  const norms=(s)=>((s||'').trim()||'—');
  const map={};   // tam -> {aFazer, consumido, pendentes}
  (inscritos||[]).forEach(i=>{
    const s=norms(i.tamanho); if(!map[s]) map[s]={aFazer:0,consumido:0,pendentes:0};
    if(podeProduzir(i)){
      if((i.camisaEstado||0)===EST.AFAZER) map[s].aFazer++;   // ainda vai consumir
      else map[s].consumido++;                                 // já saiu de A fazer -> consumiu estoque
    } else {
      map[s].pendentes++;                                      // não paga/isento ainda -> projeção
    }
  });
  // inclui tamanhos que têm ajustes de estoque mas sem inscritos
  (caixaState.estoque||[]).forEach(a=>{ const s=norms(a.tamanho); if(!map[s]) map[s]={aFazer:0,consumido:0,pendentes:0}; });
  const out=[];
  Object.keys(map).forEach(s=>{
    const m=map[s];
    const saldo=estoqueSaldo(s);
    const disponivel=saldo - m.consumido;
    const projecao=m.aFazer + m.pendentes;
    let estado;   // 'ok' | 'comprar' | 'falta'
    if(disponivel < m.aFazer) estado='falta';
    else if(disponivel < projecao) estado='comprar';
    else estado='ok';
    out.push({tam:s, disponivel, aFazer:m.aFazer, pendentes:m.pendentes, projecao, estado, falta: Math.max(0, m.aFazer - disponivel), folga: Math.max(0, disponivel - projecao)});
  });
  // só mostra tamanhos relevantes (com projeção, disponível!=0, ou algum ajuste)
  const rel=out.filter(r=>r.projecao>0 || r.disponivel!==0 || estoqueSaldo(r.tam)!==0);
  const order=['XS','S','S/M','M','L','XL','XXL','2XL','3XL','—'];
  rel.sort((a,b)=>{const ia=order.indexOf(a.tam),ib=order.indexOf(b.tam);return (ia<0?99:ia)-(ib<0?99:ib);});
  return rel;
}
function renderEstoque(inscritos){
  const host=$('#estoque'); if(!host) return;
  const rows=computeEstoque(inscritos);
  // resumo consolidado 2 partes
  const urg=rows.filter(r=>r.estado==='falta');
  const prev=rows.filter(r=>r.estado==='comprar');
  const pedIcon='<svg viewBox="0 0 24 24"><path d="M12 2 1 21h22L12 2zm0 5 7.5 13h-15L12 7zm-1 4v4h2v-4h-2zm0 5v2h2v-2h-2z"/></svg>';
  const boxIcon='<svg viewBox="0 0 24 24"><path d="M20 6H4V4h16v2zm-1 2H5l1 12h12l1-12zM9 11h6v2H9v-2z"/></svg>';
  const okIcon='<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
  let reco='';
  if(urg.length) reco += `<div class="est-reco urg">${pedIcon}<div><b>${t('estFaltaAgora')}:</b> ${urg.map(r=>r.falta+' '+r.tam).join(' · ')} — ${t('estUrgente')}</div></div>`;
  if(prev.length) reco += `<div class="est-reco prev">${boxIcon}<div><b>${t('estComprarPreventivo')}:</b> ${prev.map(r=>r.tam).join(' · ')}</div></div>`;
  if(!urg.length && !prev.length) reco = `<div class="est-reco ok">${okIcon}<div><b>${t('estCompraOk')}</b></div></div>`;
  const canEdit = (effectiveRole()==='admin'||effectiveRole()==='tesoureiro'||effectiveRole()==='user') && !isImpersonating();
  const lapis='<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  const estadoPill=(r)=> r.estado==='ok' ? `<span class="est-pill ok">${t('estOk')}${r.folga>0?' · +'+r.folga:''}</span>`
                       : r.estado==='comprar' ? `<span class="est-pill comprar">${t('estComprar')}</span>`
                       : `<span class="est-pill falta">${t('estFaltam',{n:r.falta})}</span>`;
  const body = rows.map(r=>`<tr>
      <td class="est-tam">${esc(r.tam)}</td>
      <td class="c"><span class="est-cell"><b>${r.disponivel}</b>${canEdit?`<button class="est-adj" data-tam="${esc(r.tam)}" aria-label="${t('ajustar')}">${lapis}</button>`:''}</span></td>
      <td class="c">${r.aFazer}</td>
      <td class="c">${r.projecao}</td>
      <td class="c">${estadoPill(r)}</td>
    </tr>`).join('');
  host.innerHTML = `
    <h3 class="est-h">${t('estoqueTitulo')}</h3>
    ${reco}
    <div class="tablewrap"><table class="grid est-table"><thead><tr>
      <th>${t('thTam')}</th><th class="c">${t('estColEstoque')}</th><th class="c">${t('cAfazer')}</th><th class="c">${t('estColProjecao')}</th><th class="c">${t('estColEstado')}</th>
    </tr></thead><tbody>${body || `<tr><td colspan="5" class="c" style="color:var(--muted)">${t('estVazio')}</td></tr>`}</tbody></table></div>
    <p class="est-leg">${t('estLegenda')}</p>`;
  host.querySelectorAll('.est-adj').forEach(b=>b.onclick=()=>openEstoqueModal(b.dataset.tam));
}
// ---- modal de ajuste de estoque ----
let estModalTam=null;
function openEstoqueModal(tam){
  if(writeBlocked()) return;
  estModalTam=tam;
  $('#estModalTitle').textContent = t('ajustarEstoque') + ' — ' + tam;
  const saldo=estoqueSaldo(tam);
  $('#estModalCur').innerHTML = t('disponivelAtual') + ': <b>' + saldo + '</b>';
  $('#estQty').value='+1';
  $('#estMotivo').value='';
  renderEstHist(tam);
  $('#estoqueModal').classList.remove('hidden');
}
function estQtyVal(){ const v=parseInt(String($('#estQty').value).replace(/[^0-9-]/g,''),10); return isNaN(v)?0:v; }
function setEstQty(v){ $('#estQty').value = (v>0?'+':'') + v; }
function renderEstHist(tam){
  const el=$('#estHist'); if(!el) return;
  const arr=(caixaState.estoque||[]).filter(a=>String(a.tamanho)===String(tam)).sort((a,b)=>String(a.data||a.atualizadoEm||'').localeCompare(String(b.data||b.atualizadoEm||'')));
  if(!arr.length){ el.innerHTML=`<div class="eh-t">${t('estHistorico')} — ${esc(tam)}</div><div class="eh-row"><span class="eh-d">${t('semAjustes')}</span></div>`; return; }
  let saldo=0;
  const rows=arr.map(a=>{ const d=(+a.delta||0); saldo+=d; const nome=(a.atualizadoPor||'').split('@')[0];
    return `<div class="eh-row"><span>${esc(a.motivo||'—')}</span><span><span class="${d>=0?'eh-pos':'eh-neg'}">${d>=0?'+':''}${d}</span> <span class="eh-d">→ ${t('saldoCorrente')} ${saldo}${a.data?' · '+fmtShort(a.data):''}${nome?' · '+esc(nome):''}</span></span></div>`; }).join('');
  el.innerHTML=`<div class="eh-t">${t('estHistorico')} — ${esc(tam)} (${t('estiloExtrato')})</div>${rows}`;
}
$('#estMinus') && ($('#estMinus').onclick=()=>setEstQty(estQtyVal()-1));
$('#estPlus') && ($('#estPlus').onclick=()=>setEstQty(estQtyVal()+1));
$('#estCancel') && ($('#estCancel').onclick=()=>$('#estoqueModal').classList.add('hidden'));
$('#estoqueModal') && $('#estoqueModal').addEventListener('click',e=>{ if(e.target.id==='estoqueModal') $('#estoqueModal').classList.add('hidden'); });
$('#estSave') && ($('#estSave').onclick=async()=>{
  if(writeBlocked() || !estModalTam) return;
  const delta=estQtyVal();
  if(!delta){ toast(t('estInformeQtd'),'info'); return; }
  const rec={ tamanho:estModalTam, delta:delta, motivo:($('#estMotivo').value||'').trim(), data:hoje(), atualizadoEm:new Date().toISOString() };
  if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await sPut(STORE_EST, rec); markPendingKV('est', rec.id!=null?rec.id:newId);
  $('#estoqueModal').classList.add('hidden');
  caixaState.estoque = await sGetAll(STORE_EST);
  await renderConfeccao();
  if(ONLINE_ENABLED) syncNow();
  toast(t('estAjusteOk'),'ok');
});
// botão "Estoque" no topo da Confecção -> rola até a seção
$('#btnGoEstoque') && ($('#btnGoEstoque').onclick=()=>{ const s=$('#estoque'); if(s){ s.scrollIntoView({behavior:'smooth',block:'start'}); } });

async function renderConfList(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero)||a.nome.localeCompare(b.nome));
  const f=state.confFilter;
  const qn=norm(state.confQ||'');
  const filtered=all.filter(i=>{
    if(qn && !norm(i.nome).includes(qn)) return false;   // busca por nome (sem acento)
    if(f==='todos') return true;
    // filtro "pendente de pagamento": Gideões sem pagamento completo
    if(f==='pend') return !podeProduzir(i);
    // mantém visível qualquer card em edição, para não sumir ao trocar status antes de salvar
    if(i.id in state.confDirty) return true;
    // gate de pagamento: sem pagamento completo não entra em nenhuma etapa (A fazer/Em conf/Pronta/Entregue)
    if(!podeProduzir(i)) return false;
    return (i.camisaEstado||0)===+f;
  });
  const el=$('#confList');
  if(!filtered.length){ el.innerHTML=`<div class="empty">${t('vazio')}</div>`; return; }
  const EST_LABELS=['est0','est1','est2','est3'];
  el.innerHTML=filtered.map(i=>{
    const pago = podeProduzir(i);
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
    if(!podeProduzir(rec)) return;
    setDirtyEstado(rec, est);
    updateSaveBtn(); renderConfList();
  });
  // clicar na data/ícone abre o seletor
  // (a data usa input date transparente sobreposto — o toque abre o calendário nativo direto)
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
  // rola até o card destacado (vindo do modal), centralizado — mantém o highlight
  if(state.confHighlight!=null){
    const card=el.querySelector(`.confcard[data-id="${state.confHighlight}"]`);
    if(card){ requestAnimationFrame(()=>{ try{ card.scrollIntoView({block:'center', behavior:'smooth'}); }catch(e){ card.scrollIntoView(); } }); }
  }
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
// timestamp compacto para o card: dd/mmm HH:mm (aceita ISO datetime)
function fmtStampCurto(iso){ if(!iso) return ''; const d=new Date(iso); if(isNaN(d)) return ''; const mon=(MESES[lang]||MESES.pt)[d.getMonth()]||''; const p=n=>String(n).padStart(2,'0'); return `${p(d.getDate())}/${mon} ${p(d.getHours())}:${p(d.getMinutes())}`; }
function fmtFull(iso){ iso=toISODate(iso); if(!iso) return ''; const p=iso.split('-'); if(p.length<3) return iso; return `${p[2]}/${p[1]}/${p[0].slice(2)}`; }
// dd/mês-abrev/aa (ex.: 21/set/26)
function fmtDMY(iso){ iso=toISODate(iso); if(!iso) return ''; const p=iso.split('-'); if(p.length<3) return iso; const mes=(MESES[lang]||MESES.pt)[(+p[1])-1]||p[1]; return `${p[2]}/${mes}/${p[0].slice(2)}`; }

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
// menor número livre (primeiro buraco >=1); usados = números já existentes
async function nextFreeNumber(){
  const all=await getAll();
  const used=new Set(all.map(x=>parseInt(x.numero)).filter(x=>!isNaN(x)));
  let n=1; while(used.has(n)) n++; return n;
}
// maior + 1 (default)
async function maxPlusOneNumber(){
  const all=await getAll();
  const nums=all.map(x=>parseInt(x.numero)).filter(x=>!isNaN(x));
  return nums.length? Math.max(...nums)+1 : 1;
}
// mostra o botão "buscar livre" só quando o campo está vazio
function updateNumFreeBtn(){
  const b=$('#f-num-free'); if(!b) return;
  b.classList.toggle('hidden', !!($('#f-numero').value||'').trim());
}
$('#f-numero') && ($('#f-numero').addEventListener('input', updateNumFreeBtn));
$('#f-num-free') && ($('#f-num-free').onclick=async()=>{
  const n=await nextFreeNumber();
  $('#f-numero').value=String(n).padStart(2,'0');
  updateNumFreeBtn();
});
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
  updateNumFreeBtn();
  fillSelect('#f-tamanho',TAMANHOS,rec?rec.tamanho:'');
  fillSelect('#p-tipo',TIPOS,'Dinheiro');
  if($('#p-outros-wrap')){ $('#p-outros-wrap').classList.add('hidden'); $('#p-comentario').value=''; }
  if($('#p-receb-wrap')){ $('#p-receb-wrap').classList.remove('hidden'); const pr=$('#p-receb-wrap input[value="pastor"]'); if(pr) pr.checked=true; }
  $('#f-nome').value=rec?rec.nome:'';
  $('#f-telefone').value=rec?(rec.telefone||''):'';
  const estAtual = rec?(rec.camisaEstado||0):0;
  $('#f-camisa-txt').textContent=t(estKey(estAtual));
  $('#f-camisa-txt').style.color=estColor(estAtual);
  const camDateEl=$('#f-camisa-date');
  if(camDateEl){
    const showDate = (estAtual===EST.ENTREGUE && rec && rec.datas && rec.datas[EST.ENTREGUE]);
    camDateEl.textContent = showDate ? ('· '+fmtDMY(rec.datas[EST.ENTREGUE])) : '';
  }
  $('#camisaStatusLine').dataset.pid = rec?rec.id:'';
  $('#f-revisar').checked=rec?!!rec.aRevisar:false;
  $('#f-obs').value=rec?(rec.observacoes||''):'';
  $('#f-orig').textContent=rec?(rec.textoOriginal||'—'):'—';
  updateRevisarVis();
  updateCamisaStatusVis(rec);
  const restanteOpen=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  $('#p-valor').value = restanteOpen>0 ? String(restanteOpen) : ''; $('#p-data').value=hoje();
  $('#del').classList.toggle('hidden', !rec);
  const isEl=$('#f-isento'); if(isEl){ isEl.checked = rec?!!rec.isento:false; }
  updateIsentoVis();
  renderPays();
  applyModalRO('#modal', effectiveRole()==='viewer', ['#save','#del','#addPay']);
  // timestamp criado/atualizado (só ao editar registro existente; criado em branco se não houver)
  const tsEl=$('#modalTs');
  if(tsEl){
    const bits=[];
    if(rec && rec.criadoEm) bits.push(t('tsCriado')+' '+fmtStampCurto(rec.criadoEm));
    if(rec && rec.atualizadoEm && (!rec.criadoEm || fmtStampCurto(rec.atualizadoEm)!==fmtStampCurto(rec.criadoEm))) bits.push(t('tsAtual')+' '+fmtStampCurto(rec.atualizadoEm));
    tsEl.textContent = bits.join(' · ');
    tsEl.classList.toggle('hidden', bits.length===0);
  }
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
// edita a data (campo 'data' ou 'dataEntregaTesoureiro') de um pagamento via seletor nativo
// item 7: Revisar aparece se há texto na Observação OU já está marcado
function updateRevisarVis(){
  const line=$('#revisarLine'); if(!line) return;
  const hasObs=!!($('#f-obs').value||'').trim();
  const marked=$('#f-revisar').checked;
  line.classList.toggle('hidden', !(hasObs || marked));
}
// item 8: Estado da camisa aparece só quando pago (>=COTA) E já salvo (editando registro existente)
function updateCamisaStatusVis(rec){
  const line=$('#camisaStatusLine'); if(!line) return;
  const soma=state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  const isento = $('#f-isento') && $('#f-isento').checked;
  const podeProd = isento || soma>=COTA;    // pago OU isento libera a confecção
  line.classList.toggle('hidden', !podeProd);
}
$('#f-obs') && ($('#f-obs').addEventListener('input', updateRevisarVis));

// ---- comprovante por parcela (Cartão/Outros) ----
let payFotoTargetIdx=null;   // índice da parcela cujo botão + foi tocado
// normaliza um item de p.fotos (string URL do JSON  OU  objeto {url}/{dataUrl,kind})
function normFoto(f){ return (typeof f==='string') ? {url:f} : (f||{}); }
// HTML da linha de comprovante de UMA parcela (só Cartão/Outros); thumbs + add até 3 + contador
function fotosRowHtml(p, idx){
  const tipo=String(p.tipo||'');
  if(tipo!=='Cartão' && tipo!=='Outros') return '';   // só Cartão/Outros
  const arr=Array.isArray(p.fotos)?p.fotos:[];
  const thumbs=arr.map((raw,fi)=>{
    const f=normFoto(raw);
    if(f.kind==='pdf'){
      return `<div class="foto-thumb pdf pf-open" data-p="${idx}" data-f="${fi}">${_pdfSvg}<small>PDF</small><button type="button" class="pf-rm" data-p="${idx}" data-f="${fi}">×</button></div>`;
    }
    const src=f.dataUrl||thumbFromUrl(f.url);
    return `<div class="foto-thumb"><img src="${src}" alt="anexo" class="pf-open" data-p="${idx}" data-f="${fi}"><button type="button" class="pf-rm" data-p="${idx}" data-f="${fi}">×</button></div>`;
  }).join('');
  const podeAnexar = effectiveRole()!=='viewer';   // viewer não anexa (read-only); só vê as miniaturas
  const addBtn = (podeAnexar && arr.length<3) ? (arr.length===0
      ? `<span class="pay-anexar pf-add" data-p="${idx}">📎 ${t('anexarComprovante')}</span>`
      : `<div class="pay-add pf-add" data-p="${idx}">＋<small>add</small></div>`) : '';
  const cnt = `<span class="pay-cnt">${arr.length}/3</span>`;
  return `<div class="pay-fotos">${thumbs}${addBtn}${cnt}</div>`;
}

function renderPays(){
  const soma=state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  const falta=COTA-soma;
  const canDeliver = (effectiveRole()==='admin' || effectiveRole()==='tesoureiro') && !isImpersonating();
  const calSvg='<svg viewBox="0 0 24 24"><path d="M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zm12 7v10H5V9h14z"/></svg>';
  const dateChip=(idx,field,iso)=>`<span class="pay-date"><span class="dc-ico">${calSvg}</span><span class="dc-txt">${fmtDMY(iso)}</span><input type="date" class="dc-in" data-i="${idx}" data-f="${field}" value="${toISODate(iso)}"></span>`;
  $('#paysList').innerHTML=state.draftPays.map((p,idx)=>{
    const isCash = (p.tipo==='Dinheiro');
    let deliverRow='';
    if(isCash){
      const recebPastor = (p.recebidoPor!=='tesoureiro'); // default pastor
      if(recebPastor){
        const on = !!p.entregueTesoureiro;
        deliverRow = `<div class="pay-deliver">
          <input type="checkbox" class="pdeliver" data-i="${idx}" ${on?'checked':''} ${canDeliver?'':'disabled'}>
          <span>${t('entregueTesoureiro')}</span>
          ${on?dateChip(idx,'dataEntregaTesoureiro',p.dataEntregaTesoureiro||hoje()):''}
        </div>`;
      } else {
        deliverRow = `<div class="pay-deliver"><span>${t('recebidoDireto')}</span></div>`;
      }
    }
    return `<div class="pay">
      <div class="pay-main">
        <span class="vt">${p.valor}€ · ${esc(p.tipo||'—')}${p.tipo==='Outros'&&p.nota?' ('+esc(p.nota)+')':''}</span>
        ${dateChip(idx,'data',p.data||hoje())}
        <button class="del" data-i="${idx}">×</button>
      </div>
      ${deliverRow}
      ${fotosRowHtml(p, idx)}
    </div>`;
  }).join('');
  $$('#paysList .del').forEach(b=>b.onclick=()=>{state.draftPays.splice(+b.dataset.i,1);renderPays();});
  // comprovante por parcela: remover / abrir / adicionar
  $$('#paysList .pf-rm').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation(); const pi=+b.dataset.p, fi=+b.dataset.f; const p=state.draftPays[pi]; if(p&&Array.isArray(p.fotos)){ p.fotos.splice(fi,1); renderPays(); } });
  $$('#paysList .pf-open').forEach(im=>im.onclick=()=>{ const pi=+im.dataset.p, fi=+im.dataset.f; const p=state.draftPays[pi]; if(p&&p.fotos&&p.fotos[fi]) openFoto(normFoto(p.fotos[fi])); });
  $$('#paysList .pf-add').forEach(b=>b.onclick=()=>{ const pi=+b.dataset.p; const p=state.draftPays[pi]; if(!Array.isArray(p.fotos)) p.fotos=[]; if(p.fotos.length>=3){ toast(t('maxFotos'),'info'); return; } payFotoTargetIdx=pi; $('#p-fotoInput').click(); });
  $$('#paysList .pdeliver').forEach(cb=>cb.onchange=()=>{
    const i=+cb.dataset.i; const p=state.draftPays[i];
    if(cb.checked){ p.entregueTesoureiro=true; p.dataEntregaTesoureiro=hoje(); }
    else { p.entregueTesoureiro=false; p.dataEntregaTesoureiro=''; }
    renderPays();
  });
  // editar datas (input date transparente sobreposto ao texto)
  $$('#paysList .dc-in').forEach(el=>el.onchange=()=>{ if(el.value){ state.draftPays[+el.dataset.i][el.dataset.f]=el.value; renderPays(); } });
  const box=$('#saldoBox');
  if(soma>=COTA){ box.style.background='var(--soft-green)';box.style.color='var(--green)';box.textContent=t('saldoPago'); }
  else if(soma>0){ box.style.background='var(--soft-amber)';box.style.color='var(--amber)';box.textContent=t('saldoFalta',{v:falta}); }
  else { box.style.background='var(--soft-grey)';box.style.color='var(--grey)';box.textContent=t('saldoPend'); }
  // esconde a área de adicionar pagamento quando a cota já está completa OU o inscrito é isento
  const isentoNow = $('#f-isento') && $('#f-isento').checked;
  const ap=$('#payFields'); if(ap) ap.classList.toggle('hidden', isentoNow || soma>=COTA);
  // a linha (titulo + checkbox Isento) some quando pago e NAO isento (mantem acessivel p/ marcar isento se ainda nao pagou)
  const head=$('#addPayHead'); if(head) head.classList.toggle('hidden', !isentoNow && soma>=COTA);
}
// Isento: esconde os campos de pagamento (mantém o checkbox visível); mostra nota discreta
function updateIsentoVis(){
  const on = $('#f-isento') && $('#f-isento').checked;
  const soma = state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  const pl=$('#paysList'); if(pl) pl.classList.toggle('hidden', on);
  const sb=$('#saldoBox'); if(sb) sb.classList.toggle('hidden', on);
  const pf=$('#payFields'); if(pf) pf.classList.toggle('hidden', on || soma>=COTA);
  const nota=$('#isentoNota'); if(nota) nota.classList.toggle('hidden', !on);
  const ttl=$('#addPayTitle'); if(ttl) ttl.classList.toggle('hidden', on);  // esconde "Adicionar pagamento" quando isento
  // a linha (titulo + checkbox Isento) some quando a cota ja esta completa e NAO e isento
  const head=$('#addPayHead'); if(head) head.classList.toggle('hidden', !on && soma>=COTA);
  const ap=$('#addPaySub'); if(ap) ap.classList.remove('hidden');  // sempre visível (contém o checkbox)
}
$('#f-isento') && ($('#f-isento').onchange=()=>{ updateIsentoVis(); updateCamisaStatusVis(); });
$('#addPay').onclick=()=>{
  const v=parseFloat(($('#p-valor').value||'').replace(',','.'));
  if(!v||v<=0) return;
  const tipo=$('#p-tipo').value;
  const nota=(tipo==='Outros')? ($('#p-comentario').value||'').trim() : '';
  if(tipo==='Outros' && !nota){ toast(t('comentarioObrigatorio'),'info'); const c=$('#p-comentario'); if(c) c.focus(); return; }
  const pay={valor:v,tipo,data:$('#p-data').value||hoje(),nota};
  if(tipo==='Dinheiro'){
    const rb=$('#p-receb-wrap input[name="p-recebido"]:checked');
    pay.recebidoPor = rb? rb.value : 'pastor';
    // se recebido direto pelo tesoureiro, já conta como entregue
    if(pay.recebidoPor==='tesoureiro'){ pay.entregueTesoureiro=true; pay.dataEntregaTesoureiro=pay.data; }
  }
  state.draftPays.push(pay);
  const restante=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  $('#p-valor').value = restante>0 ? String(restante) : '';
  $('#p-data').value=hoje();
  $('#p-comentario').value='';
  renderPays();
};
// mostra o campo de comentário só quando "Outros"
document.addEventListener('change',(e)=>{ if(e.target && e.target.id==='p-tipo'){ $('#p-outros-wrap').classList.toggle('hidden', e.target.value!=='Outros'); const rw=$('#p-receb-wrap'); if(rw) rw.classList.toggle('hidden', e.target.value!=='Dinheiro'); } });
// comprovante de uma parcela específica (Cartão/Outros)
$('#p-fotoInput') && ($('#p-fotoInput').onchange=async(e)=>{
  const file=e.target.files && e.target.files[0]; const pi=payFotoTargetIdx; e.target.value=''; payFotoTargetIdx=null;
  if(!file || pi==null) return;
  const p=state.draftPays[pi]; if(!p) return;
  if(!Array.isArray(p.fotos)) p.fotos=[];
  if(p.fotos.length>=3){ toast(t('maxFotos'),'info'); return; }
  try{ const anexo=await processAnexo(file); if(anexo){ p.fotos.push(anexo); renderPays(); } }
  catch(err){ toast(err && err.message ? err.message : 'Erro ao processar o anexo','err'); }
});
$('#save').onclick=async()=>{
  if(writeBlocked()) return;
  const nome=$('#f-nome').value.trim();
  if(!nome){ toast(t('nomeObrig'),'info'); return; }
  const isento = !!($('#f-isento') && $('#f-isento').checked);
  // reforço defensivo: valor de pagamento digitado mas NÃO adicionado
  // (ignora o "restante" auto-preenchido — só avisa se o usuário digitou algo diferente)
  const pv=parseFloat(($('#p-valor').value||'').replace(',','.'));
  const restanteAtual=COTA-state.draftPays.reduce((a,p)=>a+(+p.valor||0),0);
  if(!isento && pv && pv>0 && Math.abs(pv-restanteAtual)>0.001){
    if(await confirmDialog(t('pagamentoNaoAddT'), t('pagamentoNaoAdicionado'), {perigo:false, okText:t('adicionarESalvar'), cancelText:t('salvarSemAdd')})){ $('#addPay').click(); }
  }
  // sobe comprovantes pendentes de CADA parcela (Cartão/Outros) antes de gravar; aborta se falhar
  if(!isento){
    const btn=$('#save'); const orig=(btn.querySelector('span')?btn.querySelector('span').textContent:btn.textContent);
    const temPendente = state.draftPays.some(p=>Array.isArray(p.fotos) && p.fotos.some(f=>f&&typeof f==='object'&&!f.url&&f.dataUrl));
    if(temPendente){
      btn.disabled=true; btnLabel(btn, t('enviandoFoto'));
      for(const p of state.draftPays){
        if(!Array.isArray(p.fotos) || !p.fotos.length) continue;
        // normaliza para objetos, sobe pendentes
        p.fotos = p.fotos.map(normFoto);
        const up=await uploadPendentes(p.fotos);
        if(!up.ok){ btn.disabled=false; btnLabel(btn, orig); toast(up.error==='offline'? t('fotoSemConexao') : (t('fotoFalhou')+' ('+up.error+')'),'err'); return; }
      }
      btn.disabled=false; btnLabel(btn, orig);
    }
    // serializa cada parcela: fotos = array de URLs (o pagamentos_json guarda só URLs)
    state.draftPays.forEach(p=>{ if(Array.isArray(p.fotos)){ p.fotos = p.fotos.map(f=> (typeof f==='string'? f : (f&&f.url)) ).filter(Boolean); if(!p.fotos.length) delete p.fotos; } });
  }
  const all=await getAll();
  let rec=state.editing?all.find(x=>x.id===state.editing):{cota:COTA,textoOriginal:''};
  rec.numero=$('#f-numero').value.trim();
  if(!rec.numero){ const n=await maxPlusOneNumber(); rec.numero=String(n).padStart(2,'0'); }
  rec.nome=nome;
  rec.telefone=$('#f-telefone').value.trim();
  rec.tamanho=$('#f-tamanho').value;
  rec.cota=COTA;
  rec.isento=isento;
  rec.pagamentos=isento? [] : state.draftPays;   // isento não tem pagamentos
  if(rec.camisaEstado===undefined) rec.camisaEstado=0;
  rec.aRevisar=$('#f-revisar').checked;
  rec.observacoes=$('#f-obs').value.trim();
  if(!('motivoRevisar' in rec)) rec.motivoRevisar='';
  if(!rec.criadoEm) rec.criadoEm=new Date().toISOString();   // só na 1ª vez (criação)
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await put(rec);
  markPending(rec.id!=null?rec.id:newId);
  closeModal(); refresh();
  if(ONLINE_ENABLED) syncNow();
};
$('#del').onclick=async()=>{ if(!state.editing) return; if(!(await confirmDialog(t('excluirGideaoT'), t('confirmDel'), {perigo:true}))) return; const id=state.editing; await del(id); markPendingDel(id); closeModal(); refresh(); if(ONLINE_ENABLED) syncNow(); };
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
function closeModal(){
  $('#modal').classList.add('hidden');
  const fromExtrato = !!extReturn;   // capturar antes de backToExtratoIfNeeded limpar
  // se o modal foi aberto a partir da lista (não do extrato), lembra o card para destacar ao voltar
  if(!fromExtrato && state.editing!=null) state.listHighlight=state.editing;
  state.editing=null; state.draftPays=[]; state.formSnapshot=undefined;
  backToExtratoIfNeeded();
}
// fecha o modal do Gideão; se houver alterações não salvas, pergunta antes
function tryCloseModal(){
  if(formDirty()){ $('#formConfirm').classList.remove('hidden'); }
  else { closeModal(); refresh(); }
}
$('#fcSave').onclick=async()=>{
  const nome=$('#f-nome').value.trim();
  if(!nome){ toast(t('nomeObrig'),'info'); return; }
  $('#formConfirm').classList.add('hidden');
  $('#save').click();
};
$('#fcDiscard').onclick=()=>{ $('#formConfirm').classList.add('hidden'); closeModal(); refresh(); };
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
  // --- Despesas e Movimentacoes (Caixa) ---
  const despesas=await sGetAll(STORE_DESP);
  const movimentos=await sGetAll(STORE_MOV);
  const despHead=['Descricao','Valor','Data','Categoria','Bolso','Obs'];
  const despRows=despesas.slice().sort((a,b)=>(a.data||'').localeCompare(b.data||'')).map(d=>[
    d.descricao||'', d.valor||0, d.data||'', d.categoria||'', BOLSO_LABEL[d.bolso]||d.bolso||'', (d.obs||'').replace(/\n/g,' ')]);
  const movHead=['De','Para','Valor','Data','Comentario'];
  const movRows=movimentos.slice().sort((a,b)=>(a.data||'').localeCompare(b.data||'')).map(m=>[
    BOLSO_LABEL[m.de]||m.de||'', BOLSO_LABEL[m.para]||m.para||'', m.valor||0, m.data||'', (m.comentario||'').replace(/\n/g,' ')]);
  const csvRow=r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(';');
  const blocks=[];
  blocks.push('# '+(t('navInscritos')||'Inscritos')); blocks.push([head,...rows].map(csvRow).join('\r\n'));
  blocks.push(''); blocks.push('# '+t('despesas')); blocks.push([despHead,...despRows].map(csvRow).join('\r\n'));
  blocks.push(''); blocks.push('# '+t('movimentacoes')); blocks.push([movHead,...movRows].map(csvRow).join('\r\n'));
  const csv='\uFEFF'+blocks.join('\r\n');
  download('gideao300.csv',csv,'text/csv;charset=utf-8');
}
async function backup(){
  const all=await getAll();
  const despesas=await sGetAll(STORE_DESP);
  const movimentos=await sGetAll(STORE_MOV);
  download('gideao300-backup-'+new Date().toISOString().slice(0,10)+'.json',
    JSON.stringify({projeto:'Projeto Gideão 300',cota:COTA,exportadoEm:new Date().toISOString(),inscritos:all,despesas:despesas,movimentos:movimentos},null,2),
    'application/json');
}
$('#btnExportXlsx').onclick=exportCsv;
$('#btnBackup').onclick=backup;
async function buildPrint(){
  const all=(await getAll()).sort((a,b)=>numOrder(a.numero)-numOrder(b.numero)||a.nome.localeCompare(b.nome));
  const rows=all.map(i=>{
    const soma=somaPago(i), st=statusPag(i);
    const stTxt=st==='pago'?t('sPago'):st==='parcial'?t('faltam',{v:i.cota-soma}):t('sPend');
    const camisa = podeProduzir(i) ? t(estKey(i.camisaEstado||0)) : t('pendPag');
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
  if(!(await confirmDialog(t('restaurarBackupT'), t('confirmRestore'), {perigo:true, okText:t('restaurar')}))){ e.target.value=''; return; }
  const txt=await f.text();
  // 1) valida o JSON ANTES de tocar em qualquer dado (se invalido, nada e apagado)
  let arr, despIn, movIn;
  try{
    const data=JSON.parse(txt);
    arr=data.inscritos||data;
    if(!Array.isArray(arr)) throw new Error('formato');
    despIn = Array.isArray(data.despesas)? data.despesas : [];
    movIn  = Array.isArray(data.movimentos)? data.movimentos : [];
  }catch(err){ toast(t('jsonInvalido'),'err'); e.target.value=''; return; }
  try{
    setSync('syncing');
    // 2) normaliza e repovoa a base LOCAL (o backup restaurado e a nova verdade)
    const base=arr.map((i,idx)=>({...i,
      id: idx+1,
      cota: i.cota||COTA,
      camisaEstado: (i.camisaEstado===undefined?0:i.camisaEstado),
      datas: i.datas||{}
    }));
    await clearAll(); clearPending();
    for(const i of base){ await put(i); }
    // 2b) repovoa despesas e movimentacoes (backup completo)
    await sClear(STORE_DESP); await sClear(STORE_MOV);
    localStorage.removeItem('gd_pending_cx');
    for(const d of despIn){ await sPut(STORE_DESP, d); }
    for(const m of movIn){ await sPut(STORE_MOV, m); }
    // 3) empurra para o servidor como FULL-REPLACE atomico (reset), para o pull nao sobrescrever depois
    if(ONLINE_ENABLED && auth.idToken && navigator.onLine){
      const first=base.slice(0,40), rest=base.slice(40);
      // o 1o POST com reset:true zera inscritos+despesas+movimentos e ja sobe as colecoes financeiras
      const r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({token:CFG.SYNC_TOKEN, idToken:auth.idToken, reset:true, inscritos:first, despesas:despIn, movimentos:movIn})}, 30000);
      const data=await r.json(); if(!data.ok) throw new Error(data.error||'reset_failed');
      if(rest.length) await pushAll(rest);
      await pull();                 // reconcilia: agora servidor == base restaurada
      setSync('ok');
    } else {
      // offline: marca TODOS como pendentes; o proximo sync faz push ANTES do pull (nao sobrescreve)
      for(const i of base){ markPending(i.id); }
      for(const d of despIn){ markPendingKV('desp', d.id); }
      for(const m of movIn){ markPendingKV('mov', m.id); }
      setSync('pend');
    }
    refresh(); toast(t('okRestaurado', {n:base.length}),'ok');
  }catch(err){ setSync('err'); toast(t('erroRestaurar')+': '+err.message,'err'); }
  e.target.value='';
};

/* ---------- navegação / idioma ---------- */
/* ---------- CAIXA (financeiro, só admin) ---------- */
const CATEGORIAS=['Camisas','Material','Outros'];
const BOLSO_LABEL={dinheiro:'Dinheiro',banco:'Banco',outros:'Outros'};
let caixaState={ despesas:[], movimentos:[], estoque:[], tab:'despesas', editDesp:null, editMov:null, draftFotos:[], draftFotosMov:[], sortDesc:true };
function eur(n){ return (Math.round((+n||0)*100)/100).toLocaleString('pt-PT')+' €'; }

async function loadCaixa(){
  caixaState.despesas = await sGetAll(STORE_DESP);
  caixaState.movimentos = await sGetAll(STORE_MOV);
  caixaState.estoque = await sGetAll(STORE_EST);
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
  // item 7: quebra do dinheiro por custódia
  const cp=$('#cashPastor'); if(cp) cp.textContent=eur(c.cashPastor||0);
  const ct=$('#cashTeso'); if(ct) ct.textContent=eur(c.cashTeso||0);
  // selo somente-leitura: só quando o usuário não pode NADA na Caixa (nem adicionar despesa)
  const ro=$('#cxReadonly'); if(ro) ro.classList.toggle('hidden', !!auth.podeAddDespesa);
  renderCaixaTabs(); renderCaixaList(c);
}
let cashSplitOpen=false;
$('#cashSplitHead') && ($('#cashSplitHead').onclick=()=>{
  cashSplitOpen=!cashSplitOpen;
  const lines=$('#cashLines'); if(lines) lines.classList.toggle('hidden', !cashSplitOpen);
  const head=$('#cashSplitHead'); if(head) head.classList.toggle('open', cashSplitOpen);
});
function renderCaixaTabs(){
  $$('#cxTabs .tab2').forEach(el=>{ el.classList.toggle('on', el.dataset.cx===caixaState.tab); el.onclick=()=>{ caixaState.tab=el.dataset.cx; renderCaixa(); updateFabCaixa(); }; });
  const lbl=$('#cxSortLbl'); if(lbl) lbl.textContent = caixaState.sortDesc? t('maisRecente') : t('maisAntigo');
}
$('#cxSortBtn') && ($('#cxSortBtn').onclick=()=>{ caixaState.sortDesc=!caixaState.sortDesc; renderCaixa(); });
function renderCaixaList(){
  const el=$('#cxList');
  const cmpDate=(a,b)=>{ const r=(a.data||'').localeCompare(b.data||''); return caixaState.sortDesc? -r : r; };
  if(caixaState.tab==='despesas'){
    const arr=caixaState.despesas.slice().sort(cmpDate);
    if(!arr.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; return; }
    el.innerHTML=arr.map(d=>{ const susp=(d.status==='suspenso'); return `<div class="cx-item${susp?' susp':''}" data-id="${d.id}" data-k="desp:${d.id}">
      <div><div class="desc">${susp?`<span class="selo-susp">${t('suspensa')}</span>`:''}${esc(d.descricao||'—')}</div><div class="meta">${fmtShort(d.data)} · ${esc(BOLSO_LABEL[d.bolso]||d.bolso||'')}${d.categoria?' · '+esc(d.categoria):''}${d.obs?' · '+esc(d.obs):''}${(d.fotos&&d.fotos.length)?' · 📷'+d.fotos.length:''}</div></div>
      <div class="amt out">−${eur(d.valor)}</div></div>`; }).join('');
    el.querySelectorAll('.cx-item').forEach(it=>it.onclick=()=>{ cxHighlight=it.dataset.k; extHighlight=null; openDesp(+it.dataset.id); });
  } else {
    const arr=caixaState.movimentos.slice().sort(cmpDate);
    if(!arr.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; return; }
    el.innerHTML=arr.map(m=>`<div class="cx-item" data-id="${m.id}" data-k="mov:${m.id}">
      <div><div class="desc">${esc(BOLSO_LABEL[m.de]||m.de)} → ${esc(BOLSO_LABEL[m.para]||m.para)}</div><div class="meta">${fmtShort(m.data)}${m.comentario?' · '+esc(m.comentario):''}</div></div>
      <div class="amt mov">${eur(m.valor)}</div></div>`).join('');
    el.querySelectorAll('.cx-item').forEach(it=>it.onclick=()=>{ cxHighlight=it.dataset.k; extHighlight=null; openMov(+it.dataset.id); });
  }
  // highlight + scroll do lançamento de onde viemos (ao voltar do modal)
  if(cxHighlight){
    const item=el.querySelector(`.cx-item[data-k="${cxHighlight}"]`);
    if(item){
      item.classList.add('hl');
      requestAnimationFrame(()=>{ try{ item.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){ item.scrollIntoView(); } });
      const k=cxHighlight;
      setTimeout(()=>{ const i2=el.querySelector(`.cx-item[data-k="${k}"]`); if(i2) i2.classList.remove('hl'); }, 3000);
    }
    cxHighlight=null;
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
  // origem de custódia (só quando bolso = Dinheiro): pastor/tesoureiro
  const orig = (d && d.origemCusto==='pastor') ? 'pastor' : 'tesoureiro';
  $$('#despModal input[name="d-origem"]').forEach(r=>{ r.checked=(r.value===orig); });
  updateOrigemVis();
  $('#d-obs').value = d? (d.obs||'') : '';
  caixaState.draftFotos = (d && Array.isArray(d.fotos)) ? d.fotos.map(u=>({url:u})) : [];
  renderDraftFotos();
  // user pode criar/editar despesa (nao deletar). Managers (admin/tesoureiro) podem tudo.
  const despRO = !auth.podeAddDespesa;                       // read-only só se nem adicionar pode (viewer nunca chega aqui)
  const suspensa = !!(d && d.status==='suspenso');
  // Suspender: despesa existente ativa, quem pode editar despesa (pastora+mgr)
  $('#despSuspend').classList.toggle('hidden', !(d && !suspensa && auth.podeAddDespesa));
  // Reativar: despesa existente suspensa, quem pode editar
  $('#despReactivate').classList.toggle('hidden', !(d && suspensa && auth.podeAddDespesa));
  // Excluir (hard delete): só admin/tesoureiro
  $('#despDel').classList.toggle('hidden', !d || !auth.podeCaixaMgr);
  $('#despModal').classList.remove('hidden');
  applyModalRO('#despModal', despRO, ['#despSave','#d-addFoto']);
}
// modo somente-leitura para modais da Caixa: desabilita campos e esconde botoes de acao
function applyModalRO(modalSel, ro, actionBtns){
  const m=$(modalSel); if(!m) return;
  m.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=ro; });
  (actionBtns||[]).forEach(sel=>{ const b=$(sel); if(b) b.classList.toggle('hidden', ro); });
}
function bolsoFromLabel(lbl){ for(const b of BOLSOS){ if(BOLSO_LABEL[b]===lbl) return b; } return 'banco'; }
// mostra o seletor "Saiu de" só quando o bolso da despesa é Dinheiro
function updateOrigemVis(){
  const row=$('#d-origemRow'); if(!row) return;
  const b=bolsoFromLabel($('#d-bolso').value);
  row.classList.toggle('hidden', b!=='dinheiro');
}
$('#d-bolso') && ($('#d-bolso').addEventListener('change', updateOrigemVis));
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
  const pdfSvg='<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm-1 7V3.5L18.5 9z"/></svg>';
  el.innerHTML=fotosGridHtml(caixaState.draftFotos||[]);
  wireFotosGrid(el, caixaState.draftFotos, renderDraftFotos);
  const addBtn=$('#d-addFoto'); if(addBtn) addBtn.style.display=(caixaState.draftFotos.length>=3)?'none':'block';
}
// ---- helpers reutilizáveis de anexo (foto/PDF) — usados por Despesas, Movimentações e Pagamentos ----
const _pdfSvg='<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zm-1 7V3.5L18.5 9z"/></svg>';
function fotosGridHtml(arr){
  return (arr||[]).map((f,idx)=>{
    if(f.kind==='pdf'){
      return `<div class="foto-thumb pdf foto-open" data-i="${idx}">${_pdfSvg}<small>PDF</small><button type="button" class="rm" data-i="${idx}">×</button></div>`;
    }
    const src = f.dataUrl || thumbFromUrl(f.url);
    return `<div class="foto-thumb"><img src="${src}" alt="anexo" class="foto-open" data-i="${idx}"><button type="button" class="rm" data-i="${idx}">×</button></div>`;
  }).join('');
}
function wireFotosGrid(el, arr, rerender){
  el.querySelectorAll('.rm').forEach(b=>b.onclick=(ev)=>{ ev.stopPropagation(); arr.splice(+b.dataset.i,1); rerender(); });
  el.querySelectorAll('.foto-open').forEach(im=>im.onclick=()=>{ openFoto(arr[+im.dataset.i]); });
}
// sobe os anexos pendentes (dataUrl sem url) de um array para o Drive; retorna {ok, error}
async function uploadPendentes(arr){
  const pendentes=(arr||[]).filter(f=>!f.url && f.dataUrl);
  if(!pendentes.length) return {ok:true};
  if(!ONLINE_ENABLED || !auth.idToken || !navigator.onLine){ return {ok:false, error:'offline'}; }
  for(const f of pendentes){
    let d=null, err=null;
    try{
      const resp=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({token:CFG.SYNC_TOKEN, idToken:auth.idToken, action:'upload', dataUrl:f.dataUrl, filename:(f.filename || ('comprovante_'+Date.now()+(f.kind==='pdf'?'.pdf':'.jpg')))})}, 45000);
      try{ d=await resp.json(); }catch(_){ err='resposta inválida do servidor'; }
    }catch(e){ err=e && e.message ? e.message : 'falha de rede'; }
    if(!d || !d.ok || !d.url){ return {ok:false, error:(err || (d&&d.error) || 'upload')}; }
    f.url=d.url; delete f.dataUrl;   // sucesso confirmado
  }
  return {ok:true};
}
// render do grid de fotos da MOVIMENTAÇÃO
function renderDraftFotosMov(){
  const el=$('#m-fotos'); if(!el) return;
  el.innerHTML=fotosGridHtml(caixaState.draftFotosMov||[]);
  wireFotosGrid(el, caixaState.draftFotosMov, renderDraftFotosMov);
  const addBtn=$('#m-addFoto'); if(addBtn) addBtn.style.display=(caixaState.draftFotosMov.length>=3)?'none':'block';
}
function openFoto(f){
  if(!f) return;
  if(f.url){ window.open(f.url, '_blank'); return; }   // já no Drive -> abre em nova aba
  if(f.kind==='pdf'){ try{ window.open(f.dataUrl, '_blank'); }catch(e){} return; }  // pdf local -> abre em aba
  // imagem local (ainda não enviada) -> lightbox com o dataUrl
  const lb=$('#fotoLightbox'), img=$('#fotoLightImg');
  if(lb && img){ img.src=f.dataUrl; lb.classList.remove('hidden'); }
}
function thumbFromUrl(url){ if(!url) return ''; const m=url.match(/\/d\/([^/]+)\//); return m? ('https://drive.google.com/thumbnail?id='+m[1]) : url; }
$('#fotoLightClose') && ($('#fotoLightClose').onclick=()=>$('#fotoLightbox').classList.add('hidden'));
$('#fotoLightbox') && ($('#fotoLightbox').addEventListener('click',e=>{ if(e.target.id==='fotoLightbox') $('#fotoLightbox').classList.add('hidden'); }));
$('#d-addFoto') && ($('#d-addFoto').onclick=()=>{ if((caixaState.draftFotos||[]).length>=3){ toast(t('maxFotos'),'info'); return; } $('#d-fotoInput').click(); });
$('#d-fotoInput') && ($('#d-fotoInput').onchange=async(e)=>{
  const file=e.target.files && e.target.files[0]; if(!file) return;
  try{ const anexo=await processAnexo(file); if(anexo){ caixaState.draftFotos.push(anexo); renderDraftFotos(); } }
  catch(err){ toast(err && err.message ? err.message : 'Erro ao processar o anexo','err'); }
  e.target.value='';
});
$('#m-addFoto') && ($('#m-addFoto').onclick=()=>{ if((caixaState.draftFotosMov||[]).length>=3){ toast(t('maxFotos'),'info'); return; } $('#m-fotoInput').click(); });
$('#m-fotoInput') && ($('#m-fotoInput').onchange=async(e)=>{
  const file=e.target.files && e.target.files[0]; if(!file) return;
  try{ const anexo=await processAnexo(file); if(anexo){ caixaState.draftFotosMov.push(anexo); renderDraftFotosMov(); } }
  catch(err){ toast(err && err.message ? err.message : 'Erro ao processar o anexo','err'); }
  e.target.value='';
});
// processa um arquivo (imagem OU pdf) -> {dataUrl, kind:'img'|'pdf', filename}
// imagem: comprime via canvas; pdf: lê direto, valida tamanho (~5MB). Reutilizável (despesas/mov/pagamentos).
const MAX_PDF_BYTES = 5*1024*1024;
async function processAnexo(file){
  const isPdf = file.type==='application/pdf' || /\.pdf$/i.test(file.name||'');
  if(isPdf){
    if(file.size > MAX_PDF_BYTES){ throw new Error(t('pdfGrande')); }
    const dataUrl = await new Promise((res,rej)=>{ const fr=new FileReader(); fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(file); });
    return { dataUrl, kind:'pdf', filename:(file.name||('comprovante_'+Date.now()+'.pdf')) };
  }
  // imagem
  const dataUrl = await compressImage(file, 1280, 0.7);
  return { dataUrl, kind:'img', filename:('comprovante_'+Date.now()+'.jpg') };
}
$('#despSave') && ($('#despSave').onclick=async()=>{
  if(writeBlocked()) return;
  const desc=$('#d-desc').value.trim(); const v=parseFloat(($('#d-valor').value||'').replace(',','.'));
  if(!desc||!v||v<=0){ toast(t('nomeObrig'),'info'); return; }
  // sobe fotos novas (dataUrl) para o Drive -> obtém URLs
  const btn=$('#despSave'); const orig=(btn.querySelector('span')?btn.querySelector('span').textContent:btn.textContent);
  // valida upload das fotos ANTES de salvar; se alguma falhar, aborta e avisa (não finge que subiu)
  if((caixaState.draftFotos||[]).some(f=>!f.url && f.dataUrl)){
    btn.disabled=true; btnLabel(btn, t('enviandoFoto'));
    const up=await uploadPendentes(caixaState.draftFotos);
    btn.disabled=false; btnLabel(btn, orig);
    if(!up.ok){ toast(up.error==='offline'? t('fotoSemConexao') : (t('fotoFalhou')+' ('+up.error+')'),'err'); return; }
  }
  const all=caixaState.despesas; let rec=caixaState.editDesp? all.find(x=>x.id===caixaState.editDesp):{};
  rec.descricao=desc; rec.valor=v; rec.data=$('#d-data').value||hoje(); rec.categoria=$('#d-categoria').value;
  rec.bolso=bolsoFromLabel($('#d-bolso').value); rec.obs=$('#d-obs').value.trim();
  // origem de custódia só faz sentido para dinheiro; senao limpa
  if(rec.bolso==='dinheiro'){ const sel=$('#despModal input[name="d-origem"]:checked'); rec.origemCusto = sel? sel.value : 'tesoureiro'; }
  else { rec.origemCusto=''; }
  rec.fotos=(caixaState.draftFotos||[]).map(f=>f.url).filter(Boolean);
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await sPut(STORE_DESP, rec); markPendingKV('desp', rec.id!=null?rec.id:newId);
  $('#despModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow();
});
$('#despDel') && ($('#despDel').onclick=async()=>{ if(!caixaState.editDesp) return; if(!(await confirmDialog(t('excluirDespT'), t('confirmDelDesp'), {perigo:true}))) return; await sDel(STORE_DESP, caixaState.editDesp); markPendingKV('desp_del', caixaState.editDesp); $('#despModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow(); });
// Suspender (soft delete): marca status='suspenso' — fica no histórico, sai do saldo
$('#despSuspend') && ($('#despSuspend').onclick=async()=>{
  if(writeBlocked() || !caixaState.editDesp) return;
  if(!(await confirmDialog(t('suspenderDespT'), t('confirmSuspenderDesp'), {perigo:false, okText:t('suspender')}))) return;
  const rec=caixaState.despesas.find(x=>x.id===caixaState.editDesp); if(!rec) return;
  rec.status='suspenso'; rec.suspensoPor=auth.email||''; rec.suspensoEm=new Date().toISOString();
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  await sPut(STORE_DESP, rec); markPendingKV('desp', rec.id);
  $('#despModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow();
  toast(t('despSuspensa'),'info');
});
// Reativar: volta status para ativo
$('#despReactivate') && ($('#despReactivate').onclick=async()=>{
  if(writeBlocked() || !caixaState.editDesp) return;
  const rec=caixaState.despesas.find(x=>x.id===caixaState.editDesp); if(!rec) return;
  rec.status='ativo'; rec.suspensoPor=''; rec.suspensoEm='';
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  await sPut(STORE_DESP, rec); markPendingKV('desp', rec.id);
  $('#despModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow();
  toast(t('despReativada'),'ok');
});
$('#despCancel') && ($('#despCancel').onclick=()=>{ $('#despModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); });
$('#despBack') && ($('#despBack').onclick=()=>{ $('#despModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); });
$('#despModal') && $('#despModal').addEventListener('click',e=>{ if(e.target.id==='despModal'){ $('#despModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); } });
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
  // origem de custódia (só quando SAI do Dinheiro): pastor/tesoureiro
  var morig = (m && m.origemCusto==='pastor') ? 'pastor' : 'tesoureiro';
  $$('#movModal input[name="m-origem"]').forEach(r=>{ r.checked=(r.value===morig); });
  updateMovOrigemVis();
  caixaState.draftFotosMov = (m && Array.isArray(m.fotos)) ? m.fotos.map(u=>({url:u})) : [];
  renderDraftFotosMov();
  $('#movDel').classList.toggle('hidden', !m || auth.caixaRO);
  $('#movModal').classList.remove('hidden');
  applyModalRO('#movModal', auth.caixaRO, ['#movSave']);
}
// mostra "Saiu de" só quando a origem da movimentação é Dinheiro
function updateMovOrigemVis(){
  const row=$('#m-origemRow'); if(!row) return;
  row.classList.toggle('hidden', bolsoFromLabel($('#m-de').value)!=='dinheiro');
}
$('#m-de') && ($('#m-de').addEventListener('change', updateMovOrigemVis));
$('#movSave') && ($('#movSave').onclick=async()=>{
  if(writeBlocked()) return;
  const de=bolsoFromLabel($('#m-de').value), para=bolsoFromLabel($('#m-para').value);
  const v=parseFloat(($('#m-valor').value||'').replace(',','.'));
  if(de===para){ toast(t('origemDestinoIguais'),'info'); return; }
  if(!v||v<=0){ toast(t('nomeObrig'),'info'); return; }
  // sobe anexos novos (dataUrl) para o Drive antes de gravar; aborta se falhar
  const btn=$('#movSave'); const orig=(btn.querySelector('span')?btn.querySelector('span').textContent:btn.textContent);
  if((caixaState.draftFotosMov||[]).some(f=>!f.url && f.dataUrl)){
    btn.disabled=true; btnLabel(btn, t('enviandoFoto'));
    const up=await uploadPendentes(caixaState.draftFotosMov);
    btn.disabled=false; btnLabel(btn, orig);
    if(!up.ok){ toast(up.error==='offline'? t('fotoSemConexao') : (t('fotoFalhou')+' ('+up.error+')'),'err'); return; }
  }
  const all=caixaState.movimentos; let rec=caixaState.editMov? all.find(x=>x.id===caixaState.editMov):{};
  rec.de=de; rec.para=para; rec.valor=v; rec.data=$('#m-data').value||hoje(); rec.comentario=$('#m-comentario').value.trim();
  // custódia de origem só quando SAI do dinheiro
  if(de==='dinheiro'){ const sel=$('#movModal input[name="m-origem"]:checked'); rec.origemCusto = sel? sel.value : 'tesoureiro'; }
  else { rec.origemCusto=''; }
  rec.fotos=(caixaState.draftFotosMov||[]).map(f=>f.url).filter(Boolean);
  rec.atualizadoEm=new Date().toISOString(); if(auth.email) rec.atualizadoPor=auth.email;
  const newId=await sPut(STORE_MOV, rec); markPendingKV('mov', rec.id!=null?rec.id:newId);
  $('#movModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow();
});
$('#movDel') && ($('#movDel').onclick=async()=>{ if(!caixaState.editMov) return; if(!(await confirmDialog(t('excluirMovT'), t('confirmDelMov'), {perigo:true}))) return; await sDel(STORE_MOV, caixaState.editMov); markPendingKV('mov_del', caixaState.editMov); $('#movModal').classList.add('hidden'); await renderCaixa(); backToExtratoIfNeeded(); if(ONLINE_ENABLED) syncNow(); });
$('#movCancel') && ($('#movCancel').onclick=()=>{ $('#movModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); });
$('#movBack') && ($('#movBack').onclick=()=>{ $('#movModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); });
$('#movModal') && $('#movModal').addEventListener('click',e=>{ if(e.target.id==='movModal'){ $('#movModal').classList.add('hidden'); backToExtratoIfNeeded(); renderCaixa(); } });
$('#fabCaixa') && ($('#fabCaixa').onclick=()=>{
  if(caixaState.tab==='despesas'){ if(auth.podeAddDespesa) openDesp(null); }
  else { if(auth.podeCaixaMgr) openMov(null); }   // movimentacao: so admin/tesoureiro
});
// visibilidade do FAB da Caixa conforme aba atual + papel
function updateFabCaixa(){
  const fc=$('#fabCaixa'); if(!fc) return;
  const naCaixa = (state.view==='caixa');
  const pode = caixaState.tab==='despesas' ? auth.podeAddDespesa : auth.podeCaixaMgr;
  fc.classList.toggle('hidden', !(naCaixa && pode));
}
// marcador de pendência para sync das novas coleções (chave composta)
function markPendingKV(kind,id){ const p=JSON.parse(localStorage.getItem('gd_pending_cx')||'{}'); p[kind+':'+id]=1; localStorage.setItem('gd_pending_cx',JSON.stringify(p)); }

/* --- Extrato por bolso --- */
// custódia derivada de um pagamento em dinheiro: 'teso' | 'pastor'
function payCustody(p){
  if(p.recebidoPor==='tesoureiro') return 'teso';
  if(p.entregueTesoureiro) return 'teso';
  return 'pastor';
}
function custodyPill(kind){
  const cls = kind==='teso' ? 'cust-teso' : 'cust-pastor';
  const lbl = kind==='teso' ? t('origemTesoureiro') : t('origemPastor');
  return `<span class="b ${cls}">${lbl}</span>`;
}
let extratoBolso=null;   // bolso atualmente aberto (para voltar ao extrato após editar)
let extHighlight=null;   // chave do lançamento a destacar ao voltar ao extrato
let cxHighlight=null;    // chave do lançamento a destacar na lista de Lançamentos (despesas/movimentos)
let extCust={teso:true, pastor:true};   // filtro de custódia no extrato do Dinheiro
async function openExtrato(bolso){
  extratoBolso=bolso;
  cxHighlight=null;   // ao abrir o extrato, não deixa highlight preso vazar para a lista de Lançamentos por baixo
  const isCash = (bolso==='dinheiro');
  const inscritos=await getAll();
  const lanc=[]; // {data, tipo, desc, valor(sinal), kind, refId, cust, gid, pidx}
  // entradas (pagamentos que caem neste bolso)
  inscritos.forEach(i=>(i.pagamentos||[]).forEach((p,idx)=>{
    if(bolsoDaForma(p.tipo)!==bolso) return;
    lanc.push({ data:p.data||'', tipo:t('entrada'),
      desc:`${t('pagamentoDe')} — ${i.nome}${p.tipo==='Outros'&&p.nota?' ('+p.nota+')':''}`,
      valor:(+p.valor||0), kind:'pag', gid:i.id, pidx:idx,
      cust: isCash? payCustody(p) : null });
  }));
  // despesas pagas deste bolso
  caixaState.despesas.forEach(d=>{ if((d.bolso||'banco')!==bolso) return; const susp=(d.status==='suspenso'); lanc.push({ data:d.data||'', tipo:t('despesa'), desc:d.descricao||'—', valor: susp?0:-(+d.valor||0), valorReal:-(+d.valor||0), susp:susp, kind:'desp', refId:d.id, cust: isCash? (d.origemCusto==='pastor'?'pastor':'teso') : null }); });
  // movimentações que afetam este bolso
  caixaState.movimentos.forEach(m=>{
    if(m.para===bolso) lanc.push({ data:m.data||'', tipo:t('movimentacao'), desc:`${BOLSO_LABEL[m.de]} → ${BOLSO_LABEL[m.para]}${m.comentario?' · '+m.comentario:''}`, valor:(+m.valor||0), kind:'mov', refId:m.id });
    if(m.de===bolso) lanc.push({ data:m.data||'', tipo:t('movimentacao'), desc:`${BOLSO_LABEL[m.de]} → ${BOLSO_LABEL[m.para]}${m.comentario?' · '+m.comentario:''}`, valor:-(+m.valor||0), kind:'mov', refId:m.id });
  });
  // ordena CRONOLOGICO crescente para calcular saldo corrente (sobre TODOS, saldo total real)
  lanc.sort((a,b)=>toISODate(a.data).localeCompare(toISODate(b.data)));
  let bal=0; lanc.forEach(l=>{ bal+=l.valor; l.bal=bal; });
  const saldoFinal=bal;
  // filtro de custódia (só no Dinheiro): afeta APENAS a exibição, não o saldo total
  const custActive = isCash && !(extCust.teso && extCust.pastor);  // filtro ativo se algum desligado
  let shown = lanc;
  if(isCash){ shown = lanc.filter(l=>{ if(l.cust==='teso') return extCust.teso; if(l.cust==='pastor') return extCust.pastor; return !custActive; }); }
  // ordem de exibição conforme o toggle (default: recente no topo)
  if(caixaState.sortDesc) shown=shown.slice().reverse();
  $('#extTitle').textContent=`${t('extrato')} · ${BOLSO_LABEL[bolso]}`;
  $('#extSaldo').textContent=eur(saldoFinal);
  // controles: label de ordenação + filtros de custódia (só Dinheiro)
  const sl=$('#extSortLbl'); if(sl) sl.textContent=caixaState.sortDesc? t('maisRecente') : t('maisAntigo');
  const cf=$('#extCustFilters'); if(cf) cf.classList.toggle('hidden', !isCash);
  $$('#extCustFilters .cust-toggle').forEach(b=>b.classList.toggle('on', !!extCust[b.dataset.cust]));
  const el=$('#extList');
  const lkey=(l)=> l.kind==='pag' ? ('pag:'+l.gid+':'+l.pidx) : (l.kind+':'+l.refId);
  if(!shown.length){ el.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; }
  else el.innerHTML=shown.map((l)=>{
    if(l.susp){
      return `<div class="ext-item clickable susp" data-idx="${lanc.indexOf(l)}" data-key="${lkey(l)}">
        <div><div class="e-d"><span class="selo-susp">${t('suspensa')}</span>${esc(l.desc)}</div><div class="e-m">${fmtShort(l.data)}</div></div>
        <div class="e-right"><div class="e-v neg susp-val">−${eur(Math.abs(l.valorReal||0))}</div></div>
      </div>`;
    }
    const pos=l.valor>=0;
    const tag = l.cust ? custodyPill(l.cust) : '';
    const balHtml = custActive ? '' : `<div class="e-bal">${eur(l.bal)}</div>`;  // saldo corrente só sem filtro
    return `<div class="ext-item clickable" data-idx="${lanc.indexOf(l)}" data-key="${lkey(l)}">
      <div><div class="e-d"><span class="ext-tag">${l.tipo}</span>${esc(l.desc)}</div><div class="e-m">${fmtShort(l.data)}</div></div>
      <div class="e-right">${tag}<div class="e-v ${pos?'pos':'neg'}">${pos?'+':'−'}${eur(Math.abs(l.valor))}</div>${balHtml}</div>
    </div>`;
  }).join('');
  el.querySelectorAll('.ext-item.clickable').forEach(it=>it.onclick=()=>{
    const l=lanc[+it.dataset.idx]; if(!l) return;
    extHighlight=lkey(l);   // lembra o lançamento clicado para destacar ao voltar
    $('#extratoModal').classList.add('hidden');
    if(l.kind==='desp'){ extReturn=bolso; openDesp(l.refId); }
    else if(l.kind==='mov'){ extReturn=bolso; openMov(l.refId); }
    else if(l.kind==='pag'){ extReturn=bolso; openModal(l.gid, l.pidx); }   // edita o Gideão; volta ao extrato ao sair
  });
  // highlight + scroll do lançamento de onde viemos (ao voltar ao extrato)
  if(extHighlight){
    const item=el.querySelector(`.ext-item[data-key="${extHighlight}"]`);
    if(item){
      item.classList.add('hl');
      requestAnimationFrame(()=>{ try{ item.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){ item.scrollIntoView(); } });
      const k=extHighlight;
      setTimeout(()=>{ const i2=el.querySelector(`.ext-item[data-key="${k}"]`); if(i2) i2.classList.remove('hl'); }, 3000);
    }
    extHighlight=null;
  }
  $('#extratoModal').classList.remove('hidden');
  const sh=$('#extratoModal .sheet'); if(sh) sh.scrollTop=0;
}
// ordenação e filtros de custódia do extrato
$('#extSortBtn') && ($('#extSortBtn').onclick=()=>{ caixaState.sortDesc=!caixaState.sortDesc; if(extratoBolso) openExtrato(extratoBolso); });
$$('#extCustFilters .cust-toggle').forEach(b=>b.onclick=()=>{ extCust[b.dataset.cust]=!extCust[b.dataset.cust]; if(extratoBolso) openExtrato(extratoBolso); });
// controla retorno ao extrato após editar a partir dele
let extReturn=null;
function backToExtratoIfNeeded(){
  if(extReturn){ const b=extReturn; extReturn=null; openExtrato(b); }
}
document.addEventListener('click',(e)=>{
  const b=e.target.closest && e.target.closest('#view-caixa .bolso');
  if(b && b.dataset.bolso && state.view==='caixa'){ openExtrato(b.dataset.bolso); }
});
$('#extBack') && ($('#extBack').onclick=()=>$('#extratoModal').classList.add('hidden'));
$('#extratoModal') && $('#extratoModal').addEventListener('click',e=>{ if(e.target.id==='extratoModal') $('#extratoModal').classList.add('hidden'); });

function doSetView(v){
  // guarda: Visualizador só pode ver Gideões/Painel/Mais (defense in depth, além do applyAdminUI)
  if(effectiveRole()==='viewer' && (v==='confeccao'||v==='caixa'||v==='acessos')) v='lista';
  // guarda a posição de scroll da tab atual
  if(state.view){ state.scrollPos = state.scrollPos||{}; state.scrollPos[state.view]=window.scrollY; }
  state.view=v;
  ['lista','painel','confeccao','caixa','acessos','mais'].forEach(x=>$('#view-'+x).classList.toggle('hidden',x!==v));
  $$('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  $('#fab').classList.toggle('hidden', v!=='lista' || effectiveRole()==='viewer');
  const fc=$('#fabCaixa'); if(fc) updateFabCaixa();
  if(v==='painel') renderPainel();
  if(v==='confeccao') renderConfeccao();
  if(v==='caixa') renderCaixa();
  if(v==='acessos') loadUsers();
  if(v==='mais') renderSyncStamp();
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
function updateBuscaPlaceholder(){ const el=$('#q'); if(el) el.placeholder = state.qAdv ? t('buscarAvancado') : t('buscar'); }
$('#qAdv') && (()=>{ $('#qAdv').checked=state.qAdv; updateBuscaPlaceholder(); $('#qAdv').onchange=e=>{ state.qAdv=e.target.checked; try{ localStorage.setItem('qAdv', state.qAdv?'1':'0'); }catch(_){ } updateBuscaPlaceholder(); renderList(); }; })();
$('#confQ') && ($('#confQ').oninput=e=>{ state.confQ=e.target.value; $('#confQClear').classList.toggle('hidden', !e.target.value); renderConfList(); });
$('#confQClear') && ($('#confQClear').onclick=()=>{ const q=$('#confQ'); q.value=''; state.confQ=''; $('#confQClear').classList.add('hidden'); renderConfList(); q.focus(); });
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
  updateBuscaPlaceholder();
  $$('.lang button').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang));
  renderFilters();
  if(typeof refreshUpdateRow==='function') refreshUpdateRow();
}
$$('.lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.lang;localStorage.setItem('lang',lang);applyLang();refresh();});

async function refresh(){
  const all=await getAll();
  $('#metaSub').textContent=t('metaSub',{n:all.length});
  if(state.view==='lista') await renderList();
  else if(state.view==='painel') await renderPainel();
  else if(state.view==='confeccao') await renderConfeccao();
  else if(state.view==='caixa') await renderCaixa();
}

/* ---------- atualização (via version.json — confiável) ---------- */
let bannerShown=false;
let newVersionAvail=null;   // versão nova detectada (string) — usada pela barra E pelo botão em MAIS
let updating=false;
// aplica a atualização: limpa caches + atualiza SW + recarrega forçando rede (compartilhada barra/MAIS)
async function applyUpdate(btn){
  if(updating) return; updating=true;
  if(btn){ btn.disabled=true; btn.textContent=t('atualizando'); }
  try{
    if('caches' in window){ const keys=await caches.keys(); await Promise.all(keys.map(k=>caches.delete(k))); }
    if('serviceWorker' in navigator){ const regs=await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r=>r.update().catch(()=>{}))); }
  }catch(e){}
  setTimeout(()=>{ location.reload(); }, 300);
}
// atualiza a LINHA da tab MAIS (visível sempre que houver nova versão, mesmo após ignorar a barra)
function refreshUpdateRow(){
  const row=$('#updateRow'); if(!row) return;
  const has=!!newVersionAvail;
  row.classList.toggle('hidden', !has);
  const btn=$('#updateBtnMais');
  if(btn && has){ btn.textContent = t('atualizarPara') + ' ' + newVersionAvail; }
}
function showUpdateBanner(newVer){
  if(bannerShown) return;
  // se o usuário já ignorou ESTA versão, não mostra a BARRA de novo (mas o botão em MAIS continua)
  try{ if(newVer && sessionStorage.getItem('gd_dismissedVer')===newVer) return; }catch(e){}
  bannerShown=true;
  const b=$('#updateBanner');
  $('#updateMsg').textContent = t('novaVersao') + (newVer? ' ('+newVer+')' : '');
  $('#updateBtn').textContent=t('atualizar');
  b.classList.remove('hidden');
  const dx=$('#updateDismiss');
  if(dx) dx.onclick=()=>{
    b.classList.add('hidden'); bannerShown=false;
    try{ if(newVer) sessionStorage.setItem('gd_dismissedVer', newVer); }catch(e){}
    // ao ignorar a barra, o botão em MAIS permanece disponível
  };
  $('#updateBtn').onclick=()=>applyUpdate($('#updateBtn'));
}
// liga o botão da tab MAIS (uma vez)
$('#updateBtnMais') && ($('#updateBtnMais').onclick=()=>applyUpdate($('#updateBtnMais')));
async function checkVersion(){
  try{
    const r=await fetchTimeout('version.json?ts='+Date.now(), {cache:'no-store'}, 8000);
    if(!r.ok) return;
    const data=await r.json();
    if(data && data.version && data.version!==APP_VERSION){
      newVersionAvail=data.version;
      refreshUpdateRow();          // mostra o botão em MAIS
      showUpdateBanner(data.version);
    }
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
let auth = { idToken:null, email:null, role:null, realAdmin:false, viewAs:null };
// "Ver como" NAO persiste entre recarregamentos (sai ao dar reload) — limpa flag antiga
try{ sessionStorage.removeItem('gd_viewas'); }catch(e){}

function parseJwt(tok){ try{ return JSON.parse(atob(tok.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); }catch(e){ return {}; } }

let loginVerifying=false;
// alterna o botão Google (#gsiBtn) e o card "Verificando acesso…" com borda animada
function setLoginChecking(on){
  loginVerifying = on;
  const btn=$('#gsiBtn'); if(btn) btn.classList.toggle('hidden', on);
  const chk=$('#loginChecking'); if(chk) chk.classList.toggle('on', on);
  const gate=$('#loginGate'); if(gate) gate.setAttribute('aria-busy', on?'true':'false');
}
// no login: re-checa version.json e mostra link "nova versão disponível" se houver
async function checkLoginVersion(){
  const lv=$('#loginVer'); if(lv) lv.textContent = APP_VERSION;
  const nv=$('#loginNewVer'); if(!nv) return;
  try{
    const r=await fetchTimeout('version.json?ts='+Date.now(), {cache:'no-store'}, 6000);
    if(!r.ok) return;
    const data=await r.json();
    if(data && data.version && data.version!==APP_VERSION){
      newVersionAvail=data.version;
      nv.textContent = t('novaVersao') + ' (' + data.version + ') — ' + t('atualizar');
      nv.classList.remove('hidden');
      nv.onclick=()=>applyUpdate(nv);
    } else { nv.classList.add('hidden'); }
  }catch(e){ /* offline: ignora */ }
}
function onGoogleCredential(resp){
  const jwt = resp && resp.credential;
  if(!jwt) return;
  if(loginVerifying) return;   // já verificando: ignora clique/callback repetido
  const claims = parseJwt(jwt);
  const email = (claims.email||'').toLowerCase();
  // NÃO bloqueamos aqui pela lista local (config.js): a autoridade é o SERVIDOR (aba Admin).
  // Deixa o login prosseguir; se o servidor recusar (unauthorized), a tela de login mostra o aviso.
  auth.idToken = jwt; auth.email = email;
  sessionStorage.setItem('gd_idtoken', jwt);
  sessionStorage.setItem('gd_email', email);
  verifyAccessThenStart();
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
  // se já temos token de sessão válido, tenta usar (será revalidado no servidor)
  const saved = sessionStorage.getItem('gd_idtoken');
  const savedEmail = sessionStorage.getItem('gd_email');
  if(saved && savedEmail){
    const c=parseJwt(saved);
    if(c.exp && c.exp*1000 > Date.now()+60000){ auth.idToken=saved; auth.email=savedEmail; showLoginGate(); verifyAccessThenStart(); return; }
  }
  showLoginGate();
  let tries=0;
  const tryInit=()=>{
    if(!(window.google && google.accounts && google.accounts.id)){
      tries++;
      if(tries>40){   // ~8s sem carregar o script do Google
        const le=$('#loginError');
        if(le){ le.innerHTML = t('loginGoogleFalhou')+' <button id="loginReload" class="btn ghost" style="margin-top:8px">'+t('recarregar')+'</button>'; le.classList.remove('info'); le.classList.remove('hidden'); }
        const rb=$('#loginReload'); if(rb) rb.onclick=()=>location.reload();
        return;
      }
      return setTimeout(tryInit,200);
    }
    try{
      google.accounts.id.initialize({ client_id: CFG.GOOGLE_CLIENT_ID, callback: onGoogleCredential, auto_select:false, cancel_on_tap_outside:true });
      google.accounts.id.renderButton($('#gsiBtn'), { theme:'filled_black', size:'large', shape:'pill', text:'signin_with', width:260 });
      // NÃO usar One Tap prompt() — causa cooldown/travas no iOS/FedCM. O botão é o caminho confiável.
    }catch(e){
      const le=$('#loginError'); if(le){ le.textContent=t('loginGoogleFalhou'); le.classList.remove('info'); le.classList.remove('hidden'); }
    }
  };
  tryInit();
}
function showLoginGate(){ $('#loginGate').classList.remove('hidden'); checkLoginVersion(); }
function hideLoginGate(){ $('#loginGate').classList.add('hidden'); }
// valida o acesso no servidor ANTES de abrir a UI (quando online); offline usa cache
async function verifyAccessThenStart(){
  // offline ou app sem backend: mantém o comportamento offline-first (usa cache)
  if(!ONLINE_ENABLED || !navigator.onLine || !auth.idToken){ hideLoginGate(); startAppAfterLogin(); return; }
  // mostra "verificando acesso…" (card com borda animada) e ESCONDE o botão Google (evita clique duplo)
  const le=$('#loginError'); if(le){ le.classList.add('hidden'); le.textContent=''; }
  setLoginChecking(true);
  try{
    const url = CFG.SHEET_WEBAPP_URL + '?action=pull&token=' + encodeURIComponent(CFG.SYNC_TOKEN) + '&idToken=' + encodeURIComponent(auth.idToken);
    const r = await fetchTimeout(url, {method:'GET'}, 15000);
    const data = await r.json();
    if(data && data.ok){
      if(data.role){ auth.role=data.role; }
      if(le){ le.classList.add('hidden'); le.textContent=''; }
      setLoginChecking(false);
      hideLoginGate(); startAppAfterLogin();
    } else {
      // servidor recusou -> não abre a UI. Mostra o motivo e o email tentado (diagnóstico).
      const tentativa = auth.email || '';
      const err = data && data.error ? data.error : 'unauthorized';
      auth={idToken:null,email:null,role:null,realAdmin:false,viewAs:null};
      sessionStorage.removeItem('gd_idtoken'); sessionStorage.removeItem('gd_email');
      setLoginChecking(false);   // recusado -> volta a mostrar o botão Google
      showLoginGate();
      if(le){
        let msg = (err==='unauthorized') ? t('naoAutorizado') : (t('erroLogin')+' ('+err+')');
        if(tentativa) msg += '\n('+tentativa+')';
        le.textContent = msg; le.style.whiteSpace='pre-line'; le.classList.remove('info'); le.classList.remove('hidden');
      }
      try{ google.accounts.id.disableAutoSelect(); }catch(_){}
    }
  }catch(e){
    // sem resposta do servidor (rede instável): cai para o modo offline (usa cache)
    if(le){ le.classList.add('hidden'); le.textContent=''; }
    setLoginChecking(false);
    hideLoginGate(); startAppAfterLogin();
  }
}
function applyAdminUI(){
  // papel REAL (do servidor; fallback config.js). O gating usa o papel EFETIVO (pode ser "ver como").
  let realIsAdmin;
  if(auth.role){ realIsAdmin = (auth.role==='admin'); }
  else { realIsAdmin = (CFG.ADMIN_EMAILS||[]).map(e=>e.toLowerCase()).indexOf((auth.email||'').toLowerCase())>=0; }
  auth.realAdmin = realIsAdmin;
  const eff = effectiveRole();                 // 'admin' | 'tesoureiro' | 'user' | 'viewer'
  const isAdmin = (eff==='admin');
  const isViewer = (eff==='viewer');            // Visualizador: só Gideões + Painel, read-only total
  const isCaixaEdit = isAdmin || (eff==='tesoureiro');   // gerencia a Caixa (movimentacoes, deletar despesa)
  auth.caixaRO = !isCaixaEdit;                            // user = Caixa (quase) somente leitura
  auth.podeCaixaMgr = isCaixaEdit;                        // movimentacoes + deletar despesa: admin/tesoureiro
  auth.podeAddDespesa = isAdmin || (eff==='tesoureiro') || (eff==='user');  // criar/editar despesa: todos menos viewer
  const adminEl=$('#adminSection'); if(adminEl) adminEl.classList.toggle('hidden', !isAdmin);
  const navC=$('#navCaixa'); if(navC) navC.classList.toggle('hidden', isViewer);   // Caixa: todos exceto viewer
  const navA=$('#navAcessos'); if(navA) navA.classList.toggle('hidden', !isAdmin);
  const navConf=$('#navConfeccao'); if(navConf) navConf.classList.toggle('hidden', isViewer);  // Confecção: escondida p/ viewer
  const fab=$('#fab'); if(fab) fab.classList.toggle('hidden', isViewer);            // sem "+ novo Gideão" p/ viewer
  // viewer NÃO pode exportar/baixar dados (fecharia a brecha de exfiltrar movimentações via CSV/JSON):
  // na tab Mais, deixa só a seção "Conta e sincronização"
  const dbSec=$('#dadosBackupSection'); if(dbSec) dbSec.classList.toggle('hidden', isViewer);
  renderImpersonateUI();
  updateAcctRole();
  if(isAdmin) loadUsers();
}
/* rótulo do perfil logado na aba MAIS (papel real; indica "ver como" se ativo) */
function roleLabel(r){ return r==='admin'?t('papelAdmin'):(r==='tesoureiro'?t('papelTesoureiro'):(r==='viewer'?t('papelViewer'):t('papelUser'))); }
function updateAcctRole(){
  const el=$('#acctRole'); if(!el) return;
  const realRole = auth.role || (auth.realAdmin ? 'admin' : 'user');
  let txt = roleLabel(realRole);
  if(isImpersonating()){ txt += ' · ' + t('verComo') + ' ' + roleLabel(auth.viewAs); }
  el.textContent = txt;
}
/* ---------- "Ver como" (impersonate visual — só admin) ---------- */
// papel efetivo = o simulado (se admin real ativou "ver como"), senao o real
function effectiveRole(){
  if(auth.realAdmin && auth.viewAs && auth.viewAs!=='admin') return auth.viewAs;
  return auth.role || (auth.realAdmin?'admin':'user');
}
function isImpersonating(){ return !!(auth.realAdmin && auth.viewAs && auth.viewAs!=='admin'); }
function setViewAs(role){
  if(!auth.realAdmin) return;                  // só admin real
  auth.viewAs = (role && role!=='admin') ? role : null;
  applyAdminUI();
  // se a aba atual deixou de ser visivel no papel simulado, volta para a lista
  const cur=state.view;
  const eff=effectiveRole();
  const blocked = (cur==='acessos' && eff!=='admin')
               || (cur==='caixa' && (eff==='user'||eff==='viewer'))   // caixa: user vê (RO), viewer NÃO
               || (eff==='viewer' && (cur==='confeccao'||cur==='caixa'||cur==='acessos'));  // viewer só lista/painel/mais
  if(blocked){ setView('lista'); }
  updateSaveBtn && updateSaveBtn();
}
function renderImpersonateUI(){
  // seletor "Ver como" (topo da aba Acessos) — só quando admin real
  const sel=$('#viewAsSelect');
  if(sel){ sel.value = auth.viewAs || 'admin'; }
  const wrap=$('#viewAsWrap'); if(wrap) wrap.classList.toggle('hidden', !auth.realAdmin);
  // banner fixo
  const b=$('#impersonateBanner');
  if(b){
    if(isImpersonating()){
      const lbl = auth.viewAs==='tesoureiro'?t('papelTesoureiro'):t('papelUser');
      $('#impersonateMsg').textContent = t('vendoComo',{r:lbl});
      b.classList.remove('hidden');
      document.body.classList.add('has-imp');
    } else { b.classList.add('hidden'); document.body.classList.remove('has-imp'); }
  }
}
// bloqueia escrita enquanto "vendo como" (evita gravar como admin achando que é o papel simulado)
function writeBlocked(){
  if(effectiveRole()==='viewer'){ toast(t('viewerBloqueio'),'info'); return true; }   // Visualizador: read-only
  if(isImpersonating()){ toast(t('verComoBloqueio'),'info'); return true; }
  return false;
}

/* ---------- Acessos: gestao de usuarios (so admin) ---------- */
let accessUsers=[];          // cache da ultima lista
let accEditing=null;         // email em edicao (null = novo)
let accConfirmingDel=false;  // 2 estagios para remover

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
  const tesos =accessUsers.filter(u=>u.role==='tesoureiro');
  const viewers=accessUsers.filter(u=>u.role==='viewer');
  const users =accessUsers.filter(u=>u.role!=='admin' && u.role!=='tesoureiro' && u.role!=='viewer');
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
  box.innerHTML = group(t('grupoAdmins'),admins) + group(t('grupoTesoureiros'),tesos) + group(t('grupoViewers'),viewers) + group(t('grupoUsers'),users);
  box.querySelectorAll('.access-row .edit-btn').forEach(b=>b.onclick=()=>{
    const email=b.closest('.access-row').dataset.email;
    openAccessModal(accessUsers.find(u=>u.email===email)||null);
  });
}
async function loadUsers(){
  if(!ONLINE_ENABLED||!auth.idToken){ const b=$('#accessGroups'); if(b) b.innerHTML=`<div class="empty">${t('semLancamentos')}</div>`; return; }
  const box=$('#accessGroups'); if(box && !accessUsers.length) box.innerHTML=`<div class="empty">${t('verificandoAcesso')}</div>`;
  try{
    const d=await usersApi('listUsers');
    accessUsers=d.users||[];
    renderAccess();
    if(box && !accessUsers.length) box.innerHTML=`<div class="empty">—</div>`;
  }
  catch(e){
    // mostra o erro em vez de sumir silenciosamente
    if(box) box.innerHTML=`<div class="acc-alert">${t('erroLogin')} (${esc(String(e.message||'erro'))})</div>`;
  }
}
function accSetError(code){
  const el=$('#accError'); if(!el) return;
  if(!code){ el.classList.add('hidden'); el.textContent=''; return; }
  const m={already_exists:'errJaExiste',invalid_email:'errEmailInvalido',last_admin:'errUltimoAdmin'}[code]||'errUserFalhou';
  el.textContent=t(m); el.classList.remove('hidden');
}
function openAccessModal(u){
  accEditing = u ? u.email : null;
  accConfirmingDel = false;
  accSetError(null);
  $('#accTitle').textContent = u ? t('editarUsuario') : t('novoUsuario');
  const em=$('#acc-email'); em.value = u ? u.email : ''; em.disabled = !!u;   // email read-only ao editar
  $('#acc-nome').value = u ? (u.nome||'') : '';
  $('#acc-role').value = u ? u.role : 'user';
  const del=$('#accDel'); del.classList.toggle('hidden', !u); btnLabel(del, t('remover')); del.classList.remove('confirm');
  btnLabel('#accSave', u ? t('salvar') : t('adicionar'));
  $('#accessModal').classList.remove('hidden');
}
function closeAccessModal(){ $('#accessModal').classList.add('hidden'); accEditing=null; accConfirmingDel=false; }
function accBusy(btnSel, on){
  const b=$(btnSel); if(!b) return;
  b.classList.toggle('busy', on);
  const sp=b.querySelector('span'); const cur=sp?sp:b;
  if(on){ b.dataset.txt=cur.textContent; btnLabel(b, t('processando')); }
  else if(b.dataset.txt!==undefined){ btnLabel(b, b.dataset.txt); delete b.dataset.txt; }
}
async function accSave(){
  const email=(accEditing || ($('#acc-email').value||'').trim().toLowerCase());
  const nome=($('#acc-nome').value||'').trim();
  const role=$('#acc-role').value||'user';
  if(!email || email.indexOf('@')<0){ accSetError('invalid_email'); return; }
  const action = accEditing ? 'setRole' : 'addUser';
  accSetError(null); accBusy('#accSave', true);
  try{
    const d=await usersApi(action,{email:email, role:role, nome:nome});
    accessUsers=d.users||accessUsers; renderAccess(); closeAccessModal();
  }catch(e){ accSetError(String(e.message)); }   // erro fica visivel, modal permanece aberto
  finally{ accBusy('#accSave', false); }
}
async function accRemove(){
  if(!accEditing) return;
  const del=$('#accDel');
  // 1º clique: pede confirmacao IN-MODAL (botao vira "Confirmar remoção"); 2º clique: executa
  if(!accConfirmingDel){
    accConfirmingDel=true;
    btnLabel(del, t('confirmarRemocao'));
    del.classList.add('confirm');
    return;
  }
  accSetError(null); accBusy('#accDel', true);
  try{
    const d=await usersApi('removeUser',{email:accEditing});
    accessUsers=d.users||accessUsers; renderAccess(); closeAccessModal();
  }catch(e){ accSetError(String(e.message)); accConfirmingDel=false; btnLabel(del, t('remover')); del.classList.remove('confirm'); }
  finally{ accBusy('#accDel', false); }
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
  if(s==='ok'){ try{ localStorage.setItem('gd_last_sync', new Date().toISOString()); }catch(_){ } }
  renderSyncStamp();
}
// timestamp discreto da última sincronização com sucesso — dd-mon-yy HH:mm:ss
function fmtStamp(iso){
  const d=new Date(iso); if(isNaN(d)) return '';
  const mon=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'][d.getMonth()];
  const p=n=>String(n).padStart(2,'0');
  return `${p(d.getDate())}-${mon}-${String(d.getFullYear()).slice(2)} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
function renderSyncStamp(){
  const row=$('#syncStampRow'), el=$('#syncStamp'); if(!row||!el) return;
  let iso=''; try{ iso=localStorage.getItem('gd_last_sync')||''; }catch(_){ }
  if(iso){ el.textContent=fmtStamp(iso); row.classList.remove('hidden'); }
  else { row.classList.add('hidden'); }
}
// logo Casa Fuerte = refresh forçado + verificar nova versão
$('#brandLogoLink') && ($('#brandLogoLink').onclick=async()=>{
  try{ await checkVersion(); }catch(_){}
  applyUpdate(null);   // limpa cache + SW.update + reload
});
// logo Casa Fuerte na TELA DE LOGIN = refresh forçado + verificar nova versão (igual ao do header)
$('#loginLogoLink') && ($('#loginLogoLink').onclick=async()=>{
  try{ await checkVersion(); }catch(_){}
  applyUpdate(null);
});
function markPending(id){
  const p=JSON.parse(localStorage.getItem('gd_pending')||'{}'); p[id]=1;
  localStorage.setItem('gd_pending', JSON.stringify(p));
}
function pendingIds(){ return Object.keys(JSON.parse(localStorage.getItem('gd_pending')||'{}')); }
function clearPending(){ localStorage.removeItem('gd_pending'); }
// tombstones de inscritos apagados (para propagar a deleção ao servidor no próximo push)
function markPendingDel(id){
  const p=JSON.parse(localStorage.getItem('gd_pending_del')||'{}'); p[String(id)]=1;
  localStorage.setItem('gd_pending_del', JSON.stringify(p));
  // se estava pendente de upsert, remove (não faz sentido enviar edição de algo apagado)
  const up=JSON.parse(localStorage.getItem('gd_pending')||'{}'); delete up[String(id)];
  localStorage.setItem('gd_pending', JSON.stringify(up));
}
function pendingDelIds(){ return Object.keys(JSON.parse(localStorage.getItem('gd_pending_del')||'{}')); }
function clearPendingDel(){ localStorage.removeItem('gd_pending_del'); }

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
  const delPend = pendingDelIds();   // apagados localmente ainda não confirmados no servidor
  const localAll = await getAll();
  const localById = {}; localAll.forEach(i=>localById[i.id]=i);
  await clearAll();
  let maxId=0;
  for(const s of data.inscritos){
    if(delPend.indexOf(String(s.id))>=0) { if(s.id>maxId) maxId=s.id; continue; }  // apagado local pendente -> não regrava
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
  await reconcileColl(STORE_EST, data.estoque||[], 'est', pendKeys);
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
  const delIds=pendingDelIds();
  const pcx=JSON.parse(localStorage.getItem('gd_pending_cx')||'{}');
  const cxKeys=Object.keys(pcx);
  if(!ids.length && !delIds.length && !cxKeys.length) return;
  const payload={token:CFG.SYNC_TOKEN, idToken:auth.idToken};
  // inscritos pendentes
  if(ids.length){ const all=await getAll(); payload.inscritos=all.filter(i=>ids.indexOf(String(i.id))>=0); }
  // inscritos apagados (tombstones)
  if(delIds.length){ payload.inscritosDel=delIds.map(x=>+x); }
  // despesas/movimentos pendentes + deleções
  const despAll=await sGetAll(STORE_DESP), movAll=await sGetAll(STORE_MOV), estAll=await sGetAll(STORE_EST);
  const despIds=cxKeys.filter(k=>k.indexOf('desp:')===0).map(k=>+k.split(':')[1]);
  const despDel=cxKeys.filter(k=>k.indexOf('desp_del:')===0).map(k=>+k.split(':')[1]);
  const movIds=cxKeys.filter(k=>k.indexOf('mov:')===0).map(k=>+k.split(':')[1]);
  const movDel=cxKeys.filter(k=>k.indexOf('mov_del:')===0).map(k=>+k.split(':')[1]);
  const estIds=cxKeys.filter(k=>k.indexOf('est:')===0).map(k=>+k.split(':')[1]);
  const estDel=cxKeys.filter(k=>k.indexOf('est_del:')===0).map(k=>+k.split(':')[1]);
  if(despIds.length) payload.despesas=despAll.filter(d=>despIds.indexOf(d.id)>=0);
  if(despDel.length) payload.despesasDel=despDel;
  if(movIds.length) payload.movimentos=movAll.filter(m=>movIds.indexOf(m.id)>=0);
  if(movDel.length) payload.movimentosDel=movDel;
  if(estIds.length) payload.estoque=estAll.filter(x=>estIds.indexOf(x.id)>=0);
  if(estDel.length) payload.estoqueDel=estDel;
  const r=await fetchTimeout(CFG.SHEET_WEBAPP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify(payload)});
  const data=await r.json();
  if(!data.ok) throw new Error(data.error||'push_failed');
  clearPending();
  clearPendingDel();
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
    if(String(e.message)==='unauthorized'){
      // servidor recusou (email não está na aba Admin) -> volta ao login com aviso
      appStarted=false;
      auth={idToken:null,email:null,role:null,realAdmin:false,viewAs:null};
      sessionStorage.removeItem('gd_idtoken'); sessionStorage.removeItem('gd_email');
      showLoginGate(); setSync('err');
      const el=$('#loginError'); if(el){ el.textContent=t('naoAutorizado'); el.classList.remove('info'); el.classList.remove('hidden'); }
      try{ google.accounts.id.disableAutoSelect(); }catch(_){}
    }
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
  updateAcctRole();
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
  try{ setSync('syncing'); const all=await getAll(); await pushAll(all); clearPending(); await pull(); setSync('ok'); refresh(); toast(t('okGenerico'),'ok'); }
  catch(e){ setSync('err'); toast(t('erroGenerico')+': '+e.message,'err'); }
});
$('#btnReloadBase') && ($('#btnReloadBase').onclick=async()=>{
  if(!(await confirmDialog(t('recarregarBaseT'), t('confirmRecarregar'), {perigo:true}))) return;
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
    setSync('ok'); refresh(); toast(t('okRecarregada', {n:base.length}),'ok');
  }catch(e){ setSync('err'); toast(t('erroGenerico')+': '+e.message,'err'); }
});
// ---- backup/restore de USUARIOS (acessos) — exclusivo admin ----
$('#btnBackupUsers') && ($('#btnBackupUsers').onclick=async()=>{
  if(effectiveRole()!=='admin' && !auth.realAdmin) return;
  try{
    setSync('syncing');
    const d=await usersApi('listUsers');
    const users=d.users||[];
    download('gideao300-usuarios-'+new Date().toISOString().slice(0,10)+'.json',
      JSON.stringify({projeto:'Projeto Gideão 300', tipo:'acessos', exportadoEm:new Date().toISOString(), usuarios:users}, null, 2),
      'application/json');
    setSync('ok');
  }catch(e){ setSync('err'); toast(t('erroRestaurar')+': '+e.message,'err'); }
});
$('#fileRestoreUsers') && ($('#fileRestoreUsers').onchange=async e=>{
  const f=e.target.files[0]; if(!f) return;
  if(effectiveRole()!=='admin' && !auth.realAdmin){ e.target.value=''; return; }
  if(!(await confirmDialog(t('restaurarUsersT'), t('confirmRestoreUsers'), {perigo:true, okText:t('restaurar')}))){ e.target.value=''; return; }
  const txt=await f.text();
  let users;
  try{
    const data=JSON.parse(txt);
    users=data.usuarios||data.users||data;
    if(!Array.isArray(users)) throw new Error('formato');
  }catch(err){ toast(t('jsonInvalido'),'err'); e.target.value=''; return; }
  try{
    setSync('syncing');
    const d=await usersApi('replaceUsers',{users:users});
    accessUsers=d.users||users; renderAccess();
    setSync('ok');
    toast(t('okRestaurado', {n:(d.users||users).length}),'ok');
  }catch(err){
    setSync('err');
    const msg = err.message==='must_have_admin' ? t('erroPrecisaAdmin')
              : err.message==='no_valid_users' ? t('erroSemUsuarios')
              : t('erroRestaurar')+': '+err.message;
    toast(msg,'err');
  }
  e.target.value='';
});
$('#btnAddAccess') && ($('#btnAddAccess').onclick=()=>openAccessModal(null));
$('#viewAsSelect') && ($('#viewAsSelect').onchange=(e)=>setViewAs(e.target.value));
$('#impersonateExit') && ($('#impersonateExit').onclick=()=>setViewAs('admin'));
$('#accSave') && ($('#accSave').onclick=accSave);
$('#accDel') && ($('#accDel').onclick=accRemove);
$('#accCancel') && ($('#accCancel').onclick=closeAccessModal);
$('#accBack') && ($('#accBack').onclick=closeAccessModal);

(function(){ initGoogleLogin(); })();
