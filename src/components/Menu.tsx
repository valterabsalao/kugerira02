/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fmt, avatarBg, initials, Sync } from '../lib/utils';
import { IC } from '../lib/icons';
import { logout, db } from '../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const h = React.createElement;

export function Menu({ uid, user, goTo, config, onInstall }: any) {
  const [showSync, setShowSync] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [meta, setMeta] = useState(config.metaMensal || 0);
  const [syncCode, setSyncCode] = useState('');

  async function handleLogout() {
    await logout();
    setShowLogoutConfirm(false);
  }

  function handleExport() {
    const code = Sync.export(uid);
    setSyncCode(code);
    setShowSync(true);
  }

  async function saveConfig() {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        metaMensal: Number(meta),
        updatedAt: serverTimestamp(),
      });
      setShowConfig(false);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Erro ao salvar configurações.');
    }
  }

  const menuItems = [
    { id: 'ai-assistant', label: 'Assistente IA', desc: 'Consultoria inteligente', icon: IC.ai, color: '#00E5A0' },
    { id: 'pipeline', label: 'Funil de Vendas', desc: 'Gestão de leads', icon: IC.target, color: '#4D9EFF' },
    { id: 'relatorios', label: 'Relatórios & KPIs', desc: 'Análise de performance', icon: IC.piechart, color: '#FFB547' },
    { id: 'disparos', label: 'Disparos WhatsApp', desc: 'Marketing direto', icon: IC.wa, color: '#25D366' },
    { id: 'lembretes', label: 'Alertas & Agenda', desc: 'Compromissos', icon: IC.bell, color: '#FF5B6B' },
  ];

  const actions = [
    { id: 'config', label: 'Configurações do App', icon: IC.cog, onClick: () => setShowConfig(true) },
    { id: 'sync', label: 'Sincronizar / Exportar', icon: IC.zap, onClick: handleExport },
    ...(onInstall ? [{ id: 'install', label: 'Instalar App no Telemóvel', icon: IC.pkg, onClick: onInstall }] : []),
    { id: 'help', label: 'Suporte & Ajuda', icon: IC.help, onClick: () => window.open('https://wa.me/258840000000', '_blank') },
    { id: 'logout', label: 'Sair da Conta', icon: IC.x, onClick: () => setShowLogoutConfirm(true), isDanger: true },
  ];

  return h(
    'div',
    { className: 'screen' },
    h(
      'div',
      { className: 'top-bar' },
      h('h1', null, 'Menu Principal')
    ),

    h(
      'div',
      { className: 'p-6 space-y-8' },
      
      // Profile Section
      h(
        motion.div,
        { 
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: 'card flex items-center gap-4'
        },
        h(
          'div', 
          { 
            className: 'w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner',
            style: { background: avatarBg(user?.nome || '?') }
          }, 
          initials(user?.nome || '?')
        ),
        h(
          'div',
          { className: 'flex-1' },
          h('div', { className: 'text-lg font-bold text-[var(--txt)]' }, user?.nome || 'Usuário'),
          h('div', { className: 'text-sm text-[var(--txt2)]' }, user?.email || 'Sem e-mail configurado')
        ),
        h(
          'button',
          { 
            onClick: () => setShowLogoutConfirm(true),
            className: 'p-2 rounded-xl bg-[var(--red-dim)] text-[var(--red)] hover:bg-[rgba(255,91,107,0.2)] transition-colors'
          },
          h(IC.x)
        )
      ),

      // Tools Section
      h(
        'div',
        null,
        h('h2', { className: 'section-title px-1' }, 'Ferramentas de Gestão'),
        h(
          'div',
          { className: 'grid grid-cols-1 gap-3' },
          menuItems.map((item, idx) =>
            h(
              motion.div,
              { 
                key: item.id,
                initial: { opacity: 0, x: -10 },
                animate: { opacity: 1, x: 0 },
                transition: { delay: idx * 0.05 },
                onClick: () => goTo(item.id),
                className: 'card flex items-center gap-4 active:scale-95 transition-transform cursor-pointer hover:border-[var(--accent)]'
              },
              h(
                'div', 
                { 
                  className: 'w-12 h-12 rounded-xl flex items-center justify-center',
                  style: { background: `${item.color}20`, color: item.color }
                }, 
                h(item.icon)
              ),
              h(
                'div',
                { className: 'flex-1' },
                h('div', { className: 'text-sm font-bold text-[var(--txt)]' }, item.label),
                h('div', { className: 'text-xs text-[var(--txt2)]' }, item.desc)
              ),
              h('div', { className: 'text-[var(--txt3)]' }, h(IC.arrow))
            )
          )
        )
      ),

      // Actions Section
      h(
        'div',
        null,
        h('h2', { className: 'section-title px-1' }, 'Sistema & Suporte'),
        h(
          'div',
          { className: 'card p-0 overflow-hidden' },
          actions.map((action, idx) =>
            h(
              'div',
              { 
                key: action.id,
                onClick: action.onClick,
                className: `flex items-center gap-4 p-4 hover:bg-[var(--bg3)] cursor-pointer active:bg-[var(--bg4)] transition-colors ${idx !== actions.length - 1 ? 'border-b border-[var(--border)]' : ''}`
              },
              h('div', { className: action.isDanger ? 'text-[var(--red)]' : 'text-[var(--txt3)]' }, h(action.icon)),
              h('div', { className: `flex-1 text-sm font-medium ${action.isDanger ? 'text-[var(--red)]' : 'text-[var(--txt2)]'}` }, action.label),
              h('div', { className: 'text-[var(--txt3)]' }, h(IC.arrow))
            )
          )
        )
      ),

      h(
        'div', 
        { className: 'text-center py-8' },
        h('div', { className: 'text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]' }, 'Kugerira v3.6'),
        h('div', { className: 'text-[10px] text-gray-400 mt-1' }, 'Versão Atualizada 🚀')
      )
    ),

    // MODAL CONFIG
    h(AnimatePresence, null, showConfig &&
      h(
        motion.div,
        { 
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: 'overlay z-50',
          onClick: () => setShowConfig(false) 
        },
        h(
          motion.div,
          { 
            initial: { y: '100%' },
            animate: { y: 0 },
            exit: { y: '100%' },
            transition: { type: 'spring', damping: 25, stiffness: 300 },
            className: 'sheet max-w-md mx-auto',
            onClick: (e) => e.stopPropagation() 
          },
          h('div', { className: 'sheet-handle' }),
          h('h2', { className: 'text-xl font-bold mb-6 text-[var(--txt)]' }, 'Configurações'),
          h(
            'div',
            { className: 'space-y-6' },
            h(
              'div',
              null,
              h('label', { className: 'text-xs font-bold text-[var(--txt2)] uppercase mb-2 block' }, 'Meta de Receita Mensal'),
              h(
                'div',
                { className: 'relative' },
                h('span', { className: 'absolute left-4 top-1/2 -translate-y-1/2 text-[var(--txt3)] font-bold' }, 'MZN'),
                h('input', { 
                  type: 'number', 
                  value: meta, 
                  onChange: (e) => setMeta(e.target.value),
                  className: 'w-full bg-[var(--bg3)] border border-[var(--border2)] rounded-xl py-4 pl-16 pr-4 font-bold text-lg focus:ring-2 focus:ring-[var(--accent)] outline-none transition-all text-[var(--txt)]'
                })
              )
            ),
            h(
              'div',
              { className: 'flex gap-3 pt-4' },
              h('button', { className: 'btn btn-secondary', onClick: () => setShowConfig(false) }, 'Cancelar'),
              h('button', { className: 'btn btn-primary', onClick: saveConfig }, 'Salvar')
            )
          )
        )
      )
    ),

    // MODAL SYNC
    h(AnimatePresence, null, showSync &&
      h(
        motion.div,
        { 
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: 'overlay z-50',
          onClick: () => setShowSync(false) 
        },
        h(
          motion.div,
          { 
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: 'card p-8 w-[90%] max-w-sm shadow-2xl',
            onClick: (e) => e.stopPropagation() 
          },
          h('h2', { className: 'text-xl font-bold mb-2 text-[var(--txt)]' }, 'Sincronização'),
          h('p', { className: 'text-sm text-[var(--txt2)] mb-6' }, 'Use este código para restaurar os seus dados noutro dispositivo.'),
          h('div', { className: 'bg-[var(--bg3)] p-4 rounded-2xl border border-[var(--border)] mb-6' },
            h('textarea', { 
              readOnly: true, 
              value: syncCode, 
              className: 'w-full h-32 bg-transparent text-[10px] font-mono text-[var(--txt2)] resize-none outline-none' 
            })
          ),
          h('button', { 
            className: 'btn btn-primary',
            onClick: () => { navigator.clipboard.writeText(syncCode); alert('Copiado!'); } 
          }, 'Copiar Código')
        )
      )
    ),

    // MODAL LOGOUT CONFIRM
    h(AnimatePresence, null, showLogoutConfirm &&
      h(
        motion.div,
        { 
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: 'overlay z-50 flex items-center justify-center p-6',
          onClick: () => setShowLogoutConfirm(false) 
        },
        h(
          motion.div,
          { 
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.9, opacity: 0 },
            className: 'card p-8 w-full max-w-xs shadow-2xl text-center',
            onClick: (e) => e.stopPropagation() 
          },
          h('div', { className: 'w-16 h-16 bg-[var(--red-dim)] text-[var(--red)] rounded-full flex items-center justify-center mx-auto mb-4' }, h(IC.x)),
          h('h2', { className: 'text-xl font-bold mb-2 text-[var(--txt)]' }, 'Sair da Conta?'),
          h('p', { className: 'text-sm text-[var(--txt2)] mb-8' }, 'Tem certeza que deseja encerrar a sua sessão atual?'),
          h(
            'div',
            { className: 'space-y-3' },
            h('button', { 
              className: 'btn btn-danger',
              onClick: handleLogout 
            }, 'Sim, Sair'),
            h('button', { 
              className: 'btn btn-secondary',
              onClick: () => setShowLogoutConfirm(false) 
            }, 'Cancelar')
          )
        )
      )
    )
  );
}
