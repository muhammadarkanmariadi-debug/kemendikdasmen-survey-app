import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class BasicGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Basic" || !token) return false;

        const decodedToken = Buffer.from(token, "base64").toString("utf-8");
        const [username, password] = decodedToken.split(":");
        if (!username || !password) throw new UnauthorizedException('Authorization header');

        const validUsername = process.env.BASIC_AUTH_USERNAME || `mokletMalang`;
        const validPassword = process.env.BASIC_AUTH_PASSWORD || ``;

        if (username !== validUsername || password !== validPassword) {
            throw new UnauthorizedException('Invalid username or password');
        }

        // Here you can add your logic to validate the username and password
        // For example, you can check against a database or a hardcoded value

        return true; // Return true if the credentials are valid

    }
}
