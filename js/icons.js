/* 集中式輕量 SVG 圖示字典（Tabler / Lucide 風格，24x24、stroke=currentColor）。
 * 用法：<ico name="scale" /> ；大小以 class 控制（預設 1em），顏色跟隨文字色。 */
(function (root) {
  'use strict';
  const P = {
    scale: '<path d="M12 4v16M8 20h8M5 7h14"/><path d="M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z"/>',
    coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.5A6 6 0 1115 21a6 6 0 01-4-1.5M7.5 9h3M9 7.5v3"/>',
    currency: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9h-3.8a1.8 1.8 0 000 3.6h2.6a1.8 1.8 0 010 3.6H9M12 6.8V8M12 16.2v1.2"/>',
    gauge: '<path d="M4.5 18a9 9 0 1115 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M10 2h4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wallet: '<path d="M17 8V6a2 2 0 00-2-2H5a2 2 0 000 4h14a1 1 0 011 1v10a1 1 0 01-1 1H5a2 2 0 01-2-2V6"/><circle cx="16.5" cy="14" r="1"/>',
    banknote: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8.5a3.5 3.5 0 000-7h-9a3.5 3.5 0 010-7H16"/>',
    distance: '<path d="M3 17l4-4 3 3 4-5 4 4M3 21h18M3 21V3"/>',
    package: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    'heart-handshake': '<path d="M12 20l-7.5-7.3a4.9 4.9 0 017-7L12 6l.5-.3a4.9 4.9 0 017 7z"/><path d="M9 11l2 2a1.4 1.4 0 002-2l-1.5-1.5"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 01-10 0c0-2 1-3 2-4 .5 1.5 1.5 2 2 2 0-3-1-5 1-8z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    zap: '<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>',
    newspaper: '<path d="M4 5h12a1 1 0 011 1v13H6a2 2 0 01-2-2z"/><path d="M17 9h3v8a2 2 0 01-2 2M7.5 9h6M7.5 13h6M7.5 16h3"/>',
    'external-link': '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>',
    'alert-triangle': '<path d="M12 4l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5v.01"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V4a1 1 0 011-1h4a1 1 0 011 1v.5M9 12h6M9 16h4"/>',
    'file-spreadsheet': '<path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M8 13h8M8 17h8M12 13v6"/>',
    walking: '<circle cx="13" cy="4.5" r="1.8"/><path d="M8 21l3-6-2-3 1-4 4 2 2 3M11 15l3 2 1 4M8 11l2-4"/>',
    bike: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17L9 8h5l4.5 9M9 8L7.5 6H6M14 8l-3 9"/>',
    motorcycle: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M9 17h5l3-7h-4M14 17l-3-5H6M17 10l-1-4h2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.6 2.3 2.7-.6.8 2.7 2.6 1-.6 2.7L21.5 12l-2.3 1.4.6 2.7-2.6 1-.8 2.7-2.7-.6L12 21.5l-1.6-2.3-2.7.6-.8-2.7-2.6-1 .6-2.7L2.5 12l2.3-1.4-.6-2.7 2.6-1 .8-2.7 2.7.6z"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
    store: '<path d="M4 9l1.5-5h13L20 9M4 9a2.5 2.5 0 005 0 2.5 2.5 0 006 0 2.5 2.5 0 005 0M5 12v8h14v-8M10 20v-5h4v5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    download: '<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 20h14"/>',
    trending: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>'
  };
  const paths = (n) => P[n] || P.sparkle;
  root.DSCIcons = {
    paths: P,
    svg: (n, cls) => '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths(n) + '</svg>'
  };
  const C = (root.DSCComponents = root.DSCComponents || {});
  C.ico = {
    name: 'Ico',
    props: { name: { type: String, required: true } },
    render() {
      return root.Vue.h('svg', {
        class: 'ico', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
        'stroke-width': 1.9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
        'aria-hidden': 'true', innerHTML: paths(this.name)
      });
    }
  };
})(window);
