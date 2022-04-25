import * as express from "express";
import AuthorizationMiddleware from "../middlewares/authorization.middleware";

import GenericResponse from "../interfaces/generic-response.interface";
import MonitorService from "../services/monitor.service";
import {StatusCodes} from "http-status-codes";
import ReportService from "../services/report.service";
import UrlMonitorEntity from "../db/entities/url-monitor.entity";
import ReportResponseDto, {ReportDto} from "./dtos/report-response.dto";
import {RequestStatusEnum} from "../constants/enums/request-status.enum";
import {plainToInstance} from "class-transformer";

export default class ReportController {
    public static path = '/report';
    public router = express.Router();
    public authorizationMiddleware: AuthorizationMiddleware;
    public monitorService: MonitorService;
    public reportService: ReportService;

    constructor() {
        this.authorizationMiddleware = new AuthorizationMiddleware()
        this.monitorService = new MonitorService()
        this.reportService = new ReportService()
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.get(`${ReportController.path}`, this.authorizationMiddleware.isAuthorized, this.getUserReports);
    }


    private getUserReports = async (req: express.Request, res: express.Response) => {
        const genericResponse: GenericResponse = {
            success: true,
            statusCode: StatusCodes.OK,
            message: undefined
        }

        try {
            if (req.query.name) {
                // @ts-ignore
                const recordResponse = await this.monitorService.getRecord(req.query.name, req.user)
                const urlRecord: UrlMonitorEntity = recordResponse.message
                if (urlRecord){
                    genericResponse.message = await this.generateReport(urlRecord)
                }else {
                    genericResponse.success=false
                    genericResponse.statusCode = StatusCodes.NOT_FOUND
                    genericResponse.message = `Not Record with name '${req.query.name}'`
                }
            } else {
                // @ts-ignore
                const recordResponse = await this.monitorService.getUserRecords(req.user)
                const urlRecords: UrlMonitorEntity[] = recordResponse.message
                genericResponse.message = await Promise.all(urlRecords.map(async urlRecord => await this.generateReport(urlRecord)))
            }
        } catch (e: any) {
            genericResponse.success = false
            genericResponse.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            genericResponse.message = Error(e).message
        }
        res.json(genericResponse)
    }

    private async generateReport(urlRecord: UrlMonitorEntity): Promise<ReportResponseDto> {
        const reports = await this.reportService.getUrlReportsById(urlRecord.id)
        const history = reports.map(report => plainToInstance(ReportDto, report))
        const downReports = reports.filter(report => report.status === RequestStatusEnum.DOWN)

        const totalDownTimeSeconds = downReports.map(report => report.responseTime)
            .reduce((total, reportResponseTime) => total + reportResponseTime, 0)
        const monitoringTimeInSeconds = (reports[reports.length - 1].endDate.valueOf() - reports[0].startDate.valueOf()) / 1000
        const uptime = Math.floor(monitoringTimeInSeconds - totalDownTimeSeconds)
        const responseTime = reports.map(report => report.responseTime)
            .reduce((total, responseTime) => total + responseTime, 0)
        return {
            url: urlRecord.url,
            name: urlRecord.name,
            status: reports[reports.length - 1].status,
            availability: Math.floor((uptime / monitoringTimeInSeconds) * 100),
            outages: downReports.length,
            downtime: Math.floor(totalDownTimeSeconds),
            uptime,
            responseTime: Math.floor((responseTime / reports.length) * 100),
            history,
        };
    }
}
