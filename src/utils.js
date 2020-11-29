const configAuthentication = context => {
  context.params.authentication = {
    strategy: 'jwt',
    accessToken: context.params.token
  };
}

module.exports = {
  configAuthentication,
};
