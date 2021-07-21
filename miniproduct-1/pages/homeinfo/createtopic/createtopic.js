// pages/HomeInfo/createtopic/createtopic.js
import api from '../../../config/api.js';
import network from '../../../config/network.js'
const qiniuUploader = require("../../../utils/qiniuUploader");
const util = require('../../../utils/util.js')

var emptyData = {isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""};
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    tags: null,
    photoModels:[emptyData],
    locationArr: ['', '', ''],
    showAddress: false,
    address: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      photoModels:[{isAdd: true,progress: 0,complete: 0,photoKey: "",photoUrl: ""}]
    })

    //获得dialog组件
    this.getAddress = this.selectComponent("#getAddress");
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
    var that = this;
    wx.navigateTo({
      url: '../selectedtags/selectedtags',
      // 回调传值
      events: {
        // 这里用来接收后面页面传递回来的数据
        updateAddressListData: (items) => {
          console.log(items);
           // 这里处理数据即可，回调回来的数据
           that.setData({
             tags: items
           })
        }
      }
    })
  },

  /**点击标签 */
  selectTagsClick: function(e) {
    var that = this;
    wx.navigateTo({
      url: '../selectedtags/selectedtags',
      // 回调传值
      events: {
        // 这里用来接收后面页面传递回来的数据
        updateAddressListData: (items) => {
          console.log(items);
           // 这里处理数据即可，回调回来的数据
           that.setData({
             tags: items
           })
        }
      },
      // 回调传值
      success: res => {
        // 这里给要打开的页面传递数据.  第一个参数:方法key, 第二个参数:需要传递的数据
        res.eventChannel.emit('selData', that.data.tags);
      }
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
          return {isAdd: false,progress: 0,complete: 0,photoKey: Date.parse(new Date()) + '/' + util.randomString + '.jpeg',photoUrl: num}
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

  },
  locationClick: function() {
    wx.navigateTo({
      url: '../../homeinfo/location/location',
    })
  },
  //选择地址
  chooseAddress: function(e) {
  
    this.getAddress.showsGoodsDetail();
  },
 
  //组件回调
  resultEvent: function(e) {
    var addressInfos = e.detail.nameArr
    var address = ''
    if (e.detail.nameArr[2].length > 0) {
      address = e.detail.nameArr[0] + '.' + e.detail.nameArr[1] + '.' + e.detail.nameArr[2]
    }else{
      address = e.detail.nameArr[0] + '.' + e.detail.nameArr[1]
    }
    this.setData({
      showAddress: true,
      locationArr: e.detail.nameArr,
      address: address
    })
  },
  /**点击发布按钮 */
  addButtonClick: function(){
    if (this.data.content == null || this.data.content.length == 0) {
      wx.showToast({
        title: '请输入宠物简介',
        icon: 'none'
      })
      return 
    }
    var upPhotos = this.data.photoModels.filter((model) => {
      return model.isAdd == false;
    })
    if (upPhotos.length == 0) {
      wx.showToast({
        title: '请添加图片',
        icon:'none'
      })
      return 
    }

    if (this.data.contact == null || this.data.contact.length == 0) {
      wx.showToast({
        title: '请输入联系方式',
        icon:'none'
      })
      return 
    }

    if (this.data.address == null || this.data.address.length == 0) {
      wx.showToast({
        title: '请选择地址',
        icon:'none'
      })
      return 
    }

    if (this.data.qiniuToken != null && this.data.qiniuToken.length > 0) {
      this.qiniuImageNetworking(this.data.qiniuToken);
    }else{
      this.getQiNiuToken();
    }
  },
  /** 获取七牛token */
  getQiNiuToken: function() {
    var that = this;
    var token = wx.getStorageSync('token')
    wx.showLoading({
      title: '正在加载',
    })
    network({
      url: api.getQiNiuToken,
      data:{
        token: token
      },
    }).then((res) =>{
      if (res.data.code == 200) {
        // 保存token
        var qiniuToken = res.data.data.token
        console.log(qiniuToken)
        that.setData({
          qiniuToken: qiniuToken
        })
        // 上传图片
        that.qiniuImageNetworking(qiniuToken);
      }else{
        wx.hideLoading({
          success: (res) => {},
        })
      }
    }).catch((res)=>{
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  /**上传图片 */
  qiniuImageNetworking:function(token){
    wx.showLoading({
      title: '上传图片',
    })
    var photoModels = this.data.photoModels.filter((model) => {
      return model.isAdd == false
    })
    var that = this;
    for (var i=0;i<photoModels.length;i++) {
      var photo = photoModels[i]
      qiniuUploader.upload(
        photo.photoUrl,
        (res) => {
          console.log('reeees:',res)
          var allPhotos = that.data.photoModels.map((model) => {
            var newModel = model
            if (newModel.photoKey == res.key) {
              newModel.complete = 1
            }
            return newModel
          })
          that.setData({
            photoModels: allPhotos
          })
          var isCompletion = that.judgePhotoAllPushComplete(allPhotos)
          console.log('是否完成全部：',isCompletion)
          if (isCompletion) {
            // 调用发布接口
            that.setData({
              photoModels: allPhotos
            })
            that.releaseTopicNetworking();
          }
        },(error) => {
          console.log('eeeeeeeeeeee is:',error)
          wx.hideLoading({
            success: (res) => {},
          })
        },
        {
          region: 'NCN',
          uptoken: token,
          domain: 'http://img.rxswift.cn',
          key: photo.photoKey
        },
        (res) => {
          console.log('上传进度', res.progress)
          console.log('已经上传的数据长度', res.totalBytesSent)
          console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
        }
      )
    }
  },
  /**判断图片是否全部上传 */
  judgePhotoAllPushComplete(photoModles) {
    var photos = photoModles.filter((model) => {
      return model.isAdd == false
    }).filter((model) => {
      return model.complete == 0
    })
    if (photos.length == 0) {
      return true
    }else{
      return false
    }
  },
  releaseTopicNetworking() {
    wx.showLoading({
      title: '正在加载',
    })
    var token = wx.getStorageSync('token')
    var imgs = this.imageString(this.data.photoModels);
    var tags = this.tagsString(this.data.tags);

    var datas = {
      'token': token,
      'content': this.data.content,
      'imgs': imgs,
      'address_info': this.data.address,
      'contact': this.data.contact,
    }
    if (tags != null && tags.length > 0) {
      datas = {
        'token': token,
        'content': this.data.content,
        'imgs': imgs,
        'address_info': this.data.address,
        'contact': this.data.contact,
        'tags': tags 
      }
    }
    console.log(datas);
    var that = this;
    network({
      url: api.releaseTopic,
      data: datas
    }).then((res) => {
      if (res.data.code == 200) {
        wx.showToast({
          title: '发布成功',
          icon: 'none'
        })
        let eventChannel = that.getOpenerEventChannel()
      // updateAddressListData 这个方法需要上一个页面的支持, 上一个页面在navigateTo方法中的events数据中定义这个方法来接收数据
        eventChannel.emit('updateTopicList', 1);
        var timeOut = setTimeout(function () {
          wx.navigateBack({
            delta: 1,
          })
        }, 1500)
      }else{
        wx.hideLoading({
          success: (res) => {},
        })
        wx.showToast({
          title: '发布失败',
          icon: 'none'
        })
      }
    }).catch((res)=>{
      wx.hideLoading({
        success: (res) => {},
      })
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    })
  },
  /**图片字符串 */
  imageString(photoModels) {
    var photos = photoModels.filter((model) => {
      return model.isAdd == false
    }).filter((model) => {
      return model.complete == 1
    })
    
    var imgStrs = photos.map((model) => {
      return model.photoKey
    })
    return imgStrs.join(',')
  },
  /**标签字符串 */
  tagsString(tags) {
    if (tags == null || tags.length == 0) {
      return null;
    }else{
      var tagStrs = tags.map((item) => {
        return item.id
      })
      return tagStrs.join(',');
    }
  }
})