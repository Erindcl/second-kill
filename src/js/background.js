// 常驻在后台

var tasks = [];
var oldTimer = null;
var checkTime = 120000; // 检查准备工作 URL是否打开 2分钟

// 插件链接监听 获取 popup 页面更新时间
chrome.extension.onConnect.addListener(function (port) {
  console.log('Connected .....');
  port.onMessage.addListener(function (msg) {
    console.log('收到 popup 时间更新：' + msg);
    rotateTask(msg);
    port.postMessage('时间更新成功');
  });
});

rotateTask(new Date().getTime());

/**
 * 每隔 500ms 去检查任务并异步处理任务
 */
function rotateTask(currentTime) {
  console.log('background 开启轮休任务！');
  let timer = setInterval(() => {
    currentTime += 500;
    chrome.storage.local.get({
      "tasks": []
    }, (value) => {
      tasks = value.tasks;
      if (!tasks || tasks.length === 0) {
        return false;
      }
      for (let i = 0; i < tasks.length; i++) {
        // 只检查运行中任务
        if (tasks[i].status !== 0) {
          continue;
        }
        let timeDifference = new Date(tasks[i].killTime) - currentTime; // 秒杀时间与当前时间差
        if (timeDifference >= 0 && timeDifference <= 600) {
          // 异步执行点击事件
          let tabId = null;
          chrome.tabs.query({
            url: tasks[i].url
          }, function (results) {
            if (!results || results.length === 0) {
              return false;
            }
            let currentTab = results.find(ele => ele.active);
            tabId = currentTab ? currentTab.id : results[0].id;
            chrome.tabs.executeScript(tabId, {
              code: "secKill(" + tasks[i].id + ");"
            });
          });
        }
      }
    });
  }, 500);
  if (oldTimer != null) {
    clearInterval(oldTimer);
  }
  oldTimer = timer;
}

