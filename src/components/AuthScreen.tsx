/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sync } from '../lib/utils';
import { IC } from '../lib/icons';
import { auth, loginWithGoogle } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function AuthScreen() {
  const [tab, setTab] = useState('login'); // login | cadastro | sync
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [syncCode, setSyncCode] = useState('');
  const [erro, setErro] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function doLogin() {
    setErro('');
    if (!email.trim() || !pass) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e: any) {
      setErro('Erro ao entrar: ' + (e.code === 'auth/user-not-found' ? 'Usuário não encontrado.' : 'Senha incorrecta ou erro de rede.'));
    } finally {
      setLoading(false);
    }
  }

  async function doCadastro() {
    setErro('');
    if (!nome.trim() || !email.trim() || !pass || !pass2) {
      setErro('Preencha todos os campos.');
      return;
    }
    if (pass !== pass2) {
      setErro('Senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: nome.trim() });
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        nome: nome.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (e: any) {
      setErro('Erro ao criar conta: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function doGoogleLogin() {
    setErro('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setErro('Erro no Google Login: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function doImportSync() {
    setErro('');
    setInfo('');
    if (!syncCode.trim()) {
      setErro('Cole o código de sincronização.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const r = Sync.import(syncCode, '');
      setLoading(false);
      if (r.ok) {
        setInfo(r.msg);
        setTimeout(() => setTab('login'), 1200);
      } else {
        setErro(r.msg);
      }
    }, 600);
  }

  const TABS = [
    { id: 'login', label: 'Entrar' },
    { id: 'cadastro', label: 'Criar Conta' },
    { id: 'sync', label: 'Recuperar' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 w-full overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <motion.div 
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-900/40 border border-blue-400/20 relative group">
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <IC.chart size={48} className="text-white relative z-10" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-3">Kugerira</h1>
          <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.3em]">Gestão de Elite 🇲🇿</p>
        </motion.div>

        {/* Tabs */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/5 p-1.5 rounded-[24px] flex mb-10 backdrop-blur-3xl shadow-2xl"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setErro('');
                setInfo('');
              }}
              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                tab === t.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 scale-100' 
                  : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Social Login */}
            {tab !== 'sync' && (
              <div className="space-y-4 mb-10">
                <button
                  onClick={doGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-4 py-5 bg-white/[0.03] border border-white/5 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-white/[0.07] transition-all active:scale-[0.98] shadow-xl"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                <div className="flex items-center gap-6 py-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">ou e-mail</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              </div>
            )}

            {/* Forms */}
            <div className="space-y-6 mb-10">
              {tab === 'login' && (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Senha</label>
                    <div className="relative">
                      <input 
                        type={showPass ? 'text' : 'password'} 
                        placeholder="••••••••"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all pr-16 shadow-inner"
                      />
                      <button 
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                      >
                        {showPass ? <IC.x size={20} /> : <IC.ai size={20} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {tab === 'cadastro' && (
                <>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Como deseja ser chamado?"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">E-mail</label>
                    <input 
                      type="email" 
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Senha</label>
                      <input 
                        type="password" 
                        placeholder="••••••"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Confirmar</label>
                      <input 
                        type="password" 
                        placeholder="••••••"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] py-5 px-7 text-sm text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </>
              )}

              {tab === 'sync' && (
                <div className="space-y-6">
                  <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[32px]">
                    <p className="text-xs text-blue-400/80 leading-relaxed font-bold text-center">
                      Cole o código de exportação para restaurar a sua conta.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Código</label>
                    <textarea 
                      value={syncCode}
                      onChange={(e) => setSyncCode(e.target.value)}
                      placeholder="Insira o código aqui..."
                      className="w-full h-48 bg-white/[0.03] border border-white/5 rounded-[32px] py-6 px-7 text-[10px] font-mono text-blue-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all resize-none leading-relaxed shadow-inner no-scrollbar"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {erro && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-[24px] mb-8 flex items-center gap-4 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 flex-shrink-0">
                    <IC.x size={16} />
                  </div>
                  <p className="text-xs text-rose-400 font-black leading-tight">{erro}</p>
                </motion.div>
              )}

              {info && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[24px] mb-8 flex items-center gap-4 overflow-hidden"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
                    <IC.zap size={16} />
                  </div>
                  <p className="text-xs text-emerald-400 font-black leading-tight">{info}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Button */}
            <button
              onClick={tab === 'login' ? doLogin : tab === 'cadastro' ? doCadastro : doImportSync}
              disabled={loading}
              className="w-full py-6 bg-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 flex items-center justify-center gap-4 active:scale-[0.98] border border-blue-500/50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {tab === 'login' ? 'Entrar Agora' : tab === 'cadastro' ? 'Criar Conta' : 'Restaurar'}
                  </span>
                  <IC.arrow size={20} />
                </>
              )}
            </button>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.6em] mb-2">Kugerira v3.5</div>
          <div className="text-[8px] text-zinc-900 font-black tracking-[0.2em]">SISTEMA DE GESTÃO PROFISSIONAL</div>
        </motion.div>
      </div>
    </div>
  );
}
