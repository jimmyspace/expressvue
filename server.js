const fs = require('fs');//用于操作文件
const path = require("path");//绝对物理路径（避免出错）
const LRU = require('lru-cache') //用于在内存中管理缓存数据
const cookieParser = require('cookie-parser');
const express = require('express');
const favicon = require('serve-favicon');
const compression = require('compression');//压缩请求
const microcache = require('route-cache');
//route-cache
// 在负载很重的情况下，使工作路线超快，请参阅负载测试
// 防御'雷鸣般的群'
// 支持各种内容类型
// 支持重定向
// 允许条件缓存（每个请求）
// 使用gzip压缩
const resolve = file => path.resolve(__dirname, file);


const app = express();
const Vue = require('vue');

//配置项开始
app.use('/static', express.static(path.join(__dirname, './public')));//将static文件中的静态文件指向public
app.use(cookieParser());//查看cookie
app.use(compression({ threshold: 0 }));//压缩请求
app.use(favicon('./public/logo-512.png'));//设置favicon
//配置项结束

//路由
const templatePath = resolve('./src/index.template.html');

const renderer = require('vue-server-renderer').createRenderer({
  template: fs.readFileSync(templatePath, 'utf-8')
});

app.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })

  const context = {
    title: 'hello',
    meta: `
      <meta ...>
      <meta ...>
    `
  }

  renderer.renderToString(app, context, (err, html) => {
    console.log(html)
  })
})

//404处理
app.use(function (req, res, next) {
  res.status(404).sendfile('./public/page/404.html')
})
//错误处理
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).sendfile('./public/page/servererr.html')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))