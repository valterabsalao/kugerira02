/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'motion/react';
import { IC } from '../lib/icons';
import { fmt, avatarBg, initials, cn } from '../lib/utils';

export function AIAssistant({ uid, user, clientes, encomendas, financas, goTo }: any) {
  const [messages, setMessages] = useState<any[]>([
    { 
      role: 'ai', 
      text: `Olá **${user?.nome?.split(' ')[0] || 'Usuário'}**! 👋\n\nSou o **Kugerira AI**, o seu consultor de negócios inteligente. Analisei os seus dados e estou pronto para ajudar a escalar o seu negócio em Moçambique.\n\nComo posso ajudar hoje?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isStreaming]);

  async function sendMessage() {
    if (!input.trim() || isStreaming) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsStreaming(true);

    // Placeholder for AI response
    setMessages(prev => [...prev, { role: 'ai', text: '' }]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Contexto do negócio aprofundado
      const receitaClientes = clientes.reduce((s: number, c: any) => s + (parseFloat(c.valorPago) || 0), 0);
      const receitaFin = financas.filter((f: any) => f.tipo === 'Receita').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
      const receitaTotal = receitaClientes + receitaFin;
      
      const despesaTotal = financas.filter((f: any) => f.tipo === 'Despesa').reduce((s: number, f: any) => s + (parseFloat(f.valor) || 0), 0);
      const lucro = receitaTotal - despesaTotal;
      
      const dividas = clientes.reduce((s: number, c: any) => s + ((parseFloat(c.valorTotal) || 0) - (parseFloat(c.valorPago) || 0)), 0);
      const totalClientes = clientes.length;
      const clientesVip = clientes.filter((c: any) => c.vip).length;
      const encomendasAtivas = encomendas.filter((e: any) => e.status === 'Em andamento').length;

      const systemInstruction = `
        Você é o "Kugerira AI", um consultor de negócios de elite, comparável ao ChatGPT Plus, mas especializado no mercado de Moçambique.
        O usuário atual é ${user?.nome || 'Usuário'}.
        
        DADOS REAIS DO NEGÓCIO:
        - Receita Total Acumulada: MZN ${fmt(receitaTotal)}
        - Despesas Totais: MZN ${fmt(despesaTotal)}
        - Lucro Líquido: MZN ${fmt(lucro)}
        - Dívidas a Receber (Clientes): MZN ${fmt(dividas)}
        - Base de Clientes: ${totalClientes} (${clientesVip} VIPs)
        - Encomendas em Andamento: ${encomendasAtivas}
        
        DIRETRIZES DE RESPOSTA:
        1. **Tom de Voz**: Profissional, analítico, motivador e extremamente prático.
        2. **Contexto Local**: Use referências de Moçambique (MZN, províncias, feriados locais, cultura de negócios local).
        3. **Formatação**: Use Markdown extensivamente (negrito, listas, tabelas, blocos de código se necessário) para tornar a leitura agradável.
        4. **Proatividade**: Não apenas responda, mas sugira melhorias baseadas nos dados acima. Se as dívidas estiverem altas, sugira estratégias de cobrança. Se o lucro estiver baixo, sugira redução de custos.
        5. **Foco**: Vendas, Retenção de Clientes, Fluxo de Caixa e Expansão.
        
        Responda sempre em Português de Moçambique claro e direto.
      `;

      const stream = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemInstruction }] },
          ...messages.filter(m => m.text).map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: userMsg }] }
        ]
      });

      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].text = fullText;
          return newMsgs;
        });
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1].text = "⚠️ **Erro de Conexão**: Não consegui contactar o servidor da IA. Por favor, verifique a sua ligação à internet e tente novamente.";
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goTo('menu')} 
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
          >
            <IC.back className="w-5 h-5 text-zinc-400" />
          </motion.button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-900/20">
              <IC.ai className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">Kugerira AI</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Consultor Ativo</span>
              </div>
            </div>
          </div>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-zinc-700 border border-white/5">
          <IC.sparkles className="w-6 h-6" />
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={i}
              className={cn(
                "flex gap-4",
                m.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              {/* Avatar */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black border shadow-2xl",
                  m.role === 'ai' 
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' 
                    : 'bg-white/5 text-white/40 border-white/10'
                )}
                style={m.role === 'user' ? { background: avatarBg(user?.nome || '?') } : {}}
              >
                {m.role === 'ai' ? <IC.ai className="w-6 h-6" /> : initials(user?.nome || '?')}
              </div>

              {/* Bubble */}
              <div 
                className={cn(
                  "max-w-[85%] p-6 rounded-[32px] shadow-2xl border transition-all",
                  m.role === 'ai' 
                    ? 'bg-white/[0.03] border-white/5 text-zinc-300 rounded-tl-none' 
                    : 'bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-blue-900/40'
                )}
              >
                {m.role === 'ai' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-strong:text-blue-400 prose-strong:font-black prose-ul:list-disc prose-headings:text-white prose-headings:font-black prose-a:text-blue-400">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.text || (isStreaming && i === messages.length - 1 ? '...' : '')}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-base leading-relaxed font-medium">{m.text}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isStreaming && messages[messages.length - 1].text === '' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <IC.ai className="w-6 h-6" />
            </div>
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[32px] rounded-tl-none shadow-2xl flex gap-2 items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-black/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-4xl mx-auto flex items-end gap-4">
          <div className="flex-1 relative group">
            <textarea
              rows={1}
              placeholder="Como posso escalar o meu negócio hoje?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 pr-16 text-base text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none max-h-40 min-h-[64px] placeholder:text-zinc-700 shadow-inner"
            />
            <div className="absolute right-6 bottom-5 text-[9px] font-black text-zinc-800 uppercase tracking-widest group-focus-within:text-blue-500/30 transition-colors pointer-events-none">
              Enter ↵
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className={cn(
              "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-2xl",
              isStreaming || !input.trim() 
                ? 'bg-white/[0.03] text-zinc-800 border border-white/5' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/40 border border-blue-500/50'
            )}
          >
            <IC.send className="w-7 h-7" />
          </motion.button>
        </div>
        <div className="text-center mt-6 text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">
          Kugerira AI • Consultoria de Elite
        </div>
      </footer>
    </div>
  );
}
