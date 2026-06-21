import DOMPurify from 'dompurify';

export function sanitizeSvg(svg: string): string {
    if (typeof window === 'undefined') return svg;

    return DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        ADD_TAGS: ['foreignObject', 'style'],
        ADD_ATTR: ['xmlns', 'xmlns:xlink', 'xlink:href', 'marker-end', 'marker-start', 'dominant-baseline', 'text-anchor'],
    });
}
