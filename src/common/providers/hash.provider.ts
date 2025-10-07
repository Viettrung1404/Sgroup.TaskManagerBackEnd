import bcrypt from 'bcryptjs';

class HashProvider {
    async generateHash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    async compareHash(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}

export default new HashProvider();
