import { UserAuth } from '../domain/UserAuth';
import { IUserAuthService } from './IUserAuthService';
import { getConfig, DBType, utils, data } from 'telar-core';
import { DataRepositoryMongo, MongoClient } from 'telar-mongo';
import { v4 as uuidv4 } from 'uuid';
const log = utils.LogUtil;

const userAuthCollectionName = 'userAuth';
export class UserAuthService implements IUserAuthService {
    private userAuthRepo: data.IDataRepository;
    private constructor(userAuthRepo: data.IDataRepository) {
        this.userAuthRepo = userAuthRepo;
    }
    /**
     * Service query operators
     */
    public get operators(): data.IOperators {
        return this.userAuthRepo.operators;
    }
    /**
     * NewUserAuthService initializes UserAuthService's dependencies and create new UserAuthService struct
     * @param db Datebase client
     */
    static NewUserAuthService(db: unknown): [UserAuthService | null, Error | null] {
        let userAuthService;
        const config = getConfig();
        if (!config.global) {
            throw new Error('Global config is required');
        }
        if (!config.global.dBType) {
            throw new Error('[dBType] is not appeared in config');
        }
        switch (config.global.dBType) {
            case DBType.DB_MONGO:
                const mongoClient = db as MongoClient;
                const repoMongo = DataRepositoryMongo.NewDataRepositoryMongo(mongoClient);
                userAuthService = new UserAuthService(repoMongo);
        }
        if (!userAuthService || !userAuthService.userAuthRepo) {
            log.error('userAuthService.UserAuthRepo is null! \n');
            return [null, Error('Database config got error.')];
        }
        return [userAuthService, null];
    }

    /**
     * SaveUserAuth save user authentication informaition
     * @param userAuth
     */
    async saveUserAuth(userAuth: UserAuth): Promise<Error | null> {
        if (userAuth.objectId == null) {
            userAuth.objectId = uuidv4();
        }

        if (!userAuth.createdDate) {
            userAuth.createdDate = new Date().getTime();
        }

        const result = await this.userAuthRepo.save<UserAuth>(userAuthCollectionName, userAuth);
        return result.error;
    }

    /**
     * SaveManyUserAuth save users authentication informaition
     * @param userAuth[]
     */
    async saveManyUserAuth(userAuthList: UserAuth[]): Promise<Error | null> {
        userAuthList.forEach((userAuth) => {
            if (userAuth.objectId == null) {
                userAuth.objectId = uuidv4();
            }

            if (!userAuth.createdDate) {
                userAuth.createdDate = new Date().getTime();
            }
        });

        const result = await this.userAuthRepo.saveMany<UserAuth>(userAuthCollectionName, userAuthList);

        return result.error;
    }
    /**
     * FindOneUserAuth get all user authentication informaition
     * @param filter
     */
    async findOneUserAuth(filter: data.IOperators): Promise<[UserAuth | null, Error | null]> {
        const result = await this.userAuthRepo.findOne<UserAuth>(userAuthCollectionName, filter);
        if (result.error() != null) {
            return [null, result.error()];
        }
        const [userAuthResult, errDecode] = result.decode();
        if (errDecode != null) {
            return [null, new Error('Error docoding on dto.UserAuth')];
        }
        return [userAuthResult, null];
    }
    /**
     * FindUserAuthList get all user authentication informaition
     * @param filter
     * @param limit
     * @param skip
     * @param sort
     */
    async findUserAuthList(
        filter: data.IOperators,
        limit?: number,
        skip?: number,
        sort?: {
            [key: string]: number;
        },
    ): Promise<[UserAuth[] | null, Error | null]> {
        const result = await this.userAuthRepo.find<UserAuth>(userAuthCollectionName, filter, limit, skip, sort);

        if (result.error() != null) {
            return [null, result.error()];
        }
        const userAuthList: UserAuth[] = [];
        while (await result.next()) {
            const [userAuth, errDecode] = result.decode();
            if (errDecode != null) {
                return [null, new Error('Error docoding on dto.UserAuth')];
            }
            if (userAuth) {
                userAuthList.push(userAuth);
            } else {
                log.warn('Repository got null userAuth!');
            }
        }
        await result.close();
        return [userAuthList, null];
    }
    /**
     * FindByUserId find user auth by userId
     * @param userId
     */
    findByUserId(userId: string): Promise<[UserAuth | null, Error | null]> {
        const filter = this.operators.plain({
            objectId: userId,
        });
        return this.findOneUserAuth(filter);
    }
    /**
     * UpdateUserAuth update user auth information
     * @param filter
     * @param data
     */
    async updateUserAuth(filter: data.IOperators, data: data.IOperators): Promise<Error | null> {
        const result = await this.userAuthRepo.update(userAuthCollectionName, filter, data);
        if (result.error != null) {
            return result.error;
        }
        return null;
    }
    /**
     * UpdatePassword update user password
     * @param userId
     * @param newPassword
     */
    async updatePassword(userId: string, newPassword: string): Promise<Error | null> {
        const updateData = this.operators.set({
            password: newPassword,
        });

        const filter = this.operators.plain({
            objectId: userId,
        });
        const updateErr = await this.updateUserAuth(filter, updateData);
        if (updateErr != null) {
            return updateErr;
        }
        return null;
    }
    /**
     * DeleteUserAuth delete user authentication informaition
     * @param filter
     */
    async deleteUserAuth(filter: data.IOperators): Promise<Error | null> {
        const result = await this.userAuthRepo.delete(userAuthCollectionName, filter, true);
        if (result.error != null) {
            return result.error;
        }

        return null;
    }
    /**
     * DeleteUserAuth delete many authentication informaition
     * @param filter
     */
    async deleteManyUserAuth(filter: data.IOperators): Promise<Error | null> {
        const result = await this.userAuthRepo.delete(userAuthCollectionName, filter, false);
        if (result.error != null) {
            return result.error;
        }

        return null;
    }
    /**
     * FindByUsername find user auth by name
     * @param username
     */
    findByUsername(username: string): Promise<[UserAuth | null, Error | null]> {
        const filter = this.operators.plain({
            username: username,
        });
        return this.findOneUserAuth(filter);
    }
    /**
     * CheckAdmin check admin user
     */
    checkAdmin(): Promise<[UserAuth | null, Error | null]> {
        const filter = this.operators.plain({
            role: 'admin',
        });
        return this.findOneUserAuth(filter);
    }
}
