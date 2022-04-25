import {Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import UrlMonitorEntity from "./url-monitor.entity";

@Entity({name:'tag'})
export default class TagEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({unique: true})
    name: string

    @ManyToMany(() => UrlMonitorEntity, server => server.tags)
    servers: UrlMonitorEntity[];

}
