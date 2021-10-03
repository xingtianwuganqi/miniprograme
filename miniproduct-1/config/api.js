//测试地址
const baseUrl_test = 'https://test.rxswift.cn'
const baseUrl_formal = 'https://rescue.rxswift.cn'
const baseUrl = baseUrl_formal;
module.exports = {
  TopicList: baseUrl + '/api/v1/topiclist/', //获取首页列表
  topicDetail: baseUrl + '/api/v1/topicdetail/',
  LikeAction: baseUrl + '/api/v1/likeaction/', //首页数据接口
  collectionAction:  baseUrl + '/api/v1/collection/', // 点赞
  getQiNiuToken: baseUrl + '/api/v1/qiniu/', // 获取七牛token
  releaseTopic: baseUrl + '/api/v1/releasetopic/', // 发布帖子
  localTopicList: baseUrl + '/api/v2/addresstopiclist/', // 同城接口
  searchKeyWords: baseUrl + '/api/v1/searchkeywords/', // 搜索关键字
  searchAction: baseUrl + '/api/v1/search/', // 搜索
  commentList: baseUrl + '/api/v1/commentlist/', // 评论列表
  commentAction: baseUrl + '/api/v1/commentaction/', // 评论
  replyComment: baseUrl + '/api/v1/replycomment/', // 回复
  loadMoreReply: baseUrl + '/api/v1/replypageinfo/', // 更多回复 
  systemMessage: baseUrl + '/api/v1/systemnotification/', // 系统消息
  messageInfo: baseUrl + '/api/v1/authmessage/', // 消息列表
  getContact: baseUrl + '/api/v1/getcontact/', // 获取联系方式
  authHistroy: baseUrl + '/api/v1/authhistorylist/', // 历史记录
  addViewHistory: baseUrl + '/api/v1/addviewhistory/', // 添加历史记录
  authPublish: baseUrl + '/api/v1/authpublishlist/', // 我的发布
  authCollection: baseUrl + '/api/v1/authcollection/', // 我的收藏

  pravicy: baseUrl + "/api/pravicy/", // 隐私协议
  userAgreen: baseUrl + "/api/useragreen/", // 用户协议
  aboutUs: baseUrl + "/api/aboutus/", // 关于我们
  instruction: baseUrl + "/api/instruction/", //领养说明

  violationList: baseUrl + '/api/v1/violations/', // 举报列表
  report: baseUrl + '/api/v1/report/', //举报
  suggestion: baseUrl + '/api/v1/suggestion/', // 意见反馈
  complateRescue: baseUrl + '/api/v1/completetopic/', // 完成领养
  login: baseUrl + '/api/v1/login/', // 登录
  wxLogin: baseUrl + '/api/v2/wxlogin/', // 微信登录
  location: baseUrl + '/api/location/', // 选取地址
  unreadMsgNum: baseUrl + '/api/v1/authunreadnum/', // 未读消息数
};