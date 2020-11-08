// Copyright (c) 2020 Amirhossein Movahedi (@qolzam)
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { DBType, Initiazlizer } from 'telar-core';

/**
 * For unit test
 */
export const getInitializerFromENV = (): Initiazlizer => {
    const intializer: Initiazlizer = {
        global: {
            dBType: DBType.DB_MONGO,
            dbPassword: process.env.DB_PASS,
            dbHost: `mongodb+srv://telar:%s@cluster0.l6ojz.mongodb.net/telar?retryWrites=true&w=majority`,
            database: 'telar',
        },
    };
    return intializer;
};
