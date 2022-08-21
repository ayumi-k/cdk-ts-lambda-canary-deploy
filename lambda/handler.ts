import { Handler } from 'aws-lambda';

export const main: Handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'hello world ver2',
    }),
  };
};
