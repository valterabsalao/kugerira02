/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

const h = React.createElement;

export const IC = {
  dashboard: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('rect', { key: 1, x: 3, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { key: 2, x: 14, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { key: 3, x: 3, y: 14, width: 7, height: 7, rx: 1 }),
      h('rect', { key: 4, x: 14, y: 14, width: 7, height: 7, rx: 1 }),
    ]),
  users: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { key: 2, cx: 9, cy: 7, r: 4 }),
      h('path', { key: 3, d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { key: 4, d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
    ]),
  user: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
      h('circle', { key: 2, cx: 12, cy: 7, r: 4 }),
    ]),
  pkg: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', {
        key: 1,
        d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      }),
      h('polyline', { key: 2, points: '3.27 6.96 12 12.01 20.73 6.96' }),
      h('line', { key: 3, x1: 12, y1: 22.08, x2: 12, y2: 12 }),
    ]),
  send: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 22, y1: 2, x2: 11, y2: 13 }),
      h('polygon', { key: 2, points: '22 2 15 22 11 13 2 9 22 2' }),
    ]),
  money: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 12, y1: 1, x2: 12, y2: 23 }),
      h('path', { key: 2, d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }),
    ]),
  cal: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('rect', { key: 1, x: 3, y: 4, width: 18, height: 18, rx: 2 }),
      h('line', { key: 2, x1: 16, y1: 2, x2: 16, y2: 6 }),
      h('line', { key: 3, x1: 8, y1: 2, x2: 8, y2: 6 }),
      h('line', { key: 4, x1: 3, y1: 10, x2: 21, y2: 10 }),
    ]),
  cog: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('circle', { key: 0, cx: 12, cy: 12, r: 3 }),
      h('path', {
        key: 1,
        d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
      }),
    ]),
  chart: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '22 12 18 12 15 21 9 3 6 12 2 12' }),
    ]),
  plus: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 12, y1: 5, x2: 12, y2: 19 }),
      h('line', { key: 2, x1: 5, y1: 12, x2: 19, y2: 12 }),
    ]),
  search: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('circle', { key: 1, cx: 11, cy: 11, r: 8 }),
      h('line', { key: 2, x1: 21, y1: 21, x2: 16.65, y2: 16.65 }),
    ]),
  bell: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
      h('path', { key: 2, d: 'M13.73 21a2 2 0 0 1-3.46 0' }),
    ]),
  arrow: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [h('polyline', { key: 1, points: '9 18 15 12 9 6' })]),
  back: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [h('polyline', { key: 1, points: '15 18 9 12 15 6' })]),
  wa: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', stroke: 'none', ...props }, [
      h('path', {
        key: 1,
        d: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z',
      }),
    ]),
  edit: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
      h('path', { key: 2, d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' }),
    ]),
  trash: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '3 6 5 6 21 6' }),
      h('path', {
        key: 2,
        d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
      }),
    ]),
  check: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [h('polyline', { key: 1, points: '20 6 9 17 4 12' })]),
  x: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }),
      h('line', { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 }),
    ]),
  star: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polygon', {
        key: 1,
        points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2',
      }),
    ]),
  download: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '8 17 12 21 16 17' }),
      h('line', { key: 2, x1: 12, y1: 12, x2: 12, y2: 21 }),
      h('path', { key: 3, d: 'M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29' }),
    ]),
  upload: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '16 16 12 12 8 16' }),
      h('line', { key: 2, x1: 12, y1: 12, x2: 12, y2: 21 }),
      h('path', { key: 3, d: 'M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3' }),
    ]),
  trend: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
      h('polyline', { key: 2, points: '17 6 23 6 23 12' }),
    ]),
  tag: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', {
        key: 1,
        d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z',
      }),
      h('line', { key: 2, x1: 7, y1: 7, x2: 7.01, y2: 7 }),
    ]),
  funnel: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polygon', { key: 1, points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' }),
    ]),
  target: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('circle', { key: 1, cx: 12, cy: 12, r: 10 }),
      h('circle', { key: 2, cx: 12, cy: 12, r: 6 }),
      h('circle', { key: 3, cx: 12, cy: 12, r: 2 }),
    ]),
  book: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
      h('path', {
        key: 2,
        d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
      }),
    ]),
  piechart: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M21.21 15.89A10 10 0 1 1 8 2.83' }),
      h('path', { key: 2, d: 'M22 12A10 10 0 0 0 12 2v10z' }),
    ]),
  zap: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polygon', { key: 1, points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' }),
    ]),
  mic: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z' }),
      h('path', { key: 2, d: 'M19 10v2a7 7 0 0 1-14 0v-2' }),
      h('line', { key: 3, x1: 12, y1: 19, x2: 12, y2: 23 }),
      h('line', { key: 4, x1: 8, y1: 23, x2: 16, y2: 23 }),
    ]),
  stop: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [h('rect', { key: 1, x: 4, y: 4, width: 16, height: 16, rx: 2 })]),
  history: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' }),
      h('polyline', { key: 2, points: '3 3 3 8 8 8' }),
      h('polyline', { key: 3, points: '12 7 12 12 15 15' }),
    ]),
  template: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('rect', { key: 1, x: 3, y: 3, width: 18, height: 18, rx: 2 }),
      h('line', { key: 2, x1: 3, y1: 9, x2: 21, y2: 9 }),
      h('line', { key: 3, x1: 9, y1: 21, x2: 9, y2: 9 }),
    ]),
  close: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 18, y1: 6, x2: 6, y2: 18 }),
      h('line', { key: 2, x1: 6, y1: 6, x2: 18, y2: 18 }),
    ]),
  menu: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('line', { key: 1, x1: 3, y1: 12, x2: 21, y2: 12 }),
      h('line', { key: 2, x1: 3, y1: 6, x2: 21, y2: 6 }),
      h('line', { key: 3, x1: 3, y1: 18, x2: 21, y2: 18 }),
    ]),
  ai: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z' }),
      h('path', { key: 2, d: 'M12 8a4 4 0 1 0 4 4 4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2 2 2 0 0 1-2 2z' }),
      h('circle', { key: 3, cx: 12, cy: 12, r: 1 }),
    ]),
  sparkles: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' }),
      h('path', { key: 2, d: 'M5 3v4' }),
      h('path', { key: 3, d: 'M19 17v4' }),
      h('path', { key: 4, d: 'M3 5h4' }),
      h('path', { key: 5, d: 'M17 19h4' }),
    ]),
  help: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('circle', { key: 1, cx: 12, cy: 12, r: 10 }),
      h('path', { key: 2, d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
      h('line', { key: 3, x1: 12, y1: 17, x2: 12.01, y2: 17 }),
    ]),
  clock: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('circle', { key: 1, cx: 12, cy: 12, r: 10 }),
      h('polyline', { key: 2, points: '12 6 12 12 16 14' }),
    ]),
  phone: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('path', { key: 1, d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }),
    ]),
  chevronDown: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '6 9 12 15 18 9' }),
    ]),
  chevronUp: (props: any) =>
    h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', ...props }, [
      h('polyline', { key: 1, points: '18 15 12 9 6 15' }),
    ]),
};
