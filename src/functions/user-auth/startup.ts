import { setConfig, getConfig, Initiazlizer, DBType } from 'telar-core';
import { MongoClient } from 'telar-mongo';

/**
 * Service start up
 */
export async function start(init: Initiazlizer): Promise<unknown> {
    setConfig(init);
    const config = getConfig();

    if (!config.global) {
        throw new Error('Global config is required');
    }
    if (!config.global.dBType) {
        throw new Error('[dBType] is not appeared in config');
    }
    if (!config.global.dbPassword) {
        throw new Error('[dbPassword] is not appeared in config');
    }
    if (!config.global.dbHost) {
        throw new Error('[dbHost] is not appeared in config');
    }
    if (!config.global.database) {
        throw new Error('[database] is not appeared in config');
    }

    switch (config.global.dBType) {
        case DBType.DB_MONGO:
            const mongoClient = await MongoClient.NewMongoClient(
                config.global.dbPassword,
                config.global.dbHost,
                config.global.database,
            );
            return mongoClient;
        default:
            throw Error(`Could not find the database type ${config.global.dBType} to start.`);
    }
}
