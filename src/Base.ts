import { Memoize } from '@cryptoket/ts-memoize';
import { q } from '@cryptoket/ts-promise-helper';
import aws from 'aws-sdk';
import fs from 'fs';
export interface S3SaveProps {
  /** s3 bucket where this credential will be saved. */
  bucket: string;
  /** s3 path where this credential will be saved. */
  path: string;
  /** 
   * aws kms keyId to be used when saving this 
   * you can use either aws kms s3 master key, or your own.
   */
  keyId: string;
  /**
   * aws region
   */
  region: string;
  /**
   * encryption context for aws kms, an empty object like: {}
   * is fine too.
   */
  encryptionContext: aws.KMS.EncryptionContextType;
  s3Client?: aws.S3;
  kmsClient?: aws.KMS;
}

export abstract class CredentialBase<C> {
  // tslint:disable-next-line:variable-name
  __memo__: { content?: Promise<C> } = {};

  /** 
   * memoized content, as long as you're using the same instance
   * calling .content will not reinvoke the IO call.
   */
  async content(): Promise<C> {
    return Memoize(this, 'content', () => this.load() as Promise<C>);
  }

  /**
   * get the specific value in the first level of .content();
   * @param {keyof C} k 
   */
  async get<K extends keyof C>(k: K): Promise<C[K]> {
    const content = await this.content();
    return content[k];
  }

  /**
   * @param path
   * @param suffix
   * use suffix = '' if you want to override the curent file.
   */
  async saveDecryptedInLocal(path: string, suffix: string = '.backup'): Promise<void> {
    const content = await this.contentString();
    const safePath = `${path}${suffix}`;
    await q((next) => fs.writeFile(safePath, content, next as any));
  }

  /**
   * no plan to make a save in S3 because it is usually unsafe....
   * or I'm just lazy.
   */
  async saveEncryptedInS3(saveProps: S3SaveProps): Promise<aws.S3.PutObjectOutput> {
    const { region, s3Client, kmsClient, encryptionContext, keyId, bucket, path } = saveProps;
    const content = await this.content();
    const text = JSON.stringify(content);
    const s3 = s3Client || new aws.S3({ region });
    const kms = kmsClient || new aws.KMS({ region });
    const encrypted = await kms.encrypt({
      EncryptionContext: encryptionContext,
      KeyId: keyId,
      Plaintext: text,
    }).promise();
    return await s3.putObject({ Bucket: bucket, Key: path, Body: encrypted.CiphertextBlob }).promise();
  }

  /**
   * no one except CredentialBase.content may properly call load.
   * calling .load(), might be unsafe because it might invoke network out
   * again and over again.
   * unlike calling .content();
   */
  protected abstract load(): Promise<unknown>;

  private async contentString(): Promise<string> {
    return JSON.stringify(await this.content(), null, 2);
  }

}
