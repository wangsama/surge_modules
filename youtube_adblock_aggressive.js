/*
YouTube AdBlock Aggressive for Surge

作用：
1. 删除 playerResponse 里的 adPlacements / playerAds / adSlots 等字段
2. 删除 browse / next 返回中的广告卡片
3. 尽量保留正常视频、推荐、评论结构

注意：
YouTube 接口变化很快，本脚本不保证长期有效。
*/

let body = $response.body;

function removeAdKeys(obj) {
  if (!obj || typeof obj !== "object") return obj;

  const adKeySet = new Set([
    "adPlacements",
    "playerAds",
    "adSlots",
    "adBreakHeartbeatParams",
    "adEngagementPanels",
    "adSafetyReason",
    "adSurvey",
    "adParams",
    "adSignalsInfo",
    "adVideoId",
    "adLayoutLoggingData",
    "adSlotLoggingData",
    "adBreakServiceTrackingParams",
    "adPlaybackContextParams",
    "adTag",
    "linearAdSequenceRenderer",
    "companionAdRenderer",
    "promotedSparklesWebRenderer",
    "promotedVideoRenderer",
    "searchPyvRenderer",
    "carouselAdRenderer",
    "displayAdRenderer",
    "videoDisplayAdRenderer",
    "mealbarPromoRenderer",
    "statementBannerRenderer",
    "bannerPromoRenderer",
    "mastheadAd",
    "brandVideoSingletonRenderer"
  ]);

  if (Array.isArray(obj)) {
    return obj
      .map(removeAdKeys)
      .filter(item => !isAdNode(item));
  }

  for (const key of Object.keys(obj)) {
    if (adKeySet.has(key)) {
      delete obj[key];
      continue;
    }

    if (isAdNode(obj[key])) {
      delete obj[key];
      continue;
    }

    obj[key] = removeAdKeys(obj[key]);
  }

  return obj;
}

function isAdNode(node) {
  if (!node || typeof node !== "object") return false;

  let raw = "";

  try {
    raw = JSON.stringify(node);
  } catch (_) {
    return false;
  }

  const adMarkers = [
    "adPlacementRenderer",
    "promotedSparkles",
    "promotedVideoRenderer",
    "carouselAdRenderer",
    "displayAdRenderer",
    "videoDisplayAdRenderer",
    "searchPyvRenderer",
    "playerLegacyDesktopYpcOfferRenderer",
    "mealbarPromoRenderer",
    "statementBannerRenderer",
    "bannerPromoRenderer",
    "mastheadAd",
    "brandVideoSingletonRenderer",
    "sparklesLightCtaButtonRenderer",
    "fulfilledLayout",
    "googleads",
    "doubleclick",
    "pagead",
    "ad_debug_videoId",
    "ad_break"
  ];

  return adMarkers.some(marker => raw.includes(marker));
}

function cleanPlayerResponse(json) {
  delete json.adPlacements;
  delete json.playerAds;
  delete json.adSlots;
  delete json.adBreakHeartbeatParams;
  delete json.adEngagementPanels;

  if (json.playbackTracking) {
    delete json.playbackTracking.ptrackingUrl;
    delete json.playbackTracking.qoeUrl;
    delete json.playbackTracking.atrUrl;
  }

  if (json.playerConfig && json.playerConfig.mediaCommonConfig) {
    delete json.playerConfig.mediaCommonConfig.dynamicReadaheadConfig;
  }

  return json;
}

try {
  let json = JSON.parse(body);

  json = cleanPlayerResponse(json);
  json = removeAdKeys(json);

  body = JSON.stringify(json);
} catch (e) {
  console.log("YouTube AdBlock Aggressive parse error: " + e);
}

$done({ body });