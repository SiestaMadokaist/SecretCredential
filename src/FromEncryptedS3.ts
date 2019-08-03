import aws from 'aws-sdk';
import { CredentialBase } from './Base';
export interface EncryptedS3Props<Context extends aws.KMS.EncryptionContextType> {
  /**
   * bucketname
   */
  bucket: string;
  /**
   * encryptionContext
   */
  encryptionContext: Context;
  /**
   * s3 key, path to location.
   */
  key: string;
  /**
   * aws kms, if none passed default will be used.
   */
  kms?: aws.KMS;
  /**
   * region
   * default is us-east-1
   */
  region?: string;
  /**
   * aws S3 client, if none passed default will be used.
   */
  s3?: aws.S3;
}

export class FromEncryptedS3<C, Context extends aws.KMS.EncryptionContextType = aws.KMS.EncryptionContextType> extends CredentialBase<C> {
  constructor(readonly props: EncryptedS3Props<Context>) {
    super();
  }

  protected async load(): Promise<unknown> {
    const { Body: encryptedText } = await this.s3().getObject({
      Bucket: this.bucket(),
      Key: this.key(),
    }).promise();
    if (!encryptedText) { throw new Error(`failed to load body from ${this.bucket()}/${this.key()}`); }
    const decryptParams: aws.KMS.DecryptRequest = {
      CiphertextBlob: encryptedText,
      EncryptionContext: this.encryptionContext(),
    };
    const decrypted = await this.kms().decrypt(decryptParams).promise();
    const plainText = decrypted.Plaintext as string;
    return JSON.parse(plainText);
  }

  private bucket(): string {
    return this.props.bucket;
  }

  private encryptionContext(): Context {
    return this.props.encryptionContext;
  }

  private key(): string {
    return this.props.key;
  }

  private kms(): aws.KMS {
    return this.props.kms || new aws.KMS({ region: this.region() });
  }

  private region(): string {
    return this.props.region || process.env.AWS_REGION || 'us-east-1';
  }

  private s3(): aws.S3 {
    return this.props.s3 || new aws.S3({ region: this.region() });
  }

}
