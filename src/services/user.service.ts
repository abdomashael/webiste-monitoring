import {AppDataSource} from "../data-source";
import {UserEntity} from "../db/entities/user.entity";
import CryptService from "./crypt.service";
import {Repository} from "typeorm";
import MailMessage from "../interfaces/mail-message.interface";
import {LoginRequestInterface} from "../interfaces/login-request.interface";
import GenericResponse from "../interfaces/generic-response.interface";
import {StatusCodes} from "http-status-codes";
import JwtService from "./jwt.service";


export default class UserService {
    private userRepo: Repository<UserEntity>;
    private bcryptService: CryptService
    private jwtService: JwtService

    constructor() {
        this.userRepo = AppDataSource.getRepository(UserEntity)
        this.bcryptService = new CryptService()
        this.jwtService = new JwtService()
    }

    public addUser = async (userName: string, password: string, mail: string): Promise<UserEntity> => {
        const user = new UserEntity()
        user.userName = userName
        user.mail = mail
        user.hashMail = await this.bcryptService.hashText(user.mail)
        user.password = await this.bcryptService.hashText(password)
        return this.userRepo.save(user)
    }

    public generateVerificationMailMessage = async (mail: string, hashMail: string): Promise<MailMessage> => {
        const verificationPath = `${process.env.WEBSITE_DOMAIL}/auth/verify?code=${hashMail}`
        return {
            from: process.env.MAIL_USER || 'Test',
            to: mail,
            subject: "Verify your mail",
            text: `Please follow link to verify your account ${verificationPath}`,
            html: `<p>Please follow link to verify your account <a href="${verificationPath}">${verificationPath}</a>
</p>`,
        }
    }
    public verifyUser = async (hashedMail: string): Promise<boolean> => {

        const user = await this.userRepo.createQueryBuilder('user').where("user.hashMail= :hashMail", {hashMail: `${hashedMail}`}).getOne()
        console.log(user, hashedMail)
        if (!user) return false
        user.verified = true

        return !!(await this.userRepo.save(user))
    }

    public getUser = async (userNameOrMail: string): Promise<UserEntity | null> => {
        return await this.userRepo.createQueryBuilder('user').where("user.userName= :userName OR user.mail= :userName", {userName: userNameOrMail}).getOne()
    }

    public login = async (loginReq: LoginRequestInterface): Promise<GenericResponse> => {
        const user = await this.getUser(loginReq.username);
        const invalidResponse: GenericResponse = {
            success: false,
            statusCode: StatusCodes.UNAUTHORIZED,
            message: "Invalid user credentials"
        }
        if (!user) return invalidResponse
        const validPassword = await this.bcryptService.compare(user.password, loginReq.password)
        if (!validPassword) return invalidResponse
        const token = this.jwtService.create(user.mail)
        return ({
            success: true,
            statusCode: 200,
            message: {token}
        })

    }
}

