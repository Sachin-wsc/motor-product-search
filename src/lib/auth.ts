import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development";

export function signJwt(payload: object, options?: jwt.SignOptions) {
    return jwt.sign(payload, JWT_SECRET, {
        ...(options && options),
        expiresIn: options?.expiresIn || "1d",
    });
}

export function verifyJwt(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded as jwt.JwtPayload;
    } catch (error) {
        console.error("JWT verification error", error);
        return null;
    }
}
