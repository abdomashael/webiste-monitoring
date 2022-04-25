import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import UrlMonitorEntity from "./url-monitor.entity";
import {RequestStatusEnum} from "../../constants/enums/request-status.enum";

@Entity({name: 'report'})
export default class ReportEntity {
    @PrimaryGeneratedColumn()
    id: number

    //up or down
    @Column({type: "text"})
    status: RequestStatusEnum

    @Column()
    responseTime: number

    @Column()
    startDate: Date

    @Column()
    endDate: Date

    @ManyToOne(() => UrlMonitorEntity, server => server.reports)
    url: UrlMonitorEntity
}
