// 常驻在后台

var tasks = [];
var oldTimer = null;

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
        if (timeDifference >= 0 && timeDifference < 500) {
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
              code: "secondKill(" + JSON.stringify(tasks[i]) + ");"
            });
            submitOrder();
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

function submitOrder() {
  let timeCount = 0;
  console.log('执行了 submitOrder');
  let timer = setInterval(() => {
    // 当前 tab (即提交订单)
    chrome.tabs.query({active: true, currentWindow: true}, function(tab) {
      chrome.tabs.executeScript(tab.id, {
        code: "submitBtnClick();"
      });
    });

    timeCount += 500;
    if (timer && timeCount === 5000) {
      clearInterval(timer);
      timer = null;
    }
  }, 500);
}

