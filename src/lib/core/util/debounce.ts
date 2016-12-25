/**
 * Returns a function that won't be invoked, as long as it keeps being called. It will
 * be invoked after it hasn't been called for `delay` milliseconds.
 *
 * @param func Function to be debounced.
 * @param delay Amount of milliseconds to wait before calling the function.
 * @param context Context in which to call the function.
 */
export function debounce(func: Function, delay: number, context?: any): Function {
  let timer: number;

  return function() {
    let args = arguments;

    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      func.apply(context, args);
    }, delay);
  };
};
