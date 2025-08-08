// Tiny Pub/Sub event bus
const listeners = {};
export function on(event, cb) {
  (listeners[event] = listeners[event] || []).push(cb);
}
export function off(event, cb) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter(fn => fn !== cb);
}
export function emit(event, data) {
  (listeners[event] || []).forEach(fn => fn(data));
}
