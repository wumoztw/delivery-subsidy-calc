/* 分頁 3：疊單產值與作戰模擬（由子元件組成） */
(function (root) {
  'use strict';
  const C = (root.DSCComponents = root.DSCComponents || {});
  C['tab-tactics'] = {
    name: 'TabTactics',
    setup() { return root.Vue.inject('dsc'); },
    template: `
<div v-show="activeTab === 'tactics'" class="space-y-5 sm:space-y-6">
  <sim-panel></sim-panel>
  <vehicle-matrix></vehicle-matrix>
  <single-order-plan></single-order-plan>
  <vehicle-handbook></vehicle-handbook>
  <watch-vs-bill></watch-vs-bill>
</div>
`
  };
})(window);
