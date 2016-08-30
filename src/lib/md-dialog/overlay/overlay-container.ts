export function createOverlayContainer(): Element {
  let container = document.createElement('div');
  container.classList.add('md2-overlay');
  document.body.appendChild(container);
  return container;
}
