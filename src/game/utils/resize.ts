export interface FitResult {
  scale: number;
  x: number;
  y: number;
}

export function fitIntoViewport(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
): FitResult {
  const padding = Math.min(28, Math.max(10, viewportWidth * 0.025));
  const scale = Math.min(
    (viewportWidth - padding * 2) / width,
    (viewportHeight - padding * 2) / height,
  );

  return {
    scale: Math.max(0.34, scale),
    x: viewportWidth * 0.5,
    y: viewportHeight * 0.5,
  };
}
