import {DataSource} from "typeorm";
import {UserEntity} from "./db/entities/user.entity";
import UrlMonitorEntity from "./db/entities/url-monitor.entity";
import TagEntity from "./db/entities/tag.entity";
import ReportEntity from "./db/entities/report.entity";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: `./data/db.sqlite`,
    synchronize: true,
    logging: false,
    entities: [UserEntity, UrlMonitorEntity, TagEntity, ReportEntity],
    subscribers: [],
    migrations: [],
})
