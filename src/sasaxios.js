import { parseResponseStream } from './nativeResponse';
import { makeFullUrl } from './url';
import { makeRequestBody } from './requestBody';
import { createRequestInterceptorManager, createResponseInterceptorManager } from './interceptor';
export function create(defaultRequestOption = {}) {
    /**
     * Shortcut methods
     */
    const shortcutMethods = {
        get: (url, customOptions = {}) => {
            return request(url, { ...customOptions, method: 'get' });
        },
        post: (url, data, customOptions = {}) => {
            return request(url, { ...customOptions, data, method: 'post' });
        },
        put: (url, data, customOptions = {}) => {
            return request(url, { ...customOptions, data, method: 'put' });
        },
        patch: (url, data, customOptions = {}) => {
            return request(url, { ...customOptions, data, method: 'patch' });
        },
        delete: (url, customOptions = {}) => {
            return request(url, { ...customOptions, method: 'delete' });
        },
        head: (url, customOptions = {}) => {
            return request(url, { ...customOptions, method: 'head' });
        },
        options: (url, customOptions = {}) => {
            return request(url, { ...customOptions, method: 'options' });
        }
    };
    // request/response interceptors
    const requestInterceptor = createRequestInterceptorManager();
    const responseInterceptor = createResponseInterceptorManager();
    /**
     * Call native fetch
     */
    async function request(url, customOptions = {}) {
        let options = { ...defaultRequestOption, ...customOptions };
        const fullUrl = makeFullUrl(url.toString(), { baseUrl: options.baseUrl, params: options.params });
        // Call request interceptors before fetch
        for (const interceptor of requestInterceptor.handlers) {
            if (interceptor.fulfilled) {
                options = await interceptor.fulfilled(options);
            }
        }
        // Transform saxios request to native fetch request
        const nativeRequestConfig = {
            method: options.method?.toUpperCase() || 'GET',
            body: makeRequestBody(options.data, options.headers?.['content-type'] || ''),
            headers: options.headers,
            credentials: options.withCredentials ? 'include' : 'omit'
        };
        try {
            // Call native fetch
            const nativeResponse = await fetch(fullUrl, nativeRequestConfig);
            // if native fetch is success but response status is not 2xx, throw error
            if (!nativeResponse.ok) {
                const error = new Error(nativeResponse.statusText, { cause: nativeResponse });
                for (const interceptor of responseInterceptor.handlers) {
                    if (interceptor.rejected) {
                        await interceptor.rejected(error);
                    }
                }
                throw error;
            }
            // transform native fetch response to saxios response
            const response = {
                data: await parseResponseStream(nativeResponse),
                status: nativeResponse.status,
                statusText: nativeResponse.statusText,
                headers: nativeResponse.headers,
                config: customOptions
            };
            // Call response interceptors after fetch
            for (const interceptor of responseInterceptor.handlers) {
                if (interceptor.fulfilled) {
                    await interceptor.fulfilled(response);
                }
            }
            return response;
        }
        catch (e) {
            // if native fetch is failed, call rejected request interceptor
            for (const interceptor of requestInterceptor.handlers) {
                if (interceptor.rejected) {
                    await interceptor.rejected(e);
                }
            }
            throw e;
        }
    }
    return {
        request,
        interceptors: {
            request: requestInterceptor,
            response: responseInterceptor
        },
        ...shortcutMethods
    };
}
export default create();