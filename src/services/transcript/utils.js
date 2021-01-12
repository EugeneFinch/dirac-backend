const get = require('lodash/get');
const flatMap = require('lodash/flatMap');

const getKeywordCriteria = async (ctx) => {
  const sequelize = ctx.app.get('sequelizeClient');
  const { transcript_keyword_recap_config:config } = sequelize.models;
  const keywords = await config.findAll();
  return keywords.reduce((result,v)=>({
    ...result,
    [v.code] : v.criteria
  }),{});
};

const searchByKeyword = async (ctx) => {
  const keywords = get(ctx,'params.query.predefined_keyword');
  if(!keywords){
    return ;
  }

  const keywordArr = keywords.split(',');
  const kwCriteria = await getKeywordCriteria(ctx);

  const query = flatMap(keywordArr,keyword =>{
    if(!Object.keys(kwCriteria).includes(keyword)){
      return;
    }
    return kwCriteria[keyword].map(v=>( { search_content: {$like: `%${v}%`}}));
  });

  ctx.params.query = {
    ...ctx.params.query,
    $or: query
  };

 
};

const hightLightKeyword = async (ctx) => {
  if(ctx.type !== 'after') {
    return;
  }

  const keywords = get(ctx,'arguments.0.query.predefined_keyword');
  if(!keywords){
    return;
  }
  const keywordArr = keywords.split(',');

  const kwCriteria = await getKeywordCriteria(ctx);
  
  ctx.result = {
    ...ctx.result,
    data: ctx.result.data.map(v=>{
      const founds = keywordArr.map(keyword=> {
        const c = kwCriteria[keyword].find(k=>v.search_content.includes(k));
        return {
          criteria: c ,
          keyword: c && keyword
        };
      }
      ).filter(v=>v.keyword);

      founds.forEach(({criteria,keyword})=>{
        const reg = new RegExp(criteria,'i');
        const idx = v.content.search(reg);
        const hightLightKeyword =  `<span class='${keyword}'>${v.content.substr(idx,criteria.length)}</span>`;
        v.content = v.content.replace(reg,hightLightKeyword);
      });
     
      return v;
    })};
};

module.exports = { 
  searchByKeyword,
  hightLightKeyword
};