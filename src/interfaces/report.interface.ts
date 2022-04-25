import {RequestStatusEnum} from "../constants/enums/request-status.enum";

export default class ReportInterface {
    startDate: Date
    endDate: Date
    status: RequestStatusEnum
    responseTime: number
}
