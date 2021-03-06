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
      {id: 6, source: 0, target: 4},
      {id: 7, source: 0, target: 3},
      {id: 8, source: 0, target: 3},
      {id: 9, source: 0, target: 3},
      {id: 10, source: 0, target: 3},
      {id: 11, source: 0, target: 3},
      {id: 12, source: 0, target: 3},
      {id: 13, source: 0, target: 3},
      {id: 14, source: 0, target: 3},
      {id: 15, source: 0, target: 3},
      {id: 16, source: 0, target: 3},
      {id: 17, source: 0, target: 3}
    ],
    nodeSet: [
      {id: 5, type: 'nodeSet', nodes: [2, 3], root: '2', x: 660, y: 190, name: 'Node set 1', iconType: 'router'},
      {id: 6, type: 'nodeSet', nodes: [1, 5], root: '1', x: 410, y: 190, name: 'Node set 2', iconType: 'groupS'},
      {id: 7, type: 'nodeSet', nodes: [6, 0], root: '0', x: 410, y: 280, name: 'Node set 3', iconType: 'groupM'},
      {id: 8, type: 'nodeSet', nodes: [7, 4], root: '4', x: 410, y: 280, name: 'Node set 4', iconType: 'groupL'}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
