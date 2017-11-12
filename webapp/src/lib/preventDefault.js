export default function preventDefault(fn) {
  return function(event) {
    if (event) {
      event.preventDefault();
    }
    fn.call(this, event);
  };
}
