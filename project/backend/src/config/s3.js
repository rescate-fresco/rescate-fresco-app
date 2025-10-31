import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// Cargar todas las variables del archivo .env
dotenv.config();

// Configura el cliente de S3 usando las variables .env
const s3Client = new S3Client({
  region: process.env.AWS_REGION
});

export default s3Client;