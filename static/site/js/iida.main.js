/* global angular, iida */
(function() {
  'use strict';

  // モジュール名iidaはiida.startup.jsでグローバル変数として定義している
  var moduleName = iida.moduleName;

  // AngularJSにモジュールとして登録
  angular.module(moduleName, [
    'ngResource',
    'ngAnimate',
    'ngMessages',
    'ngMaterial',
    'ui.router'
  ]);

  // Angular Materialの動作設定
  // デフォルトのテーマを使いつつ、色を変更する
  angular.module(moduleName).config(['$mdThemingProvider', '$mdIconProvider', function($mdThemingProvider, $mdIconProvider) {
    // テーマ色
    $mdThemingProvider
      .theme('default')
      .primaryPalette('deep-purple')
      .accentPalette('indigo');

    // アイコンを登録
    // 要http-server
    // index.htmlをローカルファイルとして開くとクロスドメインでの読み込みになり、うまく動かない
    // フォントとして読むのがいいのかもしれないけど、それならfont-awesomeの方が使い勝手が良い
    /*
    $mdIconProvider
      .icon("menu", "./static/site/svg/ic_menu_white_24px.svg", 24)
      .icon("close", "./static/site/svg/ic_close_white_24px.svg", 24)
      .icon("setting", "./static/site/svg/ic_settings_white_24px.svg", 24);
    */
    // HTMLではこのように指定する <md-icon md-svg-icon="setting"></md-icon>
  }]);

  // $log設定
  // $log.debug();によるデバッグメッセージの表示・非表示設定
  angular.module(moduleName).config(['$logProvider', function($logProvider) {
    $logProvider.debugEnabled(false);
  }]);

  // 戻るボタン用のディレクティブ
  // <back></back>
  angular.module(moduleName).directive('back', ['$window', function($window) {
    // オブジェクトを返却
    return {
      restrict: 'E',
      replace: true,
      template: '<button type="button" class="btn btn-primary">戻る</button>',
      link: function(scope, element, attrs) {
        element.bind('click', function() {
          $window.history.back();
        });
      }
    };
  }]);

  // 自動でフォーカスをあてる
  // <input iida-autofocus></input>
  angular.module(moduleName).directive('iidaAutofocus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          element.focus();
        });
      }
    };
  }]);

  // ここでは未使用
  // <form iida-focus-invalid></form>
  // バリデーションにかかった要素にフォーカスをあてる
  angular.module(moduleName).directive('iidaFocusInvalid', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        // 'submit'イベントを受信したときのハンドラを登録
        element.on('submit', function() {
          // .ng-invalidになっている要素を取り出して、フォーカスを当てる
          var firstInvalid = element[0].querySelector('.ng-invalid');
          if (firstInvalid) {
            firstInvalid.focus();
          }
        });
      }
    };
  });

  // <input type="text" iida-focus-on="submit">
  // 特定のイベントを捕捉してフォーカスをあてる
  // イベントの発行はコントローラから $scope.$broadcast('submit') のようにする
  // submit後に先頭にフォーカスを移すような場面で便利。
  // md-selectとは相性が悪く、一度奪ったフォーカスを即座にまた戻されてしまうので、500ミリ秒の遅延をいれている
  angular.module(moduleName).directive('iidaFocusOn', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$on(attrs.iidaFocusOn, function() {
          $timeout(function() {
            element[0].focus();
          }, 500);
        });
      }
    };
  }]);

  // サービス 'settingParamService'
  // 各コントローラはこのサービスをインジェクションして、settingParamを利用する
  angular.module(moduleName).service('settingParamService', [function() {
    var svc = this;

    // 設定パラメータをまとめたオブジェクト
    svc.settingParam = {
      // ng-ifでこれをバインドすれば、デバッグ目的で入れている要素の表示・非表示が切り替わる
      debug: true,

      // コンフィグを表示するかどうか
      showConf: false,

      // 配列の中のどのデータを使うか
      topologyDataIndex: 0
    };

    // 現在のsettingParamを返却する関数
    svc.getSettingParam = function() {
      return svc.settingParam;
    };
  }]);

  // コントローラ 'settingDialogController'
  // ダイアログとして表示するので、$mdDialogを注入する
  angular.module(moduleName).controller('settingDialogController', ['settingParamService', '$mdDialog', function(settingParamService, $mdDialog) {
    var ctrl = this;
    var svc = settingParamService;

    ctrl.title = '動作設定';

    // ダイアログを消す
    ctrl.hide = function() {
      $mdDialog.hide();
    };

    // ダイアログのキャンセルボタン
    ctrl.cancel = function() {
      $mdDialog.cancel();
    };

    // ダイアログからの戻り値
    ctrl.answer = function(answer) {
      $mdDialog.hide(answer);
    };

    // ダイアログを開く
    ctrl.showDialog = function(ev) {
      // ダイアログを開くときに、サービスが持っている設定パラメータのコピーをコントローラに取り込む
      ctrl.settingParam = angular.copy(svc.settingParam, {});

      $mdDialog.show(
        {
          controller: function() {
            return ctrl;
          },
          controllerAs: 'sc',
          templateUrl: 'setting.tpl',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          fullscreen: false
        })
        .then(function(answer) {
          // answerは 'ok' もしくは 'cancel' が入っている
          if (answer === 'ok') {
            // OKボタンを押したときのみ、コントローラが保有する設定情報をサービス側に同期する
            svc.settingParam = ctrl.settingParam;
          }
        }, function() {
          // 外側をクリックした場合はここに来る。
          // console.log('cancelled');
        });
    };
  }]);

  // UI Router
  // ルーティング設定
  angular.module(moduleName).config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // 一致しないURLは全て/に飛ばす
    $urlRouterProvider.otherwise('/');

    // ステートとURLを対応付ける
    // ここで定義するURLは実際に接続に行くURLではなく、#以下の識別子にすぎないので、REST APIと被ってても構わない
    $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'index.tpl',
        controller: 'indexController',
        controllerAs: 'indexCtrl'
      })
      .state('next', {
        url: '/next',
        templateUrl: 'next.tpl',
        controller: 'nextController',
        controllerAs: 'nextCtrl'
      });
  }]);

  // <body>にバインドする最上位のコントローラ
  // ロゴやレイアウトを担当
  angular.module(moduleName).controller('topController', ['settingParamService', '$mdMedia', '$window', function(settingParamService, $mdMedia, $window) {
    var ctrl = this;

    // settingParamServiceをミックスインする
    angular.extend(ctrl, settingParamService);

    // ツールバーの左に表示するロゴ
    ctrl.logoTitle = 'NeXt trial';

    // githubのリンク
    ctrl.githubUrl = 'https://github.com/takamitsu-iida/next_ui_practice_1';

    // ツールバーに表示するリンク
    ctrl.links = [{
      title: 'リンク1',
      label: 'link 1',
      url: '#'
    }, {
      title: 'リンク2',
      label: 'link 2',
      url: '#'
    }];

    // ctrl.back()でひとつ前のページに戻る
    ctrl.back = function() {
      $window.history.back();
    };
  }]);

  // トップページ用のコントローラ
  // indexController
  // タイトルとか、日付とか、作者とか、
  angular.module(moduleName).controller('indexController', [function() {
    var ctrl = this;

    ctrl.title = 'NeXt UIとAngularJSを組み合わせるテスト';
    ctrl.description = 'Angular Materialでレイアウトを構成し、メインのコンテンツにNeXt UIを配置します。NeXt UIの仕様のため、IEでは動作しません。';
    ctrl.date = '2016/09/19';
    ctrl.author = 'Takamitsu IIDA';
    ctrl.mail = 'iida@jp.fujitsu.com';
  }]);

  // データを格納するサービス
  // 'dataService'
  angular.module(moduleName).service('dataService', ['settingParamService', function(settingParamService) {
    var svc = this;

    // 初期データ配列の中から、いま選択しているものを返却する関数
    // どれを使うかは設定項目なので、settingParamSerivceからインデックスを取り出す
    svc.getTopologyData = function() {
      // 配列のインデックスでどのデータを使うか切り替える
      var settingParam = settingParamService.getSettingParam();
      var i = settingParam.topologyDataIndex;
      return iida.topologyDatas[i];
    };

    // データを差し替える関数
    svc.setTopologyData = function(newValue) {
      var settingParam = settingParamService.getSettingParam();
      var i = settingParam.topologyDataIndex;
      iida.topologyDatas[i] = newValue;
    };

    // キャッシュデータ
    // NxShellで操作するとxとyの値が書き換えられてしまうので、キャッシュしたデータを使う。
    svc.topologyDataNx = {};

    // キャッシュデータを取得する関数
    // angular.copy()でディープコピーを作り、それを返却する
    svc.getTopologyDataNx = function() {
      return angular.copy(svc.getTopologyData(), svc.getTopologyDataNx);
    };
  }]);

  // 配列データを画面表示に結びつけるためのコントローラ
  // 'dataController'
  angular.module(moduleName).controller('dataController', ['dataService', function(dataService) {
    var ctrl = this;

    // dataServiceをミックスイン
    angular.extend(ctrl, dataService);

    // エディタに表示するオブジェクト
    ctrl.obj = ctrl.getTopologyData();
  }]);

  // REST APIを叩く$resourceファクトリ
  angular.module(moduleName).factory('userResource', ['$resource', '$location', function($resource, $location) {
    // 標準で定義済みのアクションは４種類 query(), get(), save(), delete()
    // 個別定義のアクション update() を作成する
    return $resource(
      // 第一引数はURL
      // 'http://localhost:8000/rest/users/:name',
      // :nameはプレースホルダなので、/rest/users/iidaのようなURLに変換される
      $location.protocol() + '://' + $location.host() + ':' + $location.port() + '/rest/users/:name', {
        // 第二引数はデフォルトパラメータ
        // URLのプレースホルダとオブジェクト内のキー名とを対応付ける
        name: '@name'
      }, {
        // 第三引数はアクションの定義
        query: {
          // 複数のデータを取得
          method: 'GET',
          isArray: false // デフォルトはtrue
        },
        get: {
          // 単一のデータを取得
          method: 'GET'
        },
        save: {
          // 新規データを登録
          method: 'POST'
        },
        delete: {
          // 既存データを削除
          method: 'DELETE'
        },
        update: {
          // データを修正
          method: 'PUT'
        }
      }
    );
  }]);

  // コントローラ 'nextController'
  angular.module(moduleName).controller('nextController', ['dataService', 'userResource', function(dataService, userResource) {
    var ctrl = this;

    ctrl.title = 'NeXt UIによるトポロジデータ表示';
    ctrl.description = '初期データは右上のギアをクリックして選択します。';

    // 未対応
    // 初期化時にquery()するなら、その完了状態を確認した方がいい。
    //
    // データを取得済みかどうか
    // 初期状態ではfalseにして、usersデータのダウンロードに成功したらtrueに変える
    // ctrl.isDataFetched = true;
  }]);

  // NeXt UI用のディレクティブ
  // <div iida-nx-shell></div>
  angular.module(moduleName).directive('iidaNxShell', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      controller: 'dataController', // controllerで指定したものがlink関数の第4引数に渡される
      link: function(scope, element, attrs, dataController) {
        // 定義済みのTopologyContainerクラスをインスタンス化する
        var topologyContainer = new iida.TopologyContainer();

        // その中には 'nx.graphic.Topology' クラスのオブジェクトが格納されているので、それを取り出しておく
        var topology = topologyContainer.topology();

        // データの紐付けは任意のタイミングで行えるが、初期値は'ready'後がいいと思う。
        topology.on('ready', function() {
          // dataService -> dataController経由でデータを入手して、それをディープコピーして使う
          var d = dataController.getTopologyDataNx();
          topology.data(d);
        });

        // 定義済みのシェルをインスタンス化する
        var shell = new iida.NxShell();

        // シェルをこのエレメントにぶら下げる
        shell.container(element[0]);

        // シェルとトポロジコンテナを紐付けて、動作開始
        shell.start(topologyContainer);

        scope.$watch(dataController.getTopologyData, function(newValue, oldValue) {
          var d = dataController.getTopologyDataNx();
          topology.data(d);
        });
      }
    };
  }]);

  angular.module(moduleName).directive('jsonEditor', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModelCtrl) {
        function string2JSON(text) {
          try {
            var j = angular.fromJson(text);
            ngModelCtrl.$setValidity('json', true);
            return j;
          } catch (err) {
            // returning undefined results in a parser error as of angular-1.3-rc.0, and will not go through $validators
            // return undefined
            ngModelCtrl.$setValidity('json', false);
            // return text;
            return undefined;
          }
        }

        function JSON2String(object) {
          // NOTE that angular.toJson will remove all $$-prefixed values
          // alternatively, use JSON.stringify(object, null, 2);
          return angular.toJson(object, true);
        }

        // $validators is an object, where key is the error
        // ngModelCtrl.$validators.json = isValidJson;

        // array pipelines
        ngModelCtrl.$parsers.push(string2JSON);
        ngModelCtrl.$formatters.push(JSON2String);
      }
    };
  }]);

  // コントローラ 'editorDialogController'
  // <md-button ng-controller="settingDialogController as sc" ng-click="sc.showDialog()">
  // ダイアログとして表示するので、$mdDialogを注入する
  angular.module(moduleName).controller('editorDialogController', ['dataService', '$mdDialog', function(dataService, $mdDialog) {
    var ctrl = this;
    var svc = dataService;

    ctrl.title = 'JSONデータの編集';

    // ダイアログを消す
    ctrl.hide = function() {
      $mdDialog.hide();
    };

    // ダイアログのキャンセルボタン
    ctrl.cancel = function() {
      $mdDialog.cancel();
    };

    // ダイアログからの戻り値
    ctrl.answer = function(answer) {
      $mdDialog.hide(answer);
    };

    // ダイアログを開く
    ctrl.showDialog = function(ev) {
      // ダイアログを開くときに、サービスが持っているデータのディープコピーをコントローラに取り込む
      ctrl.obj = angular.copy(svc.getTopologyData(), {});

      $mdDialog.show(
        {
          controller: function() {
            return ctrl;
          },
          controllerAs: 'ec',
          templateUrl: 'editor.tpl',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: false, // 外をクリックしても閉じない
          fullscreen: false
        })
        .then(function(answer) {
          // answerは 'ok' もしくは 'cancel' が入っている
          if (answer === 'ok') {
            // OKボタンを押したときのみ、コントローラが保有する設定情報をサービス側に同期する
            svc.setTopologyData(ctrl.obj);
          }
        }, function() {
          // 外側をクリックした場合はここに来る。
          // console.log('cancelled');
        });
    };
  }]);
  //
})();

// あとでみる
// http://codepen.io/maxbates/pen/AfEHz
