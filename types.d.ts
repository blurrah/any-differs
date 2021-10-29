export type Result = {
  [market: string]: {
    bitvavoPrice: string;
    binancePrice: string;
    delta: string;
    converted: boolean;
  };
};

export type BinancePrice = {
  symbol: string;
  price: string;
};
