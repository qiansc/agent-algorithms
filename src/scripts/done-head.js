// 在 <head> 里同步执行：读取已完成的题目，生成一段样式表。
// 左侧目录和首页的完成标记都由这段样式决定，页面第一次绘制时就已经在位，切换题目时不会闪动。
(() => {
  const KEY = 'agent-algorithms:done';
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  };
  const style = document.createElement('style');
  style.id = 'done-marks';
  document.head.appendChild(style);
  const render = () => {
    const ids = read().filter((id) => /^[a-z0-9/-]+$/.test(id));
    if (!ids.length) {
      style.textContent = '';
      return;
    }
    const sidebar = ids.map((id) => `.sidebar-content a[href$="/${id}/"]::before`).join(',');
    const rows = ids.map((id) => `[data-done-id="${id}"]`);
    style.textContent =
      `${sidebar}{content:"";position:absolute;left:-.5em;top:50%;transform:translate(-50%,-50%);` +
      `width:.95em;height:.95em;background-color:var(--done-color);` +
      `-webkit-mask:var(--done-mask) center/contain no-repeat;mask:var(--done-mask) center/contain no-repeat}` +
      `.sidebar-content a[aria-current="page"]::before{background-color:currentColor}` +
      `${rows.map((r) => `${r} .plan-done`).join(',')}{display:inline-block!important}` +
      `${rows.map((r) => `${r} .plan-title`).join(',')}{color:var(--sl-color-gray-3)!important}`;
  };
  window.__doneMarks = { key: KEY, read, render };
  render();
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) render();
  });
})();
