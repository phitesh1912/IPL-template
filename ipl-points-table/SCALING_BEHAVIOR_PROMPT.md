# Reusable Prompt: Mirror Current Template Scaling Behavior

Use this prompt whenever you create a new template component and want **exactly the same zoom/render/pan behavior** as this project.

---

Apply the exact same scaling and zoom-handling behavior used in this repo (`PointsTable` / `ScoreCard`) to my new template component.

## Required behavior (must match exactly)

1. The template uses a fixed design canvas (example: `BASE_W × BASE_H`) and renders inside a host container.
2. Render with **full-frame fill** (no letterboxing):
   - `scaleX = effectiveWidth / BASE_W`
   - `scaleY = effectiveHeight / BASE_H`
   - apply `transform: scale(scaleX, scaleY)` with `transformOrigin: 'top left'`.
3. Must be robust under `document.body.style.zoom`, including values like `"300"` and `"300%"`.
4. Zoom detection must be **measured**, not only style-parsed:
   - use `getBoundingClientRect()` for host size
   - use a probe-element measurement helper (`getMeasuredElementZoom`) to compute rendered zoom factor
   - `effectiveWidth = hostRect.width / measuredZoom`
   - `effectiveHeight = hostRect.height / measuredZoom`
5. Recompute layout when any of these change:
   - host resize (`ResizeObserver`)
   - body/html inline style zoom changes (`MutationObserver` watching `style` attribute on `document.body` and `document.documentElement`)
   - viewport zoom/resize (`window.visualViewport` resize event)
6. Keep user pan/scroll control available while zoomed:
   - app/root should not hard-clip movement (`overflow: auto` where needed)
   - outer wrapper can use `touchAction: 'pan-x pan-y'`
7. Canvas positioning:
   - absolute positioning with `left: 0`, `top: 0`
   - host is `position: relative; width: 100%; height: 100%; overflow: hidden;`
8. Preserve all existing UI styles/content; only change scaling/zoom plumbing.

## Implementation pattern to follow

- Create/Reuse utility (like `src/utils/pageZoom.js`) with:
  - zoom normalization helper (`"300"` => `"300%"`)
  - style-based fallback zoom factor
  - probe-based measured zoom helper (`getMeasuredElementZoom`)
- In the component:
  - `const hostRef = useRef(null)`
  - `const [layout, setLayout] = useState({ scaleX: 1, scaleY: 1, left: 0, top: 0 })`
  - compute `effectiveW/H` from `hostRect / measuredZoom`
  - set transform on the canvas from `layout.scaleX/scaleY`
  - attach/cleanup all observers/listeners correctly

## Acceptance criteria (must pass)

- At normal zoom: template fills host as designed.
- At `document.body.style.zoom = "300"` and `"300%"`: template remains fully renderable and predictable.
- No black bars caused by scaling math errors.
- User can move/pan across zoomed content (not restricted by overflow clipping).
- No console/runtime errors introduced.

---

If this prompt conflicts with existing code, keep existing visuals intact and only adjust the scaling/zoom infrastructure.
