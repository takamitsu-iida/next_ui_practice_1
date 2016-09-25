/* global nx, iida */
(function(nx, iida) {
  // シェルの作成とコンテナのアタッチ
  // nx.ui.Applicationを継承したクラスを定義する
  iida.NxShell = nx.define(nx.ui.Application, {
    methods: {
      start: function(container) {
        container.attach(this);
      },
      stop: function(container) {
        this.detach(container);
      }
    }
  });

  // ng.graphic.Topologyクラスのオブジェクトを格納するコンテナ
  // データとTopologyオブジェクトの両方をひとまとめにしておくと便利
  // nx.ui.Componentクラスを継承して作成する
  iida.TopologyContainer = nx.define('TopologyContainer', nx.ui.Component, {
    properties: {
      // トポロジデータを格納するオブジェクト
      topologyData: {},
      //
      // nx.graphic.Topologyオブジェクトを返すgetter
      // var topology = topologyContainer.topology();
      // topology.data(); でデータをゲット
      // topology.data(obj); でデータをセット
      // topology.on('ready', function() {}); でイベントハンドラをセット
      topology: {
        get: function() {
          return this.view('topology');
        }
      }
    },
    view: {
      props: {
        // CSSのクラスと紐付けるための設定
        class: 'iida-nx-view flex layout-fill'
      },
      content: {
        name: 'topology', // オブジェクト名。 view('topology')でこのオブジェクトが返る
        type: 'nx.graphic.Topology',
        props: {
          showIcon: true,
          theme: 'green',
          identityKey: 'id',
          // dataProcessor: 'force', // 推奨はforceとなっているけど、指定するとおかしくなる 'nextforce' or 'force' or 'quick' or 'circle'
          adaptive: true, // width 100% if true
          data: '{#topologyData}', // プロパティに紐付ける。 {#プロパティ名}は関数として扱われる
          nodeConfig: {
            // ラベルに使うキーを設定
            // デフォルトはidなので、それをnameに変更する
            // modelという文字列は、固定
            label: 'model.name',
            iconType: 'model.iconType' // 'model.device_type'
          },
          nodeSetConfig: {
            // ノードセットの設定
            label: 'model.id',
            iconType: 'model.iconType'
          },
          tooltipManagerConfig: {
            // 独自拡張したツールチップを表示する
            // nodeTooltipContentClass: 'MyNodeTooltip'
            // linkTooltipContentClass: 'MyLinkTooltip'
          },
          linkInstanceClass: 'MyExtendLink', // 拡張したLinkクラスを使う
          linkConfig: {
            linkType: 'parallel', // // 'curve' もしくは 'parallel' の２択
            label: 'model.label',
            sourcePortId: 'model.sourcePortId',
            targetPortId: 'model.targetPortId',
            color: function(edge, model) {
              if (edge.get('up')) {
                return 'green';
              }
              if (edge.get('down')) {
                return 'red';
              }
              return nx.path(model, 'model.color');
            },
            dotted: function(edge) {
              return edge.get('dotted');
            }
          }
        }
      }
    },
    methods: {
      init: function(options) {
        this.inherited(options);
        this.loadData();
      },
      loadData: function() {
        // 書式としては、以下のどちらでもデータをセットできる
        // this.topology().data(データオブジェクト);
        // this.topologyData(データオブジェクト);
        // 'ready'を待ってからデータをセットすることにして、ここではデータをセットしない
      }
    }
  });

  // ここから先は機能を拡張するための定義。

  // NodeStatusレイヤの定義
  // ノードにドットを付ける関数もこの中に定義する
  nx.define('NodeStatus', nx.graphic.Topology.Layer, {
    methods: {
      draw: function() {
        // nx.graphic.Topologyクラスのインスタンスを取得する
        var topology = this.topology();
        // eachNode()は全ノードをトラバースする。第二引数はコンテキスト。thisを渡しておけば、eachNode内でも同じthisを指す。
        topology.eachNode(function(node) {
          // nx.graphic.Circleクラスオブジェクトでドットを作成する
          var dot = new nx.graphic.Circle({
            r: 6,
            cx: -20,
            cy: -20
          });
          // 偶数ノードと奇数ノードで色を分ける
          var color = (node.model().get('id') % 2 === 0) ? '#f00' : '#0f0';
          dot.set('fill', color);

          // dotをノードにアタッチする
          dot.attach(node);

          // nodeオブジェクトからdotを取り出せるようにしておく
          node.dot = dot;
        }, this);
      },
      undraw: function() {
        var topology = this.topology();
        topology.eachNode(function(node) {
          if (node.dot) {
            node.dot.detach(node);
            delete node['dot'];
          }
        }, this);
      },
      turnGreen: function() {
        var topology = this.topology();
        topology.eachNode(function(node) {
          node.dot.set('fill', '#0f0');
        });
      },
      random: function() {
        var colorTable = ['#C3A5E4', '#75C6EF', '#CBDA5C', '#ACAEB1 ', '#2CC86F'];
        var topology = this.topology();
        topology.eachNode(function(node) {
          node.dot.set('fill', colorTable[Math.floor(Math.random() * 5)]);
        });
      }
    }
  });

  // https://communities.cisco.com/thread/65299
  // 両端に文字を追加したリンクの定義
  nx.define('MyExtendLink', nx.graphic.Topology.Link, {
    properties: {
      sourcePortId: null,
      targetPortId: null
    },
    view: function(view) {
      view.content.push({
        name: 'source',
        type: 'nx.graphic.Text',
        props: {
          'class': 'sourcePortId',
          'alignment-baseline': 'text-after-edge',
          'text-anchor': 'start'
        }
      }, {
        name: 'target',
        type: 'nx.graphic.Text',
        props: {
          'class': 'targetPortId',
          'alignment-baseline': 'text-after-edge',
          'text-anchor': 'end'
        }
      });
      return view;
    },
    methods: {
      update: function() {
        this.inherited();

        var el;
        var point;
        var line = this.line();
        var angle = line.angle();
        var stageScale = this.stageScale();

        // pad line
        line = line.pad(18 * stageScale, 18 * stageScale);

        if (this.sourcePortId()) {
          el = this.view('source');
          point = line.start;
          el.set('x', point.x);
          el.set('y', point.y);
          el.set('text', this.sourcePortId());
          el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
          el.setStyle('font-size', 12 * stageScale);
        }

        if (this.targetPortId()) {
          el = this.view('target');
          point = line.end;
          el.set('x', point.x);
          el.set('y', point.y);
          el.set('text', this.targetPortId());
          el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
          el.setStyle('font-size', 12 * stageScale);
        }
      }
    }
  });

  // ノードのツールチップの定義
  // 要調整
  // まだ使えなる状態ではない
  nx.define('MyNodeTooltip', nx.ui.Component, {
    properties: {
      node: {},
      topology: {}
    },
    view: {
      content: [{
        tag: 'h1',
        content: '{#node.id}'
      }, {
        tag: 'p',
        content: [{
          tag: 'label',
          content: 'Username:'
        }, {
          tag: 'span',
          content: '{username}'
        }]
      }, {
        tag: 'p',
        content: '{#topology.width}'
      }, {
        tag: 'table',
        props: {
          class: 'col-md-12',
          border: '1'
        },
        content: [{
          tag: 'thead',
          content: {
            tag: 'tr',
            content: [{
              tag: 'td'
            }, {
              tag: 'td',
              content: 'pkts'
            }, {
              tag: 'td',
              content: 'bytes'
            }]
          }
        }, {
          tag: 'tbody',
          props: {
            items: '{#node.model.data}',
            template: {
              tag: 'tr',
              content: [{
                tag: 'td',
                content: '{nodeName}'
              }, {
                tag: 'td',
                content: '{packets}'
              }, {
                tag: 'td',
                content: '{bytes}'
              }]
            }
          }
        }]
      }]
    }
  });

  // リンクのツールチップの定義
  // 要調整
  // まだ使えなる状態ではない
  nx.define('MyLinkTooltip', nx.ui.Component, {
    properties: {
      link: {},
      topology: {}
    },
    view: {
      content: [{
        tag: 'p',
        content: [{
          tag: 'label',
          content: 'Source'
        }, {
          tag: 'span',
          content: '{#link.sourceNodeID}'
        }, {
          tag: 'label',
          content: 'Target'
        }, {
          tag: 'span',
          content: '{#link.targetNodeID}'
        }]
      }, {
        tag: 'p',
        content: '{#topology.width}'
      }, {
        tag: 'p',
        content: {
          tag: 'a',
          content: 'Action',
          props: {
            href: '#'
          },
          events: {
            click: '{#open}'
          }
        }
      }]
    },
    methods: {
      open: function(sender, event) {
        console.log(sender);
      }
    }
  });
  //
})(nx, iida);
