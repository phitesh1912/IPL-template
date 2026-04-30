# Universal Prompt: Reproduce This Project’s Scaling Exactly

Use this prompt whenever you build any new template and want the exact same scaling behavior used in this repo.

---

Apply the exact scaling contract from this project (`PointsTable` / `ScoreCard`) to my new template component.

## Scaling contract (non-negotiable)

1. Use a fixed design-space canvas (`BASE_W × BASE_H`) rendered inside a host.
2. Fill behavior must be **full-host stretch** (not contain, not cover-uniform):
   - `scaleX = hostRect.width / BASE_W`
   - `scaleY = hostRect.height / BASE_H`
   - `transform: scale(scaleX, scaleY)`
   - `transform-origin: top left`
3. Canvas must always be anchored to top-left:
   - `position: absolute; left: 0; top: 0`
4. Host must always be:
   - `position: relative; width: 100%; height: 100%; overflow: hidden`
5. Do **not** render any fallback/filler/duplicate background behind the canvas.
   - Only the template canvas is allowed.
6. Preserve existing visual design/content. Only scaling plumbing may be changed.

## Zoom/resize behavior (must match)

1. Recompute on host size changes via `ResizeObserver`.
2. Recompute on viewport resize via `window.resize`.
3. Keep behavior stable under browser zoom and `document.body.style.zoom` values (e.g., `"300"`, `"300%"`) by using measured host dimensions from `getBoundingClientRect()` at compute time.

## Universal rules for any random template

1. Determine `BASE_W` and `BASE_H` from the real template source dimensions:
   - if image-based template, use the image natural pixel size
   - if design spec provides dimensions, use those exactly
2. Canvas CSS width/height must exactly equal `BASE_W/BASE_H` in px.
3. Overlay text/graphics should be positioned in the same design coordinate space (absolute px or consistent percentages).
4. Never mix this contract with contain/cover math in the same component.

## Implementation blueprint

- State shape:
  - `layout = { scaleX: 1, scaleY: 1, left: 0, top: 0 }`
- Compute function:
  1. `hostRect = hostRef.current.getBoundingClientRect()`
  2. `scaleX = hostRect.width / BASE_W`
  3. `scaleY = hostRect.height / BASE_H`
  4. `left = 0`, `top = 0`
  5. apply transform to canvas
- Lifecycle:
  - call compute once on mount
  - attach `ResizeObserver` to host
  - attach `window.resize`
  - cleanup both on unmount

## Acceptance checklist (must all pass)

- Template fills the host with no letterbox bars caused by contain logic.
- No extra background layer is used to fake fill.
- Behavior is identical across future templates when using this contract.
- Zooming in/out remains predictable (no jumpy re-centering).
- No runtime/console errors introduced.

---

If any existing code conflicts, keep visual output intact and only adjust scaling logic to satisfy this contract.

## Copy-paste React starter (exact scaling contract)

Use this as a starting point for any new template component. Replace `BASE_W`, `BASE_H`, `TemplateContent`, and CSS class names as needed.

```jsx
import { useEffect, useRef, useState } from 'react';

const BASE_W = 1080;
const BASE_H = 1920;

export default function TemplateComponent() {
   const hostRef = useRef(null);
   const [layout, setLayout] = useState({ scaleX: 1, scaleY: 1, left: 0, top: 0 });

   useEffect(() => {
      function computeLayout() {
         if (!hostRef.current) return;

         const hostRect = hostRef.current.getBoundingClientRect();
         const scaleX = hostRect.width / BASE_W;
         const scaleY = hostRect.height / BASE_H;

         setLayout({
            scaleX,
            scaleY,
            left: 0,
            top: 0,
         });
      }

      computeLayout();

      const ro = new ResizeObserver(computeLayout);
      ro.observe(hostRef.current);
      window.addEventListener('resize', computeLayout);

      return () => {
         ro.disconnect();
         window.removeEventListener('resize', computeLayout);
      };
   }, []);

   return (
      <div className="tpl-host" ref={hostRef}>
         <div
            className="tpl-canvas"
            style={{
               transform: `scale(${layout.scaleX}, ${layout.scaleY})`,
               transformOrigin: 'top left',
               left: layout.left,
               top: layout.top,
            }}
         >
            <div className="tpl-bg">
               {/* TemplateContent: image/template artwork + overlays */}
            </div>
         </div>
      </div>
   );
}
```

```css
.tpl-host {
   position: relative;
   width: 100%;
   height: 100%;
   overflow: hidden;
}

.tpl-canvas {
   position: absolute;
   left: 0;
   top: 0;
   width: 1080px;   /* BASE_W */
   height: 1920px;  /* BASE_H */
   transform-origin: top left;
   overflow: hidden;
}

.tpl-bg {
   width: 100%;
   height: 100%;
   position: relative;
   /* Put ONLY template artwork/content here. */
}
```

### Notes for strict compatibility

- Keep only one scaling method in a component (this one).
- Do not add fallback background layers behind host/canvas.
- If template source dimensions differ, update both:
   - `BASE_W/BASE_H` in JS
   - `.tpl-canvas` width/height in CSS
