import "https://deno.land/x/dotenv/load.ts";
import { hasBtcAlternative } from "./utils.ts";
import BigNumber from "https://esm.sh/bignumber.js";
import { Notification } from "https://deno.land/x/deno_notify@1.0.1/ts/mod.ts";
import * as Colors from "https://deno.land/std/fmt/colors.ts";

import type { BinancePrice, Result } from "./types.d.ts";

const output = (results: Result) => {
  Object.entries(results).forEach(([name, market]) => {
    if (market.delta.toNumber() > 1 || market.delta.toNumber() < -1) {
      console.log(
        Colors.underline(
          Colors.blue(`${name} -> Delta: ${market.delta.toString()}`)
        )
      );

      // Send notification
      new Notification()
        .title(`Delta found for market ${name}`)
        .body(`Delta is ${market.delta.toString()}`)
        .show();
    }
  });
};

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
  // const usdtEur = binanceData.find((item) => item.symbol === "EURUSDT")?.price;

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

      agg[item.market] = {
        bitvavoPrice: bitvavoPrice,
        binancePrice: binancePrice,
        delta: semiPrice.div(bitvavoPrice),
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

      agg[item.market] = {
        bitvavoPrice: bitvavoPrice,
        binancePrice: convertedBinancePrice,
        delta: semiPrice.div(bitvavoPrice),
        converted: true,
      };
      return agg;
    }
    // Else check for USDT alternative for conversion (also risky)

    return agg;
  }, {});
  output(result);

  return result;
};

// Run application
main();
