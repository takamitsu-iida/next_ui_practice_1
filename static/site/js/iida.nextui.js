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
          data: '{#topologyData}', // プロパティに紐付ける。 {#プロパティ名}はgetter/setterを持った関数として扱われる
          showIcon: true,
          theme: 'green',
          identityKey: 'id',
          // dataProcessor: 'force', // 推奨はforceとなっているけど、指定するとおかしくなる 'nextforce' or 'force' or 'quick' or 'circle'
          adaptive: true, // width 100% if true
          // http://codepen.io/NEXTSUPPORT/pen/PNVXvx
          // nodeInstanceClass: 'MyExtendNode',  // ノードを独自拡張した場合には、クラスを指定する
          nodeConfig: {
            // ラベルに使うキーを設定
            // デフォルトはidなので、それをnameに変更する
            // modelという文字列は、固定
            label: 'model.name',
            iconType: 'model.iconType' // 'model.device'
          },
          nodeSetConfig: {
            label: 'model.name',
            iconType: 'model.iconType'
          },
          tooltipManagerConfig: {
            // 独自拡張したツールチップを表示する
            nodeTooltipContentClass: 'MyNodeTooltip',
            linkTooltipContentClass: 'MyLinkTooltip'
          },
          linkInstanceClass: 'MyExtendLink', // 拡張したLinkクラスを使う
          linkConfig: {
            linkType: 'parallel', // 'curve' もしくは 'parallel' の２択
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
        // this.loadData();  // 'ready'を待ってからデータをセットすることにして、ここではデータをセットしない
      },
      loadData: function() {
        // 書式としては、以下のどちらでもデータをセットできる
        // this.topology().data(データオブジェクト);
        // this.topologyData(データオブジェクト);
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
          // el.setStyle('font-size', 12 * stageScale); // devnetの例はこうなっているが、たぶん間違い
          el.dom().setStyle('font-size', 12 * stageScale); // 正しくはこうだと思う
        }

        if (this.targetPortId()) {
          el = this.view('target');
          point = line.end;
          el.set('x', point.x);
          el.set('y', point.y);
          el.set('text', this.targetPortId());
          el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
          el.dom().setStyle('font-size', 12 * stageScale);
        }
      }
    }
  });

  // ノードのツールチップの定義
  // http://codepen.io/NEXTSUPPORT/pen/LkaAOK
  // ノードのモデルを差し替えてツールチップに表示する内容を変更する
  // next.jsの中にある 'nx.graphic.Topology.NodeTooltipContent' とほぼ同じコード。
  nx.define('MyNodeTooltip', nx.ui.Component, {
    properties: {
      title: '',
      node: {
        set: function(value) {
          // 元データ
          var model = value.model();

          // 加工後のデータ
          var dataCollection = new nx.data.Collection(filterModel(model.getData()));

          // viewの中にある 'list' 部分に加工後のデータをセットする
          this.view('list').set('items', dataCollection);

          // ツールチップのタイトルはlabel()を使う
          if (value.label()) {
            this.title(value.label());
          }

          function filterModel(model) {
            // 差し替え後のモデル
            var newModel = [];

            newModel.push({
              label: 'Name',
              value: (model.name) ? model.name : model.id
            });

            newModel.push({
              label: 'Type',
              value: (model.iconType) ? model.iconType : 'unknown'
            });

            if (model.isProvisioned) {
              newModel.push({
                label: 'Provisioned',
                value: (model.isProvisioned === true) ? 'Yes' : 'No'
              });
            }

            if (model.status) {
              newModel.push({
                label: 'Status',
                value: model.status
              });
            }

            // console.log(newModel);
            return newModel;
          }
        }
      }
    },
    // 'view' defines the appearance of the tooltip
    view: {
      content: [{
        name: 'header',
        props: {
          class: 'n-topology-tooltip-header'
        },
        content: [{
          tag: 'span',
          props: {
            class: 'n-topology-tooltip-header-text'
          },
          name: 'title',
          content: '{#title}'
        }]
      }, {
        name: 'content',
        props: {
          class: 'n-topology-tooltip-content n-list'
        },
        content: [{
          name: 'list',
          tag: 'ul',
          props: {
            class: 'n-list-wrap',
            template: {
              tag: 'li',
              props: {
                class: 'n-list-item-i',
                role: 'listitem'
              },
              content: [{
                tag: 'label',
                content: '{label}: '
              }, {
                tag: 'span',
                content: '{value}'
              }]
            }
          }
        }]
      }]
    },
    methods: {
      init: function(args) {
        this.inherited(args);
      }
    }
  });

  // リンクのツールチップの定義
  // nx.graphic.Topology.LinkTooltipContent とほぼ同じコード
  nx.define('MyLinkTooltip', nx.ui.Component, {
    properties: {
      topology: {},
      title: '',
      link: {
        set: function(value) {
          // 元データ
          var model = value.model();

          // 加工後のデータ
          var dataCollection = new nx.data.Collection(filterModel(model.getData()));

          // viewの中にある 'list' 部分に加工後のデータをセットする
          this.view('list').set('items', dataCollection);

          // ツールチップのタイトルはlabel()を使う
          if (value.label()) {
            this.title(value.label());
          }

          function filterModel(model) {
            // 差し替え後のモデル
            var newModel = [];

            newModel.push({
              label: 'Name',
              value: (model.name) ? model.name : model.id
            });

            newModel.push({
              label: 'Source',
              value: model.source
            });

            newModel.push({
              label: 'Target',
              value: model.target
            });

            if (model.up || model.down) {
              newModel.push({
                label: 'Status',
                value: (model.up) ? 'UP' : 'DOWN'
              });
            }

            if (model.sourcePortId) {
              newModel.push({
                label: 'sourcePort',
                value: model.sourcePortId
              });
            }

            if (model.targetPortId) {
              newModel.push({
                label: 'targetPort',
                value: model.targetPortId
              });
            }

            // console.log(newModel);
            return newModel;
          }
        }
      }
    },
    // 'view' defines the appearance of the tooltip
    view: {
      content: [{
        name: 'header',
        props: {
          class: 'n-topology-tooltip-header'
        },
        content: [{
          tag: 'span',
          props: {
            class: 'n-topology-tooltip-header-text'
          },
          name: 'title',
          content: '{#title}'
        }]
      }, {
        name: 'content',
        props: {
          class: 'n-topology-tooltip-content n-list'
        },
        content: [{
          name: 'list',
          tag: 'ul',
          props: {
            class: 'n-list-wrap',
            template: {
              tag: 'li',
              props: {
                class: 'n-list-item-i',
                role: 'listitem'
              },
              content: [{
                tag: 'label',
                content: '{label}: '
              }, {
                tag: 'span',
                content: '{value}'
              }]
            }
          }
        }]
      }]
    },
    methods: {
      init: function(args) {
        this.inherited(args);
      }
    }
  });
  //
})(nx, iida);
