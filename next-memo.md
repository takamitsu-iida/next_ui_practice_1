# next ui メモ

特に重要なのは、nx.graphic.Topologyクラスのオブジェクト。
APIのマニュアルを見れば、メソッドとプロパティが分かるけど、細かいところはnext.jsを見たほうが早い。
EnterpriseNetworkLayoutはバグってるので、修正が必要。


[//]:# (@@@ 20160928)
## ノードを消す

データを操作するわけではなく、見せる・見せないを制御する。

topology.graph().getVertex(0).visible(false);


[//]:# (@@@ 20160925)
## NeXtサポートチームによるjsfiddle

とても参考になる。

https://jsfiddle.net/user/nextsupport/fiddles/


[//]:# (@@@ 20160920)
## 組み込みレイヤ

next.jsでこのように定義されている。

```js
this.attachLayer("links", "nx.graphic.Topology.LinksLayer");
this.attachLayer("linkSet", "nx.graphic.Topology.LinkSetLayer");
this.attachLayer("groups", "nx.graphic.Topology.GroupsLayer");
this.attachLayer("nodes", "nx.graphic.Topology.NodesLayer");
this.attachLayer("nodeSet", "nx.graphic.Topology.NodeSetLayer");
this.attachLayer("paths", "nx.graphic.Topology.PathLayer");
```

なので、``` topology.getLayer("paths");``` とすれば、パスを描画するレイヤを取得できる。


[//]:# (@@@ 20160920)
## next-ui-demo

https://github.com/zverevalexei/next-ui-demos


[//]:# (@@@)
## クリックしたノードの情報を得る

```js
topology.on('selectNode',
  function(sender, event){
    console.log(sender.id())
  }
);
```


[//]:# (@@@)
## 任意のDOM要素にnextアプリケーションをぶら下げる

```js
var app = new nx.ui.Application();
app.container(document.getElementById('app'));
topology.attach(app);
```

[//]:# (@@@)
## jQueryでデータを取ってくる

```js
nx.define('demo.TopologyViaApi', nx.ui.Component, {
  view: {
    props: {
      'class': "demo-topology-via-api"
    },
    content: {
      name: 'topology',
      type: 'nx.graphic.Topology',
      props: {
        showIcon: true,
        theme: 'green',
        identityKey: 'id',
        data: '{#topologyData}',
        nodeConfig: {
        iconType: "model.device_type",
        label: "model.label"
      }
    }
  },
  properties: {
    topologyData: {}
  },
  methods: {
    'getTopo': function(){
    return this.view('topo');
  }
}

var topo = topologyContainer.getTopo();

$.ajax({
     type: 'GET',
     url: 'http://example.com/topology',
     dataType: 'json',
     // ... some other config ...

     success: function(data){
          // use try/catch to track parsing errors
          try {
               var data = JSON.parse(data);
               topo.data(data);
          }
          catch(SyntaxError){
               alert('hey, json is broken');
          }
     },
     error: function(jqXHR, exception){
          // some http erorr stuff
          alert("couldn't get topology from the server");
     }
});
```


[//]:# (@@@)
## ノードの見つけ方

1. find vertex :  vertex = topo.graph().getVertex(ID)
2. check if vertex generated : vertex = generated()
3. if yes, just use topo.getNode(ID)
4. if not use this property find generated parent nodeset : var vs = vertex.generatedRootVertexSet(),
5. use topo.getNode(vs.id()) find parent nodeSet



[//]:# (@@@)
## クラス定義

```js
nx.define("MyClass", {
    properties: {
        title: '', //これは外部からアクセスできない
        msg: { // msg()でアクセス可能
            value: 'Hello World!' // valueを使うとゲッター・セッターを省略できる、ただし共有型
        }
    },
    methods: {
        hello: function () {
            console.log(this.msg()); //this.msgではなく、this.msg()
        }
    }
});

var foo = new MyClass();
foo.hello();

foo.msg("Hello!");
foo.hello();
```


[//]:# (@@@)
## valueは全インスタンスで共有される

```js
nx.define("com.cisco.Foo", {
    properties: {
        wrongList: {
            value: []
        },
        correctList: {
            value: function () {
                return [];
            }
        }
    }
});
var foo1 = new com.cisco.Foo();
var foo2 = new com.cisco.Foo();

foo1.wrongList().push(1);
foo2.wrongList().push(2);
foo1.correctList().push(1);
foo2.correctList().push(2);
console.log("wrongList:" + foo1.wrongList());  // 1, 2
console.log("wrongList:" + foo2.wrongList());  // 1, 2
console.log("correctList:" + foo1.correctList()); // 1
console.log("correctList:" + foo2.correctList()); // 2
```


[//]:# (@@@)
## クラス継承時はthis.inherited()を呼ぶ


```js
/**
 * Constructor
 */
nx.define("Foo", {
    methods: {
        init: function () {
            console.log("I am foo");
        }
    }
});
var foo = new Foo();

/**
 * Overwrite constructor
 */
nx.define("Bar", Foo, {
    methods: {
        init: function () {
            this.inherited(); //これで親クラスのコンストラクタinit()が呼ばれる
            console.log("I am bar");
        }
    }
});
var bar = new Bar();
```

[//]:# (@@@)
## Viewの作り方

### nx.ui.Componentクラスを継承する。

```js
nx.define("Hello", nx.ui.Component, {
    view: {
    },
    properties: {
    },
    methods: {
    }
});
```

### コンテンツが一つだけのビュー

```js
view: {
  tag: 'span',
  content: '文字列または配列で階層化',
  props: {
    style: {
      color: '#ff0000',
      'font-size':'40px'
    }
  }
}
```

### 複数のコンテンツを持つビュー

```js
view: {
  content: [
    // DOM要素、一つ目
    {
      // <input>
      tag: 'input',
      props: {
        value: '{#username}',
        placeholder: 'Input your name here...'
      }
    },
    {
      // <p>
      //   <span>Hello</span>
      //   <span>{#username}</span>
      // </p>
      tag: 'p',
      content: [
        {
          tag: 'span',
          content: 'Hello '
        },
        {
          tag: 'span',
          content: '{#username}'
        }]
    }]
},
```
