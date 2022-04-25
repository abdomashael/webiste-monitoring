import {JwtPayload, Secret, sign, verify} from "jsonwebtoken"

export default class JwtService {

    public static jwtHash: Secret = String(process.env.JWT_HASH) ? String(process.env.JWT_HASH) : '5UmZyvRu7kpl2AZfksfx'

    create(data: string) {
        return sign(
            {
                data,
            },
            JwtService.jwtHash,
            {expiresIn: process.env.JWT_LIFETIME || '1h'},
        )
    }

    verify(token: string): JwtPayload  {
        return <JwtPayload>verify(token, JwtService.jwtHash)
    }
}
