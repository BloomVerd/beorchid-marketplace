import { gql } from "@apollo/client";

export const INVESTMENT_PLANS = gql`
  query InvestmentPlans($status: PlanStatus, $cropId: String, $maxMaturityDays: Float, $lowRiskOnly: Boolean) {
    investmentPlans(status: $status, cropId: $cropId, maxMaturityDays: $maxMaturityDays, lowRiskOnly: $lowRiskOnly) {
      id
      title
      cropId
      acreage
      unitCost
      expectedProfitMin
      expectedProfitMax
      maturityDays
      totalUnits
      unitsRemaining
      riskNotes
      status
      createdAt
    }
  }
`;

export const INVESTMENT_PLAN_DETAIL = gql`
  query InvestmentPlanDetail($id: ID!) {
    investmentPlan(id: $id) {
      id
      title
      cropId
      acreage
      unitCost
      expectedProfitMin
      expectedProfitMax
      maturityDays
      totalUnits
      unitsRemaining
      riskNotes
      status
      createdAt
    }
  }
`;

export const MY_INVESTMENTS = gql`
  query MyInvestments {
    myInvestments {
      id
      planId
      units
      principal
      status
      purchasedAt
      maturesAt
      payoutAmount
      settlementLedgerRef
    }
  }
`;

export const PURCHASE_INVESTMENT = gql`
  mutation PurchaseInvestment($planId: ID!, $units: Float!) {
    purchaseInvestment(planId: $planId, units: $units) {
      id
      units
      principal
      status
      maturesAt
    }
  }
`;

export const CREATE_INVESTMENT_PLAN = gql`
  mutation CreateInvestmentPlan($input: CreatePlanInput!) {
    createInvestmentPlan(input: $input) {
      id
      title
      cropId
      acreage
      unitCost
      expectedProfitMin
      expectedProfitMax
      maturityDays
      totalUnits
      unitsRemaining
      riskNotes
      status
      createdAt
    }
  }
`;

export const SETTLE_INVESTMENT_PLAN = gql`
  mutation SettleInvestmentPlan($planId: ID!, $actualProfitPerUnit: Float!, $notes: String) {
    settleInvestmentPlan(planId: $planId, actualProfitPerUnit: $actualProfitPerUnit, notes: $notes) {
      id
      planId
      actualProfitPerUnit
      settledAt
      notes
    }
  }
`;
