// pages/HomeInfo/createtopic/createtopic.js
/*
  struct ReleasePhotoModel: HandyJSON, Equatable {
    var image: UIImage?
    var isAdd: Bool = false // 是不是添加的图片
    var progress: Float = 0
    var complete: Bool = false
    var photoKey: String = "\(Tool.shared.getTime())/\(String.et.random(ofLength: 8)).jpeg"
    var photoUrl: String = ""
    
    static func == (lhs: Self, rhs: Self) -> Bool {
        return lhs.photoKey == rhs.photoKey
    }
}
*/
var emptyData = {isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""};
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    tags: null,
    photoModels:[emptyData]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      photoModels:[{isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""}]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /* 点击添加标签 */
  addTagsClick: function() {
    wx.navigateTo({
      url: '../selectedtags/selectedtags',
    })
  },

  //用户名和密码输入框事件
  contactInput:function(e){
    console.log(e.detail.value);
    this.setData({
      contact:e.detail.value
    })
  },
  bindTextAreaBlur: function(e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },
  /**添加照片 */
  addPhotoClick: function(e) {
    console.log(e.currentTarget.dataset.id)
    var item = e.currentTarget.dataset.id
    var that = this;
    var hadCount = this.data.photoModels.filter((num) => {
      return num.isAdd != true;
    });
    console.log("hadCount: ",hadCount)
    var count = 6 - hadCount.length;
    console.log("count: ",count)
    
    wx.chooseImage({
      count: count, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // ['album', 'camera'] 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        // _this.setData({
        //   imglist: _this.data.imglist.concat(tempFilePaths)
        // })
        var temp = tempFilePaths.map((num) => {
          return {isAdd: false,progress: 0,complete: 0,photoKey: "",photoUrl: num}
        })
        console.log(temp)
        var totalDatas = temp.concat(that.data.photoModels)
        var photoDatas = totalDatas.filter((num) => {
          return num.isAdd != true
        })
        if (photoDatas.length == 6) {
          totalDatas = photoDatas 
        }
        that.setData({
          photoModels: totalDatas
        })
      }
    })
  },
  clearPhotoClick: function(e) {
    var item = e.currentTarget.dataset.id
    var totalPhotos = this.data.photoModels.filter((num) => {
      return num.photoUrl != item.photoUrl
    })

    var emptyPhoto = totalPhotos.filter((num) => {
      return num.isAdd == true
    })

    if (emptyPhoto.length == 0) {
      totalPhotos.push({isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""})
    }
    
    this.setData({
      photoModels: totalPhotos
    })

  }
})