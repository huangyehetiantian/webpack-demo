const path = require('path') ;       //path是node的内置对象
const glob = require('glob') ;       //扫描文件的时候使用
const uglify=require('uglifyjs-webpack-plugin');//压缩js,webpack-plugin是固定的
const htmlPlugin=require('html-webpack-plugin');//必须安装,loader不需要引入,只有插件是需要引入的
const extractText=require('extract-text-webpack-plugin');//在打包后的文件中,分离css文件，方便能够修改
const PurifyCssplugin=require('purifycss-webpack');//删除项目中没有用到的css
const entry=require('./webpack_config/entry_webpack.js');
const webpack=require('webpack');

console.log(encodeURIComponent(process.env.type));

if(process.env.type=="build"){
    var website={
       publicPath:'http://www.baidu.com/' //生产环境
    }
}else{
    var website={
        publicPath:'http://192.168.1.147:8000/'
    }
}


module.exports = {
    // devtool: "source-map",//调试工具（source-map:独立map 缺点慢;cheap-module-source-map:简单模式的独立，不包括列;''eval：在文件中。上线之后删除重新打包）
    // entry:{                          //入口文件(单入口,多入口)
    //     entry:'./src/entry.js',
    //     entry2:'./src/entry2.js'
    // },
    entry:entry.path,
    output: {                         //出口文件(单出口,多出口)
        filename: '[name].js',     //name表示出口的名字和入口的文件是一致的
        path: path.resolve(__dirname, 'dist'),  //路径(用的是node的语法)
        publicPath: website.publicPath//解决静态路径的问题
    },
    module: {
        rules: [
            {                             //---精髓----)loader是非常重要的知识点，
                test:  /\.css$/,       //正则表达式的规则
                // use: [
                //     'style-loader',    //路径样式
                //     'css-loader'       //css标签识别
                // ]
                use: extractText.extract({
                    fallback: "style-loader",
                    use: [
                        {loader:"css-loader", options:{importLoaders:1}},
                        'postcss-loader'
                    ]
                })
            }, {                             //---精髓----)loader是非常重要的知识点，
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 5,//图片<limit的值,图片会被打成base64位，大于这个值的时候会打成相同的路径.fileloader就是把图片弄成相同的路径
                            outputPath: 'images/'
                        },
                    }
                ]
            }, {
                test: /\.(htm|html)$/i,
                use: ['html-withimg-loader']                              //页面上直接引入图片打包也可以用
            },{                                                               //安装less并打包进入css
                test: /\.less$/,
                use:extractText.extract({
                    use:[{
                        loader: "css-loader"
                    }, {
                        loader: "less-loader"
                    }],
                    fallback: "style-loader"
                })
            },{
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins:[
      new webpack.optimize.CommonsChunkPlugin({//优化
          name:['jquery','vue'],//必填
          filename:'assets/js/[name].js',//ext扩展名
          minChunks:2//必填
      }),
      new webpack.ProvidePlugin({     // webpack.自带的饮用第三方的插件
        $:"jquery"
        // 'vue':'vue'
      }),
      new uglify(),                                        //多个插件放逗号
      new htmlPlugin({
          minify:{
              removeAttributeQuotes:true  //去掉的是html模板页面的引号
          },
          hash:true,//防止缓存
          template:'./src/index.html'
      }),
      new extractText("css/index.css"),
      new PurifyCssplugin({
        paths:glob.sync(path.join(__dirname,'src/*.html')),
      }),
       new webpack.BannerPlugin("yandong版权所有")
    ],
    devServer: {                                              //配置前端简单的开发服务,并且支持热更新(3.5以上版本的都支持)||开发环境，代码不能压缩
        contentBase: path.join(__dirname, "dist") ,           //基本目录结构（想要更新的目标文件,需要绝对路径）
        host:"192.168.1.147" ,                               //服务器地址,本机ip地址(最好不要用localhost),
        compress: true ,                              //服务器是否压缩,默认压缩,
        port: 8000                                              //端口
    },
    watchOptions: {
        poll:1000,//1ms监测1次
        aggregeateTimeout:500,         //重复按键，半秒内重复算一次
        ignored:/node_modules/         //忽略的文件,不需要加双引号(此处有坑)
    }
}