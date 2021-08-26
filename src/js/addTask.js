// 动态注入 js

(function () {
  // 页面注入任务表单
  let taskElement = document.createElement('div');
  let formHtml = `
  <div id="skAddTaskCard">
    <div class="card-header">
      新增秒杀任务
    </div>
    <div class="card-body">
      <ul class="sk-add-task-form">
        <li>
          <span>商品名称</span>
          <input id="skTaskName" disabled value="" placeholder="请输入商品名称" />
        </li>
        <li>
          <span>秒杀节点路径</span>
          <input id="skTaskPath" style="width: 65%;" disabled value="" placeholder="body > #secKillBtn" />
          <a id="resetSKPath">重选</a>
        </li>
        <li>
          <span>秒杀时间</span>
          <input id="skTaskKillTime" type="datetime-local" step="1" placeholder="请选择秒杀时间" />
        </li>
        <li>
          <span>秒杀频率(ms)</span>
          <input id="skTaskFrequency" value="500" placeholder="请输入秒杀频率" />
        </li>
        <li>
          <span>秒杀次数</span>
          <input id="skTaskCount" value="10" placeholder="请输入秒杀次数" />
        </li>
      </ul>
    </div>
    <div class="card-footer">
      <span id="submitAddTsk">确定</span>
      <span id="cancelAddTsk">取消</span>
    </div>
  </div>
  `;
  taskElement.innerHTML = formHtml;
  if ($("#skAddTaskCard").length === 0) {
    document.getElementsByTagName("body")[0].appendChild(taskElement);
  }

  // 根据光标定位元素
  let targetSelected = false;
  window.addEventListener('mouseover', windowListener);

  // 设置秒杀名称
  $("#skTaskName").val(document.title);

  // 设置秒杀时间
  $("#skTaskKillTime").val(formatDate(new Date().getTime()));

  // 关闭任务表单
  $("#cancelAddTsk").click(function () {
    $(".sk-target-btn").removeClass("sk-target-btn");
    $("#skAddTaskCard").remove();
    window.removeEventListener('mouseover', windowListener);
  });

  // 新增任务
  $("#submitAddTsk").click(function () {
    let newTask = {
      id: new Date().getTime(),
      url: window.location.href,
    };
    let path = $("#skTaskPath").val();
    let frequency = +$("#skTaskFrequency").val();
    let count = +$("#skTaskCount").val();
    if (!path || $.trim(path) === '') {
      alert('请设定秒杀节点路径');
      return false;
    }
    if (isNaN(frequency) || frequency < 100) {
      alert('秒杀频率为数字且最小值为100');
      return false;
    }
    if (isNaN(count) || count < 1) {
      alert('秒杀次数为数字且最小值为1');
      return false;
    }
    newTask.name = $("#skTaskName").val();
    newTask.path = path;
    newTask.killTime = $("#skTaskKillTime").val();
    newTask.frequency = frequency;
    newTask.count = count;
    newTask.status = 0;
    chrome.storage.local.get({"tasks": []}, function(value){
      let tasks = value.tasks;
      tasks.push(newTask);
      chrome.storage.local.set({"tasks": value.tasks}, function() {
          $(".sk-target-btn").removeClass("sk-target-btn");
          $("#skAddTaskCard").remove();
          window.removeEventListener('mouseover', windowListener);
          alert("新增成功！");
      });
    });
  });

  function windowListener(e) {
    // 光标锁定
    if (!targetSelected) {
      $(".sk-target-btn").removeClass("sk-target-btn");
      $(e.target).addClass("sk-target-btn");
    }
    // 重选
    $(e.target).click(function () {
      if ($(this).attr("id") == "resetSKPath") {
        $(".sk-target-btn").removeClass("sk-target-btn");
        $("#skTaskPath").val('');
        targetSelected = false;
        return false;
      }
    });
    // 右键选中目标
    $(e.target).contextmenu(function () {
      if (!targetSelected) {
        targetSelected = true;
        let path = getDomPath(e.target);
        $("#skTaskPath").val(path.join(' > '));
        alert("目标已选中！");
        return false;
      }
    });
  };
})();

/**
 * 根据点击元素 path
 * @param el
 * @returns {Array.<*>}
 */
function getDomPath(el) {
  let stack = [];
  while (el.parentNode != null) {
    let sibCount = 0;
    let sibIndex = 0;
    for (let i = 0; i < el.parentNode.childNodes.length; i++) {
      let sib = el.parentNode.childNodes[i];
      if (sib.nodeName == el.nodeName) {
        if (sib === el) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if (el.hasAttribute('id') && el.id != '') {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if (sibCount > 1) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }

  return stack.slice(1); // 堆栈中第一个元素为 html
}

/**
 * 时间格式化
 * @param nowTime
 * @returns {string}
 */
function formatDate(nowTime) {
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
  return y + '-' + m + '-' + d + 'T' + h + ':' + minute + ':' + second;
}