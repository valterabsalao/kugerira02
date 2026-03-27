/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { S, uuid, NotiEngine, today } from './lib/utils';
import { IC } from './lib/icons';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { Clientes } from './components/Clientes';
import { ClienteDetail } from './components/ClienteDetail';
import { Encomendas } from './components/Encomendas';
import { Financas } from './components/Financas';
import { Lembretes } from './components/Lembretes';
import { Pipeline } from './components/Pipeline';
import { Relatorios } from './components/Relatorios';
import { Disparos } from './components/Disparos';
import { Menu } from './components/Menu';
import { AIAssistant } from './components/AIAssistant';

const h = React.createElement;

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [screen, setScreen] = useState('dashboard');
  const [prevScreen, setPrevScreen] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Global Data State
  const [clientes, setClientes] = useState<any[]>([]);
  const [encomendas, setEncomendas] = useState<any[]>([]);
  const [financas, setFinancas] = useState<any[]>([]);
  const [lembretes, setLembretes] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [disparos, setDisparos] = useState<any[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ metaMensal: 0 });
  const [notifPerm, setNotifPerm] = useState<string>(('Notification' in window) ? Notification.permission : 'denied');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handlePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const goTo = (s: string, data?: any) => {
    setPrevScreen(screen);
    setScreen(s);
    if (data && (s === 'cliente-detail' || s === 'clienteDetail')) setSelectedClientId(data.id);
  };

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUid(u.uid);
        // Sync User Profile
        const userRef = doc(db, 'users', u.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const userData = snap.data();
            setUser(userData);
            setConfig(userData);
          } else {
            const newUser = { nome: u.displayName || 'Usuário', email: u.email || '', createdAt: new Date().toISOString() };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, 'users/' + u.uid);
        }
      } else {
        setUid(null);
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!uid) return;

    const unsub: any[] = [];

    // User Profile Listener
    const userRef = doc(db, 'users', uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUser(snap.data());
        setConfig(snap.data());
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'users/' + uid));
    unsub.push(unsubUser);

    const collections = [
      { name: 'clientes', setter: setClientes },
      { name: 'encomendas', setter: setEncomendas },
      { name: 'financas', setter: setFinancas },
      { name: 'lembretes', setter: setLembretes },
      { name: 'disparos', setter: setDisparos },
      { name: 'actividade', setter: setActividades },
      { name: 'pipeline', setter: setPipeline },
    ];

    collections.forEach((col) => {
      const q = query(collection(db, col.name), where('uid', '==', uid));
      const u = onSnapshot(q, (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        col.setter(data);
      }, (err) => handleFirestoreError(err, OperationType.LIST, col.name));
      unsub.push(u);
    });

    return () => unsub.forEach(u => u());
  }, [uid]);

  // Background Reminder Check
  useEffect(() => {
    if (!uid || lembretes.length === 0) return;

    const check = () => {
      const agora = new Date();
      const dataHoje = today();
      const horaAgora = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

      // Check Reminders
      lembretes.forEach((l: any) => {
        if (!l.done && l.data === dataHoje && l.hora === horaAgora) {
          NotiEngine.fire(`🔔 Lembrete: ${l.titulo}`, l.desc || `Está na hora do seu compromisso (${l.tipo}).`, l.id);
        }
      });

      // Check Overdue Orders (once a day at 09:00)
      if (horaAgora === '09:00') {
        encomendas.forEach((e: any) => {
          if (e.status === 'Em andamento' && e.dataEntrega === dataHoje) {
            NotiEngine.fire(`📦 Entrega Hoje: ${e.produto}`, `A entrega do pedido de ${clientes.find((c: any) => c.id === e.clienteId)?.nome || 'um cliente'} está marcada para hoje!`, e.id);
          }
        });
      }
    };

    const timer = setInterval(check, 60000); // Check every minute
    check(); // Initial check
    return () => clearInterval(timer);
  }, [uid, lembretes]);

  const askNotifPerm = async () => {
    const res = await NotiEngine.ask();
    setNotifPerm(res);
  };

  if (!authReady) {
    return h('div', { className: 'screen-center' }, h('div', { className: 'loader' }));
  }

  if (!uid) {
    return h(AuthScreen);
  }

  const commonProps = { uid, goTo, user, actividades };

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return h(Dashboard, { ...commonProps, user, clientes, encomendas, lembretes, financas, config, actividades });
      case 'clientes':
        return h(Clientes, { ...commonProps, clientes });
      case 'cliente-detail':
      case 'clienteDetail':
        const cli = clientes.find((c) => c.id === selectedClientId);
        return cli ? h(ClienteDetail, { ...commonProps, cliente: cli, clientes }) : h('div', null, 'Cliente não encontrado');
      case 'encomendas':
        return h(Encomendas, { ...commonProps, encomendas, clientes });
      case 'financas':
        return h(Financas, { ...commonProps, financas });
      case 'lembretes':
        return h(Lembretes, { ...commonProps, lembretes, notifPerm, onAskPerm: askNotifPerm });
      case 'pipeline':
        return h(Pipeline, { ...commonProps, pipeline, clientes });
      case 'relatorios':
        return h(Relatorios, { ...commonProps, clientes, encomendas, financas });
      case 'disparos':
        return h(Disparos, { ...commonProps, clientes, disparos });
      case 'menu':
        return h(Menu, { ...commonProps, user, config, onInstall: deferredPrompt ? installApp : null });
      case 'ai-assistant':
        return h(AIAssistant, { ...commonProps, user, clientes, encomendas, financas });
      default:
        return h(Dashboard, { ...commonProps, user, clientes, encomendas, lembretes, financas, config });
    }
  };

  return h(
    'div',
    { className: 'app-container' },
    renderScreen(),
    screen !== 'auth' &&
      h(
        'nav',
        { className: 'bottom-nav' },
        h(
          'div',
          { className: 'nav-item ' + (screen === 'dashboard' ? 'active' : ''), onClick: () => goTo('dashboard') },
          h(IC.dashboard),
          h('span', null, 'Início')
        ),
        h(
          'div',
          { className: 'nav-item ' + (screen === 'clientes' || screen === 'cliente-detail' ? 'active' : ''), onClick: () => goTo('clientes') },
          h(IC.users),
          h('span', null, 'Clientes')
        ),
        h(
          'div',
          { className: 'nav-item ' + (screen === 'encomendas' ? 'active' : ''), onClick: () => goTo('encomendas') },
          h(IC.pkg),
          h('span', null, 'Pedidos')
        ),
        h(
          'div',
          { className: 'nav-item ' + (screen === 'financas' ? 'active' : ''), onClick: () => goTo('financas') },
          h(IC.money),
          h('span', null, 'Finanças')
        ),
        h(
          'div',
          { className: 'nav-item ' + (screen === 'menu' ? 'active' : ''), onClick: () => goTo('menu') },
          h(IC.menu),
          h('span', null, 'Menu')
        )
      )
  );
}
