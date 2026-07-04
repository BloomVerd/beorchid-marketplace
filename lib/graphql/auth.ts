export const LOGIN_MUTATION = `
  mutation LoginWithPassword($email: String!, $password: String!) {
    loginWithPassword(email: $email, password: $password) {
      accessToken
      refreshToken
      farmer {
        id
        email
        firstName
        lastName
        roles
        isFieldAgent
      }
    }
  }
`;

export const REGISTER_MUTATION = `
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      farmer {
        id
        email
        firstName
        lastName
        roles
        isFieldAgent
      }
    }
  }
`;

export const REFRESH_MUTATION = `
  mutation Refresh($refreshToken: String!) {
    refresh(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;
