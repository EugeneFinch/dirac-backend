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
    $or: PREDEFINED_KEYWORD[keyword].map(v=>( { search_content: {$like: `%${v}%`}})),
    $select: ['id','search_content','start_time']
  };

  ctx.params.query = {
    ...ctx.params.query,
    ...query
  };
};

const hightLightKeyword = (ctx) => {
  if(ctx.type !== 'after') {
    return;
  }

  const keyword = get(ctx,'arguments.0.query.predefined_keyword');
  if(!keyword){
    return;
  }
  
  
  ctx.result = {
    ...ctx.result,
    data: ctx.result.data.map(v=>({
      ...v,
      highlight_keyword: PREDEFINED_KEYWORD[keyword].find(k=>v.search_content.includes(k))
    }))
  };
};

module.exports = { 
  searchByKeyword,
  hightLightKeyword
};