/* global iida */
(function() {
  var topologyData = {
    nodes: [
      {id: 0, x: 100, y: 100, iconType: 'router', name: 'R1', status: 'up'},
      {id: 1, x: 150, y: 100, iconType: 'switch', name: 'SW1', status: 'up'},
      {id: 2, x: 200, y: 100, iconType: 'server', name: 'PC1', status: 'up'}
    ],
    links: [
      {id: 0, source: 0, target: 1, label: 'R1-SW1', sourcePortId: 'G1/0/1', targetPortId: 'G1/0/2', color: 'purple'},
      {id: 1, source: 1, target: 2, up: true},
      {id: 2, source: 1, target: 2, down: true, dotted: true}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
