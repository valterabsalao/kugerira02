import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmt, S, today, tsLabel, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export function ClienteDetail({ uid, cliente, onBack, clientes }: any) {
  const [innerTab, setInnerTab] = useState('info');
  const [showMsg, setShowMsg] = useState(false);
  const [showPgto, setShowPgto] = useState(false);
  const [pgtoVal, setPgtoVal] = useState('');
  const [pgtoObs, setPgtoObs] = useState('');
  const [notaTexto, setNotaTexto] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [pagamentos, setPagamentos] = useState<any[]>([]);
  const [notas, setNotas] = useState<any[]>([]);

  // Reload from clientes state
  const c = clientes.find((x: any) => x.id === cliente.id) || cliente;
  const [editForm, setEditForm] = useState({ ...c });
  const div = c.valorTotal - c.valorPago;

  useEffect(() => {
    if (!c.id) return;
    const qP = query(collection(db, 'clientes', c.id, 'pagamentos'), orderBy('createdAt', 'desc'));
    const unsubP = onSnapshot(qP, (snap) => {
      setPagamentos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const qN = query(collection(db, 'clientes', c.id, 'notas'), orderBy('createdAt', 'desc'));
    const unsubN = onSnapshot(qN, (snap) => {
      setNotas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubP(); unsubN(); };
  }, [c.id]);

  const msgAuto = `Olá ${c.nome} 👋\n\nEsperamos que esteja bem!\n\nVim lembrá-lo(a) que tem um saldo pendente de ${fmt(
    div
  )} referente ao serviço "${c.servico || 'nosso serviço'}".\n\nPor favor, entre em contacto para regularização.\n\nObrigado pela confiança! 🙏`;

  function openWA() {
    const tel = (c.tel || '').replace(/\D/g, '');
    if (!tel) {
      alert('Sem número de telefone.');
      return;
    }
    window.open('https://wa.me/' + tel + '?text=' + encodeURIComponent(msgAuto), '_blank');
  }

  async function registarPgto() {
    const val = parseFloat(pgtoVal) || 0;
    if (val <= 0) return;
    const novoPago = Math.min(c.valorTotal, c.valorPago + val);
    const novaDiv = c.valorTotal - novoPago;
    const novoStatus = novaDiv <= 0 ? 'Pago' : 'Em Dívida';

    try {
      await updateDoc(doc(db, 'clientes', c.id), {
        valorPago: novoPago,
        status: novoStatus,
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(db, 'clientes', c.id, 'pagamentos'), {
        valor: val,
        obs: pgtoObs,
        data: today(),
        createdAt: serverTimestamp(),
      });
      S.addActividade(uid, 'Pagamento de ' + fmt(val) + ' registado para ' + c.nome, 'pago');
      setShowPgto(false);
      setPgtoVal('');
      setPgtoObs('');
    } catch (error) {
      console.error('Error registering payment:', error);
    }
  }

  async function addNota() {
    if (!notaTexto.trim()) return;
    try {
      await addDoc(collection(db, 'clientes', c.id, 'notas'), {
        texto: notaTexto.trim(),
        ts: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
      S.addActividade(uid, 'Nota adicionada para ' + c.nome, 'info');
      setNotaTexto('');
      setInnerTab('notas');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  async function saveEdit() {
    const total = parseFloat(editForm.valorTotal) || 0;
    const pago = parseFloat(editForm.valorPago) || 0;
    const st = pago >= total && total > 0 ? 'Pago' : pago > 0 ? 'Em Dívida' : 'Pendente';

    try {
      await updateDoc(doc(db, 'clientes', c.id), {
        ...editForm,
        valorTotal: total,
        valorPago: pago,
        status: st,
        updatedAt: serverTimestamp(),
      });
      setShowEdit(false);
    } catch (error) {
      console.error('Error saving client edit:', error);
    }
  }

  async function markPago() {
    try {
      await updateDoc(doc(db, 'clientes', c.id), {
        valorPago: c.valorTotal,
        status: 'Pago',
        updatedAt: serverTimestamp(),
      });
      S.addActividade(uid, c.nome + ' marcado como Pago', 'pago');
      onBack();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-white/10"
          >
            <IC.back size={20} />
          </motion.button>
          <h1 className="text-xl font-black text-white tracking-tight">Ficha do Cliente</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-white/10"
          onClick={() => setShowEdit(true)}
        >
          <IC.edit size={20} />
        </motion.button>
      </header>

      <motion.main 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-8"
      >
        {/* Profile Header Card */}
        <motion.div variants={item} className="bento-card p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-500 opacity-50" />
          
          <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 text-blue-400 flex items-center justify-center font-black text-3xl mx-auto mb-6 border border-blue-500/20 shadow-2xl shadow-blue-900/20">
            {(c.nome || '?')[0].toUpperCase()}
          </div>

          {c.vip && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <span className="text-xs">⭐</span> VIP CUSTOMER
            </div>
          )}

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{c.nome}</h2>
          <p className="text-zinc-500 text-sm mb-6 flex items-center justify-center gap-2 font-medium">
            <IC.phone size={14} className="text-blue-500" />
            {c.tel || 'Sem telefone'}
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <span className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-lg",
              c.status === 'Pago' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-900/10" :
              c.status === 'Em Dívida' ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-900/10" :
              "bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-amber-900/10"
            )}>
              {c.status}
            </span>
            {(c.tags || []).map((t: any) => (
              <span key={t} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border bg-white/5 border-white/10 text-zinc-500">
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Debt Alert Card */}
        {div > 0 && (
          <motion.div 
            variants={item}
            className="bento-card p-6 bg-rose-500/5 border-rose-500/20 flex items-center justify-between gap-6 shadow-xl shadow-rose-900/5"
          >
            <div>
              <div className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em] mb-2">Dívida Activa</div>
              <div className="text-3xl font-black text-rose-400 tracking-tighter">{fmt(div)}</div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPgto(true)}
              className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/30 border border-rose-500/50"
            >
              + Pagamento
            </motion.button>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div variants={item} className="flex p-1.5 bg-white/5 rounded-2xl border border-white/5">
          {[
            { id: 'info', label: 'Detalhes' },
            { id: 'notas', label: 'Notas' },
            { id: 'pagamentos', label: 'Histórico' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setInnerTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-xl",
                innerTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {innerTab === 'info' && (
              <motion.div 
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Serviço', val: c.servico || '—', icon: <IC.pkg size={16} /> },
                    { label: 'Valor Total', val: fmt(c.valorTotal), icon: <IC.money size={16} /> },
                    { label: 'Valor Pago', val: fmt(c.valorPago), icon: <IC.check size={16} /> },
                    { label: 'Data', val: c.data || '—', icon: <IC.cal size={16} /> },
                  ].map((item, i) => (
                    <div key={i} className="bento-card p-5 flex items-center justify-between border-white/5 hover:bg-white/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-zinc-700">{item.icon}</div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{item.label}</span>
                      </div>
                      <span className="font-black text-white text-sm tracking-tight">{item.val}</span>
                    </div>
                  ))}
                </div>

                {c.obs && (
                  <div className="bento-card p-6 bg-white/[0.02] border-white/5">
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3">Observações</div>
                    <p className="text-sm text-zinc-400 leading-relaxed italic font-medium">"{c.obs}"</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openWA}
                    className="flex items-center justify-center gap-3 py-5 bg-[#25D366]/10 text-[#25D366] rounded-2xl font-black text-xs uppercase tracking-widest border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all"
                  >
                    <IC.wa size={18} />
                    WhatsApp
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowMsg(true)}
                    className="flex items-center justify-center gap-3 py-5 bg-white/5 text-zinc-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <IC.sparkles size={18} />
                    Cobrança
                  </motion.button>
                </div>

                {div > 0 && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={markPago}
                    className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/30 border border-blue-500/50"
                  >
                    <IC.check size={20} />
                    Marcar como Pago
                  </motion.button>
                )}
              </motion.div>
            )}

            {innerTab === 'notas' && (
              <motion.div 
                key="notas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <textarea
                    value={notaTexto}
                    onChange={(e) => setNotaTexto(e.target.value)}
                    placeholder="Escreva uma nota importante..."
                    className="w-full bg-white/5 border border-white/10 rounded-[32px] p-6 text-sm text-white min-h-[120px] resize-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20"
                    onClick={addNota}
                  >
                    Adicionar Nota
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {notas.length === 0 ? (
                    <div className="text-center py-16 bento-card border-dashed border-white/5">
                      <p className="text-zinc-700 text-xs font-black uppercase tracking-widest italic">Nenhuma nota registada.</p>
                    </div>
                  ) : (
                    notas.map((n: any, idx) => (
                      <motion.div 
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bento-card p-6 border-white/5 hover:bg-white/5 transition-all"
                      >
                        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{n.texto}</p>
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] flex items-center gap-2">
                          <IC.clock size={12} />
                          {tsLabel(n.ts)}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {innerTab === 'pagamentos' && (
              <motion.div 
                key="pagamentos"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {pagamentos.length === 0 ? (
                    <div className="text-center py-16 bento-card border-dashed border-white/5">
                      <p className="text-zinc-700 text-xs font-black uppercase tracking-widest italic">Nenhum pagamento registado.</p>
                    </div>
                  ) : (
                    pagamentos.map((p: any, idx) => (
                      <motion.div 
                        key={p.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bento-card p-5 flex items-center justify-between border-white/5 hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <IC.money size={20} />
                          </div>
                          <div>
                            <div className="text-base font-black text-emerald-400 tracking-tight">+{fmt(p.valor)}</div>
                            {p.obs && <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{p.obs}</div>}
                          </div>
                        </div>
                        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                          {p.data}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-6 bg-white/5 text-zinc-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all"
                  onClick={() => setShowPgto(true)}
                >
                  Registar Novo Pagamento
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>

      {/* Modals */}
      <AnimatePresence>
        {showPgto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowPgto(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#111111] rounded-t-[40px] p-8 pb-16 border-t border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Registar Pagamento</h2>
              
              <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/20 mb-8 flex justify-between items-center">
                <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em]">Dívida Restante</span>
                <span className="text-2xl font-black text-rose-400 tracking-tighter">{fmt(div)}</span>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Valor (MZN)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-black">MZN</span>
                    <input
                      type="number"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-3xl font-black text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      value={pgtoVal}
                      onChange={(e) => setPgtoVal(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Observação</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                    value={pgtoObs}
                    onChange={(e) => setPgtoObs(e.target.value)}
                    placeholder="Ex: M-Pesa / Dinheiro"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="py-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-zinc-500 hover:bg-white/10 transition-all" onClick={() => setShowPgto(false)}>Cancelar</button>
                  <button className="py-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50" onClick={registarPgto}>Confirmar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMsg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            onClick={() => setShowMsg(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#111111] rounded-[40px] p-8 border border-white/10 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-black text-white mb-4 tracking-tight">Cobrança</h2>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Mensagem Automática</p>
              
              <div className="bg-black/40 p-6 rounded-3xl border border-white/5 text-xs text-zinc-400 italic mb-8 whitespace-pre-line leading-relaxed">
                {msgAuto}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-zinc-500" onClick={() => setShowMsg(false)}>Fechar</button>
                <button className="py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-[#25D366] text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20" onClick={() => { openWA(); setShowMsg(false); }}>
                  <IC.wa size={18} /> Enviar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEdit && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setShowEdit(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#111111] rounded-t-[40px] p-8 pb-16 border-t border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Editar Cliente</h2>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Nome</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={editForm.nome} onChange={(e) => setEditForm((p: any) => ({ ...p, nome: e.target.value }))} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Telefone</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={editForm.tel || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, tel: e.target.value }))} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Serviço</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={editForm.servico || ''} onChange={(e) => setEditForm((p: any) => ({ ...p, servico: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Total</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={editForm.valorTotal} onChange={(e) => setEditForm((p: any) => ({ ...p, valorTotal: e.target.value }))} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Pago</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" value={editForm.valorPago} onChange={(e) => setEditForm((p: any) => ({ ...p, valorPago: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6">
                  <button className="py-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-zinc-500" onClick={() => setShowEdit(false)}>Cancelar</button>
                  <button className="py-6 rounded-2xl font-black text-xs uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-900/20 border border-blue-500/50" onClick={saveEdit}>Guardar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
