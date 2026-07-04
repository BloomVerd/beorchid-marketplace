import { gql } from "@apollo/client";

export const CROPS = gql`
  query Crops($category: String, $region: String) {
    crops(category: $category, region: $region) {
      id
      name
      slug
      unit
      category
      region
      recentPrices {
        price
        observedAt
      }
    }
  }
`;

export const CROP_PRICES = gql`
  query CropPrices($cropId: ID!, $region: String, $from: DateTime, $to: DateTime) {
    cropPrices(cropId: $cropId, region: $region, from: $from, to: $to) {
      id
      region
      price
      currency
      observedAt
      priceType
      source
      qualityGrade
    }
  }
`;

export const CROP_FORECAST = gql`
  query CropForecast($cropId: ID!, $region: String!, $horizon: Int) {
    cropForecast(cropId: $cropId, region: $region, horizon: $horizon) {
      id
      predictedPrice
      confidenceLow
      confidenceHigh
      horizonDays
      generatedAt
    }
  }
`;

export const MARKET_INSIGHTS = gql`
  query MarketInsights($cropId: ID, $region: String) {
    marketInsights(cropId: $cropId, region: $region) {
      id
      type
      payload
      publishedAt
    }
  }
`;
