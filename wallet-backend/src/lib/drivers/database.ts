import _ from 'lodash';
import { JSONFile, Low } from 'lowdb';
import { Post } from '../../models/post';

export type Identifiable = {
  id: string;
};

export type UserTied = {
  userId: string;
};

export type UserIdentifiablePost = Post & Identifiable & UserTied;

export type Data = {
  posts: UserIdentifiablePost[];
};

class LowWithLodash<T> extends Low<T> {
  chain: _.ExpChain<this['data']> = _.chain(this).get('data');
}

const adapter = new JSONFile<Data>(process.env.DB_FILE!);
export const db = new LowWithLodash(adapter);

export const rw = async <T>(
  code: (db: LowWithLodash<Data>) => T | Promise<T>,
): Promise<T> => {
  await db.read();
  db.data ||= { posts: [] };
  const result = await code(db);
  await db.write();
  return result;
};

export const r = async <T>(
  code: (db: LowWithLodash<Data>) => T | Promise<T>,
): Promise<T> => {
  await db.read();
  db.data ||= { posts: [] };
  const result = await code(db);
  return result;
};
