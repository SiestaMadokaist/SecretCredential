import { CredentialBase } from './Base';
export class FromJSON<C> extends CredentialBase<C> {
  constructor(readonly props: C) { super(); }

  protected async load(): Promise<unknown> {
    return this.props;
  }
}
