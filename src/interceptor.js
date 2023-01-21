function createInterceptorManager() {
    let currentIdIndex = 0;
    const handlers = [];
    function use(fulfilled, rejected) {
        handlers.push({ id: currentIdIndex, fulfilled, rejected: rejected || null });
        return currentIdIndex++;
    }
    function eject(id) {
        const index = handlers.findIndex(interceptor => interceptor.id === id);
        if (index >= 0) {
            handlers.splice(index, 1);
        }
    }
    function clear() {
        handlers.length = 0;
    }
    return {
        use,
        eject,
        clear,
        handlers
    };
}
export function createRequestInterceptorManager() {
    return createInterceptorManager();
}
export function createResponseInterceptorManager() {
    return createInterceptorManager();
}
