/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmtShort, S, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export function Encomendas({ uid, encomendas, clientes }: any) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ clienteId: '', produto: '', valorTotal: '', valorPago: '', dataEntrega: '', status: 'Em andamento' });

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'encomendas'), {
        ...form,
        valorTotal: parseFloat(form.valorTotal) || 0,
        valorPago: parseFloat(form.valorPago) || 0,
        uid,
        createdAt: serverTimestamp()
      });
      await S.addActividade(uid, `Nova encomenda: ${form.produto}`, 'info');
      setShowAdd(false);
      setForm({ clienteId: '', produto: '', valorTotal: '', valorPago: '', dataEntrega: '', status: 'Em andamento' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'encomendas');
    }
  };

  const updateStatus = async (id: string, st: string) => {
    try {
      await updateDoc(doc(db, 'encomendas', id), { status: st });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'encomendas');
    }
  };

  const del = async (id: string) => {
    if (!window.confirm('Eliminar encomenda?')) return;
    try {
      await deleteDoc(doc(db, 'encomendas', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'encomendas');
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
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-32">
      {/* Header */}
      <header className="px-6 py-10 flex justify-between items-center sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5">
        <div>
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em] mb-1.5">Logística</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Pedidos</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-blue-900/40 active:scale-90 transition-all border border-blue-500/50"
          onClick={() => setShowAdd(true)}
        >
          <IC.plus size={28} />
        </motion.button>
      </header>

      <div className="p-6 space-y-8">
        {/* List */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {encomendas.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bento-card border-white/5 bg-white/[0.01]"
              >
                <div className="w-20 h-20 bg-white/[0.03] rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/5">
                  <IC.pkg size={40} className="text-zinc-800" />
                </div>
                <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">Nenhum pedido registado</p>
              </motion.div>
            )}
            
            {encomendas.map((e: any) => {
              const cli = clientes.find((c: any) => c.id === e.clienteId);
              const pendente = e.valorTotal - e.valorPago;
              
              return (
                <motion.div 
                  key={e.id}
                  variants={item}
                  layout
                  className="bento-card space-y-6 p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group shadow-2xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-xl tracking-tight group-hover:text-blue-400 transition-colors truncate">{e.produto}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <IC.users size={12} className="text-blue-400" />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{cli?.nome || 'Cliente não identificado'}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      e.status === 'Entregue' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    )}>
                      {e.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white/[0.03] p-5 rounded-[24px] border border-white/5 shadow-inner">
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1.5">Total</p>
                      <p className="font-black text-white text-lg tracking-tight">{fmtShort(e.valorTotal)}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1.5">Pendente</p>
                      <p className={cn(
                        "font-black text-lg tracking-tight",
                        pendente > 0 ? 'text-rose-500' : 'text-emerald-500'
                      )}>
                        {fmtShort(pendente)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-3">
                      <IC.cal size={16} className="text-zinc-700" />
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {e.dataEntrega ? `Entrega: ${e.dataEntrega}` : 'Sem data definida'}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {e.status === 'Em andamento' && (
                        <motion.button 
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateStatus(e.id, 'Entregue')} 
                          className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                        >
                          <IC.check size={20} />
                        </motion.button>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => del(e.id)} 
                        className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                      >
                        <IC.trash size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-end justify-center z-[200] p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md bg-[#111] border-t border-white/10 rounded-t-[40px] p-8 pb-16 space-y-8 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white tracking-tight">Novo Pedido</h2>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-white/5"
                >
                  <IC.close size={24} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Cliente</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner appearance-none"
                      required
                      value={form.clienteId}
                      onChange={e => setForm({...form, clienteId: e.target.value})}
                    >
                      <option value="" className="bg-[#111]">Selecionar Cliente</option>
                      {clientes.map((c: any) => <option key={c.id} value={c.id} className="bg-[#111]">{c.nome}</option>)}
                    </select>
                    <IC.chevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Detalhes do Pedido</label>
                  <input 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    placeholder="O que está sendo encomendado?"
                    required
                    value={form.produto}
                    onChange={e => setForm({...form, produto: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Total</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                        placeholder="0.00"
                        required
                        value={form.valorTotal}
                        onChange={e => setForm({...form, valorTotal: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Pago</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                        placeholder="0.00"
                        value={form.valorPago}
                        onChange={e => setForm({...form, valorPago: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Data de Entrega</label>
                  <input 
                    type="date"
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    value={form.dataEntrega}
                    onChange={e => setForm({...form, dataEntrega: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500/50">
                  Salvar Pedido
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
