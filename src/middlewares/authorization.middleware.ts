import * as express from "express";
import JwtService from "../services/jwt.service";
import UserService from "../services/user.service";
import {StatusCodes} from "http-status-codes";
import GenericResponse from "../interfaces/generic-response.interface";

export default class AuthorizationMiddleware {
    private jwtService: JwtService
    private userService: UserService

    constructor() {
        this.jwtService = new JwtService()
        this.userService = new UserService()
    }

    public isAuthorized =
        async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
            try {

                const response: GenericResponse = {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "Not authorized!"
                };
                let authorizationHeader = req.header('authorization')
                if (!authorizationHeader) {
                    res.json(response)
                    return
                }
                const authorizationHeaderWWithoutBearer = authorizationHeader?.replace("Bearer ", "")
                const decoded = this.jwtService.verify(authorizationHeaderWWithoutBearer || '')
                const user = await this.userService.getUser(decoded.data)
                if (!authorizationHeader) {
                    res.json(response)
                    return
                }
                if (!user?.verified) {
                    response.statusCode = StatusCodes.PRECONDITION_FAILED
                    response.message = "User not verified please check mail to verify"
                    res.json(response)
                    return
                }
                // @ts-ignore
                req.user = user
                next()
            } catch (e: any) {
                console.log(e)
                const response: GenericResponse = {
                    success: false,
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    message: Error(e).message
                };
                res.json(response)
            }

        }
}
