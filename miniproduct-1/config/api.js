//测试地址
const baseUrl = 'https://test.rxswift.cn';
module.exports = {
  TopicList: baseUrl + '/api/v1/topiclist/', //获取首页列表
  LikeAction: baseUrl + '/api/v1/likeaction/', //首页数据接口
  collectionAction:  baseUrl + '/api/v1/collection/', // 点赞
  getQiNiuToken: baseUrl + '/api/v1/qiniu/', // 获取七牛token
  
};