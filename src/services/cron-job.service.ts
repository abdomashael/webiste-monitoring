import ReportInterface from "../interfaces/report.interface";
import axios, {AxiosError, AxiosRequestConfig} from "axios";
import {RequestStatusEnum} from "../constants/enums/request-status.enum";
import https from 'https';
import ReportService from "./report.service";
import UrlMonitorEntity from "../db/entities/url-monitor.entity";
import {RequestProtocolEnum} from "../constants/enums/request-protocol.enum";
import MonitorService from "./monitor.service";
import MailService from "./mail.service";
import MailMessage from "../interfaces/mail-message.interface";
import {Job, scheduleJob} from "node-schedule";
import UserService from "./user.service";

export default class CronJobService {

    private reportService: ReportService
    private mailService: MailService
    private userService: UserService

    constructor() {
        this.reportService = new ReportService()
        this.mailService = new MailService()
        this.userService = new UserService()
    }

    public createJob = (urlMonitorEntity: UrlMonitorEntity): Job => {
        return this.getScheduleJob(urlMonitorEntity);
    }

    public generateFailedMailMessage = async (mail: string, url: string, urlName: string, numberOfFailedTries: number): Promise<MailMessage> => {
        const msgText = `Monitor with name '${urlName}' and URl '${url}' is down for ${numberOfFailedTries} tries.`
        return {
            from: process.env.MAIL_USER || 'Test',
            to: mail,
            subject: `${urlName}: Url Is Down`,
            text: msgText,
            html: `<p>msgText</p>`,
        }
    }
    public startAllJobs = async () => {
        const urlMonitorEntities = await new MonitorService().getAllRecords()
        urlMonitorEntities.forEach(urlMonitorEntity => {
            this.getScheduleJob(urlMonitorEntity).invoke()
        })
    }

    private getScheduleJob(urlMonitorEntity: UrlMonitorEntity) {
        return scheduleJob(urlMonitorEntity.name, `*/${urlMonitorEntity.interval} * * * *`, async () => {
            let reportInterface: ReportInterface
            const monitorService = new MonitorService()

            try {
                const port = urlMonitorEntity.port ? urlMonitorEntity.port : urlMonitorEntity.protocol === RequestProtocolEnum.HTTP ? 80 : 443
                const url = `${urlMonitorEntity.protocol}://${urlMonitorEntity.url}:${port}${urlMonitorEntity.path || "/"}`

                const httpsAgent = new https.Agent({
                    rejectUnauthorized: !urlMonitorEntity.ignoreSSL
                })
                const config: AxiosRequestConfig = {
                    url,
                    timeout: urlMonitorEntity.timeout * 1000 || 10000,
                    httpsAgent,
                    metadata: {startTime: new Date(), endTime: null, durationInSeconds: null}
                }
                if (urlMonitorEntity.authentication) {
                    config.auth = {
                        username: urlMonitorEntity.authentication.username,
                        password: urlMonitorEntity.authentication.password
                    }
                }
                if (urlMonitorEntity.httpHeaders) {
                    config.headers = urlMonitorEntity.httpHeaders
                }

                const response = await axios.request(config)
                reportInterface = {
                    startDate: response.config.metadata.startTime,
                    endDate: response.config.metadata.endTime || new Date(),
                    status: RequestStatusEnum.UP,
                    responseTime: response.config.metadata.durationInSeconds || 0
                };
                await monitorService.resetFailedThresholdRecord(urlMonitorEntity.id)
            } catch (error) {
                const e = error as AxiosError
                console.log(error)
                reportInterface = {
                    startDate: e.config.metadata.startTime,
                    endDate: e.config.metadata.endTime || new Date(),
                    status: RequestStatusEnum.DOWN,
                    responseTime: e.config.metadata.durationInSeconds || 0
                };
                console.log("error", error);
                await monitorService.addFailedRecord(urlMonitorEntity.id)
                const updatedUrlMonitorEntity = await monitorService.getRecordById(urlMonitorEntity.id)
                if (updatedUrlMonitorEntity && updatedUrlMonitorEntity.numberOfFailedTries >= updatedUrlMonitorEntity.threshold) {
                    const mailMsgConfig = await this.generateFailedMailMessage(urlMonitorEntity.user.mail, urlMonitorEntity.url, updatedUrlMonitorEntity.name, updatedUrlMonitorEntity.numberOfFailedTries)
                    await this.mailService.sendMail(mailMsgConfig)
                }
            }
            await this.reportService.addReport(reportInterface, urlMonitorEntity)
        });
    }


}
