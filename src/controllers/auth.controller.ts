import * as express from 'express';
import UserService from "../services/user.service";
import UserInterface from "../interfaces/user.interface";
import GenericResponse from "../interfaces/generic-response.interface";
import {StatusCodes} from "http-status-codes";
import MailService from "../services/mail.service";
import CryptService from "../services/crypt.service";
import {UserEntity} from "../db/entities/user.entity";
import {LoginRequestInterface} from "../interfaces/login-request.interface";

class AuthController {
    public static path = '/auth';
    public router = express.Router();
    private readonly userService: UserService;
    private readonly mailService: MailService;
    private readonly bcryptService: CryptService;

    constructor() {
        this.userService = new UserService()
        this.mailService = new MailService()
        this.bcryptService = new CryptService()
        this.initializeRoutes();
    }

    public initializeRoutes() {
        this.router.post(`${AuthController.path}/register`, this.register);
        this.router.get(`${AuthController.path}/verify`, this.verify);
        this.router.post(`${AuthController.path}/login`, this.login);
    }

    private register = async (req: express.Request, res: express.Response) => {

        try {
            const user: UserInterface = req.body
            const newUser: UserEntity = await this.userService.addUser(user.userName, user.password, user.mail);
            await this.mailService.sendMail(await this.userService.generateVerificationMailMessage(user.mail, newUser.hashMail))
            const response: GenericResponse = {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Please check your mail to verify your account "
            };
            res.json(response)
        } catch (e: unknown) {
            const response: GenericResponse = {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: e
            };
            response.success = false;
            console.log(e)
            res.json(response)
        }
    }


    private verify = async (req: express.Request, res: express.Response) => {
        const hashedMail = req.query.code?.toString()
        console.log(hashedMail)
        const response: GenericResponse = {
            success: true,
            statusCode: StatusCodes.OK,
            message: {
                verified: await this.userService.verifyUser(hashedMail || '')
            }
        };
        res.json(response)

    }

    private login = async (req: express.Request, res: express.Response) => {
        const loginReq: LoginRequestInterface = {
            username: req.body.userName?.toString() || '',
            password: req.body.password?.toString() || '',
        }
        const response = await this.userService.login(loginReq)
        res.json(response)
    }
}

export default AuthController
