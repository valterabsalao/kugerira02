/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const S = {
  get: (k: string) => {
    try {
      const val = localStorage.getItem(k);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  set: (k: string, v: any) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  del: (k: string) => {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
  getUsers: () => S.get('gp_users') || [],
  saveUsers: (u: any[]) => S.set('gp_users', u),
  getSession: () => S.get('gp_session'),
  saveSession: (u: any) => S.set('gp_session', u),
  clearSession: () => S.del('gp_session'),
  getData: (uid: string, key: string) => S.get(`gp_${uid}_${key}`) || [],
  setData: (uid: string, key: string, val: any) => S.set(`gp_${uid}_${key}`, val),
  getCfg: (uid: string) => S.get(`gp_${uid}_config`) || {},
  setCfg: (uid: string, val: any) => S.set(`gp_${uid}_config`, val),
  getFinancas: (uid: string) => S.get(`gp_${uid}_financas`) || [],
  setFinancas: (uid: string, val: any) => S.set(`gp_${uid}_financas`, val),
  getNotas: (uid: string, cid: string) => S.get(`gp_${uid}_notas_${cid}`) || [],
  setNotas: (uid: string, cid: string, v: any) => S.set(`gp_${uid}_notas_${cid}`, v),
  getPagamentos: (uid: string, cid: string) => S.get(`gp_${uid}_pgts_${cid}`) || [],
  setPagamentos: (uid: string, cid: string, v: any) => S.set(`gp_${uid}_pgts_${cid}`, v),
  getPipeline: (uid: string) => S.get(`gp_${uid}_pipeline`) || [],
  setPipeline: (uid: string, v: any) => S.set(`gp_${uid}_pipeline`, v),
  getCatalogo: (uid: string) => S.get(`gp_${uid}_catalogo`) || [],
  setCatalogo: (uid: string, v: any) => S.set(`gp_${uid}_catalogo`, v),
  getDisparos: (uid: string) => S.get(`gp_${uid}_disparos`) || [],
  setDisparos: (uid: string, v: any) => S.set(`gp_${uid}_disparos`, v),
  getActividade: (uid: string) => S.get(`gp_${uid}_actividade`) || [],
  addActividade: async (uid: string, texto: string, tipo = 'info') => {
    try {
      await addDoc(collection(db, 'actividade'), {
        uid,
        texto,
        tipo,
        ts: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  },
};

export const fmt = (v: number | string) =>
  'MZN ' +
  Number(v || 0).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const fmtShort = (v: number | string) => {
  const n = Number(v || 0);
  return n >= 1000000
    ? (n / 1000000).toFixed(1) + 'M'
    : n >= 1000
    ? (n / 1000).toFixed(1) + 'K'
    : String(n.toFixed(0));
};

export const today = () => new Date().toISOString().split('T')[0];

export const avatarColors = ['#00E5A0', '#4D9EFF', '#FFB547', '#A78BFA', '#FF5B6B', '#00C9FF', '#F7971E'];

export const avatarBg = (n: string) => avatarColors[(n || '?').charCodeAt(0) % avatarColors.length];

export const initials = (n: string) =>
  (n || '?')
    .split(' ')
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();

export const uuid = () => 'id' + Date.now() + Math.random().toString(36).slice(2, 6);

export const tsLabel = (ts: string) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'Agora';
  if (diff < 60) return diff + 'min';
  if (diff < 1440) return Math.floor(diff / 60) + 'h';
  return d.toLocaleDateString('pt');
};

export function normTel(t: string) {
  if (!t) return '';
  const d = t.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('258') && d.length >= 11) return d;
  if (d.startsWith('0') && d.length === 10) return '258' + d.slice(1);
  if (d.length === 9) return '258' + d;
  return d;
}

export function displayTel(t: string) {
  const n = normTel(t);
  if (!n) return '';
  if (n.startsWith('258')) return '+258 ' + n.slice(3, 6) + ' ' + n.slice(6, 9) + ' ' + n.slice(9);
  return n;
}

export const NotiEngine = {
  ask: async () => {
    if (!('Notification' in window)) return 'denied';
    const res = await Notification.requestPermission();
    return res;
  },
  fire: (title: string, body: string, tag?: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        tag,
        icon: 'https://picsum.photos/seed/kugerira/192/192',
      });
    }
  },
};

export const Sync = {
  export: (uid: string) => {
    try {
      const d = {
        v: 3,
        ts: Date.now(),
        users: S.getUsers(),
        clientes: S.getData(uid, 'clientes'),
        encomendas: S.getData(uid, 'encomendas'),
        lembretes: S.getData(uid, 'lembretes'),
        disparos: S.getData(uid, 'disparos'),
        financas: S.getFinancas(uid),
        config: S.getCfg(uid),
        pipeline: S.getPipeline(uid),
        catalogo: S.getCatalogo(uid),
      };
      return btoa(unescape(encodeURIComponent(JSON.stringify(d))));
    } catch {
      return '';
    }
  },
  import: (code: string, currentUid: string) => {
    try {
      const d = JSON.parse(decodeURIComponent(escape(atob(code.trim().replace(/\s/g, '')))));
      if (!d || d.v !== 3) return { ok: false, msg: 'Código inválido ou de versão diferente.' };
      if (d.users) S.saveUsers(d.users);
      const targetUser = d.users?.find((u: any) => u.id === currentUid) || d.users?.[0];
      const uid = targetUser?.id || currentUid;
      if (uid) {
        if (d.clientes) S.setData(uid, 'clientes', d.clientes);
        if (d.encomendas) S.setData(uid, 'encomendas', d.encomendas);
        if (d.lembretes) S.setData(uid, 'lembretes', d.lembretes);
        if (d.disparos) S.setData(uid, 'disparos', d.disparos);
        if (d.financas) S.setFinancas(uid, d.financas);
        if (d.config) S.setCfg(uid, d.config);
        if (d.pipeline) S.setPipeline(uid, d.pipeline);
        if (d.catalogo) S.setCatalogo(uid, d.catalogo);
      }
      const sess = targetUser ? { id: targetUser.id, nome: targetUser.nome, email: targetUser.email } : null;
      if (sess) S.saveSession(sess);
      const dt = new Date(d.ts).toLocaleDateString('pt');
      return { ok: true, msg: 'Dados restaurados com sucesso! Backup de ' + dt + '.', session: sess };
    } catch (e: any) {
      return { ok: false, msg: 'Erro ao importar: ' + e.message };
    }
  },
};

export function exportClientsCSV(clientes: any[]) {
  const rows = [
    ['Nome', 'Telefone', 'Serviço', 'Total', 'Pago', 'Dívida', 'Status', 'Data'],
    ...clientes.map((c) => [
      c.nome,
      c.tel,
      c.servico,
      c.valorTotal,
      c.valorPago,
      c.valorTotal - c.valorPago,
      c.status,
      c.data,
    ]),
  ];
  const csv =
    '\uFEFF' +
    rows.map((r) => r.map((x) => '"' + (x || '').toString().replace(/"/g, '""') + '"').join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'clientes.csv';
  a.click();
}

export const TAG_COLORS: Record<string, string> = { VIP: 'vip', Urgente: 'urgente', Novo: 'novo', Fiel: 'fiel' };
