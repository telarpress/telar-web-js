import { v4 as uuidv4 } from 'uuid';
import { getInitializerFromENV } from '../../function.env';
import { start } from '../../startup';
import { UserAuth } from '../../domain/UserAuth';
import faker from 'faker';
import { IUserAuthService } from '../../services/IUserAuthService';
import { UserAuthService } from '../../services/UserAuthService';
import { LogUtil } from 'telar-core/lib/cjs/utils';
import { clone } from 'ramda';
const log = LogUtil;

describe('UserAuthService', () => {
    const { internet, random, date } = faker;
    let service: IUserAuthService;
    const userAuthListMock = Array(5)
        .fill(0)
        .map(
            () =>
                new UserAuth(
                    uuidv4(),
                    internet.userName(),
                    internet.password(),
                    random.uuid(),
                    true,
                    'user',
                    false,
                    0,
                    date.recent().getTime(),
                    new Date().getTime(),
                ),
        );

    beforeAll(async () => {
        jest.setTimeout(20000);
        const db = await start(getInitializerFromENV());
        const [serviceResult, err] = UserAuthService.NewUserAuthService(db);
        if (err) {
            throw err;
        }
        if (!serviceResult) {
            throw new Error('Service can not be null');
        }
        service = serviceResult;
    });

    afterAll(async () => {
        const err = await service.deleteManyUserAuth(service.operators.plain({ phoneVerified: false }));
        if (err) {
            throw err;
        }
    });

    it('Should insert a doc into collection', async () => {
        const userAuthId = uuidv4();
        const mockUserAuth = new UserAuth(
            userAuthId,
            'amir',
            internet.password(),
            random.uuid(),
            true,
            'admin',
            false,
            0,
            date.recent().getTime(),
            new Date().getTime(),
        );
        const err = await service.saveUserAuth(mockUserAuth);
        if (err) {
            throw err;
        }
        const [savedUserAuth, findErr] = await service.findByUserId(userAuthId);
        if (findErr) {
            throw findErr;
        }
        if (!savedUserAuth) {
            throw new Error('userAuth is null');
        }
        expect(savedUserAuth).toEqual(mockUserAuth);
    });

    it('Should save 5 users auth with the role [user]', async () => {
        const err = await service.saveManyUserAuth(clone(userAuthListMock));
        if (err) {
            throw err;
        }

        const [findResult, findErr] = await service.findUserAuthList(service.operators.plain({ role: 'user' }));
        if (findErr) {
            throw findErr;
        }
        if (!findResult) {
            throw new Error('userAuth list is null');
        }
        expect(findResult.length).toEqual(5);
    });

    it('Should return list of docs with query using pagination and sort', async () => {
        const numberOfItems = 3;
        const page = 2;
        const sortMap: Record<string, number> = {};
        sortMap['createdDate'] = -1;
        const skip = numberOfItems * (page - 1);
        const limit = numberOfItems;
        const filter = service.operators.plain({ role: 'user' });

        const [findResult, findErr] = await service.findUserAuthList(filter, limit, skip, sortMap);
        if (findErr) {
            throw findErr;
        }
        if (!findResult) {
            throw new Error('userAuth list is null');
        }
        log.info(findResult);
        expect(findResult.length).toEqual(2);
    });
    it('Should update a userAuth password', async () => {
        const userAuthId = uuidv4();
        const mockUserAuth = new UserAuth(
            userAuthId,
            'behrooz',
            internet.password(),
            random.uuid(),
            true,
            'user',
            false,
            0,
            date.recent().getTime(),
            new Date().getTime(),
        );
        const err = await service.saveUserAuth(mockUserAuth);
        if (err) {
            throw err;
        }
        const newPassword = 'p@ssw0rd';

        const updateErr = await service.updatePassword(userAuthId, newPassword);

        if (updateErr) {
            throw updateErr;
        }
        const [updatedUser, findErr] = await service.findByUserId(userAuthId);
        if (findErr) {
            throw findErr;
        }
        if (!updatedUser) {
            throw new Error('userAuth is null');
        }
        expect(updatedUser.password).toEqual(newPassword);
    });
    it('Should delete a userAuth and return null when query', async () => {
        const userAuthId = uuidv4();
        const mockUserAuth = new UserAuth(
            userAuthId,
            'ranaa',
            internet.password(),
            random.uuid(),
            true,
            'user',
            false,
            0,
            date.recent().getTime(),
            new Date().getTime(),
        );
        const err = await service.saveUserAuth(mockUserAuth);
        if (err) {
            throw err;
        }
        const filter = service.operators.plain({ objectId: userAuthId });
        const deleteErr = await service.deleteUserAuth(filter);
        if (deleteErr) {
            throw deleteErr;
        }
        const [deletedUser, findErr] = await service.findByUserId(userAuthId);
        if (findErr) {
            throw findErr;
        }
        expect(deletedUser).toEqual(null);
    });
    it('Should find am admin user', async () => {
        const [admin, err] = await service.checkAdmin();
        if (err) {
            throw err;
        }
        expect(admin).not.toEqual(null);
    });
});
