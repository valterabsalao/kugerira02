import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { S, today, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export function Lembretes({ uid, lembretes }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [newRem, setNewRem] = useState({ titulo: '', tipo: 'Cobrança', data: today(), hora: '09:00' });

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'lembretes'), {
        ...newRem,
        done: false,
        uid,
        createdAt: serverTimestamp()
      });
      await S.addActividade(uid, `Novo lembrete: ${newRem.titulo}`, 'info');
      setShowAdd(false);
      setNewRem({ titulo: '', tipo: 'Cobrança', data: today(), hora: '09:00' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'lembretes');
    }
  };

  const toggle = async (id: string, done: boolean) => {
    try {
      await updateDoc(doc(db, 'lembretes', id), { done: !done });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'lembretes');
    }
  };

  const del = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lembretes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'lembretes');
    }
  };

  const pendentes = lembretes.filter((l: any) => !l.done);
  const concluidos = lembretes.filter((l: any) => l.done);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { x: -20, opacity: 0 },
    show: { x: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-32">
      <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <h1 className="text-2xl font-black text-white tracking-tight">Lembretes</h1>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 active:scale-90 transition-all border border-blue-500/50"
          onClick={() => setShowAdd(true)}
        >
          <IC.plus size={20} />
        </motion.button>
      </header>

      <div className="p-6 space-y-8">
        {/* Pending Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Pendentes</h2>
            <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{pendentes.length}</span>
          </div>
          
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {pendentes.length === 0 && (
              <div className="text-center py-16 bento-card border-dashed border-white/5 bg-white/[0.02]">
                <div className="text-zinc-800 mb-2 flex justify-center"><IC.check size={32} /></div>
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest italic opacity-50">Tudo em dia!</p>
              </div>
            )}
            {pendentes.map((l: any, i: number) => (
              <motion.div 
                key={l.id}
                variants={item}
                className="bento-card flex items-center justify-between group hover:bg-white/5 transition-all border-white/5"
              >
                <div className="flex items-center gap-4">
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={() => toggle(l.id, l.done)} 
                    className="w-7 h-7 rounded-xl border-2 border-zinc-800 flex items-center justify-center hover:border-blue-500 transition-colors group-hover:border-zinc-600"
                  >
                    {l.done && <IC.check size={14} className="text-blue-500" />}
                  </motion.button>
                  <div>
                    <p className="font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">{l.titulo}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <IC.clock size={10} className="text-zinc-600" />
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">{l.data} • {l.hora}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => del(l.id)} className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-800 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all">
                  <IC.trash size={18} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Completed Section */}
        {concluidos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] px-1">Concluídos</h2>
            <div className="space-y-3 opacity-40">
              {concluidos.map((l: any) => (
                <div key={l.id} className="bento-card flex items-center justify-between bg-white/[0.02] border-transparent">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggle(l.id, l.done)} 
                      className="w-7 h-7 rounded-xl bg-blue-500/20 border-2 border-blue-500/30 flex items-center justify-center"
                    >
                      <IC.check size={14} className="text-blue-400" />
                    </button>
                    <div>
                      <p className="font-bold text-zinc-500 line-through leading-tight">{l.titulo}</p>
                      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-widest mt-1">{l.data}</p>
                    </div>
                  </div>
                  <button onClick={() => del(l.id)} className="text-zinc-800 hover:text-rose-400 transition-colors p-1">
                    <IC.trash size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
                <h2 className="text-2xl font-black text-white tracking-tight">Novo Lembrete</h2>
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
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">O que lembrar?</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-base text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                      placeholder="Ex: Cobrar fatura do Cliente Y"
                      required
                      value={newRem.titulo}
                      onChange={e => setNewRem({...newRem, titulo: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Data</label>
                      <input 
                        type="date"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={newRem.data}
                        onChange={e => setNewRem({...newRem, data: e.target.value})}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Hora</label>
                      <input 
                        type="time"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        value={newRem.hora}
                        onChange={e => setNewRem({...newRem, hora: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500/50">
                  Salvar Lembrete
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
