/* global nx, iida */
(function(nx, iida) {
  // View定義
  // nx.ui.Componentクラスを継承して作成する
  iida.TopologyContainer = nx.define('TopologyContainer', nx.ui.Component, {
    properties: {
      // トポロジデータを格納するオブジェクト
      topologyData: {},
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
        // angularのディレクティブもここに書く
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
          linkConfig: {
            // ノード間に複数の線がある場合に、どのように表示するか
            // 'curve' もしくは 'parallel' の２択
            linkType: 'parallel'
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
        // 'ready'を待ってからデータをセットすることにする
      }
    }
  });

  // シェルの作成
  // nx.ui.Applicationを継承したクラスを定義する
  iida.NxShell = nx.define(nx.ui.Application, {
    methods: {
      start: function(container) {
        container.attach(this);
      }
    }
  });
})(nx, iida);
