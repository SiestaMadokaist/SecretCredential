import { q } from '@cryptoket/ts-promise-helper';
import fs from 'fs';
import { CredentialBase } from './Base';
export interface FileProps {
  path: string;
}
export class FromFile<C> extends CredentialBase<C> {
  constructor(readonly props: FileProps) {
    super();
  }

  protected async load(): Promise<unknown> {
    const content = await q((next) => fs.readFile(this.props.path, next));
    return JSON.parse(content);
  }
}
