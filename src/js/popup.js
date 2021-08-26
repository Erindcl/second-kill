var oldTimer = null;

$(document).ready(function () {
  const RED_COLOR = '#FF5B68';
  const GREEN_COLOR = '#23C293';
  const YELLOW_COLOR = '#FFAC2E';
  let currentTime = new Date().getTime();

  // 更新 popup page 的当前时间
  $("#currentTime").text(formatDate(currentTime));
  updateTime(currentTime);

  // 任务列表
  let tasks = [];

  // 新建任务
  $("#addSkTask").click(() => {
    let query = { active: true, currentWindow: true };
    chrome.tabs.query(query, (tabs) => {
      chrome.tabs.executeScript(tabs[0].id, { file: 'js/addTask.js'});
    });
  });

  // 加载任务列表数据
  chrome.storage.local.get({
    'tasks': []
  }, (value) => {
    tasks = value.tasks;
    renderTask(tasks);
  });

  // 任务列表操作监听
  $(document).delegate(".sk-task-operate span", "click", function () {
    let currentTask = null;
    let taskIndex = 0;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id + '' === $(this).parent().attr("taskId")) {
        currentTask = {
          ...tasks[i]
        };
        taskIndex = i;
        break;
      }
    }

    // 启动
    if ($(this).index() === 1 && currentTask.status === 1) {
      currentTask.status = 0;
      $(this).siblings(":first").text("运行中");
      $(this).siblings(":first").css("color", GREEN_COLOR);
    }
    // 暂停
    if ($(this).index() === 2 && currentTask.status == 0) {
      currentTask.status = 1;
      $(this).siblings(":first").text("已暂停");
      $(this).siblings(":first").css("color", YELLOW_COLOR);
    }
    tasks[taskIndex] = currentTask;

    // 删除
    if ($(this).index() === 3) {
      tasks.splice(taskIndex, 1);
      $(this).parent().parent().remove();
      if (tasks.length === 0) {
        $("#skTaskList").html($("#skTaskTemplate .sk-task-empty")[0]);
      }
    }

    // 更新任务列表
    chrome.storage.local.set({
      "tasks": tasks
    });
  });

  // 点击任务列表中的 URL 打开地址
  $(document).delegate(".sk-task-url", "click", function () {
    let currentTask = null;
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id == $(this).attr("taskId")) {
        currentTask = tasks[i];
        chrome.tabs.query({
          url: currentTask.url
        }, function (results) {
          if (results != null && results.length > 0) {
            chrome.tabs.update(results[0].id, {
              "active": true
            }, function () {
              console.log('设置当前为抢购页面');
            });
          } else {
            console.log('打开抢购页面');
            chrome.tabs.create({
              url: currentTask.url
            });
          }
        });
      }
    }
  });

  function renderTask() {
    $("#skTaskList").empty();
    if (tasks.length > 0) {
      tasks.forEach((ele) => {
        let itemDom = $("#skTaskTemplate .sk-task-item").clone();
        let statusText = '运行中';
        let color = GREEN_COLOR;
        switch (ele.status) {
          case 0:
            statusText = '运行中';
            color = GREEN_COLOR;
            break;
          case 1:
            statusText = '已暂停';
            color = YELLOW_COLOR;
            break;
          case 2:
            statusText = '已过期';
            color = RED_COLOR;
            break;
          default:
            break;
        }
        itemDom.find(".sk-task-status").css("color", color);
        itemDom.find(".sk-task-status").text(statusText);
        itemDom.find(".sk-task-title").text(ele.name);
        itemDom.find(".sk-task-title").attr("title", ele.name);
        itemDom.find("span[field='url']").text(ele.url);
        itemDom.find("span[field='url']").attr("title", ele.url);
        itemDom.find("span[field='url']").attr("taskId", ele.id);
        itemDom.find("span[field='path']").text(ele.path);
        itemDom.find("span[field='path']").attr("title", ele.path);
        itemDom.find("span[field='killTime']").text(ele.killTime.replace("T", " "));
        itemDom.find("span[field='restTime']").attr("killTime", ele.killTime);
        itemDom.find("span[field='restTime']").text(getRestTime(new Date(ele.killTime).getTime() - currentTime));
        itemDom.find("span[field='frequency']").text(ele.frequency);
        itemDom.find("span[field='count']").text(ele.count);
        itemDom.find(".sk-task-operate").attr("taskId", ele.id);
        $("#skTaskList").append(itemDom);
      })
    } else {
      $("#skTaskList").html($("#skTaskTemplate .sk-task-empty")[0]);
    }
  };
});

/**
 * 更新 popup page 的当前时间，剩余时间和设定后台的时间
 */
function updateTime(currentTime) {
  let timer = setInterval(() => {
    currentTime += 1000;
    $("#currentTime").text(formatDate(currentTime));
    $("span[field='restTime']").each(function() {
      $(this).text(getRestTime(new Date($(this).attr("killTime")).getTime() - currentTime + 1000));
    });
  }, 1000);
  if (oldTimer !== null) {
    clearInterval(oldTimer);
  }
  oldTimer = timer;

  // 更新Background的时间
  let port = chrome.extension.connect({
    name: "update currentTime"
  });
  port.postMessage(currentTime);
  port.onMessage.addListener(function (msg) {
    console.log("后台反馈：" + msg);
  });
}

/**
 * 获取剩余时间
 * @param restTime
 * @returns {string}
 */
function getRestTime(restTime) {
  if (!isNaN(restTime)) {
    if (restTime <= 0) {
      return '00:00:00';
    } else {
      let date = new Date(null);
      date.setMilliseconds(restTime)
      let result = date.toISOString().substr(11, 8);
      return result;
    }
  }
}

/**
 * 时间格式化
 * @param nowTime
 * @param type
 * @returns {string}
 */
function formatDate(nowTime, type) {
  let date = new Date(nowTime);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let h = date.getHours();
  let minute = date.getMinutes();
  let second = date.getSeconds();
  m = m < 10 ? ('0' + m) : m;
  d = d < 10 ? ('0' + d) : d;
  h = h < 10 ? ('0' + h) : h;
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  if (type === 'date') {
    return y + '-' + m + '-' + d;
  }
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
}