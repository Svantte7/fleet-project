import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

initializeApp();

const db = getFirestore('specto-fleet');

const isValidPassword = (password) =>
  typeof password === 'string' && password.length >= 6 && /\d/.test(password);

export const resetUserPassword = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Kirjaudu ensin sisaan.');
  }

  const { uid, resetPassword } = request.data || {};
  if (!uid || !isValidPassword(resetPassword)) {
    throw new HttpsError('invalid-argument', 'Salasana ei tayta vaatimuksia.');
  }

  const [callerSnap, targetSnap] = await Promise.all([
    db.doc(`users/${request.auth.uid}`).get(),
    db.doc(`users/${uid}`).get(),
  ]);

  if (!callerSnap.exists || !targetSnap.exists) {
    throw new HttpsError('not-found', 'Kayttajaa ei loydy.');
  }

  const caller = callerSnap.data();
  const target = targetSnap.data();
  const callerRole = caller?.role;
  const targetRole = target?.role;

  if (callerRole !== 'admin' && callerRole !== 'moderator') {
    throw new HttpsError('permission-denied', 'Ei oikeutta resetoida salasanaa.');
  }
  if (uid === request.auth.uid || targetRole === 'admin') {
    throw new HttpsError('permission-denied', 'Tata salasanaa ei voi resetoida.');
  }
  if (callerRole === 'moderator' && targetRole !== 'driver') {
    throw new HttpsError('permission-denied', 'Moderaattori voi resetoida vain kuljettajan salasanan.');
  }

  await getAuth().updateUser(uid, { password: resetPassword });
  await targetSnap.ref.update({ mustChangePIN: true });

  return { ok: true };
});
