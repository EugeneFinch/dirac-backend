const get = require('lodash/get');
const flatMap = require('lodash/flatMap');
const {PREDEFINED_KEYWORD}  = require('../transcript-keyword/constants');
const KEYWORD_CRITERIA = PREDEFINED_KEYWORD.reduce((result,v)=>{
  return {
    ...result,
    [v.code] : v.criteria
  };
},{});

const searchByKeyword = (ctx) => {
  const keywords = get(ctx,'params.query.predefined_keyword');
  if(!keywords){
    return ;
  }

  const keywordArr = keywords.split(',');

  const query = flatMap(keywordArr,keyword =>{
    if(!Object.keys(KEYWORD_CRITERIA).includes(keyword)){
      return;
    }
    return KEYWORD_CRITERIA[keyword].map(v=>( { search_content: {$like: `%${v}%`}}));
  });

  ctx.params.query = {
    ...ctx.params.query,
    $or: query
  };

 
};

const hightLightKeyword = (ctx) => {
  if(ctx.type !== 'after') {
    return;
  }

  const keywords = get(ctx,'arguments.0.query.predefined_keyword');
  if(!keywords){
    return;
  }
  const keywordArr = keywords.split(',');
  
  ctx.result = {
    ...ctx.result,
    data: ctx.result.data.map(v=>({
      ...v,
      highlight_keyword: keywordArr.map(keyword=> KEYWORD_CRITERIA[keyword].find(k=>v.search_content.includes(k)))[0]
    }))};
};

module.exports = { 
  searchByKeyword,
  hightLightKeyword
};