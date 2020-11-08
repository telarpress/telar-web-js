import { data } from 'telar-core';
import { UserAuth } from '../domain/UserAuth';

export interface IUserAuthService {
    /**
     * SaveUserAuth save user authentication informaition
     * @param userAuth
     */
    saveUserAuth(userAuth: UserAuth): Promise<Error | null>;
    /**
     * SaveManyUserAuth save users authentication informaition
     * @param userAuth[]
     */
    saveManyUserAuth(userAuthList: UserAuth[]): Promise<Error | null>;
    /**
     * FindOneUserAuth get all user authentication informaition
     * @param filter
     */
    findOneUserAuth(filter: data.IOperators): Promise<[UserAuth | null, Error | null]>;
    /**
     * FindUserAuthList get all user authentication informaition
     * @param filter
     * @param limit
     * @param skip
     * @param sort
     */
    findUserAuthList(
        filter: data.IOperators,
        limit?: number,
        skip?: number,
        sort?: {
            [key: string]: number;
        },
    ): Promise<[UserAuth[] | null, Error | null]>;
    /**
     * FindByUserId find user auth by userId
     * @param userId
     */
    findByUserId(userId: string): Promise<[UserAuth | null, Error | null]>;
    /**
     * UpdateUserAuth update user auth information
     * @param filter
     * @param data
     */
    updateUserAuth(filter: data.IOperators, data: data.IOperators): Promise<Error | null>;
    /**
     * UpdatePassword update user password
     * @param userId
     * @param newPassword
     */
    updatePassword(userId: string, newPassword: string): Promise<Error | null>;
    /**
     * DeleteUserAuth delete user authentication informaition
     * @param filter
     */
    deleteUserAuth(filter: data.IOperators): Promise<Error | null>;
    /**
     * DeleteUserAuth delete many authentication informaition
     * @param filter
     */
    deleteManyUserAuth(filter: data.IOperators): Promise<Error | null>;
    /**
     * FindByUsername find user auth by name
     * @param username
     */
    findByUsername(username: string): Promise<[UserAuth | null, Error | null]>;
    /**
     * CheckAdmin check admin user
     */
    checkAdmin(): Promise<[UserAuth | null, Error | null]>;
    /**
     * Service query operators
     */
    operators: data.IOperators;
}
