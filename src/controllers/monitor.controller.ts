import * as express from "express";
import AuthorizationMiddleware from "../middlewares/authorization.middleware";
import {plainToInstance} from "class-transformer";

import GenericResponse from "../interfaces/generic-response.interface";
import MonitorService from "../services/monitor.service";
import UrlMonitorRequest from "./dtos/url-monitor-request.dto";
import {validate} from "class-validator";
import {StatusCodes} from "http-status-codes";

export default class MonitorController {
    public static path = '/monitor';
    public router = express.Router();
    public authorizationMiddleware: AuthorizationMiddleware;
    public monitorService: MonitorService;

    constructor() {
        this.authorizationMiddleware = new AuthorizationMiddleware()
        this.monitorService = new MonitorService()
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${MonitorController.path}`, this.authorizationMiddleware.isAuthorized, this.addUrl);
        this.router.get(`${MonitorController.path}/:name`, this.authorizationMiddleware.isAuthorized, this.getUrlConfig);
        this.router.get(`${MonitorController.path}/`, this.authorizationMiddleware.isAuthorized, this.getUserAllUrlsConfig);
        this.router.delete(`${MonitorController.path}/:name`, this.authorizationMiddleware.isAuthorized, this.deleteUrl);
    }

    private addUrl = async (req: express.Request, res: express.Response): Promise<void> => {
        const urlMonitorRequest: UrlMonitorRequest = plainToInstance(UrlMonitorRequest, req.body)
        const errors = await validate(urlMonitorRequest, {validationError: {target: false}})
        if (errors.length > 0) {
            const genericResponse: GenericResponse = {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: errors,
            }
            res.json(genericResponse)
            return
        }
        // @ts-ignore
        const genericResponse: GenericResponse = await this.monitorService.addNewRecord(urlMonitorRequest, req.user)
        res.json(genericResponse);

    }

    private getUserAllUrlsConfig = async (req: express.Request, res: express.Response): Promise<void> => {
        // @ts-ignore
        const response = await this.monitorService.getUserRecords(req.user)
        res.json(response)
    }

    private getUrlConfig = async (req: express.Request, res: express.Response): Promise<void> => {
        const urlName = req.query.name
        if (!urlName && !String(urlName)) {
            const genericResponse: GenericResponse = {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "name of url is required",
            }
            res.json(genericResponse)
            return
        }
        // @ts-ignore
        const response = await this.monitorService.getRecord(String(urlName), req.user)
        res.json(response)
    }

    private deleteUrl = async (req: express.Request, res: express.Response): Promise<void> => {
        const urlName = req.query.name
        if (!urlName && !String(urlName)) {
            const genericResponse: GenericResponse = {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "name of url is required",
            }
            res.json(genericResponse)
            return
        }
        // @ts-ignore
        const response = await this.monitorService.deleteRecord(String(urlName), req.user)
        res.json(response)
    }

}
