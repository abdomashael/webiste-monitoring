import MonitorService from "../monitor.service";
import UrlMonitorRequest from "../../controllers/dtos/url-monitor-request.dto";
import {RequestProtocolEnum} from "../../constants/enums/request-protocol.enum";
import {UserEntity} from "../../db/entities/user.entity";

describe("monitor", () => {
    let monitorService: MonitorService
    beforeAll(() => {
        monitorService = new MonitorService()
    })

    test("add new record", async () => {
        const urlMonitorRequest: UrlMonitorRequest = {
            authentication: {password: "", username: ""},
            httpHeaders: {},
            ignoreSSL: false,
            interval: 0,
            name: "test",
            path: "",
            port: 0,
            protocol: RequestProtocolEnum.HTTPS,
            tags: [],
            threshold: 0,
            timeout: 0,
            url: "http://localhost"
        }
        const user: UserEntity = {
            hashMail: "",
            id: 0,
            mail: "",
            password: "",
            urls: [],
            userName: "test",
            verified: false
        }
        const response = await monitorService.addNewRecord(urlMonitorRequest, user)
        expect(response).not.toBeNull()
    })
})
