// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { Blob } from 'buffer';
import { ReadableStream } from 'stream/web';
import { FormData, Headers } from 'undici';
import { URLSearchParams } from 'url';
import { FunctionInput, FunctionOptions, FunctionOutput, FunctionResult } from './index';
import { InvocationContext } from './InvocationContext';

export type HttpHandler = (context: InvocationContext, request: HttpRequest) => FunctionResult<HttpResponse>;

export interface HttpFunctionOptions extends HttpInputOptions, Partial<FunctionOptions> {
    handler: HttpHandler;

    /**
     * Configuration for the optional primary output of the function. If not set, this will default to a standard http response output
     * This is the main output that you should set as the return value of the function handler during invocation
     */
    return?: FunctionOutput;
}

export interface HttpInputOptions {
    /**
     * The function HTTP authorization level
     * Defaults to 'anonymous' if not specified
     */
    authLevel?: 'anonymous' | 'function' | 'admin';

    /**
     * An array of the http methods for this http input
     * Defaults to ["get", "post"] if not specified
     */
    methods?: HttpMethod[];

    /**
     * The route for this http input. If not specified, the function name will be used
     */
    route?: string;
}

export interface HttpInput extends FunctionInput {
    /**
     * The function HTTP authorization level.
     */
    authLevel: 'anonymous' | 'function' | 'admin';

    /**
     * An array of the http methods for this http input
     */
    methods: HttpMethod[];

    /**
     * The route for this http input. If not specified, the function name will be used
     */
    route?: string;
}

/**
 * At this point in time there are no http output specific options
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HttpOutputOptions {}

export type HttpOutput = FunctionOutput & HttpOutputOptions;

/**
 * HTTP request object. Provided to your function when using HTTP Bindings.
 */
export interface HttpRequest {
    /**
     * HTTP request method used to invoke this function.
     */
    method: HttpMethod;

    /**
     * Request URL.
     */
    url: string;

    /**
     * HTTP request headers.
     */
    headers: Headers;

    /**
     * Query string parameter keys and values from the URL.
     */
    query: URLSearchParams;

    /**
     * Route parameter keys and values.
     */
    params: HttpRequestParams;

    /**
     *  Object representing logged-in user, either through
     *  AppService/Functions authentication, or SWA Authentication
     *  null when no such user is logged in.
     */
    user: HttpRequestUser | null;

    /**
     * Returns the body as a ReadableStream
     */
    readonly body: ReadableStream | null;

    /**
     * Returns whether the body has been read from
     */
    readonly bodyUsed: boolean;

    /**
     * Returns a promise fulfilled with the body as an ArrayBuffer
     */
    readonly arrayBuffer: () => Promise<ArrayBuffer>;

    /**
     * Returns a promise fulfilled with the body as a Blob
     */
    readonly blob: () => Promise<Blob>;

    /**
     * Returns a promise fulfilled with the body as FormData
     */
    readonly formData: () => Promise<FormData>;

    /**
     * Returns a promise fulfilled with the body parsed as JSON
     */
    readonly json: () => Promise<unknown>;

    /**
     * Returns a promise fulfilled with the body as a string
     */
    readonly text: () => Promise<string>;
}

/**
 * Route parameter keys and values.
 */
export interface HttpRequestParams {
    [name: string]: string;
}

/**
 *  Object representing logged-in user, either through
 *  AppService/Functions authentication, or SWA Authentication
 */
export interface HttpRequestUser {
    /**
     * Type of authentication, either AppService or StaticWebApps
     */
    type: HttpRequestUserType;

    /**
     * unique user GUID
     */
    id: string;

    /**
     * unique username
     */
    username: string;

    /**
     * provider of authentication service
     */
    identityProvider: string;

    /**
     * Extra authentication information, dependent on auth type
     * and auth provider
     */
    claimsPrincipalData: {
        [key: string]: any;
    };
}

/**
 * Possible values for an HTTP request method.
 */
export type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'HEAD' | 'PATCH' | 'PUT' | 'OPTIONS' | 'TRACE' | 'CONNECT';

/**
 * Possible values for an HTTP Request user type
 */
export type HttpRequestUserType = 'AppService' | 'StaticWebApps';

/**
 * Http response object and methods.
 * This is the default of the res property in the Context object provided to your function when using HTTP triggers.
 */
export interface HttpResponseFull {
    /**
     * HTTP response headers.
     */
    headers?: HttpResponseHeaders;

    /**
     *  HTTP response cookies.
     */
    cookies?: Cookie[];

    /**
     * HTTP response body.
     */
    body?: any;

    /**
     * HTTP response status code.
     * @default 200
     */
    statusCode?: number | string;

    /**
     * Enable content negotiation of response body if true
     * If false, treat response body as raw
     * @default false
     */
    enableContentNegotiation?: boolean;

    /**
     * Sets the HTTP response status code
     * @returns the updated HttpResponseFull instance
     */
    status: (statusCode: number | string) => HttpResponseFull;

    /**
     * Sets a particular header field to a value
     * @returns the updated HttpResponseFull instance
     */
    setHeader(field: string, val: any): HttpResponseFull;

    /**
     * Has the same functionality as setHeader.
     * Sets a particular header field to a value
     * @returns the updated HttpResponseFull instance
     */
    header(field: string, val: any): HttpResponseFull;

    /**
     * Has the same functionality as setHeader.
     * Sets a particular header field to a value
     * @returns the updated HttpResponseFull instance
     */
    set(field: string, val: any): HttpResponseFull;

    /**
     * Get the value of a particular header field
     */
    getHeader(field: string): any;

    /**
     * Has the same functionality as getHeader
     * Get the value of a particular header field
     */
    get(field: string): any;

    /**
     * Removes a particular header field
     * @returns the updated HttpResponseFull instance
     */
    removeHeader(field: string): HttpResponseFull;

    /**
     * Set the 'Content-Type' header to a particular value
     * @returns the updated HttpResponseFull instance
     */
    type(type: string): HttpResponseFull;
}

/**
 * HTTP response headers.
 */
export interface HttpResponseHeaders {
    [name: string]: string;
}

/**
 * Http response object.
 * This is not the default on the Context object, but you may replace context.res with an object of this type when using HTTP triggers.
 */
export interface HttpResponseSimple {
    /**
     * HTTP response headers.
     */
    headers?: HttpResponseHeaders;

    /**
     *  HTTP response cookies.
     */
    cookies?: Cookie[];

    /**
     * HTTP response body.
     */
    body?: any;

    /**
     * HTTP response status code.
     * This property takes precedence over the `status` property
     * @default 200
     */
    statusCode?: number | string;

    /**
     * HTTP response status code
     * The same as `statusCode`. This property is ignored if `statusCode` is set
     * @default 200
     */
    status?: number | string;

    /**
     * Enable content negotiation of response body if true
     * If false, treat response body as raw
     * @default false
     */
    enableContentNegotiation?: boolean;
}

/**
 * Http response type.
 */
export type HttpResponse = HttpResponseSimple | HttpResponseFull;

/**
 * Http response cookie object to "Set-Cookie"
 */
export interface Cookie {
    name: string;

    value: string;

    /**
     * Specifies allowed hosts to receive the cookie
     */
    domain?: string;

    /**
     * Specifies URL path that must exist in the requested URL
     */
    path?: string;

    /**
     * NOTE: It is generally recommended that you use maxAge over expires.
     * Sets the cookie to expire at a specific date instead of when the client closes.
     * This can be a Javascript Date or Unix time in milliseconds.
     */
    expires?: Date | number;

    /**
     * Sets the cookie to only be sent with an encrypted request
     */
    secure?: boolean;

    /**
     * Sets the cookie to be inaccessible to JavaScript's Document.cookie API
     */
    httpOnly?: boolean;

    /**
     * Can restrict the cookie to not be sent with cross-site requests
     */
    sameSite?: 'Strict' | 'Lax' | 'None' | undefined;

    /**
     * Number of seconds until the cookie expires. A zero or negative number will expire the cookie immediately.
     */
    maxAge?: number;
}
