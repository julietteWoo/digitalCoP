// If we don't check whether 'window' and 'global' variables are defined,
// code will fail in browser/node with 'variable is undefined' error.
let root;
if (typeof window !== 'undefined') {
    root = window;
}
else if (typeof global !== 'undefined') {
    root = global;
}
// tslint:disable-next-line:variable-name
export const MouseEvent = root.MouseEvent;
export function createMouseEvent(name, bubbles = false, cancelable = true) {
    // Calling new of an event does not work correctly on IE. The following is a tested workaround
    // See https://stackoverflow.com/questions/27176983/dispatchevent-not-working-in-ie11
    if (typeof MouseEvent === 'function') {
        // Sane browsers
        return new MouseEvent(name, { bubbles, cancelable });
    }
    else {
        // IE
        const event = document.createEvent('MouseEvent');
        event.initEvent(name, bubbles, cancelable);
        return event;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1jaGFydHMvIiwic291cmNlcyI6WyJsaWIvZXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLHlFQUF5RTtBQUN6RSxxRUFBcUU7QUFDckUsSUFBSSxJQUFTLENBQUM7QUFDZCxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtJQUNqQyxJQUFJLEdBQUcsTUFBTSxDQUFDO0NBQ2Y7S0FBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtJQUN4QyxJQUFJLEdBQUcsTUFBTSxDQUFDO0NBQ2Y7QUFFRCx5Q0FBeUM7QUFDekMsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUc5QixDQUFDO0FBRUYsTUFBTSxVQUFVLGdCQUFnQixDQUFDLElBQVksRUFBRSxVQUFtQixLQUFLLEVBQUUsYUFBc0IsSUFBSTtJQUNqRyw4RkFBOEY7SUFDOUYscUZBQXFGO0lBQ3JGLElBQUksT0FBTyxVQUFVLEtBQUssVUFBVSxFQUFFO1FBQ3BDLGdCQUFnQjtRQUNoQixPQUFPLElBQUksVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ3REO1NBQU07UUFDTCxLQUFLO1FBQ0wsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNqRCxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDM0MsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJkZWNsYXJlIGxldCBnbG9iYWw6IGFueTtcblxuLy8gSWYgd2UgZG9uJ3QgY2hlY2sgd2hldGhlciAnd2luZG93JyBhbmQgJ2dsb2JhbCcgdmFyaWFibGVzIGFyZSBkZWZpbmVkLFxuLy8gY29kZSB3aWxsIGZhaWwgaW4gYnJvd3Nlci9ub2RlIHdpdGggJ3ZhcmlhYmxlIGlzIHVuZGVmaW5lZCcgZXJyb3IuXG5sZXQgcm9vdDogYW55O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gIHJvb3QgPSBnbG9iYWw7XG59XG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTp2YXJpYWJsZS1uYW1lXG5leHBvcnQgY29uc3QgTW91c2VFdmVudCA9IHJvb3QuTW91c2VFdmVudCBhcyBNb3VzZUV2ZW50ICYge1xuICBwcm90b3R5cGU/OiBNb3VzZUV2ZW50O1xuICBuZXcgKHR5cGVBcmc6IHN0cmluZywgZXZlbnRJbml0RGljdD86IE1vdXNlRXZlbnRJbml0KTogTW91c2VFdmVudDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb3VzZUV2ZW50KG5hbWU6IHN0cmluZywgYnViYmxlczogYm9vbGVhbiA9IGZhbHNlLCBjYW5jZWxhYmxlOiBib29sZWFuID0gdHJ1ZSk6IE1vdXNlRXZlbnQge1xuICAvLyBDYWxsaW5nIG5ldyBvZiBhbiBldmVudCBkb2VzIG5vdCB3b3JrIGNvcnJlY3RseSBvbiBJRS4gVGhlIGZvbGxvd2luZyBpcyBhIHRlc3RlZCB3b3JrYXJvdW5kXG4gIC8vIFNlZSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNzE3Njk4My9kaXNwYXRjaGV2ZW50LW5vdC13b3JraW5nLWluLWllMTFcbiAgaWYgKHR5cGVvZiBNb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgLy8gU2FuZSBicm93c2Vyc1xuICAgIHJldHVybiBuZXcgTW91c2VFdmVudChuYW1lLCB7IGJ1YmJsZXMsIGNhbmNlbGFibGUgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gSUVcbiAgICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgZXZlbnQuaW5pdEV2ZW50KG5hbWUsIGJ1YmJsZXMsIGNhbmNlbGFibGUpO1xuICAgIHJldHVybiBldmVudDtcbiAgfVxufVxuIl19