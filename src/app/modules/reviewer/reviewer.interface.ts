import { GENDER } from '../../utilities/enum';

export interface IReviewer {
  name: string;
  username: string;
  city: string;
  zipcode: number;
  gender: (typeof GENDER)[keyof typeof GENDER];
  age: number;
  isStripeAccountConnected: boolean;
  stripeConnectedAccountId: string;
}
