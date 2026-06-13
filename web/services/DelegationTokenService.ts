export class DelegationTokenService {
  constructor(_getProvider: unknown) {}
  getDelegatee(_user: string, _tokenType: number): Promise<string> {
    return Promise.resolve('0x');
  }
  getPowerDelegatedTo(_user: string, _tokenType: number): Promise<string> {
    return Promise.resolve('0');
  }
  getDelegateeByType(
    _user: string
  ): Promise<{ votingDelegatee: string; propositionPowerDelegatee: string }> {
    return Promise.resolve({ votingDelegatee: '0x', propositionPowerDelegatee: '0x' });
  }
  approveDelegation(_tokenType: number, _delegatee: string, _amount: string): Promise<string> {
    return Promise.resolve('0x');
  }
  approveDelegationWithSig(
    _tokenType: number,
    _delegatee: string,
    _amount: string,
    _nonce: string,
    _deadline: string,
    _signature: string | unknown
  ): Promise<string> {
    return Promise.resolve('0x');
  }
  signDelegation(
    _user: string,
    _nonce: string,
    _deadline: string,
    _delegationTokenType: number,
    _delegatee: string
  ): Promise<{ v: number; r: string; s: string; deadline: string; nonce: string }> {
    return Promise.resolve({ v: 0, r: '0x', s: '0x', deadline: '0', nonce: '0' });
  }
  batchMetaDelegate(_user: string, _txs: unknown[], _chainId: number): Promise<string> {
    return Promise.resolve('0x');
  }
  getTokenNonce(_user: string, _tokenType: number): Promise<string> {
    return Promise.resolve('0');
  }
}
