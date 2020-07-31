export function getTextWithExcludedElements(element: Element, excludeSelector: string) {
  const clone = element.cloneNode(true) as Element;
  const exclusions = clone.querySelectorAll(excludeSelector);
  for (let i = 0; i < exclusions.length; i++) {
    let child = exclusions[i];
    child.parentNode?.removeChild(child);
  }
  return (clone.textContent || '').trim();
}
