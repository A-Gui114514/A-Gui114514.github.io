/**
 * 地牢地图交互
 * - 悬停房间：那间房的灯池亮起来，其他房间退到后面
 * - 点房间：纸条从门里长出来；Esc / 点空处 / × 退回地图
 * 只改 class 和 transform-origin，动画全交给 CSS，避免逐帧改布局。
 */
(function () {
  var sheet = document.querySelector('.map-sheet')
  if (!sheet) return

  var nodes = Array.prototype.slice.call(sheet.querySelectorAll('.map-node'))
  var panels = Array.prototype.slice.call(sheet.querySelectorAll('.room-panel'))
  var pools = Array.prototype.slice.call(sheet.querySelectorAll('.map-pools i'))
  var current = null
  var lastFocus = null

  function poolFor (name) {
    for (var i = 0; i < pools.length; i++) {
      if (pools[i].getAttribute('data-room') === name) return pools[i]
    }
    return null
  }

  function panelFor (name) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-room') === name) return panels[i]
    }
    return null
  }

  function openPanel (panel, node) {
    var sr = sheet.getBoundingClientRect()
    var nr = node.getBoundingClientRect()
    var ox = ((nr.left + nr.width / 2) - sr.left) / sr.width * 100
    var oy = ((nr.top + nr.height / 2) - sr.top) / sr.height * 100

    panel.style.transformOrigin = ox.toFixed(2) + '% ' + oy.toFixed(2) + '%'

    if (current && current !== panel) current.classList.remove('open')
    panel.classList.add('open')
    sheet.classList.add('expanded')
    current = panel

    var list = panel.querySelector('.panel-list')
    if (list) list.scrollTop = 0
    var btn = panel.querySelector('.panel-close')
    if (btn) btn.focus({ preventScroll: true })
  }

  function closePanel () {
    if (!current) return
    current.classList.remove('open')
    sheet.classList.remove('expanded')
    current = null
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true })
    lastFocus = null
  }

  nodes.forEach(function (node) {
    var name = node.getAttribute('data-room')

    node.addEventListener('mouseenter', function () {
      var pool = poolFor(name)
      if (pool) pool.classList.add('lit')
    })

    node.addEventListener('mouseleave', function () {
      var pool = poolFor(name)
      if (pool) pool.classList.remove('lit')
    })

    node.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      var panel = panelFor(name)
      if (!panel) return
      e.preventDefault()
      e.stopPropagation()
      lastFocus = node
      openPanel(panel, node)
    })
  })

  sheet.addEventListener('click', function (e) {
    if (!current) return
    if (e.target.closest('.room-panel')) return
    if (e.target.closest('.map-node')) return
    closePanel()
  })

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) closePanel()
  })

  // 面板里的关闭按钮
  panels.forEach(function (panel) {
    var btn = panel.querySelector('.panel-close')
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        closePanel()
      })
    }
  })
})()
