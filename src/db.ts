import { FirebaseOptions, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithCredential,
  signInWithCustomToken,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  DataSnapshot,
  child,
  get,
  getDatabase,
  limitToFirst,
  onValue,
  orderByChild,
  orderByKey,
  orderByValue,
  push,
  query,
  ref,
  remove,
  runTransaction,
  set,
  startAt,
  update,
} from "firebase/database";
import * as dotenv from "dotenv";

// dotenv-config
dotenv.config();

// firebase-initial
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  // 따로 추가함
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

interface IAuth {
  email: string;
  password: string;
}
// 신규 유저
const authNewMember = async ({ email, password }: IAuth) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (e) {
    console.error("error from auth new member");
  }
};

// 기존 유저
const authExistMember = async ({ email, password }: IAuth) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (e) {
    console.log("auth error");
  }
};

// DB
interface IDb {
  userId: string;
  name: string;
  email: string;
  imageUrl: string | null;
}

const db = getDatabase();

// set 얘는 음.. 딱히 쓸일이.. 대시보드에서 생성하는게 나을듯
const setUserData = async ({ userId, name, email, imageUrl }: IDb) => {
  try {
    await set(ref(db, `users/${userId}`), {
      username: name,
      email,
      profile_picture: imageUrl,
    });
    console.log("Set complete");
  } catch (e) {
    console.log("error occur", e);
  }
};

// onValue (값 읽고 변경사항 수신 대기, 데이터가 변경될때마다 트리거 됨)
interface OnValueDataProps {
  path: string;
  onValue: (snapshot: DataSnapshot) => void;
}

const onValueData = ({ path, onValue: callBack }: OnValueDataProps) => {
  const pathRef = ref(db, path);
  onValue(pathRef, (snapshot) => {
    callBack(snapshot);
  });
};

// get (데이터 한번 읽기)
interface GetDataProps {
  path: string;
  key: string;
}

const getData = async ({ path, key }: GetDataProps) => {
  const dbRef = ref(db);
  const data = await get(child(dbRef, `${path}/${key}`));
  return data;
};

// once (관찰자로 로컬캐시 데이터 가져오기)

// update
interface UpdateDataProps<T> {
  path: string;
  key: string;
  data: T;
}

const updateData = async <K>({ path, key, data }: UpdateDataProps<K>) => {
  const updates: any = {};
  updates[`${path}/` + key] = data;
  await update(ref(db), updates);
};

// delete
interface DeleteDataProps {
  path: string;
  key: string;
}

const deleteData = async ({ path, key }: DeleteDataProps) => {
  const pathRef = ref(db, `${path}/` + key);
  await remove(pathRef);
};

// transaction
interface TransactionDataProps {
  path: string;
  key: string;
}

const viewUpData = async ({ path, key }: TransactionDataProps) => {
  const postRef = ref(db, `${path}/` + key);
  try {
    await runTransaction(postRef, (post) => {
      if (post) {
        post.views = post.views + 1;
        return post;
      } else {
        console.error("Error, no post");
      }
    });
  } catch (e) {
    console.log("Error", e);
  }
};

const likedUpData = async ({ path, key }: TransactionDataProps) => {
  const postRef = ref(db, `${path}/` + key);
  try {
    await runTransaction(postRef, (post) => {
      if (post) {
        post.liked = post.liked + 1;
        return post;
      } else {
        console.error("Error, no post");
      }
    });
  } catch (e) {
    console.log("Error", e);
  }
};

// push
interface PushDataProps {
  path: string;
}

const pushData = async <K>({ path, data }: PushDataProps & { data: K }) => {
  const postListRef = ref(db, path);
  const newPostRef = push(postListRef);
  await set(newPostRef, data);
};

// orderByChild
/**
 * 이거 안됨 왜그런지 모르겠음
 */
interface OrderDataProps {
  path: string;
  orderBy: "views" | "created" | "liked";
}

const orderData = async ({ path, orderBy }: OrderDataProps) => {
  const dbQuery = query(ref(db, path), orderByChild(orderBy));
  const data = await get(dbQuery);
  return data;
};

const modules = {
  authExistMember,
  onValueData,
  getData,
  updateData,
  deleteData,
  viewUpData,
  likedUpData,
  pushData,
  orderData,
};

export default modules;
