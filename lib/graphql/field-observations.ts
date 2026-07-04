import { gql } from "@apollo/client";

export const MY_FIELD_OBSERVATIONS = gql`
  query MyFieldObservations {
    myFieldObservations {
      id
      status
      cropId
      region
      observedAt
      pricePerUnit
      qualityGrade
      confidence
      rejectionReason
      createdAt
    }
  }
`;

export const SUBMIT_FIELD_OBSERVATION = gql`
  mutation SubmitFieldObservation($input: SubmitObservationInput!) {
    submitFieldObservation(input: $input) {
      id
      status
      confidence
      cropId
      region
      observedAt
      pricePerUnit
    }
  }
`;
