// V4 埋点：单事件异步上报，无离线队列、无自动重试。
const api = require('../config/api.js')

const SESSION_KEY = 'analytics.v4.session'
const ENABLED_KEY = 'analytics.v4.collectionAllowed'
const IDLE_INTERVAL = 30 * 60 * 1000
const MAX_SEQUENCE = 2147483647

const PAGE_CODES = [
  'home', 'login',
  // 'publish_selector', 'publish_adoption', 'publish_find_pet', 'publish_show_pet',
  'topic_detail', 'messages', 'profile', 'adoption_profile',
  'message_list'
]
// const PUBLISH_PAGES = {
//   adoption: 'publish_adoption',
//   find_pet: 'publish_find_pet',
//   show_pet: 'publish_show_pet'
// }
const EVENT_PROPERTIES = {
  app_open: ['referrer_page'],
  app_quit: [],
  page_view: ['object_id', 'referrer_page', 'message_list_type'],
  login_click: ['login_method', 'referrer_page'],
  login_success: ['login_method'],
  login_failed: ['login_method', 'reason_code'],
  // publish_click: ['publish_type', 'referrer_page'],
  // publish_page_view: ['publish_type', 'referrer_page'],
  // publish_success: ['publish_type', 'object_id'],
  logout: [],
  logOff: [],
  export_image: ['publish_type', 'object_id'],
  export_video: ['publish_type', 'object_id'],
  click_video_ad: ['ad_placement', 'object_id'],
  video_ad_success: ['ad_placement', 'object_id', 'reward_attempt_id']
}
const TOKEN_REQUIRED = ['login_success', /* 'publish_success', */ 'logOff', 'click_video_ad', 'video_ad_success']
const ENUMS = {
  publish_type: ['adoption', 'find_pet', 'show_pet'],
  referrer_page: PAGE_CODES,
  login_method: ['password', 'sms', 'email', 'wechat', 'apple', 'other'],
  reason_code: ['invalid_credentials', 'invalid_code', 'account_unavailable', 'cancelled', 'network_error', 'provider_error', 'unknown'],
  message_list_type: ['like', 'collect', 'comment', 'system', 'find_pet', 'my_applications', 'received_applications'],
  ad_placement: ['my_posts', 'publish_success']
}
const MESSAGE_TYPES = {
  '1': 'like',
  '2': 'collect',
  '3': 'comment'
}

let enabled = true
let state = null
let lastPageCode = ''
let lastPageKey = ''

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function now() {
  return Date.now()
}

function createState() {
  return {
    anonymousID: uuid(),
    sessionID: uuid(),
    sequence: 0,
    lastInteraction: null,
    backgroundAt: null,
    userID: null
  }
}

function saveState() {
  if (state) {
    wx.setStorageSync(SESSION_KEY, state)
  }
}

function ensureState() {
  if (!state && enabled) {
    const stored = wx.getStorageSync(SESSION_KEY)
    if (stored && typeof stored === 'object' && stored.anonymousID && stored.sessionID) {
      state = {
        anonymousID: String(stored.anonymousID),
        sessionID: String(stored.sessionID),
        sequence: Number(stored.sequence) || 0,
        lastInteraction: stored.lastInteraction ? Number(stored.lastInteraction) : null,
        backgroundAt: stored.backgroundAt ? Number(stored.backgroundAt) : null,
        userID: stored.userID === null || stored.userID === undefined || stored.userID === '' ? null : Number(stored.userID)
      }
    } else {
      state = createState()
    }
    saveState()
  }
}

function endSession(userID) {
  if (!state) {
    return
  }
  state.sessionID = uuid()
  state.sequence = 0
  state.lastInteraction = null
  state.backgroundAt = null
  state.userID = userID === undefined ? state.userID : userID
  saveState()
}

function setUser(userID) {
  if (!enabled) {
    return
  }
  ensureState()
  let next = null
  if (userID !== null && userID !== undefined && userID !== '') {
    const value = Number(userID)
    next = isNaN(value) || value <= 0 ? null : value
  }
  const previous = state.userID
  if (previous !== null && previous !== next) {
    endSession(next)
  } else {
    state.userID = next
    saveState()
  }
}

function interaction() {
  if (!state) {
    return
  }
  const time = now()
  if (state.lastInteraction !== null && time - state.lastInteraction >= IDLE_INTERVAL) {
    endSession(state.userID)
  }
  state.lastInteraction = time
  saveState()
}

function nextSnapshot() {
  ensureState()
  if (!state) {
    return null
  }
  if (state.sequence >= MAX_SEQUENCE) {
    endSession(state.userID)
  }
  state.sequence += 1
  saveState()
  return {
    anonymous: state.anonymousID,
    session: state.sessionID,
    sequence: state.sequence
  }
}

function appVersion() {
  try {
    const info = wx.getAccountInfoSync()
    return String((info && info.miniProgram && info.miniProgram.version) || '').slice(0, 32)
  } catch (e) {
    return ''
  }
}

function isPositiveInteger(value) {
  return typeof value === 'number' && isFinite(value) && value > 0 && Math.floor(value) === value
}

function isUUID(value) {
  return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value)
}

function schemaValid(eventName, page, properties, token) {
  const allowed = EVENT_PROPERTIES[eventName]
  if (!allowed || !properties || typeof properties !== 'object' || Array.isArray(properties)) {
    return false
  }
  const keys = Object.keys(properties)
  for (let i = 0; i < keys.length; i += 1) {
    if (allowed.indexOf(keys[i]) === -1) {
      return false
    }
  }
  if (TOKEN_REQUIRED.indexOf(eventName) !== -1 && !token) {
    return false
  }
  if (eventName === 'page_view' && !page) {
    return false
  }
  if (page && PAGE_CODES.indexOf(page) === -1) {
    return false
  }
  for (const key in ENUMS) {
    if (properties[key] !== undefined && ENUMS[key].indexOf(properties[key]) === -1) {
      return false
    }
  }
  if (properties.object_id !== undefined && !isPositiveInteger(properties.object_id)) {
    return false
  }
  if (properties.reward_attempt_id !== undefined && !isUUID(properties.reward_attempt_id)) {
    return false
  }
  if (eventName === 'login_failed' && !properties.reason_code) {
    return false
  }
//   if (eventName === 'publish_page_view' && properties.publish_type && page !== PUBLISH_PAGES[properties.publish_type]) {
//     return false
//   }
//   if (eventName === 'publish_page_view' && !properties.publish_type) {
//     return false
//   }
  if ([/* 'publish_success', */ 'export_image', 'export_video'].indexOf(eventName) !== -1 &&
      (!properties.publish_type || properties.object_id === undefined)) {
    return false
  }
  if (['click_video_ad', 'video_ad_success'].indexOf(eventName) !== -1 &&
      (!properties.ad_placement || properties.object_id === undefined)) {
    return false
  }
  if (eventName === 'video_ad_success' && !properties.reward_attempt_id) {
    return false
  }
  if (eventName === 'page_view' && page === 'message_list' && !properties.message_list_type) {
    return false
  }
  if (properties.message_list_type !== undefined &&
      !(eventName === 'page_view' && page === 'message_list')) {
    return false
  }
  return true
}

function track(eventName, page, properties, options) {
  if (!enabled) {
    return false
  }
  ensureState()
  if (!state) {
    return false
  }
  options = options || {}
  if (options.touch) {
    interaction()
  }
  const token = wx.getStorageSync('token') || ''
  const props = properties || {}
  if (!schemaValid(eventName, page, props, token)) {
    return false
  }
  const propertyText = JSON.stringify(props)
  if (propertyText.length > 2048) {
    return false
  }
  const snapshot = nextSnapshot()
  if (!snapshot) {
    return false
  }
  const payload = {
    event_id: uuid(),
    event_name: eventName,
    anonymous_id: snapshot.anonymous,
    session_id: snapshot.session,
    sequence: snapshot.sequence,
    occurred_at: new Date().toISOString(),
    platform: 'other',
    app_version: appVersion(),
    properties: props
  }
  if (page) {
    payload.page = page
  }
  if (JSON.stringify(payload).length > 8192) {
    return false
  }
  const header = {
    'Content-Type': 'application/json'
  }
  if (token) {
    header.Authorization = 'Bearer ' + token
  }
  try {
    wx.request({
      url: String(api.baseUrl || '').replace(/\/$/, '') + '/api/v4/analytics/events/',
      method: 'POST',
      header: header,
      data: payload,
      timeout: 5000,
      success: function () {},
      fail: function () {}
    })
  } catch (e) {
    return false
  }
  return true
}

function currentRoute() {
  try {
    const pages = getCurrentPages()
    if (pages && pages.length > 0) {
      return pages[pages.length - 1].route || ''
    }
  } catch (e) {}
  return ''
}

function pageView(page, properties) {
  properties = properties || {}
  const route = currentRoute()
  const objectID = properties.object_id === undefined ? '' : String(properties.object_id)
  const messageType = properties.message_list_type === undefined ? '' : String(properties.message_list_type)
  const key = route + '|' + page + '|' + objectID + '|' + messageType
  if (key === lastPageKey) {
    return false
  }
  const props = {}
  if (lastPageCode) {
    props.referrer_page = lastPageCode
  }
  if (properties.object_id !== undefined) {
    props.object_id = Number(properties.object_id)
  }
  if (properties.message_list_type !== undefined) {
    props.message_list_type = properties.message_list_type
  }
  if (track('page_view', page, props, { touch: true })) {
    lastPageKey = key
    lastPageCode = page
    return true
  }
  return false
}

// function publishPageView(type) {
//   const page = PUBLISH_PAGES[type]
//   if (!page) {
//     return false
//   }
//   const route = currentRoute()
//   const key = route + '|' + page + '|publish'
//   if (key === lastPageKey) {
//     return false
//   }
//   const props = { publish_type: type }
//   if (lastPageCode) {
//     props.referrer_page = lastPageCode
//   }
//   if (track('publish_page_view', page, props, { touch: true })) {
//     lastPageKey = key
//     lastPageCode = page
//     return true
//   }
//   return false
// }

function loginClick() {
  const props = {}
  if (lastPageCode) {
    props.referrer_page = lastPageCode
  }
  track('login_click', null, props, { touch: true })
}

function loginSuccess(method, userID) {
  if (userID !== undefined && userID !== null) {
    setUser(userID)
  }
  track('login_success', null, { login_method: method || 'other' }, { touch: false })
}

function loginFailed(method, reason) {
  track('login_failed', null, {
    login_method: method || 'other',
    reason_code: reason || 'unknown'
  }, { touch: false })
}

// function publishClick(type) {
//   const props = {}
//   if (type) {
//     props.publish_type = type
//   }
//   if (lastPageCode) {
//     props.referrer_page = lastPageCode
//   }
//   track('publish_click', null, props, { touch: true })
// }

// function publishSuccess(type, objectID) {
//   track('publish_success', null, {
//     publish_type: type,
//     object_id: Number(objectID)
//   }, { touch: false })
// }

function logout() {
  track('logout', null, {}, { touch: true })
  setUser(null)
}

function logOff() {
  track('logOff', null, {}, { touch: true })
}

function onForeground(cold) {
  if (!enabled) {
    return
  }
  ensureState()
  if (!state) {
    return
  }
  const time = now()
  const longBackground = state.backgroundAt !== null && time - state.backgroundAt >= IDLE_INTERVAL
  const staleCold = cold && state.lastInteraction !== null && time - state.lastInteraction >= IDLE_INTERVAL
  if (longBackground || staleCold) {
    endSession(state.userID)
  }
  state.backgroundAt = null
  if (cold || longBackground) {
    state.lastInteraction = time
  }
  saveState()
  if (cold || longBackground) {
    track('app_open', null, {}, { touch: false })
  }
}

function onBackground() {
  if (!enabled) {
    return
  }
  ensureState()
  if (!state) {
    return
  }
  state.backgroundAt = now()
  saveState()
  track('app_quit', null, {}, { touch: false })
}

function setEnabled(value) {
  enabled = value !== false
  wx.setStorageSync(ENABLED_KEY, enabled)
  if (enabled) {
    state = null
    ensureState()
  } else {
    state = null
  }
}

function init() {
  const stored = wx.getStorageSync(ENABLED_KEY)
  enabled = stored === '' ? true : stored !== false
  if (enabled) {
    ensureState()
  }
}

init()

module.exports = {
  setUser: setUser,
  setEnabled: setEnabled,
  onForeground: onForeground,
  onBackground: onBackground,
  pageView: pageView,
  // publishPageView: publishPageView,
  loginClick: loginClick,
  loginSuccess: loginSuccess,
  loginFailed: loginFailed,
  // publishClick: publishClick,
  // publishSuccess: publishSuccess,
  logout: logout,
  logOff: logOff,
  track: track,
  messageType: function (msgType) {
    return MESSAGE_TYPES[String(msgType)] || ''
  }
}
