import {AxiosInterceptorManager, AxiosResponse} from "axios";

declare module 'axios' {
    export interface AxiosRequestConfig {
        metadata: { startTime: Date, endTime: Date | null, durationInSeconds: number | null };
    }

    export interface interceptors {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    }

}
