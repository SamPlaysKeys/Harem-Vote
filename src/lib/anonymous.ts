import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const ANON_COOKIE_NAME = 'anon_voter_id';

export async function getAnonId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ANON_COOKIE_NAME)?.value;
}

export async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  let anonId = cookieStore.get(ANON_COOKIE_NAME)?.value;

  if (!anonId) {
    anonId = uuidv4();
    cookieStore.set(ANON_COOKIE_NAME, anonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return anonId;
}
