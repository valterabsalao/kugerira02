import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { fmt, fmtShort, today, cn } from '../lib/utils';
import { IC } from '../lib/icons';

export function Relatorios({ uid, clientes, encomendas, financas, goTo }: any) {
  const receita = clientes.reduce((s: number, c: any) => s + (parseFloat(c.valorPago) || 0), 0);
  const dividas = clientes.reduce((s: number, c: any) => s + ((parseFloat(c.valorTotal) || 0) - (parseFloat(c.valorPago) || 0)), 0);
  const totalFaturado = clientes.reduce((s: number, c: any) => s + (parseFloat(c.valorTotal) || 0), 0);
  const taxaConversao = totalFaturado > 0 ? Math.round((receita / totalFaturado) * 100) : 0;
  const receitaFin = financas.filter((f: any) => f.tipo === 'Receita').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
  const despesaFin = financas.filter((f: any) => f.tipo === 'Despesa').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
  const lucroTotal = receita + receitaFin - despesaFin;
  const topClientes = [...clientes].sort((a, b) => (parseFloat(b.valorTotal) || 0) - (parseFloat(a.valorTotal) || 0)).slice(0, 5);
  
  const pct = (v: number, t: number) => (t > 0 ? Math.round((v / t) * 100) : 0);

  const now = new Date();
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][d.getMonth()];
    const value = clientes.filter((c: any) => c.data && c.data.startsWith(key)).reduce((s: number, c: any) => s + (parseFloat(c.valorPago) || 0), 0);
    return { name: label, value };
  });

  const statusData = [
    { name: 'Pagos', value: clientes.filter((c: any) => c.status === 'Pago').length, color: '#10b981' },
    { name: 'Em Dívida', value: clientes.filter((c: any) => c.status === 'Em Dívida').length, color: '#ef4444' },
    { name: 'Pendentes', value: clientes.filter((c: any) => c.status === 'Pendente').length, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  function exportRelatorio() {
    const linhas = [
      ['=== RELATÓRIO GERAL ==='],
      ['Data', today()],
      [''],
      ['RECEITAS'],
      ['Receita Clientes', receita],
      ['Receita Adicional', receitaFin],
      ['DESPESAS'],
      ['Total Despesas', despesaFin],
      [''],
      ['LUCRO LÍQUIDO', lucroTotal],
      [''],
      ['CLIENTES'],
      ['Total', clientes.length],
      ['Taxa Conversão', taxaConversao + '%'],
      [''],
      ['TOP CLIENTES'],
      ['Nome', 'Serviço', 'Total', 'Pago'],
      ...topClientes.map((c) => [c.nome, c.servico, c.valorTotal, c.valorPago]),
    ];
    const csv = '\uFEFF' + linhas.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'relatorio.csv';
    a.click();
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
      <header className="px-6 py-8 flex items-center justify-between sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goTo('dashboard')}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-all border border-white/10"
          >
            <IC.back size={20} />
          </motion.button>
          <h1 className="text-2xl font-black text-white tracking-tight">Relatórios</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 active:scale-90 transition-all border border-blue-500/50"
          onClick={exportRelatorio}
        >
          <IC.download size={20} />
        </motion.button>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="p-6 space-y-6"
      >
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Receita Total', val: receita, color: 'text-emerald-400', icon: <IC.money size={14} />, bg: 'bg-emerald-500/5 border-emerald-500/10' },
            { label: 'Lucro Líquido', val: lucroTotal, color: lucroTotal >= 0 ? 'text-blue-400' : 'text-rose-400', icon: <IC.check size={14} />, bg: 'bg-blue-500/5 border-blue-500/10' },
            { label: 'Conversão', val: taxaConversao + '%', color: 'text-amber-400', icon: <IC.pkg size={14} />, bg: 'bg-amber-500/5 border-amber-500/10', isPct: true },
            { label: 'A Cobrar', val: dividas, color: 'text-rose-400', icon: <IC.clock size={14} />, bg: 'bg-rose-500/5 border-rose-500/10' },
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              variants={item}
              className={cn("bento-card flex flex-col justify-between h-32 border", kpi.bg)}
            >
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{kpi.label}</div>
                <div className="text-zinc-500 opacity-30">{kpi.icon}</div>
              </div>
              <div className={cn("text-2xl font-black tracking-tight", kpi.color)}>
                {kpi.isPct ? kpi.val : fmtShort(kpi.val as number)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Chart */}
        <motion.div variants={item} className="bento-card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Receita Mensal</h2>
            <div className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-bold border border-blue-500/20">
              6 MESES
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={meses}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: '#151515', border: '1px solid #ffffff10', borderRadius: '16px', fontSize: '10px', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                  itemStyle={{ color: '#3b82f6' }}
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution & Top Clients */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div variants={item} className="bento-card space-y-6">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Distribuição de Status</h2>
            <div className="flex items-center gap-10">
              <div className="h-36 w-36 flex-shrink-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={10}
                      dataKey="value"
                      stroke="none"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-black text-white">{clientes.length}</span>
                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: s.color, boxShadow: `0 0 10px ${s.color}40` }} />
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-200 transition-colors">{s.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={item} className="bento-card space-y-6">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Top Clientes</h2>
            <div className="space-y-5">
              {topClientes.map((c, i) => (
                <div key={c.id} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-zinc-500 flex items-center justify-center text-[10px] font-black group-hover:bg-blue-600/10 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">{c.nome}</div>
                    <div className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mt-0.5">{c.servico || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-blue-400">{fmtShort(c.valorTotal)}</div>
                    <div className="text-[9px] text-zinc-700 font-black uppercase tracking-widest mt-0.5">{pct(c.valorPago, c.valorTotal)}% Pago</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Financial Summary */}
        <motion.div variants={item} className="bento-card overflow-hidden">
          <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-6">Resumo Financeiro</h2>
          <div className="space-y-3">
            {[
              { label: 'Receita de Clientes', val: receita, color: 'text-emerald-400' },
              { label: 'Receita Adicional', val: receitaFin, color: 'text-emerald-400' },
              { label: 'Total Despesas', val: despesaFin, color: 'text-rose-400' },
              { label: 'Dívidas por cobrar', val: dividas, color: 'text-amber-400' },
              { label: 'Lucro Líquido', val: lucroTotal, color: lucroTotal >= 0 ? 'text-blue-400' : 'text-rose-400', bold: true },
            ].map((row, i) => (
              <div key={i} className={cn(
                "flex justify-between items-center p-5 rounded-2xl transition-all border border-transparent",
                row.bold ? "bg-blue-600/10 border-blue-500/20 mt-6 shadow-lg shadow-blue-900/10" : "hover:bg-white/5"
              )}>
                <span className={cn("text-[10px] uppercase font-black tracking-[0.15em]", row.bold ? "text-blue-400" : "text-zinc-500")}>{row.label}</span>
                <span className={cn("text-base font-black tracking-tight", row.color)}>{fmt(row.val)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
