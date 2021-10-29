import BigNumber from "https://esm.sh/bignumber.js";

import type { BinancePrice } from "./types.d.ts";

export const getBtcRate = async () => {
  const response = await fetch(
    "https://api.coinbase.com/v2/exchange-rates?currency=EUR"
  );
  const data = await response.json();

  return new BigNumber(data.data.rates.BTC);
};

export const convertUsdtToEur = async () => {
  const response = await fetch(
    "https://api.binance.com/api/v3/avgPrice?symbol=EURUSDT"
  );
  const data = await response.json();

  console.log(data);
};

/**
 * Function that checks whether a EUR market has a BTC alternative available
 * @param symbol
 * @param markets
 * @returns Boolean whether it exists
 */
export const hasBtcAlternative = (symbol: string, markets: BinancePrice[]) =>
  symbol.includes("EUR") &&
  markets.some((market) => market.symbol === `${symbol.split("-")[0]}BTC`);
