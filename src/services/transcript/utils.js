const get = require('lodash/get');
const {PREDEFINED_KEYWORD}  = require('./constants');

const searchByKeyword = (ctx) => {
  const keyword = get(ctx,'params.query.predefined_keyword');
  if(!keyword){
    return ;
  }

  if(!Object.keys(PREDEFINED_KEYWORD).includes(keyword)){
    return;
  }
  const query = {
    $or: PREDEFINED_KEYWORD[keyword].map(v=>( { search_content: {$like: `%${v}%`}}))
  };

  ctx.params.query = {
    ...ctx.params.query,
    ...query
  };
};

module.exports = { 
  searchByKeyword
};