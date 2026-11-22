/**
 * 地牢地图交互
 * - 悬停房间：那间房的灯池亮起来，其他房间退到后面
 * - 点房间：纸条从门里长出来；客房则是展开一开始那张羊皮卷
 * - 羊皮卷：进页面自动展开一次；收起后点客房可以再看
 * 只改 class 和 transform-origin，动画全交给 CSS。
 */
(function () {
  var sheet = document.querySelector('.map-sheet')
  var intro = document.querySelector('.scroll-intro')
  if (!sheet && !intro) return

  var nodes = sheet ? Array.prototype.slice.call(sheet.querySelectorAll('.map-node')) : []
  var panels = sheet ? Array.prototype.slice.call(sheet.querySelectorAll('.room-panel')) : []
  var pools = sheet ? Array.prototype.slice.call(sheet.querySelectorAll('.map-pools i')) : []
  var washes = sheet ? Array.prototype.slice.call(sheet.querySelectorAll('.map-art .wash')) : []
  var current = null
  var lastFocus = null

  function byRoom (list, name) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].getAttribute('data-room') === name) return list[i]
    }
    return null
  }

  function panelFor (name) {
    for (var i = 0; i < panels.length; i++) {
      if (panels[i].getAttribute('data-room') === name) return panels[i]
    }
    return null
  }

  /* ---------- 羊皮卷 ---------- */
  function openScroll (withLead) {
    if (!intro) return
    intro.classList.add('open')
    intro.setAttribute('aria-hidden', 'false')
    document.documentElement.style.overflow = 'hidden'
    var paper = intro.querySelector('.scroll-paper')
    if (paper) paper.classList.toggle('no-lead', withLead === false)
    var body = intro.querySelector('.scroll-body')
    if (body) body.scrollTop = 0
    var btn = intro.querySelector('.scroll-close')
    if (btn) btn.focus({ preventScroll: true })
  }

  function closeScroll () {
    if (!intro) return
    intro.classList.remove('open')
    intro.setAttribute('aria-hidden', 'true')
    document.documentElement.style.overflow = ''
  }

  if (intro) {
    intro.addEventListener('click', function (e) {
      if (e.target.closest('.scroll-paper')) return
      closeScroll()
    })

    var scrollBtn = intro.querySelector('.scroll-close')
    if (scrollBtn) {
      scrollBtn.addEventListener('click', function (e) {
        e.preventDefault()
        closeScroll()
      })
    }
  }

  /* ---------- 房间面板 ---------- */
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

    var main = panel.querySelector('.panel-main')
    if (main) main.scrollTop = 0
    var btn = panel.querySelector('.panel-close')
    if (btn) btn.focus({ preventScroll: true })
  }

  function closePanel () {
    if (!current) return
    current.classList.remove('open')
    if (sheet) sheet.classList.remove('expanded')
    current = null
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true })
    lastFocus = null
  }

  nodes.forEach(function (node) {
    var name = node.getAttribute('data-room')
    var isScroll = node.getAttribute('data-scroll') === '1'

    node.addEventListener('mouseenter', function () {
      var pool = byRoom(pools, name)
      if (pool) pool.classList.add('lit')
      var wash = byRoom(washes, name)
      if (wash) wash.classList.add('lit')
    })

    node.addEventListener('mouseleave', function () {
      var pool = byRoom(pools, name)
      if (pool) pool.classList.remove('lit')
      var wash = byRoom(washes, name)
      if (wash) wash.classList.remove('lit')
    })

    node.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return

      if (isScroll && intro) {
        e.preventDefault()
        e.stopPropagation()
        closePanel()
        lastFocus = node
        openScroll(false)
        return
      }

      var panel = panelFor(name)
      if (!panel) return
      e.preventDefault()
      e.stopPropagation()
      lastFocus = node
      openPanel(panel, node)
    })
  })

  if (sheet) {
    sheet.addEventListener('click', function (e) {
      if (!current) return
      if (e.target.closest('.room-panel')) return
      if (e.target.closest('.map-node')) return
      closePanel()
    })
  }

  panels.forEach(function (panel) {
    var btn = panel.querySelector('.panel-close')
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault()
        closePanel()
      })
    }
  })

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.keyCode !== 27) return
    closeScroll()
    closePanel()
  })

  // 一进页面，先展开客房的羊皮卷
  if (intro) setTimeout(function () { openScroll(true) }, 450)
})()
