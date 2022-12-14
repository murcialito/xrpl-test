import { Transaction } from 'xrpl';

export default class ResultBuilder {
  private readonly result: any;

  constructor() {
    this.result = {
      success: true,
      engine_result: 'tesSUCCESS',
      engine_result_code: 0,
      engine_result_message: 'The transaction was applied. Only final in a validated ledger.',
      tx_blob:
        '1200002280000000240000016861D4838D7EA4C6800000000000000000000000000055534400000000004B4E9C06F24296074F7BC48F92A97916C6DC5EA9684000000000002710732103AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB7446304402200E5C2DD81FDF0BE9AB2A8D797885ED49E804DBF28E806604D878756410CA98B102203349581946B0DDA06B36B35DBC20EDA27552C1F167BCF5C6ECFF49C6A46F858081144B4E9C06F24296074F7BC48F92A97916C6DC5EA983143E9D4A2B8AA0780F682D136F7A56D6724EF53754',
    };
  }

  static generateSignature() {
    return {
      SigningPubKey: '03AB40A0490F9B7ED8DF29D246BF2D6269820A0EE7742ACDD457BEA7C7D0931EDB',
      TxnSignature:
        '304402200E5C2DD81FDF0BE9AB2A8D797885ED49E804DBF28E806604D878756410CA98B102203349581946B0DDA06B36B35DBC20EDA27552C1F167BCF5C6ECFF49C6A46F8580',
    };
  }

  // success(success: boolean): ResultBuilder{
  //     this.result.success = success;
  //     return this;
  // }

  // engineResult(result: string): ResultBuilder{
  //     this.result.engine_result = result;
  //     return this;
  // }

  // engineResultCode(code: number): ResultBuilder{
  //     this.result.engine_result_code = code;
  //     return this;
  // }

  // engineResultMessage(message: string): ResultBuilder{
  //     this.result.engine_result_message = message;
  //     return this;
  // }

  // txBlob(txBlob: string): ResultBuilder{
  //     this.result.tx_blob = txBlob;
  //     return this;
  // }

  txJson<T extends Transaction>(
    transaction: T,
    signature?: {
      SigningPubKey: string;
      TxnSignature: string;
    },
  ): ResultBuilder {
    this.result.tx_json = {
      ...transaction,
      ...{
        Fee: 10000,
        Flags: 2147483648,
        Sequence: 360,
        hash: '4D5D90890F8D49519E4151938601EF3D0B30B16CD6A519D9C99102C9FA77F7E0',
      },
    };
    // if(signature != null) {
    //     this.result.tx_json = {...this.result.tx_json, ...signature}
    // }
    this.result.tx_json = { ...this.result.tx_json, ...signature };
    return this;
  }

  build<T>() {
    return this.result as T;
  }

  add(props: { key: string; value: any }[]): ResultBuilder {
    props.forEach((prop) => {
      this.result[prop.key] = prop.value;
    });
    return this.result;
  }
}
