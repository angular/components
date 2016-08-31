export function createOverlayContainer(): Element {
  let container = document.createElement('div');
  container.classList.add('md-overlay');
  document.body.appendChild(container);
  return container;
}
