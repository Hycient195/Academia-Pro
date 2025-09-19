import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

export interface UploadFileOptions {
  bucket?: string;
  key: string;
  content: Buffer | Readable | string;
  contentType?: string;
  metadata?: Record<string, string>;
  acl?: ObjectCannedACL;
}

export interface UploadResult {
  key: string;
  bucket: string;
  location: string;
  etag: string;
  size?: number;
}

export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly defaultBucket: string;
  private readonly isLocalStack: boolean;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID', 'test');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY', 'test');

    this.defaultBucket = this.configService.get<string>('S3_BUCKET_NAME', 'academia-pro-dev');
    this.isLocalStack = this.configService.get<string>('USE_LOCALSTACK') === 'true';

    this.s3Client = new S3Client({
      region,
      endpoint: this.isLocalStack ? endpoint : undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: this.isLocalStack, // Required for LocalStack
    });

    this.logger.log(`S3 Service initialized with ${this.isLocalStack ? 'LocalStack' : 'AWS S3'}`);
  }

  /**
   * Ensure the default bucket exists (mainly for LocalStack)
   */
  async ensureBucketExists(bucketName?: string): Promise<void> {
    const bucket = bucketName || this.defaultBucket;

    try {
      // Check if bucket exists
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
      this.logger.log(`Bucket ${bucket} already exists`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // Bucket doesn't exist, create it
        await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
        this.logger.log(`Bucket ${bucket} created successfully`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(options: UploadFileOptions): Promise<UploadResult> {
    const { bucket = this.defaultBucket, key, content, contentType, metadata, acl } = options;

    try {
      // Ensure bucket exists (for LocalStack)
      if (this.isLocalStack) {
        await this.ensureBucketExists(bucket);
      }

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: content,
          ContentType: contentType,
          Metadata: metadata,
          ACL: acl,
        },
      });

      const result = await upload.done();

      // Calculate size from content if it's a Buffer
      let size: number | undefined;
      if (Buffer.isBuffer(content)) {
        size = content.length;
      } else if (typeof content === 'string') {
        size = Buffer.byteLength(content, 'utf8');
      }

      const uploadResult: UploadResult = {
        key,
        bucket,
        location: this.isLocalStack
          ? `${this.configService.get('S3_ENDPOINT')}/${bucket}/${key}`
          : `https://${bucket}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`,
        etag: result.ETag,
        size,
      };

      this.logger.log(`File uploaded successfully: ${key} to bucket ${bucket}`);
      return uploadResult;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(bucket: string, key: string): Promise<Readable> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error(`File ${key} not found in bucket ${bucket}`);
      }

      this.logger.log(`File downloaded successfully: ${key} from bucket ${bucket}`);
      return response.Body as Readable;
    } catch (error) {
      this.logger.error(`Failed to download file ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(bucket: string, key: string): Promise<FileInfo> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      const fileInfo: FileInfo = {
        key,
        size: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        etag: response.ETag || '',
        contentType: response.ContentType,
        metadata: response.Metadata,
      };

      return fileInfo;
    } catch (error) {
      this.logger.error(`Failed to get file info for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${key} from bucket ${bucket}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  /**
   * List files in a bucket with optional prefix
   */
  async listFiles(bucket: string, prefix?: string, maxKeys: number = 1000): Promise<FileInfo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
      });

      const response = await this.s3Client.send(command);

      const files: FileInfo[] = (response.Contents || []).map((object) => ({
        key: object.Key || '',
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        etag: object.ETag || '',
      }));

      this.logger.log(`Listed ${files.length} files from bucket ${bucket}${prefix ? ` with prefix ${prefix}` : ''}`);
      return files;
    } catch (error) {
      this.logger.error(`Failed to list files in bucket ${bucket}:`, error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for temporary access to a file
   */
  async generateSignedUrl(bucket: string, key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      // Note: For LocalStack, signed URLs might not work the same way
      // This is a simplified implementation
      if (this.isLocalStack) {
        const endpoint = this.configService.get('S3_ENDPOINT');
        return `${endpoint}/${bucket}/${key}`;
      }

      // For AWS S3, you would use getSignedUrl from @aws-sdk/s3-request-presigner
      // This is a placeholder - you might want to implement proper signed URLs
      const region = this.configService.get('AWS_REGION');
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Failed to generate signed URL for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get the default bucket name
   */
  getDefaultBucket(): string {
    return this.defaultBucket;
  }

  /**
   * Check if using LocalStack
   */
  isUsingLocalStack(): boolean {
    return this.isLocalStack;
  }
}