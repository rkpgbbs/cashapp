import { Amplify } from 'aws-amplify';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_API_ENDPOINT,
      region: import.meta.env.VITE_API_REGION,
      defaultAuthMode: 'apiKey',
      apiKey: import.meta.env.VITE_API_KEY
    }
  }
});
