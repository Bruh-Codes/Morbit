export const useCoingeckoCategories = () => {
  return {
    data: { stablecoinSymbols: [], ethCorrelatedSymbols: [] },
    isLoading: false,
    error: null,
  };
};
