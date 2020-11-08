export class UserAuth {
    public objectId?: string;
    public username?: string;
    public password?: string;
    public accessToken?: string;
    public emailVerified?: boolean;
    public role?: string;
    public phoneVerified?: boolean;
    public tokenExpires?: number;
    public createdDate?: number;
    public lastUpdated?: number;
    constructor(
        objectId?: string,
        username?: string,
        password?: string,
        accessToken?: string,
        emailVerified?: boolean,
        role?: string,
        phoneVerified?: boolean,
        tokenExpires?: number,
        createdDate?: number,
        lastUpdated?: number,
    ) {
        this.objectId = objectId;
        this.username = username;
        this.password = password;
        this.accessToken = accessToken;
        this.emailVerified = emailVerified;
        this.role = role;
        this.phoneVerified = phoneVerified;
        this.tokenExpires = tokenExpires;
        this.createdDate = createdDate;
        this.lastUpdated = lastUpdated;
    }
}
