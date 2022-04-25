import bcrypt from "bcrypt";

export default class CryptService {
    private readonly salRounds: number;

    constructor() {
        this.salRounds = Number(process.env.SALT_ROUNDS) || 10
    }

    public hashText = async (text: string): Promise<string> => {
        return await bcrypt.hash(text, this.salRounds)
    }

    public compare = async (hashedText: string, plainText: string) => {
        return bcrypt.compare(plainText, hashedText)
    }
}

