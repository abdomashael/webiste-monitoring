import {Repository} from "typeorm";
import ReportEntity from "../db/entities/report.entity";
import {AppDataSource} from "../data-source";
import ReportInterface from "../interfaces/report.interface";
import UrlMonitorEntity from "../db/entities/url-monitor.entity";
import {plainToInstance} from "class-transformer";

export default class ReportService {
    private reportRepository: Repository<ReportEntity>

    constructor() {
        this.reportRepository = AppDataSource.getRepository(ReportEntity)
    }

    public addReport = async (reportInterface: ReportInterface, urlMonitorEntity: UrlMonitorEntity): Promise<ReportEntity> => {
        const reportEntity: ReportEntity = plainToInstance(ReportEntity, reportInterface)
        reportEntity.url = urlMonitorEntity
        return this.reportRepository.save(reportEntity)

    }

    public getUrlReportsById = (id: number): Promise<ReportEntity[]> => {
        return this.reportRepository.createQueryBuilder().where("urlId= :id", {id}).getMany()
    }
}
