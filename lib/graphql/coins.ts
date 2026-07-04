import { gql } from "@apollo/client";

export const COINS = gql`
  query Coins {
    coins {
      id
      name
      symbol
      cropId
      basePrice
      currentPrice
      circulatingSupply
      status
      createdAt
    }
  }
`;

export const COIN_DETAIL = gql`
  query CoinDetail($id: ID!) {
    coin(id: $id) {
      id
      name
      symbol
      cropId
      basePrice
      currentPrice
      circulatingSupply
      status
      pricingWeights
      createdAt
    }
  }
`;

export const COIN_PRICES = gql`
  query CoinPrices($coinId: ID!, $from: DateTime, $to: DateTime) {
    coinPrices(coinId: $coinId, from: $from, to: $to) {
      id
      price
      computedAt
    }
  }
`;

export const MY_COINS = gql`
  query MyCoins {
    myCoins {
      holding {
        id
        coinId
        units
        avgCost
      }
      coin {
        id
        name
        symbol
        currentPrice
      }
      currentValue
      unrealizedPnl
    }
  }
`;

export const BUY_COIN = gql`
  mutation BuyCoin($coinId: ID!, $units: Float!, $idempotencyKey: String!) {
    buyCoin(coinId: $coinId, units: $units, idempotencyKey: $idempotencyKey) {
      id
      side
      units
      unitPrice
      grossAmount
      executedAt
    }
  }
`;

export const SELL_COIN = gql`
  mutation SellCoin($coinId: ID!, $units: Float!, $idempotencyKey: String!) {
    sellCoin(coinId: $coinId, units: $units, idempotencyKey: $idempotencyKey) {
      id
      side
      units
      unitPrice
      grossAmount
      executedAt
    }
  }
`;

export const CREATE_COIN = gql`
  mutation CreateCoin($input: CreateCoinInput!) {
    createCoin(input: $input) {
      id
      name
      symbol
      cropId
      basePrice
      currentPrice
      status
      createdAt
    }
  }
`;

export const RECOMPUTE_COIN_PRICE = gql`
  mutation RecomputeCoinPrice($coinId: ID!) {
    recomputeCoinPrice(coinId: $coinId) {
      id
      price
      computedAt
    }
  }
`;
