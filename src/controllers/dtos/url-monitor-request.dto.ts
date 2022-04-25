import {RequestProtocolEnum} from "../../constants/enums/request-protocol.enum";
import {IsBoolean, IsString, IsUrl} from 'class-validator';

export default class UrlMonitorRequest {
    @IsString()
    name: string

    @IsUrl()
    url: string

    @IsString()
    protocol: RequestProtocolEnum

    path: string

    port: number
    timeout: number
    interval: number = 10
    threshold: number
    authentication: { username: string, password: string }
    httpHeaders: { [type: string]: string; }
    tags: string[]

    @IsBoolean()
    ignoreSSL: boolean = false
}
