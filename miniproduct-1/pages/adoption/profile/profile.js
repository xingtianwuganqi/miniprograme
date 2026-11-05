// pages/adoption/profile/profile.js
const adoption = require('../../../config/adoption.js')
const analytics = require('../../../utils/analytics.js')

const housingOptions = [{ value: '', label: '请选择' }].concat(adoption.HOUSING_OPTIONS)
const employmentOptions = [{ value: '', label: '请选择' }].concat(adoption.EMPLOYMENT_OPTIONS)

Page({

  data: {
    age: '',
    city: '',
    district: '',
    experience: '',
    housingOptions: housingOptions,
    employmentOptions: employmentOptions,
    housingIndex: 0,
    employmentIndex: 0,
    locationArr: ['', '', ''],
    address: '',
    version: 0,
    loading: true,
    saving: false
  },

  onLoad: function () {
    this.loadProfile()
  },

  onShow: function () {
    analytics.pageView('adoption_profile')
  },

  /** 读取本人领养资料 */
  loadProfile: function () {
    var that = this
    adoption.adoptionProfile().then(function (data) {
      var profile = adoption.profileFrom(data)
      var housingIndex = that.indexOfOption(housingOptions, profile.housing)
      var employmentIndex = that.indexOfOption(employmentOptions, profile.employment)
      that.setData({
        age: profile.age,
        city: profile.city,
        district: profile.district,
        experience: profile.experience,
        housingIndex: housingIndex,
        employmentIndex: employmentIndex,
        address: that.addressText(profile.city, profile.district),
        version: profile.version,
        loading: false
      })
    }).catch(function (error) {
      that.setData({ loading: false })
      that.handleError(error)
    })
  },

  indexOfOption: function (options, value) {
    for (var i = 0; i < options.length; i++) {
      if (options[i].value === value) {
        return i
      }
    }
    return 0
  },

  addressText: function (city, district) {
    return [city, district].filter(function (item) {
      return !!item
    }).join(' ')
  },

  /** 选择城市/区县 */
  chooseAddress: function () {
    this.getAddress = this.selectComponent('#getAddress')
    if (this.getAddress) {
      this.getAddress.showsGoodsDetail()
    }
  },

  resultEvent: function (e) {
    var nameArr = e.detail.nameArr || ['', '', '']
    var city = nameArr[1] || ''
    var district = nameArr[2] || ''
    this.setData({
      locationArr: nameArr,
      city: city,
      district: district,
      address: this.addressText(city, district)
    })
  },

  ageInput: function (e) {
    this.setData({
      age: e.detail.value
    })
  },

  experienceInput: function (e) {
    this.setData({
      experience: e.detail.value
    })
  },

  housingChange: function (e) {
    this.setData({
      housingIndex: Number(e.detail.value)
    })
  },

  employmentChange: function (e) {
    this.setData({
      employmentIndex: Number(e.detail.value)
    })
  },

  /** 保存资料；保存成功后只返回，不自动提交申请 */
  save: function () {
    if (this.data.saving) {
      return
    }
    var age = Number(this.data.age)
    if (!/^\d+$/.test(String(this.data.age)) || age < 10 || age > 100) {
      this.showToast('请输入10-100周岁的年龄')
      return
    }
    if (!this.data.city || !this.data.district) {
      this.showToast('请选择城市和区县')
      return
    }
    var housing = this.data.housingOptions[this.data.housingIndex]
    if (!housing || !housing.value) {
      this.showToast('请选择住房情况')
      return
    }
    var employment = this.data.employmentOptions[this.data.employmentIndex]
    if (!employment || !employment.value) {
      this.showToast('请选择工作状态')
      return
    }
    if ((this.data.experience || '').length > 200) {
      this.showToast('养宠经验最多200字')
      return
    }
    var body = {
      age: age,
      residence_city: this.data.city,
      residence_district: this.data.district,
      housing_type: housing.value,
      employment_status: employment.value,
      pet_experience: this.data.experience || ''
    }
    if (this.data.version > 0) {
      body.version = this.data.version
    }
    var that = this
    this.setData({ saving: true })
    adoption.saveAdoptionProfile(body).then(function (data) {
      var profile = adoption.profileFrom(data)
      that.setData({
        saving: false,
        version: profile.version > 0 ? profile.version : that.data.version
      })
      wx.showToast({
        title: '保存成功',
        icon: 'none'
      })
      setTimeout(function () {
        wx.navigateBack({
          delta: 1
        })
      }, 800)
    }).catch(function (error) {
      that.setData({ saving: false })
      that.handleError(error)
    })
  },

  handleError: function (error) {
    if (!error) {
      return
    }
    if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'SESSION_CHANGED') {
      wx.removeStorageSync('token')
      wx.removeStorageSync('userInfo')
      analytics.setUser(null)
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      wx.navigateTo({
        url: '/pages/login/login'
      })
      return
    }
    wx.showModal({
      title: '保存失败',
      content: error.message || '保存失败，请稍后重试。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  showToast: function (title) {
    wx.showToast({
      title: title,
      icon: 'none'
    })
  }
})
