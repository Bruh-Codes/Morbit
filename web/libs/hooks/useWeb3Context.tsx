import React, { useContext } from 'react';

import { Web3Data } from '../web3-data-provider/Web3Provider';
// import { Web3Data } from '../web3-data-provider/Web3ContextProvider';

export type Web3ContextData = {
  web3ProviderData: Web3Data;
};

export const Web3Context = React.createContext({} as Web3ContextData);

export const useWeb3Context = () => {
  const context = useContext(Web3Context);
  const web3ProviderData = context?.web3ProviderData;
  if (!web3ProviderData || Object.keys(web3ProviderData).length === 0) {
    throw new Error(
      'useWeb3Context() can only be used inside of <Web3ContextProvider />, ' +
        'please declare it at a higher level.'
    );
  }

  return web3ProviderData;
};
