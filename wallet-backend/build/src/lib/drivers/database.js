import _ from 'lodash';
import { JSONFile, Low } from 'lowdb';
class LowWithLodash extends Low {
    chain = _.chain(this).get('data');
}
const adapter = new JSONFile(process.env.DB_FILE);
export const db = new LowWithLodash(adapter);
export const rw = async (code) => {
    await db.read();
    db.data ||= { posts: [] };
    const result = await code(db);
    await db.write();
    return result;
};
export const r = async (code) => {
    await db.read();
    db.data ||= { posts: [] };
    const result = await code(db);
    return result;
};
