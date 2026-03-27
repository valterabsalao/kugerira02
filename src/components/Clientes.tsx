/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmtShort, today, initials, avatarBg, S, cn } from '../lib/utils';
import { IC } from '../lib/icons';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function Clientes({ uid, clientes, goTo }: any) {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCli, setNewCli] = useState({ nome: '', tel: '', servico: '', valorTotal: 0, valorPago: 0, status: 'Pendente' });

  const filtered = useMemo(() => {
    return clientes.filter((c: any) => 
      (c.nome || '').toLowerCase().includes(search.toLowerCase()) || 
      (c.tel || '').includes(search)
    );
  }, [clientes, search]);

  const handleAdd = async (e: any) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'clientes'), {
        ...newCli,
        uid,
        data: today(),
        createdAt: serverTimestamp()
      });
      await S.addActividade(uid, `Novo cliente: ${newCli.nome}`, 'user');
      setShowAdd(false);
      setNewCli({ nome: '', tel: '', servico: '', valorTotal: 0, valorPago: 0, status: 'Pendente' });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'clientes');
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
          <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em] mb-1.5">Gestão</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Clientes</h1>
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
        {/* Search */}
        <div className="relative group">
          <IC.search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-blue-500/50 transition-colors" />
          <input 
            className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none placeholder:text-zinc-800 shadow-inner transition-all"
            placeholder="Pesquisar por nome ou telefone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((c: any) => (
              <motion.div 
                key={c.id}
                variants={item}
                layout
                className="bento-card flex items-center justify-between p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 active:scale-[0.98] transition-all cursor-pointer group shadow-2xl" 
                onClick={() => goTo('cliente-detail', c)}
              >
                <div className="flex items-center gap-5">
                  <div 
                    className="w-14 h-14 rounded-[20px] flex items-center justify-center text-white font-black text-xl shadow-2xl border border-white/10" 
                    style={{ background: avatarBg(c.nome || '?') }}
                  >
                    {initials(c.nome || '?')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-lg text-zinc-200 tracking-tight truncate group-hover:text-blue-400 transition-colors">{c.nome}</p>
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">{c.servico || 'Sem serviço'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white tracking-tight">{fmtShort(c.valorTotal)}</p>
                  <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 border",
                    c.status === 'Pago' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-900/10' 
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-lg shadow-amber-900/10'
                  )}>
                    {c.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-24 bento-card border-white/5 bg-white/[0.01]">
              <div className="w-20 h-20 bg-white/[0.03] rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/5">
                <IC.users size={40} className="text-zinc-800" />
              </div>
              <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.4em]">Nenhum cliente encontrado</p>
            </div>
          )}
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
                <h2 className="text-2xl font-black text-white tracking-tight">Novo Cliente</h2>
                <button 
                  onClick={() => setShowAdd(false)} 
                  className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 hover:text-white transition-colors border border-white/5"
                >
                  <IC.close size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAdd} className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Identificação</label>
                  <input 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    placeholder="Nome completo"
                    required
                    value={newCli.nome}
                    onChange={e => setNewCli({...newCli, nome: e.target.value})}
                  />
                  <input 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    placeholder="Telefone / WhatsApp"
                    value={newCli.tel}
                    onChange={e => setNewCli({...newCli, tel: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 block">Serviço & Orçamento</label>
                  <input 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    placeholder="O que será feito?"
                    value={newCli.servico}
                    onChange={e => setNewCli({...newCli, servico: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                        placeholder="Total"
                        value={newCli.valorTotal || ''}
                        onChange={e => setNewCli({...newCli, valorTotal: Number(e.target.value)})}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 text-[10px] font-black">MZN</span>
                      <input 
                        type="number"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-16 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                        placeholder="Pago"
                        value={newCli.valorPago || ''}
                        onChange={e => setNewCli({...newCli, valorPago: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active:scale-[0.98] transition-all border border-blue-500/50">
                  Cadastrar Cliente
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
