export class TokenWrapperService {
  constructor(_getProvider: unknown) {}

  supplyWrappedTokenWithPermit(
    _amount: string,
    _asset: string,
    _user: string,
    _deadline: string,
    _signature: any
  ): Promise<string> {
    return Promise.resolve('0x');
  }

  supplyWrappedToken(_amount: string, _asset: string, _user: string): Promise<string> {
    return Promise.resolve('0x');
  }

  withdrawWrappedTokenWithPermit(
    _amount: string,
    _asset: string,
    _user: string,
    _deadline: string,
    _signature: any
  ): Promise<string> {
    return Promise.resolve('0x');
  }

  withdrawWrappedToken(_amount: string, _asset: string, _user: string): Promise<string> {
    return Promise.resolve('0x');
  }
}
