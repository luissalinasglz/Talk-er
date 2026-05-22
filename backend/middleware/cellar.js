import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const cellar = new S3Client({
  region: "us-east-1",
  endpoint: `https://${process.env.CELLAR_ADDON_HOST}`,
  credentials: {
    accessKeyId: process.env.CELLAR_ADDON_KEY_ID,
    secretAccessKey: process.env.CELLAR_ADDON_KEY_SECRET,
  },
  forcePathStyle: true,
});

export default cellar;

await cellar.send(
  new PutBucketCorsCommand({
    Bucket: process.env.CELLAR_ADDON_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedOrigins: ["http://localhost:5173"],
          AllowedMethods: ["PUT", "GET"],
          AllowedHeaders: ["*"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
  })
);

console.log("CORS configurado en Cellar ✓");