import ReportService from "./report.service";
import GenericResponse from "../interfaces/generic-response.interface";
import UrlMonitorRequest from "../controllers/dtos/url-monitor-request.dto";
import UrlMonitorEntity from "../db/entities/url-monitor.entity";
import {plainToInstance} from "class-transformer";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import CronJobService from "./cron-job.service";
import {StatusCodes} from "http-status-codes";
import {RequestProtocolEnum} from "../constants/enums/request-protocol.enum";
import {UserEntity} from "../db/entities/user.entity";

export default class MonitorService {
    private reportService: ReportService
    private cronJobService: CronJobService
    private urlMonitorRepository: Repository<UrlMonitorEntity>

    constructor() {
        this.reportService = new ReportService()
        this.cronJobService = new CronJobService()
        this.urlMonitorRepository = AppDataSource.getRepository(UrlMonitorEntity)
    }

    public addNewRecord = async (urlMonitorRequest: UrlMonitorRequest, user: UserEntity): Promise<GenericResponse> => {

        const response: GenericResponse = {message: undefined, statusCode: 0, success: false}

        try {
            let urlMonitorEntity = plainToInstance(UrlMonitorEntity, urlMonitorRequest)
            urlMonitorEntity.user = user
            urlMonitorEntity.port = urlMonitorRequest.port || urlMonitorRequest.protocol === RequestProtocolEnum.HTTP ? 80 : 443

            urlMonitorEntity = await this.urlMonitorRepository.save(urlMonitorEntity)
            const scheduledTask = this.cronJobService.createJob(urlMonitorEntity)
            scheduledTask.invoke()
            response.statusCode = StatusCodes.OK
            response.success = true
            response.message = urlMonitorEntity
        } catch (e: any) {
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.success = false
            response.message = Error(e).message
        }

        return response
    }

    public deleteRecord = async (urlMonitorName: string, user: UserEntity): Promise<GenericResponse> => {
        const response: GenericResponse = {message: undefined, statusCode: 0, success: false}
        try {
            const deleteResult = await this.urlMonitorRepository
                .createQueryBuilder()
                .where("name= :urlMonitorName", {urlMonitorName})
                .andWhere('user= :user', {user})
                .delete().execute()

            if (deleteResult.affected && deleteResult.affected > 0) {
                response.success = true
                response.statusCode = StatusCodes.OK
                response.message = `Number of deleted url monitor = ${deleteResult.affected}`
            } else {
                response.success = false
                response.statusCode = StatusCodes.NOT_FOUND
                response.message = `No url monitor found with name '${urlMonitorName}'`
            }
        } catch (e: any) {
            response.success = false
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.message = Error(e).message
        }

        return response
    }

    async getUserRecords(user: UserEntity): Promise<GenericResponse> {
        const response: GenericResponse = {message: undefined, statusCode: 0, success: false}
        try {
            const urlMonitorEntities = await this.urlMonitorRepository.createQueryBuilder()
                .where('userId= :userId', {userId: user.id})
                .getMany()
            response.success = true
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.message = urlMonitorEntities
        } catch (e: any) {
            console.log("Error", e)
            response.success = false
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.message = Error(e).message
        }
        return response
    }

    async getRecord(urlName: string, user: UserEntity): Promise<GenericResponse> {
        const response: GenericResponse = {message: undefined, statusCode: 0, success: false}
        try {
            const urlMonitor = await this.urlMonitorRepository.createQueryBuilder()
                .where('name= :urlName', {urlName})
                .andWhere('userId= :userId', {userId: user.id})
                .getOne()
            response.success = true
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.message = urlMonitor
        } catch (e: any) {
            response.success = false
            response.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
            response.message = Error(e).message
        }
        return response
    }

    public getAllRecords = async (): Promise<UrlMonitorEntity[]> => {
        return this.urlMonitorRepository.find({
            relations: {
                user: true,
            },
        })
    }

    public resetFailedThresholdRecord = async (id: number) => {
        const urlMonitorEntity = await this.getRecordById(id)
        if (urlMonitorEntity) {
            urlMonitorEntity.numberOfFailedTries = 0
            await this.urlMonitorRepository.save(urlMonitorEntity)
        }

    }

    public addFailedRecord = async (id: number) => {
        const urlMonitorEntity = await this.getRecordById(id)
        if (urlMonitorEntity) {
            urlMonitorEntity.numberOfFailedTries = urlMonitorEntity.numberOfFailedTries + 1
            await this.urlMonitorRepository.save(urlMonitorEntity)
        }

    }

    public getRecordById = async (id: number) => {
        return await this.urlMonitorRepository
            .createQueryBuilder()
            .where("id= :id", {id})
            .getOne()
    }
}
