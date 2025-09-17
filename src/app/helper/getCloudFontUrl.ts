export const getCloudFrontUrl = (s3Url: string) => {
  return s3Url.replace(
    'https://sampli-bucket101.s3.us-west-2.amazonaws.com',
    'https://d5yvwqjsam02k.cloudfront.net',
  );
};
