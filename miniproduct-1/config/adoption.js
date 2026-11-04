// 领养申请 V2 网络封装
// V2 接口使用 Bearer token、JSON 请求体，并在非 2xx 时继续解析业务错误包。
const api = require('./api')

const HOUSING_OPTIONS = [
  { value: 'owned', label: '自有住房' },
  { value: 'whole_rent', label: '整租' },
  { value: 'shared_rent', label: '合租' },
  { value: 'with_family', label: '与家人同住' },
  { value: 'dormitory', label: '宿舍' },
  { value: 'other', label: '其他' }
]

const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: '在职' },
  { value: 'self_employed', label: '自由职业或个体经营' },
  { value: 'student', label: '学生' },
  { value: 'not_working', label: '暂未工作' },
  { value: 'retired', label: '退休' }
]

function text(value) {
  return typeof value === 'string' ? value : ''
}

function number(value) {
  const result = Number(value)
  return isNaN(result) ? 0 : result
}

function flag(value) {
  return value === true || value === 1 || value === '1'
}

function hasKeys(value) {
  return !!value && typeof value === 'object' && Object.keys(value).length > 0
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function errorMessage(json) {
  const data = json.data || {}
  if (data.errors && typeof data.errors === 'object') {
    return Object.keys(data.errors).sort().map(function (key) {
      const value = data.errors[key]
      const messages = Array.isArray(value) ? value : [String(value)]
      return key + ': ' + messages.join('、')
    }).join('\n')
  }
  return text(json.message) || '操作失败，请刷新重试'
}

function parseError(status, json) {
  const body = json && typeof json === 'object' ? json : {}
  const data = body.data && typeof body.data === 'object' ? body.data : {}
  const businessCode = number(body.code) || null
  let code = text(data.error_code) || text(body.error_code)
  if (!code && businessCode === null && typeof body.code === 'string') {
    code = body.code
  }
  return {
    status: status,
    code: code,
    message: errorMessage(body),
    businessCode: businessCode,
    retryAfter: number(data.retry_after) || number(body.retry_after) || null,
    data: data
  }
}

/**
 * 发起 V2 请求。成功条件为 HTTP 2xx 且 code == 200。
 */
function request(method, path, options) {
  options = options || {}
  const token = options.token !== undefined ? options.token : wx.getStorageSync('token')
  return new Promise(function (resolve, reject) {
    if (!token && options.allowAnonymous !== true) {
      reject({ status: 401, code: 'AUTH_REQUIRED', message: '请先登录', businessCode: 401 })
      return
    }
    let url = api.baseUrl + path
    if (options.query) {
      const query = Object.keys(options.query).map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(options.query[key])
      }).join('&')
      if (query) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + query
      }
    }
    const header = { 'Accept': 'application/json' }
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
    if (method !== 'GET') {
      header['Content-Type'] = 'application/json'
    }
    if (options.key) {
      header['Idempotency-Key'] = options.key
    }
    wx.request({
      url: url,
      method: method,
      header: header,
      data: method === 'GET' ? undefined : (options.body || {}),
      success: function (res) {
        const json = res.data && typeof res.data === 'object' ? res.data : {}
        if (res.statusCode >= 200 && res.statusCode < 300 && number(json.code) === 200) {
          resolve(json.data && typeof json.data === 'object' ? json.data : {})
        } else {
          reject(parseError(res.statusCode, json))
        }
      },
      fail: function () {
        reject({ status: 0, code: 'NETWORK', message: '网络异常，请刷新后重试', businessCode: null })
      }
    })
  })
}

function applicationState(topicID) {
  return request('GET', api.adoptionApplicationState + topicID + '/application-state')
}

function adoptionProfile() {
  return request('GET', api.adoptionProfile)
}

function saveAdoptionProfile(body) {
  return request('PUT', api.adoptionProfile, { body: body })
}

function submitApplication(topicID, body, key) {
  return request('POST', api.adoptionApplications + topicID + '/applications', {
    body: body,
    key: key
  })
}

function applicationDetail(applicationID) {
  return request('GET', api.adoptionApplicationDetail + applicationID)
}

function myApplications(query) {
  return request('GET', api.adoptionMyApplications, { query: query || {} })
}

function receivedApplications(query) {
  return request('GET', api.adoptionReceivedApplications, { query: query || {} })
}

function applicationNotifications(query) {
  return request('GET', api.adoptionNotifications, { query: query || {} })
}

function readNotification(notificationID) {
  return request('POST', api.adoptionNotificationRead + notificationID + '/read')
}

function updateApplication(applicationID, body, key) {
  return request('PATCH', api.adoptionApplicationDetail + applicationID, {
    body: body || {},
    key: key
  })
}

function completeAdoption(topicID, body, key) {
  return request('POST', api.adoptionStatus + topicID + '/status', {
    body: body || {},
    key: key
  })
}

function stateFrom(json) {
  const data = json || {}
  const app = hasKeys(data.application) ? data.application : data
  const workflowStatus = text(data.workflow_status)
  return {
    raw: data,
    id: number(app.application_id),
    status: text(app.application_status) || text(app.status),
    result: text(app.application_result) || text(app.result),
    owner: flag(data.can_manage),
    workflowStatus: workflowStatus,
    workflowEnded: workflowStatus === 'adopted' || workflowStatus === 'closed',
    canApply: workflowStatus === 'open' && flag(data.can_apply),
    authorized: flag(data.contact_authorized),
    version: number(data.workflow_version)
  }
}

function stateTitle(state) {
  if (!state) {
    return '状态暂不可用'
  }
  if (state.owner) {
    return '管理申请'
  }
  if (state.workflowEnded) {
    return '送养已结束'
  }
  if (state.workflowStatus !== 'open') {
    return '状态暂不可用'
  }
  switch (state.status) {
    case 'applying':
      return '申请中'
    case 'communicating':
      return state.authorized ? '查看联系方式' : '沟通中'
    case 'ended':
      return state.canApply && state.result === 'not_completed' ? '查看结果 / 重新申请' : '申请已结束'
    default:
      return state.canApply ? '申请领养' : '暂不可申请'
  }
}

function profileFrom(json) {
  const data = json || {}
  const profile = data.profile && typeof data.profile === 'object' ? data.profile : {}
  return {
    age: number(profile.age) > 0 ? String(number(profile.age)) : '',
    city: text(profile.residence_city),
    district: text(profile.residence_district),
    housing: text(profile.housing_type),
    employment: text(profile.employment_status),
    experience: text(profile.pet_experience),
    version: number(data.version) > 0 ? number(data.version) : number(profile.version),
    complete: flag(data.is_complete)
  }
}

function profileValid(profile) {
  if (!profile) {
    return false
  }
  const age = Number(profile.age)
  if (!/^\d+$/.test(String(profile.age)) || age < 10 || age > 100) {
    return false
  }
  if (!profile.city || !profile.district) {
    return false
  }
  const housingValid = HOUSING_OPTIONS.some(function (item) { return item.value === profile.housing })
  const employmentValid = EMPLOYMENT_OPTIONS.some(function (item) { return item.value === profile.employment })
  return housingValid && employmentValid && (profile.experience || '').length <= 200
}

function applicationFrom(json) {
  const data = json || {}
  const app = hasKeys(data.application) ? data.application : data
  const topic = app.topic && typeof app.topic === 'object' ? app.topic : {}
  return {
    raw: data,
    json: app,
    id: number(app.application_id),
    topic: topic,
    status: text(app.status),
    result: text(app.result),
    version: number(app.version)
  }
}

function applicationActive(application) {
  return !!application && (application.status === 'applying' || application.status === 'communicating')
}

function applicationTopicOpen(application) {
  if (!application) {
    return false
  }
  const topic = application.topic
  const available = number(topic.is_delete) === 1 && !flag(topic.unavailable)
  return available && !flag(topic.is_complete)
}

function applicationContact(application) {
  if (!application || !applicationTopicOpen(application) || !flag(application.topic.getedcontact)) {
    return ''
  }
  return text(application.topic.contact_info).trim()
}

function applicationStatusText(application) {
  if (!application) {
    return ''
  }
  if (application.status === 'ended' && application.result === 'not_completed' &&
      text(application.json.end_reason) === 'owner_ended' &&
      text(application.json.end_note) === '拒绝沟通申请') {
    return '被拒绝'
  }
  switch (application.status) {
    case 'applying':
      return '申请中'
    case 'communicating':
      return '沟通中'
    default:
      return application.result === 'completed' ? '已结束 · 完成送养（送养人报告）' : '已结束 · 未完成送养'
  }
}

function pad2(value) {
  return value < 10 ? '0' + value : String(value)
}

function applicationTime(value) {
  if (!value) {
    return ''
  }
  var date = new Date(value)
  if (isNaN(date.getTime())) {
    date = new Date(String(value).replace(/-/g, '/').replace('T', ' '))
  }
  if (isNaN(date.getTime())) {
    return value
  }
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate()) +
    ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds())
}

function firstImage(value) {
  var images = []
  function collect(item) {
    if (Array.isArray(item)) {
      item.forEach(collect)
      return
    }
    if (typeof item === 'string') {
      item.split(',').forEach(function (part) {
        var image = part.trim()
        if (image) {
          images.push(image)
        }
      })
    }
  }
  collect(value)
  return images.length > 0 ? images[0] : ''
}

function optionLabel(options, value) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].value === value) {
      return options[i].label
    }
  }
  return ''
}

function profileSummary(profile) {
  if (!hasKeys(profile)) {
    return '资料不可用'
  }
  var age = number(profile.age)
  var city = text(profile.residence_city)
  var district = text(profile.residence_district)
  var housing = optionLabel(HOUSING_OPTIONS, text(profile.housing_type)) || '未填写住房'
  var employment = optionLabel(EMPLOYMENT_OPTIONS, text(profile.employment_status)) || '未填写工作状态'
  return (age > 0 ? age + '岁' : '年龄未填写') + ' · ' + (city || '城市未填写') +
    (district ? ' ' + district : '') + '\n' + housing + ' · ' + employment
}

function applicationBadge(application) {
  if (application.status === 'applying') {
    return { text: '申请中', type: 'applying' }
  }
  if (application.status === 'communicating') {
    return { text: '沟通中', type: 'communicating' }
  }
  return {
    text: applicationStatusText(application) === '被拒绝' ? '被拒绝' : '已结束',
    type: 'ended'
  }
}

function receivedActions(application, topicOpen) {
  var actions = []
  if (application.status === 'applying') {
    if (topicOpen) {
      actions.push({ key: 'communicate', label: '同意沟通' })
    }
    actions.push({ key: 'reject', label: '拒绝申请' })
  } else if (application.status === 'communicating') {
    actions.push({ key: 'end', label: '结束沟通' })
    if (topicOpen) {
      actions.push({ key: 'complete', label: '完成送养' })
    }
  }
  return actions
}

/**
 * 将 V2 申请记录整理成列表页直接使用的字段。
 */
function applicationView(json) {
  var application = applicationFrom(json)
  var topic = application.topic
  var applicant = application.json.applicant && typeof application.json.applicant === 'object'
    ? application.json.applicant : {}
  var profile = application.json.profile_snapshot && typeof application.json.profile_snapshot === 'object'
    ? application.json.profile_snapshot : {}
  var topicAvailable = number(topic.is_delete) === 1 && !flag(topic.unavailable)
  var topicOpen = topicAvailable && !flag(topic.is_complete)
  var statusText = applicationStatusText(application)
  var badge = applicationBadge(application)
  var contact = applicationContact(application)
  var excerpt = text(topic.content_excerpt)
  return {
    id: application.id,
    topicId: number(topic.topic_id),
    status: application.status,
    version: application.version,
    statusText: statusText,
    badgeText: badge.text,
    badgeType: badge.type,
    hideStatusNote: applicationActive(application) || statusText === '被拒绝',
    createdAt: applicationTime(application.json.created_at),
    topicTitle: topicAvailable ? (excerpt || '查看送养帖子') : '帖子已删除或不可用',
    topicAvailable: topicAvailable,
    topicOpen: topicOpen,
    image: firstImage(topic.preview_img) || firstImage(topic.imgs),
    applicantName: text(applicant.nickname) || '已注销用户',
    applicantAvatar: text(applicant.avatar),
    profileSummary: profileSummary(profile),
    contact: contact,
    canCopy: !!contact,
    canWithdraw: applicationActive(application) && topicOpen,
    actions: receivedActions(application, topicOpen)
  }
}

function notificationView(json) {
  var data = json || {}
  return {
    id: number(data.id),
    message: text(data.message),
    createdAt: applicationTime(data.created_at),
    kind: text(data.kind),
    topicId: number(data.topic_id),
    applicationId: number(data.application_id),
    read: flag(data.read)
  }
}

function loadNotificationItems(page, values) {
  return applicationNotifications({
    page: page,
    size: 50,
    unread: 'true'
  }).then(function (data) {
    var items = Array.isArray(data.items) ? data.items : []
    var next = values.concat(items)
    if (flag(data.has_more)) {
      return loadNotificationItems(page + 1, next)
    }
    return next
  })
}

function loadMineApplicationIDs(page, ids) {
  return myApplications({
    page: page,
    size: 50
  }).then(function (data) {
    var items = Array.isArray(data.items) ? data.items : []
    items.forEach(function (item) {
      var id = number(item.application_id)
      if (id > 0) {
        ids[id] = true
      }
    })
    if (flag(data.has_more)) {
      return loadMineApplicationIDs(page + 1, ids)
    }
    return ids
  })
}

/**
 * 按申请归属拆分未读提醒，与 iOS 端消息入口角标一致。
 */
function notificationBuckets() {
  return loadNotificationItems(1, []).then(function (items) {
    return loadMineApplicationIDs(1, {}).then(function (ids) {
      var mine = []
      var received = []
      items.forEach(function (item) {
        var view = notificationView(item)
        if (view.id <= 0) {
          return
        }
        if (view.applicationId > 0 && ids[view.applicationId]) {
          mine.push(view)
        } else if (view.kind !== 'communicate' && view.kind !== 'refresh') {
          received.push(view)
        }
      })
      return {
        mine: mine,
        received: received,
        mineCount: mine.length,
        receivedCount: received.length
      }
    })
  })
}

function hasMore(data) {
  return flag(data && data.has_more)
}

module.exports = {
  HOUSING_OPTIONS: HOUSING_OPTIONS,
  EMPLOYMENT_OPTIONS: EMPLOYMENT_OPTIONS,
  uuid: uuid,
  request: request,
  applicationState: applicationState,
  adoptionProfile: adoptionProfile,
  saveAdoptionProfile: saveAdoptionProfile,
  submitApplication: submitApplication,
  applicationDetail: applicationDetail,
  myApplications: myApplications,
  receivedApplications: receivedApplications,
  applicationNotifications: applicationNotifications,
  readNotification: readNotification,
  updateApplication: updateApplication,
  completeAdoption: completeAdoption,
  stateFrom: stateFrom,
  stateTitle: stateTitle,
  profileFrom: profileFrom,
  profileValid: profileValid,
  applicationFrom: applicationFrom,
  applicationActive: applicationActive,
  applicationTopicOpen: applicationTopicOpen,
  applicationContact: applicationContact,
  applicationStatusText: applicationStatusText,
  applicationTime: applicationTime,
  firstImage: firstImage,
  profileSummary: profileSummary,
  applicationView: applicationView,
  notificationView: notificationView,
  notificationBuckets: notificationBuckets,
  hasMore: hasMore
}
