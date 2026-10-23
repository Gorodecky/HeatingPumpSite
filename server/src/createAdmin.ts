import 'dotenv/config';
import { createInterface } from 'node:readline';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function ask(question: string) {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>(resolve => readline.question(question, resolve));
  readline.close();
  return answer.trim();
}

async function askHidden(question: string) {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) throw new Error('Для введення пароля потрібен інтерактивний термінал.');
  process.stdout.write(question);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  let value = '';
  return new Promise<string>((resolve, reject) => {
    const onData = (buffer: Buffer) => {
      for (const char of buffer.toString('utf8')) {
        if (char === '\u0003') { process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off('data', onData); reject(new Error('Скасовано.')); return; }
        if (char === '\r' || char === '\n') { process.stdout.write('\n'); process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off('data', onData); resolve(value); return; }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    process.stdin.on('data', onData);
  });
}

try {
  const username = await ask('Логін адміністратора: ');
  if (!/^[a-zA-Z0-9._-]{3,80}$/.test(username)) throw new Error('Логін має містити 3–80 символів: літери, цифри, крапку, дефіс або підкреслення.');
  const password = await askHidden('Пароль (щонайменше 12 символів): ');
  if (password.length < 12 || password.length > 200) throw new Error('Пароль має містити від 12 до 200 символів.');
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  await prisma.adminUser.upsert({ where: { username }, update: { passwordHash }, create: { username, passwordHash } });
  console.log(`Обліковий запис адміністратора «${username}» створено або оновлено.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Не вдалося створити адміністратора.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
