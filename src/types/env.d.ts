declare namespace NodeJS {
  interface ProcessEnv {
    // db
    FIREBASE_API_KEY: string;
    FIREBASE_AUTH_DOMAIN: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    FIREBASE_MESSAGING_SENDER_ID: string;
    FIREBASE_APP_ID: string;
    FIREBASE_MEASUREMENT_ID: string;
    FIREBASE_DATABASE_URL: string;
    // dbAuth
    FIREBASE_AUTH_EMAIL: string;
    FIREBASE_AUTH_PASSWORD: string;
    // clientAuth
    CLIENT_AUTH_EMAIL: string;
    CLIENT_AUTH_PASSWORD: string;
    // token
    TOKEN_ACCESS_SECRET_KEY: string;
    TOKEN_REFRESH_SECRET_KEY: string;
    // amazon
    AMAZON_BUCKET_NAME: string;
    AMAZON_BUCKET_REGION: string;
    AMAZON_ACCESS_KEY: string;
    AMAZIN_SECRET_KEY: string;
  }
}
