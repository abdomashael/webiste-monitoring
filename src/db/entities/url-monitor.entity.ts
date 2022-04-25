import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import TagEntity from "./tag.entity";
import ReportEntity from "./report.entity";
import {RequestProtocolEnum} from "../../constants/enums/request-protocol.enum";
import {UserEntity} from "./user.entity";

@Entity({name: 'url_monitor'})
export default class UrlMonitorEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    name: string

    @Column()
    url: string

    @Column({type: 'text'})
    protocol: RequestProtocolEnum

    @Column({nullable: true})
    path: string

    @Column()
    port: number

    @Column({default: 5})
    timeout: number

    @Column({default: 10})
    interval: number

    @Column({default: 1})
    threshold: number

    @Column({type: "text", nullable: true})
    authentication: { username: string, password: string }

    @Column({type: "text", nullable: true})
    httpHeaders: { [type: string]: string; }

    @Column({default: false})
    ignoreSSL: boolean

    @Column({default: 0})
    numberOfFailedTries: number


    @ManyToMany(() => TagEntity, tag => tag.servers)
    @JoinTable()
    tags: TagEntity[]


    @OneToMany(() => ReportEntity, report => report.url)
    reports: ReportEntity[]

    @ManyToOne(() => UserEntity, user => user.urls)
    user: UserEntity

}
