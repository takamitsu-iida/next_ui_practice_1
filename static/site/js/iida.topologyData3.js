/* global iida */
(function() {
  var topologyData = {
    nodes: [
      {id: 0, x: 410, y: 100, name: '12K-1'},
      {id: 1, x: 410, y: 280, name: '12K-2'},
      {id: 2, x: 660, y: 280, name: 'Of-9k-03'},
      {id: 3, x: 660, y: 100, name: 'Of-9k-02'},
      {id: 4, x: 180, y: 190, name: 'Of-9k-01'}
    ],
    links: [
      {id: 0, source: 0, target: 1},
      {id: 1, source: 1, target: 2},
      {id: 2, source: 1, target: 3},
      {id: 3, source: 4, target: 1},
      {id: 4, source: 2, target: 3},
      {id: 5, source: 2, target: 0},
      {id: 6, source: 3, target: 0},
      {id: 7, source: 3, target: 0},
      {id: 8, source: 3, target: 0},
      {id: 9, source: 0, target: 4},
      {id: 10, source: 0, target: 4},
      {id: 11, source: 0, target: 3}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
