import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmt, S, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export function Pipeline({ uid, clientes, pipeline }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [addStage, setAddStage] = useState('prospecto');
  const [form, setForm] = useState({ clienteId: '', titulo: '', valor: '' });

  const STAGES = [
    { id: 'prospecto', label: 'Prospecto', color: 'bg-zinc-500', border: 'border-zinc-500/20', bg: 'bg-zinc-500/5' },
    { id: 'contactado', label: 'Contactado', color: 'bg-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
    { id: 'negociacao', label: 'Negociação', color: 'bg-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
    { id: 'fechado', label: 'Fechado', color: 'bg-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  ];

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      const cli = clientes.find((c: any) => c.id === form.clienteId);
      await addDoc(collection(db, 'pipeline'), {
        ...form,
        clienteNome: cli?.nome || '',
        valor: parseFloat(form.valor) || 0,
        stage: addStage,
        uid,
        createdAt: serverTimestamp()
      });
      await S.addActividade(uid, `Nova oportunidade: ${form.titulo}`, 'target');
      setShowAdd(false);
      setForm({ clienteId: '', titulo: '', valor: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'pipeline');
    }
  };

  const move = async (id: string, stage: string) => {
    try {
      await updateDoc(doc(db, 'pipeline', id), { stage });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'pipeline');
    }
  };

  const del = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pipeline', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'pipeline');
    }
  };

  const totalValue = pipeline.reduce((s: number, c: any) => s + (c.valor || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      <header className="px-6 py-8 flex items-end justify-between sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Pipeline</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">Gestão de Vendas</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">Valor Total</p>
          <p className="text-2xl font-black text-blue-400 tracking-tighter">{fmt(totalValue)}</p>
        </div>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-12 no-scrollbar -mx-6 px-6 pt-6">
        {STAGES.map((s, idx) => {
          const cards = pipeline.filter((c: any) => c.stage === s.id);
          const stageValue = cards.reduce((sum: number, c: any) => sum + (c.valor || 0), 0);
          
          return (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="w-80 shrink-0 space-y-5"
            >
              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full shadow-lg", s.color, `shadow-${s.color.split('-')[1]}-500/20`)} />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">{s.label}</h2>
                  <span className="text-[10px] font-black text-zinc-700 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">{cards.length}</span>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setAddStage(s.id); setShowAdd(true); }} 
                  className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 border border-white/10 transition-all"
                >
                  <IC.plus size={18} />
                </motion.button>
              </div>

              <div className={cn("space-y-4 min-h-[500px] border rounded-[40px] p-5", s.bg, s.border)}>
                <div className="text-center pb-4 border-b border-white/5 mb-2">
                  <p className="text-xs font-black text-zinc-500 tracking-tight">{fmt(stageValue)}</p>
                </div>

                <AnimatePresence mode="popLayout">
                  {cards.map((c: any) => (
                    <motion.div 
                      key={c.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="bento-card space-y-4 group relative overflow-hidden border-white/5 hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className={cn("absolute top-0 left-0 w-1 h-full opacity-40", s.color)} />
                      
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors leading-tight">{c.titulo}</h3>
                        <button onClick={() => del(c.id)} className="text-zinc-800 hover:text-rose-400 transition-colors p-1">
                          <IC.trash size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                          <IC.user size={10} className="text-zinc-600" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">{c.clienteNome || 'Sem cliente'}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-white/5">
                        <p className="text-sm font-black text-blue-400 tracking-tight">{fmt(c.valor)}</p>
                        <select 
                          className="bg-transparent text-[10px] font-black text-zinc-700 uppercase tracking-widest outline-none cursor-pointer hover:text-zinc-300 transition-colors appearance-none text-right"
                          value={c.stage}
                          onChange={e => move(c.id, e.target.value)}
                        >
                          {STAGES.map(st => <option key={st.id} value={st.id} className="bg-[#111111]">{st.label}</option>)}
                        </select>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {cards.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px] space-y-2">
                    <div className="text-zinc-800"><IC.target size={24} /></div>
                    <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] italic">Sem Negócios</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end z-[200]"
            onClick={() => setShowAdd(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-[#111111] border-t border-white/10 rounded-t-[40px] p-8 pb-16 space-y-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-2" />
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Nova Oportunidade</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", STAGES.find(s => s.id === addStage)?.color)} />
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Estágio: {STAGES.find(s => s.id === addStage)?.label}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <IC.close size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Título do Negócio</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                      placeholder="Ex: Consultoria Mensal"
                      required
                      value={form.titulo}
                      onChange={e => setForm({...form, titulo: e.target.value})}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Cliente</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
                        value={form.clienteId}
                        onChange={e => setForm({...form, clienteId: e.target.value})}
                      >
                        <option value="" className="bg-[#111111]">Selecionar Cliente (Opcional)</option>
                        {clientes.map((c: any) => <option key={c.id} value={c.id} className="bg-[#111111]">{c.nome}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <IC.arrow size={16} className="rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Valor Estimado (MZN)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-2xl font-black text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="0.00"
                        value={form.valor}
                        onChange={e => setForm({...form, valor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500/50">
                  Adicionar ao Funil
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
