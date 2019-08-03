import aws from 'aws-sdk';
import { CredentialBase } from './Base';
export interface S3Props {
  /**
   * bucketname
   */
  bucket: string;
  /**
   * s3 key, path to location.
   */
  key: string;
  /**
   * region
   * default is us-east-1
   */
  region?: string;
  /**
   * aws S3 client, if none passed default will be used.
   */
  s3?: aws.S3;
  /**
   * encryptionContext
   */
}

export class FromS3<C> extends CredentialBase<C> {
  constructor(readonly props: S3Props) {
    super();
  }

  protected async load(): Promise<unknown> {
    const { Body: content } = await this.s3().getObject({ Bucket: this.bucket(), Key: this.key() }).promise();
    if (!content) { throw new Error(`failed to load body from ${this.bucket()}/${this.key()}`); }
    return JSON.parse(`${content}`);
  }

  private bucket(): string {
    return this.props.bucket;
  }

  private key(): string {
    return this.props.key;
  }

  private region(): string {
    return this.props.region || process.env.AWS_REGION || 'us-east-1';
  }

  private s3(): aws.S3 {
    return this.props.s3 || new aws.S3({ region: this.region() });
  }

}
