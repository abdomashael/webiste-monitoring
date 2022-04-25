import JwtService from "../jwt.service";

describe("jwt", () => {


    it("check jwt creation of new token", () => {
        const jwtService = new JwtService()
        const encryptedString = jwtService.create("test@test.con")
        expect(encryptedString).not.toBeNull()
    })

    it("verify jwt token", () => {
        const jwtService = new JwtService()
        const encryptedString = jwtService.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjoiYWJkb2tpbmc5NUB5bWFpbC5jb20iLCJpYXQiOjE2NTA5MTQzNDgsImV4cCI6MTY1MDkxNzk0OH0.I7YWSXKKgh9Vd5ZzV0g5r6VeBX0kVME34A0A-EhuvP8")
        expect(encryptedString.data).toHaveReturned()
    })


})
