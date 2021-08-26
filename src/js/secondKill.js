/**
 * 根据任务ID获取任务，执行点击
 * @param taskId
 */
function secKill(taskId) {
  console.log("开始秒杀！");
  console.log(taskId);
  chrome.storage.local.get({
    "tasks": []
  }, function (value) {
    let tasks = value.tasks;
    if (!tasks || tasks.length === 0) {
      return false;
    }
    tasks.forEach(ele => {
      taskId === ele.id && dealTask(ele);
    })
  });
}

/**
 * 处理任务
 * @param task
 */
function dealTask(task) {
  let count = 1;
  let timer = setInterval(() => {
    $(task.path).each(function () {
      this.click();
    });
    count++;
    if (count > task.count) {
      clearInterval(timer);
      timer = null;
    }
  }, task.frequency);
}