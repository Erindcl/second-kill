# 天猫秒杀 Chrome 插件开发指南

## 背景

抢茅台

Chrome 插件作用

## 开发 Chrome 插件必备知识

### manifest.json

这是一个 Chrome 插件最重要也是必不可少的文件，用来配置所有和插件相关的配置，必须放在根目录。其中，manifest_version、name、version 3个是必不可少的

1、常见的配置项

2、popup

3、background

4、content-scripts

### chrome 常见 api 详解

1、动态注入或执行JS
通过chrome.tabs.executeScript来执行脚本，从而实现访问web页面的DOM

2、标签页操作

```javascript
// 获取当前标签页ID
// chrome.tabs.query 根据条件查询标签页
function getCurrentTabId(callback)
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
      if(callback) callback(tabs.length ? tabs[0].id: null);
    }
  );
}

// 设置指定 id 标签页为当前标签页
// chrome.tabs.update 根据 id 条件更新标签页属性
chrome.tabs.update(id, {
  "active": true
}, function () {
  console.log('设置当前为抢购页面');
});

// 打开新的指定 URL 的标签页
// chrome.tabs.create 打开新的标签页
chrome.tabs.create({
  url: currentTask.url
});
```

3、本地存储
本地存储建议用 chrome.storage（针对插件全局），而不是普通的 localStorage
有 chrome.storage.sync 和 chrome.storage.local 2种方式可供选择，使用示例如下：

```javascript
// 读取数据，第一个参数是指定要读取的key以及设置默认值
chrome.storage.local.get({color: 'red', age: 18}, function(items) {
  console.log(items.color, items.age);
});
// 保存数据
chrome.storage.local.set({color: 'blue'}, function() {
  console.log('保存成功！');
});
```

4.桌面通知
Chrome提供了一个 chrome.notifications API以便插件推送桌面通知

```javascript
chrome.notifications.create(null, {
  type: 'basic',
  iconUrl: 'img/icon.png',
  title: '这是标题',
  message: '您刚才点击了自定义右键菜单！'
});
```

## 秒杀插件开发

预览效果

流程图

按步骤开发介绍
1）添加 manifest.json 基础配置
2）开发 popup page

## 总结

好用 Chrome 插件推荐

参考文章
