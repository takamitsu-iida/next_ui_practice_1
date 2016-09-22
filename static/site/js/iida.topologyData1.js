/* global iida */
(function() {
  var topologyData = {
    nodes: [
      {id: 0, x: 100, y: 180, iconType: 'Router', name: 'R-1'},
      {id: 1, x: 200, y: 180, iconType: 'Router', name: 'R-2'}
    ],
    links: [
      {id: 0, source: 0, target: 1}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
