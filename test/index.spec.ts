import { describe, it } from 'mocha';
import { strict as assert } from 'assert';
import { AccountDelete, Client, Transaction, TrustSet, Wallet } from 'xrpl';

import XrplTest from '../index';
import { endpoint, seed } from './fixtures';

import SUBMIT_UNSIGNED_OK from './responses/submit-unsigned-ok.json';
import SUBMIT_AND_WAIT_UNSIGNED_OK from './responses/submit-and-wait-unsigned-ok.json';
import PAYMENT_TX from './requests/payment-tx.json';

describe('XRPL test', function () {
  const xrplTest = new XrplTest();

  afterEach(function () {
    xrplTest.restore();
  });

  it('should mock connection methods', async function () {
    const { connect, disconnect, isConnected } = xrplTest.connection();
    const client = new Client(endpoint);
    await client.connect();
    assert.strictEqual(connect.calledOnce, true, 'Stub called once');
    assert.strictEqual(client.isConnected(), true, 'Client is connected');
    assert.strictEqual(isConnected.calledOnce, true, 'Stub for isConnected was called with true.');
    await client.disconnect();
    assert.strictEqual(disconnect.calledOnce, true, 'Stub for disconnect was called.');
  });

  it('should restore stubbed methods', async function () {
    const { connect, disconnect, isConnected } = xrplTest.connection();
    const client = new Client(endpoint);
    await client.connect();
    assert.strictEqual(connect.calledOnce, true, 'Stub called once');
    await client.disconnect();
    assert.strictEqual(disconnect.calledOnce, true, 'Stub for disconnect was called.');
    xrplTest.restore();
    assert.strictEqual(client.isConnected(), false, 'Client is not connected');
    assert.strictEqual(isConnected.calledOnce, false, 'Stub for isConnected was not called.');
  });

  it('should mock autofill method', async function () {
    xrplTest.connection();
    const ts = {
      TransactionType: 'TrustSet',
      Account: 'account',
      LimitAmount: {
        currency: 'XXX',
        issuer: 'address',
        value: '100',
      },
    } as TrustSet;
    const stub = xrplTest.autofill(ts);
    const client = new Client(endpoint);
    await client.connect();
    const result = await client.autofill(ts);
    assert.strictEqual(stub.callCount, 3);
    assert.deepStrictEqual(result, {
      ...ts,
      ...{ Flags: 0, Sequence: 'Sequence', Fee: '1', LastLedgerSequence: 19020 },
    });
  });

  it('should mock autofill method for AccountDelete', async function () {
    xrplTest.connection();
    const ad = {
      TransactionType: 'AccountDelete',
      Account: 'account',
      Destination: 'account2',
      DestinationTag: 13,
    } as AccountDelete;
    const stub = xrplTest.autofill(ad);
    const client = new Client(endpoint);
    await client.connect();
    const result = await client.autofill(ad);
    assert.strictEqual(stub.callCount, 5);
    assert.deepStrictEqual(result, {
      ...ad,
      ...{ Flags: 0, Sequence: 'Sequence', Fee: '1', LastLedgerSequence: 19020 },
    });
  });

  it('should mock prepareTransaction method', async function () {
    xrplTest.connection();
    const ts = {
      TransactionType: 'TrustSet',
      Account: 'account',
      LimitAmount: {
        currency: 'XXX',
        issuer: 'address',
        value: '100',
      },
    } as TrustSet;
    const stub = xrplTest.prepareTransaction(ts);
    const client = new Client(endpoint);
    await client.connect();
    const result = await client.autofill(ts);
    assert.strictEqual(stub.callCount, 3);
    assert.deepStrictEqual(result, {
      ...ts,
      ...{ Flags: 0, Sequence: 'Sequence', Fee: '1', LastLedgerSequence: 19020 },
    });
  });

  it('should mock a submit for unsigned and autofilled transaction', async function () {
    xrplTest.connection();
    const tx = PAYMENT_TX as Transaction;
    xrplTest.autofill(tx);
    const stub = xrplTest.submit(tx);
    const client = new Client(endpoint);
    const wallet = Wallet.fromSeed(seed);
    await client.connect();
    const autofill = await client.autofill(tx);
    const result = await client.submit(autofill, { wallet });
    assert.strictEqual(stub.callCount, 4);
    assert.deepStrictEqual(result, SUBMIT_UNSIGNED_OK);
  });

  it('should mock a submit for unsigned and no autofilled transaction', async function () {
    xrplTest.connection();
    const tx = PAYMENT_TX as Transaction;
    const stub = xrplTest.submit(tx, true);
    const client = new Client(endpoint);
    const wallet = Wallet.fromSeed(seed);
    await client.connect();
    const result = await client.submit(tx, { autofill: true, wallet });
    assert.strictEqual(stub.callCount, 4);
    assert.deepStrictEqual(result, SUBMIT_UNSIGNED_OK);
  });

  it('should mock a submitAndWait for unsigned and autofilled transaction', async function () {
    xrplTest.connection();
    const tx = PAYMENT_TX as Transaction;
    xrplTest.autofill(tx);
    const stub = xrplTest.submitAndWait(tx);
    const client = new Client(endpoint);
    const wallet = Wallet.fromSeed(seed);
    await client.connect();
    const autofill = await client.autofill(tx);
    const result = await client.submitAndWait(autofill, { wallet });
    assert.strictEqual(stub.callCount, 6);
    assert.deepStrictEqual(result, SUBMIT_AND_WAIT_UNSIGNED_OK);
  }).timeout(6000);

  it('should mock a submitAndWait for unsigned and no autofilled transaction', async function () {
    xrplTest.connection();
    const tx = PAYMENT_TX as Transaction;
    const stub = xrplTest.submitAndWait(tx, true);
    const client = new Client(endpoint);
    const wallet = Wallet.fromSeed(seed);
    await client.connect();
    const result = await client.submitAndWait(tx, { autofill: true, wallet });
    assert.strictEqual(stub.callCount, 6);
    assert.deepStrictEqual(result, SUBMIT_AND_WAIT_UNSIGNED_OK);
  }).timeout(6000);
});
