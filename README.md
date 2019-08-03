# SecretCredential
module to manage secret credentials stored somewhere in the aws, or local file.

```typescript
import * as Credential from '@cryptoket/secret-credential'
interface MyCredential {
  AWS: {
    ACCESS_KEY_ID: string;
    SECRET_ACCESS_KEY: string;
  }
}
async function main(){
  const credential = new Credential.FromFile<MyCredential>('path/to/your/file.json');
  const { AWS } = await credential.content();
  // ACCESS_KEY_ID and SECRET_ACCESS_KEY
  const { ACCESS_KEY_ID, SECRET_ACCESS_KEY } =  await credential.get('AWS');
  // maybe if you need it, this can be done as well.
}
```

# SecretCredential.FromEncryptedS3
```typescript
import * as aws from 'aws-sdk';
import * as Credential from '@cryptoket/secret-credential';

const kms = new aws.KMS({ /** your aws credentials, and region goes here */ });
const s3 = new aws.S3({ /** your aws credentials, and region goes here */ });
async function main() {
  const credential = new Credential.FromEncryptedS3({ s3, kms, })
}

```
