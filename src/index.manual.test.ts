import { expect } from 'chai';
import mocha from 'mocha';
import { FromEncryptedS3 } from './FromEncryptedS3';
import { FromJSON } from './FromJSON';

const getEnv = (k: string) => {
  return () => {
    const pe = process.env as unknown as { [k: string]: string };
    const e = pe[k];
    if (!e) { throw new Error(`no variable ${k} set`); }
    return e;
  };
};

describe('CredentialBase', () => {
  const content = { body: 'hello world' };
  const fj = new FromJSON({ body: 'hello world' });
  const bucket = getEnv('CREDENTIAL_BUCKET');
  const path = 'lambda-configs/anonymous.cryptoket.io/test.blob';
  const keyId = getEnv('CREDENTIAL_KEY_ID');
  const region = getEnv('CREDENTIAL_REGION');
  const encryptionContext = getEnv('ENCRYPTION_CONTEXT');
  it('can safely save file to s3, with encryption', async () => {
    await fj.saveEncryptedInS3({
      bucket: bucket(),
      encryptionContext: { myContext: encryptionContext() },
      keyId: keyId(),
      path,
      region: region(),
    });
    // await fj.saveEncryptedInS3(bucket(), path, keyId(), region(), { context: encryptionContext() });
  });
  // tslint:disable-next-line:only-arrow-functions
  it('can open encrypted file in s3', async function(): Promise<void> {
    this.timeout(5000);
    const cred = await new FromEncryptedS3<typeof content>({
      bucket: bucket(),
      encryptionContext: { myContext: encryptionContext() },
      key: path,
      region: region(),
    });
    const bodyContent = await cred.content();
    expect(bodyContent.body).to.eq(content.body);
  });
});
