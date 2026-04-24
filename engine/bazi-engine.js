/**
 * 八字计算引擎 v2.1
 * 
 * 功能：出生日期 → 四柱干支 + 身强身弱 + 最旺五行 + 终极形态匹配
 * 
 * 算法依据：
 * - 身强身弱：计分权重法（同党得分 vs 异党得分，50分界线）
 * - 五行极值：108分制（月支40 + 3地支×12 + 4天干×8）
 * - 平局处理：月令优先 → 异党优先 → 天干透出优先
 * 
 * 浏览器端：通过 window.BaZiEngine 访问所有导出函数
 */
(function(global) {
  'use strict';

// ==================== 基础常量 ====================

const BA_ZI = {
  // 天干（10个）
  tianGan: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  // 天干→五行：0木 1火 2土 3金 4水
  tianGanWuXing: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
  // 地支（12个）
  diZhi: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  // 地支→五行（本气）：0木 1火 2土 3金 4水
  diZhiWuXing: [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 0],
  // 五行名称
  wuXingNames: ['木', '火', '土', '金', '水'],
  wuXingEmoji: ['🌱', '🔥', '⛰️', '⚔️', '🌊'],
  // 天干白话描述（用户展示用）
  tianGanDesc: [
    '参天大树型——天生向上、不服就干',   // 甲
    '花草藤蔓型——柔软但韧性十足',       // 乙
    '太阳型——天生自带光芒、照亮别人',   // 丙
    '烛火型——温柔细腻、暗夜中的光',     // 丁
    '大山型——稳重可靠、能扛大事',       // 戊
    '田园型——细腻包容、滋养万物',       // 己
    '利刃型——果断刚毅、说一不二',       // 庚
    '首饰型——精致讲究、内心有锋芒',     // 辛
    '大海型——深邃包容、势不可挡',       // 壬
    '细雨型——润物无声、聪慧灵动',       // 癸
  ],
};

// ==================== 日历工具 ====================

/**
 * 农历节气数据（节气近似时刻，用于判断月令）
 * 使用简化算法：按公历日期区间粗略判断月令
 * 每月以「节气」为分界线，不是农历初一
 */
const JIE_QI_MONTHS = [
  // [月份起始日, 月份结束日, 月支index]  (基于公历)
  // 小寒~立春 → 丑月, 立春~惊蛰 → 寅月, ...
  { monthStart: 1, dayStart: 6, monthEnd: 2, dayEnd: 3, zhi: 1 },   // 丑月 (小寒~立春)
  { monthStart: 2, dayStart: 4, monthEnd: 3, dayEnd: 5, zhi: 2 },   // 寅月 (立春~惊蛰)
  { monthStart: 3, dayStart: 6, monthEnd: 4, dayEnd: 4, zhi: 3 },   // 卯月 (惊蛰~清明)
  { monthStart: 4, dayStart: 5, monthEnd: 5, dayEnd: 5, zhi: 4 },   // 辰月 (清明~立夏)
  { monthStart: 5, dayStart: 6, monthEnd: 6, dayEnd: 5, zhi: 5 },   // 巳月 (立夏~芒种)
  { monthStart: 6, dayStart: 6, monthEnd: 7, dayEnd: 6, zhi: 6 },   // 午月 (芒种~小暑)
  { monthStart: 7, dayStart: 7, monthEnd: 8, dayEnd: 7, zhi: 7 },   // 未月 (小暑~立秋)
  { monthStart: 8, dayStart: 8, monthEnd: 9, dayEnd: 7, zhi: 8 },   // 申月 (立秋~白露)
  { monthStart: 9, dayStart: 8, monthEnd: 10, dayEnd: 7, zhi: 9 },  // 酉月 (白露~寒露)
  { monthStart: 10, dayStart: 8, monthEnd: 11, dayEnd: 7, zhi: 10 }, // 戌月 (寒露~立冬)
  { monthStart: 11, dayStart: 8, monthEnd: 12, dayEnd: 6, zhi: 11 }, // 亥月 (立冬~大雪)
  { monthStart: 12, dayStart: 7, monthEnd: 12, dayEnd: 31, zhi: 0 }, // 子月 (大雪~小寒)
  { monthStart: 1, dayStart: 1, monthEnd: 1, dayEnd: 5, zhi: 0 },   // 子月 (元旦~小寒)
];

/**
 * 根据公历日期获取月支index
 */
function getMonthZhi(month, day) {
  for (const jq of JIE_QI_MONTHS) {
    if (month === jq.monthStart && day >= jq.dayStart) return jq.zhi;
    if (month === jq.monthEnd && day <= jq.dayEnd) return jq.zhi;
    if (month > jq.monthStart && month < jq.monthEnd) return jq.zhi;
  }
  return 0; // fallback 子月
}

/**
 * 根据公历日期获取月干index
 * 规律：甲己之年丙作首，乙庚之岁戊为头...
 * 年干 % 5 → 月干起始index: 2(丙), 4(戊), 6(庚), 8(壬), 0(甲)
 */
function getMonthGan(yearGanIdx, monthZhiIdx) {
  const startGanMap = [2, 4, 6, 8, 0]; // 甲→丙起, 乙→戊起, ...
  const startGan = startGanMap[yearGanIdx % 5];
  return (startGan + monthZhiIdx) % 10;
}

/**
 * 根据公历日期获取日干index
 * 基准日：2000-01-07 = 甲子日 (index=0)
 */
function getDayGan(year, month, day) {
  const base = new Date(2000, 0, 7);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  return ((diffDays % 10) + 10) % 10;
}

/**
 * 根据公历日期获取日支index
 * 基准日：2000-01-07 = 子日 (index=0)
 */
function getDayZhi(year, month, day) {
  const base = new Date(2000, 0, 7);
  const target = new Date(year, month - 1, day);
  const diffDays = Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
  return ((diffDays % 12) + 12) % 12;
}

/**
 * 根据公历日期获取年干index
 */
function getYearGan(year) {
  // 公元年份 → 天干：(year - 4) % 10
  return ((year - 4) % 10 + 10) % 10;
}

/**
 * 根据公历日期获取年支index
 */
function getYearZhi(year) {
  // 公元年份 → 地支：(year - 4) % 12
  return ((year - 4) % 12 + 12) % 12;
}

/**
 * 根据日干和时辰获取时干index
 * 规律：甲己还加甲，乙庚丙作初...
 * 日干 % 5 → 时干起始index
 */
function getHourGan(dayGanIdx, hourZhiIdx) {
  const startGanMap = [0, 2, 4, 6, 8]; // 甲→甲起, 乙→丙起, ...
  const startGan = startGanMap[dayGanIdx % 5];
  return (startGan + hourZhiIdx) % 10;
}

/**
 * 小时 → 时辰地支index
 * 子时: 23-1, 丑时: 1-3, 寅时: 3-5, ...
 */
function getHourZhi(hour) {
  // 将23点归为子时(0), 0点也归为子时
  const adjusted = hour === 23 ? 0 : hour;
  return Math.floor((adjusted + 1) / 2) % 12;
}

// ==================== 四柱干支 ====================

function getFourPillars(year, month, day, hour = 12) {
  const yearGan = getYearGan(year);
  const yearZhi = getYearZhi(year);
  const monthZhi = getMonthZhi(month, day);
  const monthGan = getMonthGan(yearGan, monthZhi);
  const dayGan = getDayGan(year, month, day);
  const dayZhi = getDayZhi(year, month, day);
  const hourZhi = getHourZhi(hour);
  const hourGan = getHourGan(dayGan, hourZhi);

  return { yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi };
}

// ==================== 五行计算 ====================

/**
 * 获取某位置的五行
 */
function getWuXing(ganIdx, zhiIdx) {
  return {
    ganWuXing: BA_ZI.tianGanWuXing[ganIdx],
    zhiWuXing: BA_ZI.diZhiWuXing[zhiIdx],
  };
}

/**
 * 五行相生关系
 * 木(0)→火(1)→土(2)→金(3)→水(4)→木(0)
 */
const WU_XING_SHENG = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 0 };
/**
 * 五行相克关系
 * 木(0)克土(2), 火(1)克金(3), 土(2)克水(4), 金(3)克木(0), 水(4)克火(1)
 */
const WU_XING_KE = { 0: 2, 1: 3, 2: 4, 3: 0, 4: 1 };

/**
 * 判断是否为同党（同类 + 生我者）
 * @param {number} dayMasterWuXing 日主五行 (0-4)
 * @param {number} targetWuXing 目标五行 (0-4)
 */
function isSameParty(dayMasterWuXing, targetWuXing) {
  if (targetWuXing === dayMasterWuXing) return true; // 同类（比劫）
  if (WU_XING_SHENG[targetWuXing] === dayMasterWuXing) return true; // 生我者（印枭）
  return false;
}

// ==================== 身强身弱 ====================

/**
 * 计算身强身弱得分
 * @param {object} pillars - getFourPillars的返回值
 * @returns {{ score: number, isStrong: boolean }}
 */
function calcStrength(pillars) {
  const { monthZhi, yearZhi, dayZhi, hourZhi } = pillars;
  const dayMasterWX = BA_ZI.tianGanWuXing[pillars.dayGan];

  let score = 0;

  // 1. 月支（月令）—— 权重40分
  const monthZhiWX = BA_ZI.diZhiWuXing[monthZhi];
  if (isSameParty(dayMasterWX, monthZhiWX)) {
    score += 40; // 得令
  }
  // 失令 +0分，不加分

  // 2. 其他地支（年支、日支、时支）—— 每个12分
  const otherZhi = [yearZhi, dayZhi, hourZhi];
  for (const zhi of otherZhi) {
    const zhiWX = BA_ZI.diZhiWuXing[zhi];
    if (isSameParty(dayMasterWX, zhiWX)) {
      score += 12;
    }
  }

  // 3. 所有天干（年干、月干、日干、时干）—— 每个8分
  // 注意：日干也计入（日主自身也算8分，因为日主就是自己）
  const allGan = [pillars.yearGan, pillars.monthGan, pillars.dayGan, pillars.hourGan];
  for (const gan of allGan) {
    const ganWX = BA_ZI.tianGanWuXing[gan];
    if (isSameParty(dayMasterWX, ganWX)) {
      score += 8;
    }
  }

  return {
    score,
    isStrong: score >= 50,
  };
}

// ==================== 五行极值 ====================

/**
 * 计算八字中各五行的得分
 * @param {object} pillars - getFourPillars的返回值
 * @returns {{ scores: number[], maxElement: number, maxScore: number }}
 */
function calcWuXingScores(pillars) {
  const scores = [0, 0, 0, 0, 0]; // 木火土金水

  // 月支 40分
  scores[BA_ZI.diZhiWuXing[pillars.monthZhi]] += 40;

  // 年支、日支、时支 各12分
  scores[BA_ZI.diZhiWuXing[pillars.yearZhi]] += 12;
  scores[BA_ZI.diZhiWuXing[pillars.dayZhi]] += 12;
  scores[BA_ZI.diZhiWuXing[pillars.hourZhi]] += 12;

  // 年干、月干、日干、时干 各8分
  scores[BA_ZI.tianGanWuXing[pillars.yearGan]] += 8;
  scores[BA_ZI.tianGanWuXing[pillars.monthGan]] += 8;
  scores[BA_ZI.tianGanWuXing[pillars.dayGan]] += 8;
  scores[BA_ZI.tianGanWuXing[pillars.hourGan]] += 8;

  // 找最旺五行（含平局处理）
  const maxScore = Math.max(...scores);
  const maxElement = resolveTie(scores, pillars, maxScore);

  return { scores, maxElement, maxScore };
}

/**
 * 平局处理
 * 1. 月令优先：并列中谁占了月支谁赢
 * 2. 异党优先：都没占月令时，日主的异党（克/泄/耗）优先
 * 3. 天干透出优先：同为异党时，天干出现的那个赢
 */
function resolveTie(scores, pillars, maxScore) {
  const dayMasterWX = BA_ZI.tianGanWuXing[pillars.dayGan];
  const monthZhiWX = BA_ZI.diZhiWuXing[pillars.monthZhi];

  // 找出所有达到最高分的五行
  const candidates = [];
  for (let i = 0; i < 5; i++) {
    if (scores[i] === maxScore) candidates.push(i);
  }

  if (candidates.length === 1) return candidates[0];

  // 1. 月令优先
  const monthWinner = candidates.find(c => c === monthZhiWX);
  if (monthWinner !== undefined) return monthWinner;

  // 2. 异党优先（克我/我生/我克）
  const isYiDang = (wx) => {
    return wx === WU_XING_KE[dayMasterWX]  // 克我（官杀）
      || wx === WU_XING_SHENG[dayMasterWX] // 我生（食伤）
      || wx === WU_XING_KE[WU_XING_SHENG[dayMasterWX]]; // 我克（财）的推导：我生的五行所克的不对...
    // 正确推导：我克=我生的五行的所克？不对。
    // 直接定义：木克土，火克金，土克水，金克木，水克火
    // 异党 = 克我 + 我生 + 我克（除同类和生我之外的所有）
  };

  // 重新定义异党：非同党即为异党
  const isYiDangStrict = (wx) => {
    return !isSameParty(dayMasterWX, wx);
  };

  const yiDangCandidates = candidates.filter(c => isYiDangStrict(c));
  if (yiDangCandidates.length === 1) return yiDangCandidates[0];
  if (yiDangCandidates.length > 1) {
    // 3. 天干透出优先
    // 收集所有天干的五行
    const ganWuXings = [
      BA_ZI.tianGanWuXing[pillars.yearGan],
      BA_ZI.tianGanWuXing[pillars.monthGan],
      BA_ZI.tianGanWuXing[pillars.dayGan],
      BA_ZI.tianGanWuXing[pillars.hourGan],
    ];
    for (const ganWX of ganWuXings) {
      if (yiDangCandidates.includes(ganWX)) return ganWX;
    }
    // 都没有天干透出，返回第一个
    return yiDangCandidates[0];
  }

  // 所有候选都是同党（理论上不太可能），取第一个
  return candidates[0];
}

// ==================== 终极形态匹配 ====================

/**
 * 日主五行与最旺五行的关系映射
 * 每种日主对应5种最旺五行的形态ID
 * ID: A=我生(输出), B=我克(现实), C=克我(压力), D=生我(输入), E=同类(自我)
 * 
 * 但实际上是按最旺五行的种类来排列，不是按十神关系
 * 这里按 review-results.md 中的实际排列：
 *   木型：火/土/金/水/木 → A/B/C/D/E（但实际排列是火土金水木）
 *   火型：土/金/水/木/火 → A/B/C/D/E
 *   土型：金/水/木/火/土 → A/B/C/D/E
 *   金型：水/木/火/土/金 → A/B/C/D/E
 *   水型：木/火/土/金/水 → A/B/C/D/E
 */

// 最旺五行 → 形态ID偏移 (每种日主的5种形态按最旺五行排列)
// 对应关系：最旺五行index → 形态ID (A=0, B=1, C=2, D=3, E=4)
const FORM_ID_BY_ELEMENT = {
  // 木型日主：火(0)→A, 土(1)→B, 金(2)→C, 水(3)→D, 木(4)→E
  0: { 1: 0, 2: 1, 3: 2, 4: 3, 0: 4 },  // 日主木：火最旺→A, 土最旺→B, 金最旺→C, 水最旺→D, 木最旺→E
  // 火型日主：土(0)→A, 金(1)→B, 水(2)→C, 木(3)→D, 火(4)→E
  1: { 2: 0, 3: 1, 4: 2, 0: 3, 1: 4 },
  // 土型日主：金(0)→A, 水(1)→B, 木(2)→C, 火(3)→D, 土(4)→E
  2: { 3: 0, 4: 1, 0: 2, 1: 3, 2: 4 },
  // 金型日主：水(0)→A, 木(1)→B, 火(2)→C, 土(3)→D, 金(4)→E
  3: { 4: 0, 0: 1, 1: 2, 2: 3, 3: 4 },
  // 水型日主：木(0)→A, 火(1)→B, 土(2)→C, 金(3)→D, 水(4)→E
  4: { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 },
};

// 形态ID: 0=A(身强), 1=B(身弱)
// formIndex: 0-4 对应 A-J 中的两种（身强=偶数, 身弱=奇数）
// 形态Key: `{日主五行}_{formIndex}` 如 "0_3" = 木型第4种形态(D)

/**
 * 获取终极形态的Key
 * @param {number} dayMasterWX 日主五行 (0-4)
 * @param {number} maxElementWX 最旺五行 (0-4)
 * @param {boolean} isStrong 是否身强
 * @returns {string} 形态Key，如 "0_0" = 木型A形态
 */
function getFormKey(dayMasterWX, maxElementWX, isStrong) {
  const formMap = FORM_ID_BY_ELEMENT[dayMasterWX];
  const formIndex = formMap[maxElementWX]; // 0-4
  // 每个formIndex对应两个形态：偶数=身强(ID字母), 奇数=身弱(下一个字母)
  // formIndex 0 → 身强=A(0), 身弱=B(1)
  // formIndex 1 → 身强=C(2), 身弱=D(3)
  // formIndex 2 → 身强=E(4), 身弱=F(5)
  // formIndex 3 → 身强=G(6), 身弱=H(7)
  // formIndex 4 → 身强=I(8), 身弱=J(9)
  const variantIndex = isStrong ? formIndex * 2 : formIndex * 2 + 1;
  return `${dayMasterWX}_${variantIndex}`;
}

// ==================== 用神五行计算 ====================

/**
 * 用神五行推导表 v2.0（50条·含身强身弱）
 * 
 * 推导依据：十神生克关系 + 身强身弱承载力 + 通关化解
 * - 身强：能扛，宜"克泄耗"（修剪、泄秀、输出）
 * - 身弱：扛不住，宜"生扶"（补充、支撑、通关）
 * 
 * @param {number} dayMasterWX 日主五行 (0=木,1=火,2=土,3=金,4=水)
 * @param {number} maxElementWX 最旺五行 (0-4)
 * @param {boolean} isStrong 是否身强
 * @returns {number} 用神五行 (0-4)
 */
const CURE_ELEMENT_MAP = {
  // 木型日主
  0: { // 日主=木
    0: { strong: 3, weak: 4 },   // 最旺=木(同类) → 强:金(克), 弱:水(生)
    1: { strong: 2, weak: 4 },   // 最旺=火(我生) → 强:土(泄秀变现), 弱:水(回血克火)
    2: { strong: 1, weak: 0 },   // 最旺=土(我克) → 强:火(通关), 弱:木(帮身)
    3: { strong: 4, weak: 4 },   // 最旺=金(克我) → 强:水(通关), 弱:水(通关)
    4: { strong: 1, weak: 2 },   // 最旺=水(生我) → 强:火(泄秀), 弱:土(筑坝扎根)
  },
  // 火型日主
  1: { // 日主=火
    0: { strong: 2, weak: 2 },   // 最旺=木(生我) → 强:土(泄秀), 弱:土(泄秀输出)
    1: { strong: 4, weak: 0 },   // 最旺=火(同类) → 强:水(克), 弱:木(生)
    2: { strong: 3, weak: 0 },   // 最旺=土(我生) → 强:金(泄秀变现), 弱:木(生)
    3: { strong: 2, weak: 0 },   // 最旺=金(我克) → 强:土(通关), 弱:木(通关帮身)
    4: { strong: 2, weak: 0 },   // 最旺=水(克我) → 强:土(克水), 弱:木(通关化解)
  },
  // 土型日主
  2: { // 日主=土
    0: { strong: 1, weak: 1 },   // 最旺=木(克我) → 强:火(通关), 弱:火(通关)
    1: { strong: 3, weak: 3 },   // 最旺=火(生我) → 强:金(泄秀降温), 弱:金(泄秀降温)
    2: { strong: 0, weak: 1 },   // 最旺=土(同类) → 强:木(克), 弱:火(生)
    3: { strong: 4, weak: 1 },   // 最旺=金(我生) → 强:水(泄秀), 弱:火(回血)
    4: { strong: 0, weak: 1 },   // 最旺=水(我克) → 强:木(通关), 弱:火(帮身固坝)
  },
  // 金型日主
  3: { // 日主=金
    0: { strong: 1, weak: 2 },   // 最旺=木(我克) → 强:火(通关), 弱:土(帮身通关)
    1: { strong: 4, weak: 2 },   // 最旺=火(克我) → 强:水(对抗激发), 弱:土(通关化解)
    2: { strong: 4, weak: 4 },   // 最旺=土(生我) → 强:水(泄秀冲出), 弱:水(泄秀冲出)
    3: { strong: 1, weak: 2 },   // 最旺=金(同类) → 强:火(克), 弱:土(生)
    4: { strong: 0, weak: 2 },   // 最旺=水(我生) → 强:木(泄秀变现), 弱:土(回血克水)
  },
  // 水型日主
  4: { // 日主=水
    0: { strong: 1, weak: 3 },   // 最旺=木(我生) → 强:火(泄秀变现), 弱:金(回血)
    1: { strong: 0, weak: 3 },   // 最旺=火(我克) → 强:木(通关), 弱:金(帮身)
    2: { strong: 0, weak: 3 },   // 最旺=土(克我) → 强:木(对抗突破), 弱:金(通关化解)
    3: { strong: 0, weak: 0 },   // 最旺=金(生我) → 强:木(泄秀流通), 弱:木(泄秀化浊)
    4: { strong: 2, weak: 3 },   // 最旺=水(同类) → 强:土(克), 弱:金(生)
  },
};

function getCureElement(dayMasterWX, maxElementWX, isStrong) {
  const strength = isStrong ? 'strong' : 'weak';
  return CURE_ELEMENT_MAP[dayMasterWX][maxElementWX][strength];
}

// ==================== 主入口 ====================

/**
 * 完整的八字分析
 * @param {number} year  公历年
 * @param {number} month 公历月(1-12)
 * @param {number} day   公历日
 * @param {number} hour  小时(0-23)，可选
 * @returns {object} 完整分析结果
 */
function analyzeBaZi(year, month, day, hour = 12) {
  // 1. 四柱干支
  const pillars = getFourPillars(year, month, day, hour);

  // 2. 日主信息
  const dayMasterGan = pillars.dayGan;
  const dayMasterWX = BA_ZI.tianGanWuXing[dayMasterGan];

  // 3. 身强身弱
  const strength = calcStrength(pillars);

  // 4. 五行极值
  const wuXing = calcWuXingScores(pillars);

  // 5. 终极形态Key
  const formKey = getFormKey(dayMasterWX, wuXing.maxElement, strength.isStrong);

  // 6. 用神五行
  const cureElement = getCureElement(dayMasterWX, wuXing.maxElement, strength.isStrong);

  return {
    pillars,
    dayMasterGan,
    dayMasterWX,
    dayMasterName: BA_ZI.tianGan[dayMasterGan],
    dayMasterWuXingName: BA_ZI.wuXingNames[dayMasterWX],
    dayMasterEmoji: BA_ZI.wuXingEmoji[dayMasterWX],
    dayMasterDesc: BA_ZI.tianGanDesc[dayMasterGan],
    strength: {
      score: strength.score,
      isStrong: strength.isStrong,
      label: strength.isStrong ? '能量满格 🔋' : '潜力股 🪫',
      desc: strength.isStrong ? '天生就扛得住' : '别透支',
    },
    wuXing: {
      scores: wuXing.scores,
      maxElement: wuXing.maxElement,
      maxElementName: BA_ZI.wuXingNames[wuXing.maxElement],
      maxElementEmoji: BA_ZI.wuXingEmoji[wuXing.maxElement],
      maxScore: wuXing.maxScore,
    },
    formKey,
    cureElement: {
      wx: cureElement,
      name: BA_ZI.wuXingNames[cureElement],
      emoji: BA_ZI.wuXingEmoji[cureElement],
    },
  };
}

/**
 * 验证函数 — 用于开发调试
 * 返回可读的四柱干支字符串
 */
function formatPillars(pillars) {
  const B = BA_ZI;
  return {
    year: B.tianGan[pillars.yearGan] + B.diZhi[pillars.yearZhi],
    month: B.tianGan[pillars.monthGan] + B.diZhi[pillars.monthZhi],
    day: B.tianGan[pillars.dayGan] + B.diZhi[pillars.dayZhi],
    hour: B.tianGan[pillars.hourGan] + B.diZhi[pillars.hourZhi],
  };
}

// ==================== 导出 ====================
global.BaZiEngine = {
  getFourPillars,
  calcStrength,
  calcWuXingScores,
  getFormKey,
  getCureElement,
  analyzeBaZi,
  formatPillars,
  // 常量也导出，供其他模块引用
  BA_ZI,
};

})(typeof window !== 'undefined' ? window : this);
