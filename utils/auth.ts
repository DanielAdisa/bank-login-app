// utils/auth.ts
import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff' | 'user';
}

export const getUsers = (): User[] => {
  const filePath = path.join(process.cwd(), 'data', 'users.json');
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export const findUser = (username: string, password: string): User | null => {
  const users = getUsers();
  return users.find((user) => user.username === username && user.password === password) || null;
};
