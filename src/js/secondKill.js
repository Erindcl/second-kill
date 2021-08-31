/**
 * 处理秒杀任务
 * @param task
 */
 function secondKill(task) {
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
