import {RequestStatusEnum} from "../../constants/enums/request-status.enum";

export default class ReportResponseDto {
    url: string
    name: string
    status: RequestStatusEnum
    availability: number
    outages: number
    downtime: number
    uptime: number
    responseTime: number
    history: ReportDto[]
}

export class ReportDto {
    status: RequestStatusEnum
    responseTime: number
    startDate: Date
    endDate: Date
}
