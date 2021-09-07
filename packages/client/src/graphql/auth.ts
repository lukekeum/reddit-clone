import { gql } from '@apollo/client';

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    ok
  }
`;
