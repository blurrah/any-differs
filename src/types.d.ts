import BigNumber from "https://esm.sh/bignumber.js";

export type Result = {
  [market: string]: {
    bitvavoPrice: BigNumber;
    binancePrice: BigNumber;
    delta: BigNumber;
    converted: boolean;
  };
};

export type BinancePrice = {
  symbol: string;
  price: string;
};

export type NotificationMessage = {
  title: string;
  message: string;
};
