/**
 * Throttle a function
 *
 * @export
 * @param {*}      func
 * @param {number} wait
 * @param {*}      [options]
 * @returns
 */
export function throttle(func, wait, options) {
    options = options || {};
    let context;
    let args;
    let result;
    let timeout = null;
    let previous = 0;
    function later() {
        previous = options.leading === false ? 0 : +new Date();
        timeout = null;
        result = func.apply(context, args);
    }
    return function () {
        const now = +new Date();
        if (!previous && options.leading === false) {
            previous = now;
        }
        const remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
        }
        else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };
}
/**
 * Throttle decorator
 *
 *  class MyClass {
 *    throttleable(10)
 *    myFn() { ... }
 *  }
 *
 * @export
 * @param {number} duration
 * @param {*} [options]
 * @returns
 */
export function throttleable(duration, options) {
    return function innerDecorator(target, key, descriptor) {
        return {
            configurable: true,
            enumerable: descriptor.enumerable,
            get: function getter() {
                Object.defineProperty(this, key, {
                    configurable: true,
                    enumerable: descriptor.enumerable,
                    value: throttle(descriptor.value, duration, options)
                });
                return this[key];
            }
        };
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyb3R0bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWdyYXBoLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL3Rocm90dGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLFFBQVEsQ0FBQyxJQUFTLEVBQUUsSUFBWSxFQUFFLE9BQWE7SUFDN0QsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7SUFDeEIsSUFBSSxPQUFPLENBQUM7SUFDWixJQUFJLElBQUksQ0FBQztJQUNULElBQUksTUFBTSxDQUFDO0lBQ1gsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQ25CLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztJQUVqQixTQUFTLEtBQUs7UUFDWixRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZELE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDZixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELE9BQU87UUFDTCxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7UUFFeEIsSUFBSSxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsT0FBTyxLQUFLLEtBQUssRUFBRTtZQUMxQyxRQUFRLEdBQUcsR0FBRyxDQUFDO1NBQ2hCO1FBRUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDZixJQUFJLEdBQUcsU0FBUyxDQUFDO1FBRWpCLElBQUksU0FBUyxJQUFJLENBQUMsRUFBRTtZQUNsQixZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDdEIsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNmLFFBQVEsR0FBRyxHQUFHLENBQUM7WUFDZixNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEM7YUFBTSxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQ2pELE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sVUFBVSxZQUFZLENBQUMsUUFBZ0IsRUFBRSxPQUFhO0lBQzFELE9BQU8sU0FBUyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxVQUFVO1FBQ3BELE9BQU87WUFDTCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDakMsR0FBRyxFQUFFLFNBQVMsTUFBTTtnQkFDbEIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFO29CQUMvQixZQUFZLEVBQUUsSUFBSTtvQkFDbEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxVQUFVO29CQUNqQyxLQUFLLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQztpQkFDckQsQ0FBQyxDQUFDO2dCQUVILE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQyxDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhyb3R0bGUgYSBmdW5jdGlvblxuICpcbiAqIEBleHBvcnRcbiAqIEBwYXJhbSB7Kn0gICAgICBmdW5jXG4gKiBAcGFyYW0ge251bWJlcn0gd2FpdFxuICogQHBhcmFtIHsqfSAgICAgIFtvcHRpb25zXVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRocm90dGxlKGZ1bmM6IGFueSwgd2FpdDogbnVtYmVyLCBvcHRpb25zPzogYW55KSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBsZXQgY29udGV4dDtcbiAgbGV0IGFyZ3M7XG4gIGxldCByZXN1bHQ7XG4gIGxldCB0aW1lb3V0ID0gbnVsbDtcbiAgbGV0IHByZXZpb3VzID0gMDtcblxuICBmdW5jdGlvbiBsYXRlcigpIHtcbiAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogK25ldyBEYXRlKCk7XG4gICAgdGltZW91dCA9IG51bGw7XG4gICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3Qgbm93ID0gK25ldyBEYXRlKCk7XG5cbiAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHtcbiAgICAgIHByZXZpb3VzID0gbm93O1xuICAgIH1cblxuICAgIGNvbnN0IHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgIGNvbnRleHQgPSB0aGlzO1xuICAgIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogVGhyb3R0bGUgZGVjb3JhdG9yXG4gKlxuICogIGNsYXNzIE15Q2xhc3Mge1xuICogICAgdGhyb3R0bGVhYmxlKDEwKVxuICogICAgbXlGbigpIHsgLi4uIH1cbiAqICB9XG4gKlxuICogQGV4cG9ydFxuICogQHBhcmFtIHtudW1iZXJ9IGR1cmF0aW9uXG4gKiBAcGFyYW0geyp9IFtvcHRpb25zXVxuICogQHJldHVybnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRocm90dGxlYWJsZShkdXJhdGlvbjogbnVtYmVyLCBvcHRpb25zPzogYW55KSB7XG4gIHJldHVybiBmdW5jdGlvbiBpbm5lckRlY29yYXRvcih0YXJnZXQsIGtleSwgZGVzY3JpcHRvcikge1xuICAgIHJldHVybiB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiBkZXNjcmlwdG9yLmVudW1lcmFibGUsXG4gICAgICBnZXQ6IGZ1bmN0aW9uIGdldHRlcigpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIGtleSwge1xuICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiBkZXNjcmlwdG9yLmVudW1lcmFibGUsXG4gICAgICAgICAgdmFsdWU6IHRocm90dGxlKGRlc2NyaXB0b3IudmFsdWUsIGR1cmF0aW9uLCBvcHRpb25zKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGhpc1trZXldO1xuICAgICAgfVxuICAgIH07XG4gIH07XG59XG4iXX0=