const path = require('path')        //path是node的内置对象
const uglify=require('uglifyjs-webpack-plugin')//压缩js,webpack-plugin是固定的
const htmlPlugin=require('html-webpack-plugin')//必须安装,loader不需要引入,只有插件是需要引入的
const extractText=require('extract-text-webpack-plugin')

var website={
    publicPath:'http://192.168.1.147:9000/'
}

module.exports = {
    entry:{                          //入口文件(单入口,多入口)
        entry:'./src/entry.js',
        entry2:'./src/entry2.js'
    },
    output: {                         //出口文件(单出口,多出口)
        filename: '[name].js',     //name表示出口d的名字和入口的文件是一致的
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
                    use: "css-loader"
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
            // }
            }, {
                test: /\.(htm|html)$/i,
                use: ['html-withimg-loader']
            }
        ]
    },
    plugins:[
      new uglify(),                                        //多个插件放逗号
      new htmlPlugin({
          minify:{
              removeAttributeQuotes:true  //去掉的是html模板页面的引号
          },
          hash:true,//防止缓存
          template:'./src/index.html'
      }),
      new extractText("css/index.css")
    ],
    devServer: {                                              //配置前端简单的开发服务,并且支持热更新(3.5以上版本的都支持)||开发环境，代码不能压缩
        contentBase: path.join(__dirname, "dist") ,           //基本目录结构（想要更新的目标文件,需要绝对路径）
        host:"192.168.1.147" ,                               //服务器地址,本机ip地址(最好不要用localhost),
        compress: true,                                       //服务器是否压缩,默认压缩,
        port: 9000                                              //端口
    }
}