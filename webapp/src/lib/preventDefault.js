export default function preventDefault(fn) {
  return function(event) {
    event.preventDefault();
    fn.call(this, event);
  };
}
