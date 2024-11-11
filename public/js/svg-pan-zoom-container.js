// 0.6.1
var svgPanZoomContainer = function(e) {
  "use strict";
  const t = (e, t) => {
          const n = new DOMMatrix(t.style.transform);
          return [n.a, e.scrollLeft - n.e, e.scrollTop - n.f]
      },
      n = (e, t, n, o, r) => {
          const l = Math.round(Math.max(o, 0)),
              i = Math.round(Math.max(r, 0));
          t.setAttribute("transform", t.style.transform = `matrix(${n},0,0,${n},${l-o},${i-r})`), t.style.margin = 0, e.scrollLeft = l, e.scrollTop = i, e.scrollLeft !== l && (t.style.marginRight = `${l}px`, e.scrollLeft = l), e.scrollTop !== i && (t.style.marginBottom = `${i}px`, e.scrollTop = i)
      },
      o = e => {
          const t = {};
          if (e)
              for (const n of e.split(";")) {
                  const e = n.indexOf(":");
                  t[n.slice(0, e).trim().replace(/[a-zA-Z0-9_]-[a-z]/g, (e => e[0] + e[2].toUpperCase()))] = n.slice(e + 1).trim()
              }
          return t
      },
      r = (e, t) => {
          const n = e?.closest(`[${t}]`);
          return n instanceof HTMLElement ? [n, o(n.getAttribute(t))] : []
      },
      l = (e, o, r) => {
          const l = e.firstElementChild,
              [i, s, a] = t(e, l);
          n(e, l, i, s + o, a + r)
      },
      i = e => t(e, e.firstElementChild)[0],
      s = (e, o, r = {}) => {
          const l = ((e, t, n) => e < t ? t : e > n ? n : e)(o, r.minScale || 1, r.maxScale || 10),
              i = r.origin,
              s = e.firstElementChild,
              [a, c, m] = t(e, s);
          if (l === a) return;
          const u = l / a - 1,
              d = s.getBoundingClientRect(),
              f = (i && i.clientX || 0) - d.left,
              v = (i && i.clientY || 0) - d.top;
          n(e, s, l, c + u * f, m + u * v)
      },
      a = (e, t, n) => s(e, i(e) * t, n);
  var c;
  return c = {
      button: "left"
  }, addEventListener("mousedown", (e => {
      if (0 !== e.button && 2 !== e.button) return;
      const [t, n] = r(e.target, "data-pan-on-drag");
      if (!t || !n || !((e, t, n) => (!t.modifier || e.getModifierState(t.modifier)) && e.button === ("right" === (t.button || n.button) ? 2 : 0))(e, n, c)) return;
      e.preventDefault();
      let o = e.clientX,
          i = e.clientY;
      const s = e => {
              l(t, o - e.clientX, i - e.clientY), o = e.clientX, i = e.clientY, e.preventDefault()
          },
          a = e => e.preventDefault(),
          m = () => {
              removeEventListener("mouseup", m), removeEventListener("mousemove", s), setTimeout((() => removeEventListener("contextmenu", a)))
          };
      addEventListener("mouseup", m), addEventListener("mousemove", s), addEventListener("contextmenu", a)
  })), ((e, t, n = {}) => {
      n.noEmitStyle || ((document.head || document.body || document.documentElement).appendChild(document.createElement("style")).textContent = `[${e}]{overflow:scroll}[${e}]>:first-child{width:100%;height:100%;vertical-align:middle;transform-origin:0 0}`), addEventListener("wheel", (n => {
          const [o, l] = r(n.target, e);
          if (o instanceof HTMLElement) {
              const e = +l.zoomAmount || t.zoomAmount;
              a(o, (1 + e) ** -n.deltaY, {
                  origin: n,
                  minScale: +l.minScale || t.minScale,
                  maxScale: +l.maxScale || t.maxScale
              }), n.preventDefault()
          }
      }), {
          passive: !1
      }), addEventListener("resize", (() => {
          const t = document.querySelectorAll(`[${e}]`);
          for (let n = 0; n < t.length; n++) {
              const r = t[n];
              if (r instanceof HTMLElement) {
                  const t = o(r.getAttribute(e));
                  a(r, 1, t)
              }
          }
      }))
  })("data-zoom-on-wheel", {
      minScale: 1,
      maxScale: 10,
      zoomAmount: .002
  }), e.getScale = i, e.pan = l, e.resetScale = e => {
      const t = e.firstElementChild;
      t.style.margin = e.scrollLeft = e.scrollTop = 0, t.removeAttribute("transform"), t.style.transform = ""
  }, e.setScale = s, e.zoom = a, Object.defineProperty(e, "__esModule", {
      value: !0
  }), e
}({});
