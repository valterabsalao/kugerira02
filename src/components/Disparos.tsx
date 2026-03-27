/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { fmt, S, today, displayTel, normTel, cn, initials, avatarBg } from '../lib/utils';
import { IC } from '../lib/icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function Disparos({ uid, clientes, disparos, goTo }: any) {
  const [tab, setTab] = useState('novo');
  const [showTemplates, setShowTemplates] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  const TEMPLATES = [
    { id: '1', title: 'Lembrete de Pagamento', text: 'Olá {nome}, tudo bem? Passando para lembrar do pagamento pendente de {valor}. Podemos confirmar?' },
    { id: '2', title: 'Pedido Pronto', text: 'Olá {nome}, seu pedido de {servico} já está pronto para levantamento! 🚀' },
    { id: '3', title: 'Promoção VIP', text: 'Olá {nome}, como você é um cliente VIP, temos uma oferta exclusiva para você hoje! 🎁' },
    { id: '4', title: 'Agradecimento', text: 'Obrigado pela preferência, {nome}! Esperamos vê-lo novamente em breve. ✨' },
  ];

  const filtered = clientes.filter((c: any) => {
    const m = (c.nome || '').toLowerCase().includes(search.toLowerCase()) || (c.telefone || '').includes(search);
    if (filter === 'vip') return m && c.vip;
    if (filter === 'debt') return m && (parseFloat(c.valorTotal) || 0) > (parseFloat(c.valorPago) || 0);
    return m;
  });

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        setAudioUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
    }
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    mediaRecorder.current?.stream.getTracks().forEach((t) => t.stop());
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function selectAll() {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map((c: any) => c.id));
  }

  async function sugerirIA() {
    if (selectedIds.length === 0) return;
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const cli = clientes.find((c: any) => c.id === selectedIds[0]);
      
      const prompt = `
        Crie uma mensagem curta e profissional para WhatsApp para um cliente em Moçambique.
        Contexto do cliente:
        - Nome: ${cli.nome}
        - Serviço: ${cli.servico || 'serviço'}
        - VIP: ${cli.vip ? 'Sim' : 'Não'}
        - Dívida: ${(parseFloat(cli.valorTotal) || 0) - (parseFloat(cli.valorPago) || 0) > 0 ? 'Sim' : 'Não'}
        
        A mensagem deve ser amigável e usar placeholders {nome}, {valor} e {servico}.
        Retorne APENAS o texto da mensagem.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      setMsg(response.text || '');
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  }

  async function disparar() {
    if (selectedIds.length === 0) return;
    if (!msg.trim() && !audioUrl) return;

    const logs: any[] = [];
    for (const id of selectedIds) {
      const cli = clientes.find((c: any) => c.id === id);
      if (!cli) continue;
      let finalMsg = msg.replace(/{nome}/g, cli.nome).replace(/{valor}/g, fmt((parseFloat(cli.valorTotal) || 0) - (parseFloat(cli.valorPago) || 0))).replace(/{servico}/g, cli.servico || 'serviço');
      const tel = normTel(cli.telefone || cli.tel);
      const url = `https://wa.me/${tel}?text=${encodeURIComponent(finalMsg)}`;
      window.open(url, '_blank');
      logs.push({
        uid,
        clienteId: id,
        clienteNome: cli.nome,
        mensagem: finalMsg,
        data: today(),
        tipo: audioUrl ? 'Voz' : 'Texto',
        createdAt: serverTimestamp(),
      });
    }

    try {
      for (const log of logs) {
        await addDoc(collection(db, 'disparos'), log);
      }
      await S.addActividade(uid, `Disparo WhatsApp para ${selectedIds.length} clientes`, 'wa');
      setMsg('');
      setAudioUrl(null);
      setSelectedIds([]);
      setTab('historico');
    } catch (error) {
      console.error('Error saving disparo logs:', error);
    }
  }

  const fmtTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goTo('dashboard')} 
            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
          >
            <IC.back className="w-5 h-5 text-zinc-400" />
          </motion.button>
          <h1 className="text-2xl font-black tracking-tight">Disparos</h1>
        </div>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowTemplates(true)} 
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
        >
          <IC.template className="w-5 h-5 text-zinc-400" />
        </motion.button>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-10">
        {/* Tabs */}
        <div className="flex bg-white/[0.03] border border-white/5 rounded-[24px] p-1.5 shadow-2xl">
          {['novo', 'historico'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                tab === t ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              {t === 'novo' ? 'Novo Disparo' : 'Histórico'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === 'novo' ? (
            <motion.div 
              key="novo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Message Composer */}
              <div className="bento-card p-8 space-y-8 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em]">Compor Mensagem</span>
                  <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={sugerirIA} 
                    disabled={aiLoading || selectedIds.length === 0}
                    className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-blue-600/10 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/20 disabled:opacity-20 transition-all border border-blue-500/20 shadow-xl"
                  >
                    {aiLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <IC.sparkles className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <><IC.sparkles className="w-4 h-4" /> Sugerir com IA</>
                    )}
                  </motion.button>
                </div>
                
                <textarea 
                  value={msg} 
                  onChange={(e) => setMsg(e.target.value)} 
                  placeholder="Olá {nome}, seu pedido de {servico} está pronto..." 
                  className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] p-6 text-base text-white min-h-[180px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none placeholder:text-zinc-800 shadow-inner no-scrollbar"
                />
                
                <div className="flex items-center gap-4">
                  {!audioUrl ? (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "flex-1 h-16 rounded-[24px] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-widest transition-all border shadow-xl",
                        isRecording 
                          ? "bg-rose-600/10 border-rose-500/30 text-rose-500" 
                          : "bg-white/[0.03] border-white/5 text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-300"
                      )}
                    >
                      {isRecording ? (
                        <><div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> {fmtTimer(timer)}</>
                      ) : (
                        <><IC.mic size={20} /> Gravar Áudio</>
                      )}
                    </motion.button>
                  ) : (
                    <div className="flex-1 flex items-center gap-4 bg-white/[0.03] p-4 rounded-[24px] border border-white/5 shadow-inner">
                      <audio src={audioUrl} controls className="flex-1 h-10 invert brightness-200 opacity-50" />
                      <button onClick={() => setAudioUrl(null)} className="w-12 h-12 flex items-center justify-center text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-colors">
                        <IC.trash size={22} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-6">
                <div className="flex justify-between items-end px-2">
                  <h2 className="text-2xl font-black tracking-tight">Destinatários</h2>
                  <button onClick={selectAll} className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-[0.2em]">
                    {selectedIds.length === filtered.length ? 'Desmarcar' : 'Selecionar Todos'}
                  </button>
                </div>

                <div className="relative group">
                  <IC.search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700 group-focus-within:text-blue-500/50 transition-colors" />
                  <input 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    placeholder="Pesquisar clientes..." 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 pl-14 pr-6 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none placeholder:text-zinc-800 shadow-inner transition-all"
                  />
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-1">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'vip', label: 'VIPs' },
                    { id: 'debt', label: 'Dívidas' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={cn(
                        "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all shadow-lg",
                        filter === f.id 
                          ? "bg-blue-600 border-blue-500 text-white shadow-blue-900/40" 
                          : "bg-white/[0.03] border-white/5 text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.07]"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="grid gap-3">
                  {filtered.map((c: any) => (
                    <motion.div
                      layout
                      key={c.id}
                      onClick={() => toggleSelect(c.id)}
                      className={cn(
                        "p-5 rounded-[24px] flex items-center gap-5 cursor-pointer transition-all border group shadow-xl",
                        selectedIds.includes(c.id) 
                          ? "bg-blue-600/10 border-blue-500/30" 
                          : "bg-white/[0.03] border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-xl border flex items-center justify-center transition-all shadow-inner",
                        selectedIds.includes(c.id) ? "bg-blue-600 border-blue-500 text-white" : "border-white/10 group-hover:border-white/20"
                      )}>
                        {selectedIds.includes(c.id) && <IC.check size={16} />}
                      </div>
                      <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center font-black text-xl shadow-2xl", avatarBg(c.nome))}>
                        {initials(c.nome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-lg text-zinc-200 tracking-tight truncate">{c.nome}</div>
                        <div className="text-xs text-zinc-600 font-medium mt-0.5">{displayTel(c.telefone)}</div>
                      </div>
                      {c.vip && (
                        <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border border-amber-500/20 shadow-lg shadow-amber-900/10">
                          VIP
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="historico"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {disparos.length === 0 ? (
                <div className="text-center py-32 bento-card border-white/5 bg-white/[0.02]">
                  <IC.history className="w-20 h-20 mx-auto mb-6 text-zinc-900" />
                  <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-[10px]">Nenhum histórico</p>
                </div>
              ) : (
                disparos.map((d: any) => (
                  <motion.div 
                    layout
                    key={d.id} 
                    className="bento-card p-8 space-y-5 hover:border-white/10 transition-all border-white/5 shadow-2xl"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-black text-blue-400 text-xl tracking-tight">{d.clienteNome}</div>
                      <div className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-1">{d.data}</div>
                    </div>
                    <p className="text-zinc-400 leading-relaxed italic font-medium">"{d.mensagem}"</p>
                    <div className="flex items-center gap-3 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] pt-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      Enviado via {d.tipo}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <AnimatePresence>
        {tab === 'novo' && selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-10 left-0 right-0 px-8 z-40"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={disparar}
              className="w-full max-w-3xl mx-auto h-20 bg-blue-600 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-5 shadow-2xl shadow-blue-900/50 hover:bg-blue-700 transition-all border border-blue-500/50"
            >
              <IC.wa size={28} />
              Enviar para {selectedIds.length} contatos
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setShowTemplates(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className="relative bg-[#111] w-full max-w-xl rounded-[40px] shadow-2xl border border-white/10 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-2xl font-black tracking-tight">Templates</h2>
                <button onClick={() => setShowTemplates(false)} className="w-12 h-12 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-colors">
                  <IC.close size={24} className="text-zinc-600" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto space-y-4 custom-scrollbar">
                {TEMPLATES.map(t => (
                  <motion.button
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    key={t.id}
                    onClick={() => { setMsg(t.text); setShowTemplates(false); }}
                    className="w-full text-left p-8 rounded-[32px] border border-white/5 bg-white/[0.03] hover:border-blue-500/30 hover:bg-blue-500/5 transition-all space-y-3 group shadow-xl"
                  >
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">{t.title}</div>
                    <p className="text-zinc-400 italic leading-relaxed font-medium">"{t.text}"</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
