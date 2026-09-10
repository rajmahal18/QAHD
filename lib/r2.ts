import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("Cloudflare R2 is not configured.");
  }

  return { accountId, accessKeyId, secretAccessKey, bucket };
}

function client() {
  const c = config();
  return new S3Client({
    region: "auto",
    endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
  });
}

export async function createUploadUrl(key: string, contentType: string) {
  const c = config();
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: c.bucket, Key: key, ContentType: contentType }),
    { expiresIn: 300 },
  );
}

export async function createViewUrl(key: string) {
  const c = config();
  return getSignedUrl(client(), new GetObjectCommand({ Bucket: c.bucket, Key: key }), { expiresIn: 300 });
}

export async function headObject(key: string) {
  const c = config();
  return client().send(new HeadObjectCommand({ Bucket: c.bucket, Key: key }));
}

export async function deleteObject(key: string) {
  const c = config();
  return client().send(new DeleteObjectCommand({ Bucket: c.bucket, Key: key }));
}
