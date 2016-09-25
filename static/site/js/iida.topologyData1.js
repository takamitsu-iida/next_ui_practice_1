/* global iida */
(function() {
  var topologyData = {
    nodes: [
      {id: 0, x: 100, y: 100},
      {id: 1, x: 150, y: 100}
    ],
    links: [
      {id: 0, source: 0, target: 1}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
