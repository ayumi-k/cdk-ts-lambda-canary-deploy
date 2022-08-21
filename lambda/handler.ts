import { Handler } from 'aws-lambda'; // npm install -D @types/aws-lambda

export const main: Handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
        message: 'hello world ver2',
    }),
  };
};
