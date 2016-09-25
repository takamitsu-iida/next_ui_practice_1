/* global nx, iida */
(function(nx, iida) {
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
          linkInstanceClass: 'MyExtendLink', // 拡張したLinkクラスを使\う
          linkConfig: {
            // ノード間に複数の線がある場合に、どのように表示するか
            // 'curve' もしくは 'parallel' の２択
            linkType: 'parallel',
            sourceLabel: 'model.sourceLabel',
            targetLabel: 'model.targetLabel'
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

  // NodeStatusレイヤを定義する
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
      sourceLabel: null,
      targetLabel: null
    },
    view: function(view) {
      view.content.push({
        name: 'source',
        type: 'nx.graphic.Text',
        props: {
          'class': 'sourceLabel',
          'alignment-baseline': 'text-after-edge',
          'text-anchor': 'start'
        }
      }, {
        name: 'target',
        type: 'nx.graphic.Text',
        props: {
          'class': 'targetLabel',
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

        if (this.sourceLabel()) {
          el = this.view('source');
          point = line.start;
          el.set('x', point.x);
          el.set('y', point.y);
          el.set('text', this.sourceLabel());
          el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
          el.setStyle('font-size', 12 * stageScale);
        }

        if (this.targetLabel()) {
          el = this.view('target');
          point = line.end;
          el.set('x', point.x);
          el.set('y', point.y);
          el.set('text', this.targetLabel());
          el.set('transform', 'rotate(' + angle + ' ' + point.x + ',' + point.y + ')');
          el.setStyle('font-size', 12 * stageScale);
        }
      }
    }
  });

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
  //
})(nx, iida);
