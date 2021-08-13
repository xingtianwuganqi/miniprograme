//测试地址
const baseUrl = 'https://test.rxswift.cn';
module.exports = {
  TopicList: baseUrl + '/api/v1/topiclist/', //获取首页列表
  LikeAction: baseUrl + '/api/v1/likeaction/', //首页数据接口
  collectionAction:  baseUrl + '/api/v1/collection/', // 点赞
  getQiNiuToken: baseUrl + '/api/v1/qiniu/', // 获取七牛token
  releaseTopic: baseUrl + '/api/v1/releasetopic/', // 发布帖子
  localTopicList: baseUrl + '/api/v2/addresstopiclist/', // 同城接口
  searchKeyWords: baseUrl + '/api/v1/searchkeywords/', // 搜索关键字
  searchAction: baseUrl + '/api/v1/search/', // 搜索
};