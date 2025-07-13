import { Amplify } from 'aws-amplify';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: 'https://mjnkxorqy5awta2pkm6yvtyz6y.appsync-api.eu-north-1.amazonaws.com/graphql',
      region: 'eu-north-1',
      defaultAuthMode: 'apiKey',
      apiKey: 'AKIAXF5HX2CXCOJMLEFE'
    }
  }
});
