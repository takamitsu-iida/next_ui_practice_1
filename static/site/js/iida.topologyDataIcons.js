/* global iida */
(function() {
  var topologyData = {
    nodes: [
      {x: 0, y: 0, iconType: 'router', name: 'router'},
      {x: 50, y: 0, iconType: 'switch', name: 'switch'},
      {x: 100, y: 0, iconType: 'wlc', name: 'wlc'},
      {x: 150, y: 0, iconType: 'unknown', name: 'unknown'},
      {x: 200, y: 0, iconType: 'server', name: 'server'},
      {x: 0, y: 50, iconType: 'phone', name: 'phone'},
      {x: 50, y: 50, iconType: 'nexus5000', name: 'nexus5000'},
      {x: 100, y: 50, iconType: 'ipphone', name: 'ipphone'},
      {x: 150, y: 50, iconType: 'host', name: 'host'},
      {x: 200, y: 50, iconType: 'camera', name: 'camera'},
      {x: 0, y: 100, iconType: 'accesspoint', name: 'accesspoint'},
      {x: 50, y: 100, iconType: 'groups', name: 'groups'},
      {x: 100, y: 100, iconType: 'groupm', name: 'groupm'},
      {x: 150, y: 100, iconType: 'groupl', name: 'groupl'},
      {x: 200, y: 100, iconType: 'collapse', name: 'collapse'},
      {x: 0, y: 150, iconType: 'expand', name: 'expand'},
      {x: 50, y: 150, iconType: 'cloud', name: 'cloud'},
      {x: 100, y: 150, iconType: 'unlinked', name: 'unlinked'},
      {x: 150, y: 150, iconType: 'firewall', name: 'firewall'},
      {x: 200, y: 150, iconType: 'hostgroup', name: 'hostgroup'},
      {x: 0, y: 200, iconType: 'wirelesshost', name: 'wirelesshost'}
    ]
  };

  // iida.topologyDatas配列はiida.startup.jsの中で定義済みなので、そこに追加する
  iida.topologyDatas.push(topologyData);
})();
