import ReportService from "../report.service";
import ReportInterface from "../../interfaces/report.interface";
import {RequestStatusEnum} from "../../constants/enums/request-status.enum";
import UrlMonitorEntity from "../../db/entities/url-monitor.entity";
import {RequestProtocolEnum} from "../../constants/enums/request-protocol.enum";
import {UserEntity} from "../../db/entities/user.entity";
import ReportEntity from "../../db/entities/report.entity";
import {AppDataSource} from "../../data-source";

describe("report", () => {
    let reportService: ReportService
    beforeAll(async () => {
        reportService = new ReportService()
        await AppDataSource.initialize()
    })

    it("add report", async () => {
        const reportInterface: ReportInterface = {
            endDate: new Date(),
            responseTime: 0,
            startDate: new Date(),
            status: RequestStatusEnum.DOWN
        }
        const urlMonitorEntity: UrlMonitorEntity = {
            authentication: {password: "", username: ""},
            httpHeaders: {},
            id: 0,
            ignoreSSL: false,
            interval: 0,
            name: "",
            numberOfFailedTries: 0,
            path: "",
            port: 0,
            protocol: RequestProtocolEnum.HTTP,
            reports: [],
            tags: [],
            threshold: 0,
            timeout: 0,
            url: "",
            user: new UserEntity()
        }
        const result = await reportService.addReport(reportInterface, urlMonitorEntity)
        expect(typeof result).toBe(ReportEntity)
    })
})
