import { BaseResponse } from 'xrpl/dist/npm/models/methods/baseMethod';

export default class ResponseBuilder {
  private readonly response: Record<string, any>;

  constructor() {
    this.response = {
      id: new Date().valueOf(),
      type: 'response',
    };
  }

  id(id: number): ResponseBuilder {
    this.response.id = id;
    return this;
  }

  // type(type: string): ResponseBuilder{
  //     this.response.type = type;
  //     return this;
  // }

  status(status: string): ResponseBuilder {
    this.response.status = status;
    return this;
  }

  result(result: Record<string, any>): ResponseBuilder {
    this.response.result = result;
    return this;
  }

  build(): BaseResponse {
    return this.response as BaseResponse;
  }
}
