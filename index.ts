import { Transaction, Client, Wallet } from 'xrpl';
import sinon, { SinonStub } from 'sinon';
import { BaseResponse } from 'xrpl/dist/npm/models/methods/baseMethod';
import rippleBinary from 'ripple-binary-codec';
import ResponseBuilder from './response-builder';
import ResultBuilder from './result-builder';

const ledgerIndex = { type: 'response', id: '3', result: { ledger_index: 19000 } };

export default class XrplTest {
  public isConnected: boolean;

  public sandbox: sinon.SinonSandbox;

  private requestStub: SinonStub;

  private requestCount: number;

  constructor() {
    this.isConnected = true;
    this.sandbox = sinon.createSandbox();
    this.requestStub = this.sandbox.stub(Client.prototype, 'request');
    this.requestCount = 0;
  }

  public connection(): {
    connect: SinonStub<[], Promise<void>>;
    disconnect: SinonStub<[], Promise<void>>;
    isConnected: SinonStub<[], boolean>;
  } {
    this.isConnected = true;
    const connect = this.sandbox.stub(Client.prototype, 'connect').resolves();
    const disconnect = this.sandbox.stub(Client.prototype, 'disconnect').callsFake(() => {
      this.isConnected = false;
      return Promise.resolve();
    });
    const isConnected = this.sandbox
      .stub(Client.prototype, 'isConnected')
      .callsFake(() => this.isConnected);
    return { connect, disconnect, isConnected };
  }

  public restore(): void {
    this.isConnected = false;
    this.requestCount = 0;
    this.sandbox.restore();
    this.requestStub = this.sandbox.stub(Client.prototype, 'request');
  }

  private addRequest(response: BaseResponse) {
    this.requestStub.onCall(this.requestCount).resolves(response);
    this.requestCount++;
  }

  public prepareTransaction<T extends Transaction>(transaction: T): SinonStub<any[], any> {
    return this.autofill(transaction);
  }

  public autofill<T extends Transaction>(transaction: T): SinonStub<any[], any> {
    const nextValidSequenceNumber = new ResponseBuilder()
      .result({ account_data: { Sequence: 'Sequence' } })
      .build();
    const feeXRP = new ResponseBuilder()
      .result({ info: { validated_ledger: { base_fee_xrp: 0.0000012 } } })
      .build();

    this.addRequest(nextValidSequenceNumber);
    this.addRequest(feeXRP);

    if (transaction.TransactionType === 'AccountDelete') {
      this.addRequest(ledgerIndex);
      const checkAccountDeleteBlockers = new ResponseBuilder()
        .result({ account_objects: [] })
        .build();
      this.addRequest(checkAccountDeleteBlockers);
      const fetchAccountDeleteFee = new ResponseBuilder()
        .result({ state: { validated_ledger: { reserve_inc: 0.0000012 } } })
        .build();
      this.addRequest(fetchAccountDeleteFee);
    } else {
      this.addRequest(ledgerIndex);
    }

    return this.requestStub;
  }

  public submit<T extends Transaction>(transaction: T, autofill?: boolean): SinonStub<any[], any> {
    if (autofill) this.autofill(transaction);
    const signature = ResultBuilder.generateSignature();
    const signedTx: Record<string, any> = {
      ...transaction,
      ...signature,
      ...{ LastLedgerSequence: 19020 },
    };
    this.sandbox.stub(rippleBinary, 'decode').returns(signedTx);
    this.sandbox.stub(Wallet.prototype, 'sign').returns({ tx_blob: 'tx_blob', hash: 'hash' });
    const response = new ResponseBuilder()
      .id(0)
      .status('success')
      .result(new ResultBuilder().txJson(transaction, signature).build())
      .build();

    this.addRequest(response);
    return this.requestStub;
  }

  public submitAndWait<T extends Transaction>(
    transaction: T,
    autofill?: boolean,
  ): SinonStub<any[], any> {
    if (autofill) this.autofill(transaction);
    const signature = ResultBuilder.generateSignature();
    const signedTx: Record<string, any> = {
      ...transaction,
      ...signature,
      ...{ LastLedgerSequence: 19020 },
    };
    this.sandbox.stub(rippleBinary, 'decode').returns(signedTx);
    this.sandbox.stub(Wallet.prototype, 'sign').returns({ tx_blob: 'tx_blob', hash: 'hash' });
    const result = new ResultBuilder().txJson(transaction, signature);
    const response = new ResponseBuilder().id(0).status('success').result(result.build()).build();

    this.addRequest(response);
    this.addRequest(ledgerIndex);
    const validated = result.add([
      { key: 'ledger_index', value: 19000 },
      { key: 'validated', value: true },
    ]);
    this.addRequest({
      type: 'response',
      id: 0,
      result: validated,
    });

    return this.requestStub;
  }

  // getXrpBalance: typeof getXrpBalance;
  // getBalances: typeof getBalances;
  // getOrderbook: typeof getOrderbook;
  // fundWallet: typeof fundWallet;
}
