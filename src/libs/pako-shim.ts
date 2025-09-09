import * as pako from 'pako';

// Default export for consumers expecting default
export default pako;

// Named exports passthrough
export const deflate = pako.deflate;
export const inflate = pako.inflate;
export const gzip = (pako as any).gzip;
export const ungzip = (pako as any).ungzip;
export const inflateRaw = pako.inflateRaw;
export const deflateRaw = pako.deflateRaw;
export const constants = (pako as any).constants;

// Export all
export * from 'pako';
