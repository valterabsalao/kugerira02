/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { motion } from 'motion/react';
import { fmt, fmtShort, tsLabel, cn } from '../lib/utils';
import { IC } from '../lib/icons';

export function Dashboard({ user, clientes, encomendas, financas, goTo, actividades }: any) {
  const stats = useMemo(() => {
    const receitaCli = clientes.reduce((s: number, c: any) => s + (parseFloat(c.valorPago) || 0), 0);
    const receitaFin = financas.filter((f: any) => f.tipo === 'Receita').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
    const despesaFin = financas.filter((f: any) => f.tipo === 'Despesa').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
    const dividas = clientes.reduce((s: number, c: any) => s + ((parseFloat(c.valorTotal) || 0) - (parseFloat(c.valorPago) || 0)), 0);
    
    const totalReceita = receitaCli + receitaFin;
    const lucro = totalReceita - despesaFin;
    
    return {
      receita: totalReceita,
      lucro,
      dividas,
      despesas: despesaFin,
      clientesCount: clientes.length,
      pedidosAtivos: encomendas.filter((e: any) => e.status === 'Em andamento').length
    };
  }, [clientes, encomendas, financas]);

  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][d.getMonth()];
      
      const r = clientes.filter((c: any) => c.data?.startsWith(key)).reduce((s: number, c: any) => s + (parseFloat(c.valorPago) || 0), 0) +
                financas.filter((f: any) => f.tipo === 'Receita' && f.data?.startsWith(key)).reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
      return { name: label, valor: r };
    });
  }, [clientes, financas]);

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
    <div className="min-h-screen bg-[#050505] pb-32 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-6 py-10 flex justify-between items-center sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5"
      >
        <div>
          <p className="text-blue-500 text-[9px] uppercase font-black tracking-[0.4em] mb-1.5">Visão Geral</p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Olá, <span className="text-blue-500">{user?.nome?.split(' ')[0] || 'Usuário'}</span>
          </h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-center text-zinc-400 hover:bg-white/[0.07] transition-all active:scale-90 shadow-2xl"
          onClick={() => goTo('menu')}
        >
          <IC.menu size={28} />
        </motion.button>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-10 relative z-10"
      >
        {/* Main Stats Card */}
        <motion.div 
          variants={item} 
          className="bento-card col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 border-none shadow-2xl shadow-blue-900/40 p-8 relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-xl border border-white/20">
                <IC.piechart size={20} />
              </div>
              <p className="text-blue-100 text-[10px] uppercase font-black tracking-[0.3em] opacity-80">Receita Total</p>
            </div>
            <p className="text-5xl font-black text-white tracking-tighter mb-4">{fmtShort(stats.receita)}</p>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                <IC.zap size={12} className="text-emerald-400" />
                <span>+12% este mês</span>
              </div>
              <div className="text-[10px] text-blue-100/40 font-black uppercase tracking-widest">Moçambique 🇲🇿</div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
            <IC.piechart size={240} />
          </div>
        </motion.div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div variants={item} className="bento-card p-6 border-white/5 bg-white/[0.03] shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <IC.zap size={16} />
              </div>
              <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">Lucro</p>
            </div>
            <p className="text-2xl font-black text-emerald-500 tracking-tight">{fmtShort(stats.lucro)}</p>
          </motion.div>

          <motion.div variants={item} className="bento-card p-6 border-white/5 bg-white/[0.03] shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <IC.bell size={16} />
              </div>
              <p className="text-zinc-600 text-[9px] uppercase font-black tracking-[0.3em]">Dívidas</p>
            </div>
            <p className="text-2xl font-black text-rose-500 tracking-tight">{fmtShort(stats.dividas)}</p>
          </motion.div>
        </div>

        {/* Chart Card */}
        <motion.div variants={item} className="bento-card p-8 border-white/5 bg-white/[0.02] shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-1">Performance</h3>
              <p className="text-lg font-black text-white tracking-tight">Crescimento Mensal</p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 shadow-xl">
              6 MESES
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#3f3f46', fontSize: 10, fontWeight: 900}} 
                  dy={15}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{
                    background: '#111', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '20px', 
                    fontSize: '10px',
                    fontWeight: '900',
                    color: '#fff',
                    padding: '12px 16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }} 
                  itemStyle={{color: '#3b82f6'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Actividade Recente</h3>
            <button 
              className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] hover:text-blue-400 transition-colors" 
              onClick={() => goTo('relatorios')}
            >
              Ver Tudo
            </button>
          </div>
          <div className="space-y-4">
            {actividades.length === 0 ? (
              <div className="bento-card text-center py-16 border-white/5 bg-white/[0.01]">
                <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Nenhuma actividade registada</p>
              </div>
            ) : (
              actividades.slice(0, 3).map((a: any) => (
                <div key={a.id} className="bento-card flex items-center gap-5 p-5 border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group shadow-xl">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 text-zinc-600 rounded-2xl flex items-center justify-center group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                    <IC.zap size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-zinc-300 leading-tight truncate tracking-tight">{a.texto}</p>
                    <p className="text-[9px] text-zinc-600 font-black mt-1.5 uppercase tracking-[0.2em]">{tsLabel(a.ts)}</p>
                  </div>
                  <div className="text-zinc-800 group-hover:text-zinc-600 transition-colors">
                    <IC.arrow size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>

        {/* Footer Info */}
        <motion.div variants={item} className="text-center pt-10 pb-6">
          <div className="text-[9px] font-black text-zinc-900 uppercase tracking-[0.6em]">Kugerira Intelligence System</div>
        </motion.div>
      </motion.div>
    </div>
  );
}
