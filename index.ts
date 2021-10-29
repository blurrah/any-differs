import "https://deno.land/x/dotenv/load.ts";
import { convertUsdtToEur, getBtcRate, hasBtcAlternative } from "./utils.ts";
import BigNumber from "https://esm.sh/bignumber.js";

import type { BinancePrice, Result } from "./types.d.ts";

const main = async () => {
  const response = await fetch("https://api.bitvavo.com/v2/ticker/price");
  const data: { market: string; price: string }[] = await response.json();

  const binanceResponse = await fetch(
    `https://api.binance.com/api/v3/ticker/price`
  );
  const binanceData: BinancePrice[] = await binanceResponse.json();

  // Grab comparison prices for converting btc and usdt to eur
  const btcEur = new BigNumber(
    binanceData.find((item) => item.symbol === "BTCEUR")?.price ?? ""
  );
  const usdtEur = binanceData.find((item) => item.symbol === "EURUSDT")?.price;

  console.log("---- action is coming ---");
  // convertBtcToEur();
  const btcRate = await getBtcRate();
  console.log(btcRate.toString());

  /**
   * Create aggregation of data
   */
  const result = data.reduce((agg: Result, item) => {
    // Binance doesn't use camel-case notation
    const name = item.market.replace("-", "");

    // Check whether market exists on both exchanges
    if (binanceData.some((item) => item.symbol === name)) {
      // console.log(binanceData.find((item) => item.symbol === name)?.price);
      const binancePrice = new BigNumber(
        binanceData.find((item) => item.symbol === name)?.price ?? ""
      );
      const bitvavoPrice = new BigNumber(item.price);

      const semiPrice = bitvavoPrice.minus(binancePrice);

      agg[name] = {
        bitvavoPrice: bitvavoPrice.toString(),
        binancePrice: binancePrice.toString(),
        delta: semiPrice.div(bitvavoPrice).toString(),
        converted: false,
      };
      return agg;
    } else if (hasBtcAlternative(item.market, binanceData)) {
      // If doesn't exist, check for BTC alternative for conversion (risky)
      const binancePrice = new BigNumber(
        binanceData.find(
          (market) => market.symbol === `${item.market.split("-")[0]}BTC`
        )?.price ?? ""
      );
      const bitvavoPrice = new BigNumber(item.price);

      const convertedBinancePrice = btcEur.multipliedBy(binancePrice);

      const semiPrice = bitvavoPrice.minus(convertedBinancePrice);

      agg[name] = {
        bitvavoPrice: bitvavoPrice.toString(),
        binancePrice: convertedBinancePrice.toString(),
        delta: semiPrice.div(bitvavoPrice).toString(),
        converted: true,
      };
      return agg;
    }
    // Else check for USDT alternative for conversion (also risky)

    return agg;
  }, {});

  return result;
};

main();
