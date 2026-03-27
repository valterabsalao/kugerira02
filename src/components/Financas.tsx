import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmtShort, S, today, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function Financas({ uid, financas }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newFin, setNewFin] = useState({ tipo: 'Receita', descricao: '', valor: 0, categoria: 'Serviços' });

  const filterMes = today().slice(0, 7);
  const doMes = financas.filter((f: any) => f.data.startsWith(filterMes));
  const receita = doMes.filter((f: any) => f.tipo === 'Receita').reduce((s: number, f: any) => s + (Number(f.valor) || 0), 0);
  const despesa = doMes.filter((f: any) => f.tipo === 'Despesa').reduce((s: number, f: any) => s + (Number(f.valor) || 0), 0);
  const saldo = receita - despesa;

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'financas'), {
        ...newFin,
        uid,
        data: today(),
        createdAt: serverTimestamp()
      });
      await S.addActividade(uid, `${newFin.tipo}: ${newFin.descricao}`, 'pago');
      setShowAdd(false);
      setNewFin({ tipo: 'Receita', descricao: '', valor: 0, categoria: 'Serviços' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'financas');
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Finanças</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 active:scale-90 transition-all border border-blue-500/50"
          onClick={() => setShowAdd(true)}
        >
          <IC.plus size={20} />
        </motion.button>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card bg-emerald-500/5 border-emerald-500/10 flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.2em]">Receitas</div>
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <IC.plus size={12} className="text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">{fmtShort(receita)}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card bg-rose-500/5 border-rose-500/10 flex flex-col justify-between h-32"
          >
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em]">Despesas</div>
              <div className="w-6 h-6 bg-rose-500/20 rounded-lg flex items-center justify-center">
                <IC.close size={12} className="text-rose-400" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-400 tracking-tight">{fmtShort(despesa)}</p>
          </motion.div>
        </div>

        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card bg-blue-600/5 border-blue-600/10 p-6"
        >
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-[0.2em] mb-2">Saldo do Mês</p>
              <p className={cn("text-4xl font-black tracking-tighter", saldo >= 0 ? 'text-white' : 'text-rose-400')}>
                {fmtShort(saldo)}
              </p>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                {today().split('-')[1]}/{today().split('-')[0]}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions List */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1">Lançamentos Recentes</h2>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {doMes.length === 0 && (
              <div className="text-center py-16 bento-card border-dashed border-white/5">
                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest italic opacity-50">Nenhum lançamento este mês</p>
              </div>
            )}

            {doMes.map((f: any, i: number) => (
              <motion.div 
                key={f.id}
                variants={item}
                className="bento-card flex items-center justify-between group hover:bg-white/5 transition-all border-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    f.tipo === 'Receita' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  )}>
                    {f.tipo === 'Receita' ? <IC.plus size={20} /> : <IC.close size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{f.descricao}</p>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{f.categoria}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn("font-black text-base tracking-tight", f.tipo === 'Receita' ? 'text-emerald-400' : 'text-rose-400')}>
                    {f.tipo === 'Receita' ? '+' : '-'}{fmtShort(f.valor)}
                  </p>
                  <p className="text-[9px] text-zinc-700 font-black uppercase tracking-widest mt-0.5">{f.data.split('-').reverse().slice(0, 2).join('/')}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
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
                <h2 className="text-2xl font-black text-white tracking-tight">Novo Lançamento</h2>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <IC.close size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    className={cn(
                      "py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all",
                      newFin.tipo === 'Receita' 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-900/20' 
                        : 'bg-white/5 border-white/10 text-zinc-600 hover:bg-white/10'
                    )}
                    onClick={() => setNewFin({...newFin, tipo: 'Receita'})}
                  >
                    Receita
                  </button>
                  <button 
                    type="button"
                    className={cn(
                      "py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all",
                      newFin.tipo === 'Despesa' 
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-lg shadow-rose-900/20' 
                        : 'bg-white/5 border-white/10 text-zinc-600 hover:bg-white/10'
                    )}
                    onClick={() => setNewFin({...newFin, tipo: 'Despesa'})}
                  >
                    Despesa
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Descrição</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                      placeholder="Ex: Pagamento de Cliente X"
                      required
                      value={newFin.descricao}
                      onChange={e => setNewFin({...newFin, descricao: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Valor (MZN)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-2xl font-black text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="0.00"
                        required
                        value={newFin.valor || ''}
                        onChange={e => setNewFin({...newFin, valor: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500/50">
                  Confirmar Lançamento
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
