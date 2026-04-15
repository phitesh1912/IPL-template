function toZoomFactor(rawValue) {
  if (rawValue == null) return 1;

  const raw = String(rawValue).trim();
  const num = Number.parseFloat(raw);

  if (!Number.isFinite(num) || num <= 0) return 1;
  if (raw.endsWith('%')) return num / 100;

  // Common console usage is: document.body.style.zoom = "300"
  // Treat values >10 as percentages (300 => 3x).
  return num > 10 ? num / 100 : num;
}

function normalizeInlineZoom(target) {
  if (!target || !target.style) return;

  const raw = String(target.style.zoom || '').trim();
  if (!raw || raw.endsWith('%')) return;

  const num = Number.parseFloat(raw);
  if (!Number.isFinite(num) || num <= 10) return;

  // If someone sets zoom as "300", normalize it to "300%"
  // so runtime behavior aligns with intended 3x zoom.
  target.style.zoom = `${num}%`;
}

export function getPageZoomFactor() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 1;

  normalizeInlineZoom(document.body);
  normalizeInlineZoom(document.documentElement);

  const bodyZoom = toZoomFactor(window.getComputedStyle(document.body).zoom);
  const htmlZoom = toZoomFactor(window.getComputedStyle(document.documentElement).zoom);

  return bodyZoom !== 1 ? bodyZoom : htmlZoom;
}

export function getMeasuredElementZoom(target) {
  if (!target || typeof document === 'undefined') return 1;

  // Keep body/html inline zoom values normalized (e.g. "300" -> "300%")
  // before measuring rendered zoom behavior.
  const fallbackZoom = getPageZoomFactor();

  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.left = '0';
  probe.style.top = '0';
  probe.style.width = '100px';
  probe.style.height = '0';
  probe.style.opacity = '0';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';

  target.appendChild(probe);
  const probeWidth = probe.getBoundingClientRect().width;
  probe.remove();

  const measured = probeWidth / 100;
  return Number.isFinite(measured) && measured > 0 ? measured : fallbackZoom;
}
