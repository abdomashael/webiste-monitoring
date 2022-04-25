import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import UrlMonitorEntity from "./url-monitor.entity";

@Entity({name: 'user'})
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 100,
        unique: true
    })
    userName: string

    @Column()
    password: string


    @Column({
        unique: true
    })
    mail: string

    @Column()
    verified: boolean = false

    @Column()
    hashMail: string

    @OneToMany(() => UrlMonitorEntity, url => url.user)
    urls: UrlMonitorEntity[]
}
