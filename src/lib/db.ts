import "server-only";
import { promises as fs } from "fs";
import path from "path";

// 별도 DB 서버 없이 동작하도록 프로젝트 루트의 .data/db.json 파일에 저장합니다.
// 실제 서비스로 운영할 때는 이 파일만 PostgreSQL, SQLite 등으로 교체하면 됩니다.

export type Role = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type Post = {
  id: number;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: number;
  authorId: string;
  content: string;
  createdAt: string;
};

export type Data = {
  users: User[];
  sessions: Session[];
  posts: Post[];
  comments: Comment[];
};

export const DB_PATH = path.join(process.cwd(), ".data", "db.json");

function emptyData(): Data {
  return { users: [], sessions: [], posts: [], comments: [] };
}

export async function readDb(): Promise<Data> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return { ...emptyData(), ...JSON.parse(raw) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyData();
    throw error;
  }
}

async function writeDb(data: Data) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DB_PATH);
}

// 쓰기 작업을 한 번에 하나씩 처리해 동시 요청에서도 데이터가 덮어써지지 않게 합니다.
let lock: Promise<unknown> = Promise.resolve();

export function updateDb<T>(mutate: (data: Data) => T): Promise<T> {
  const run = lock.then(async () => {
    const data = await readDb();
    const result = mutate(data);
    await writeDb(data);
    return result;
  });
  lock = run.catch(() => {});
  return run;
}

export function toPublicUser(user: User): PublicUser {
  const { id, email, name, role, createdAt } = user;
  return { id, email, name, role, createdAt };
}
