export function when(value, factory) {
    return value ? factory(value) : undefined;
}
