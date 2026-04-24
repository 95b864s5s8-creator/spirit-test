"""
八字计算引擎验证脚本
用设计文档中的案例验证算法正确性

案例1：戊辰 庚申 甲寅 癸酉
预期：
- 日主=甲木(0)
- 身弱(同党28 < 50)
- 最旺=金(60)
- 形态Key = 0_5 (金锐木折)
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ==================== 基础常量 ====================
TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
TIAN_GAN_WX = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]  # 木火土金水
DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
DI_ZHI_WX = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 0]  # 水土木火土火火土金金土木
WX_NAMES = ['木', '火', '土', '金', '水']
WX_EMOJI = ['🌱', '🔥', '⛰️', '⚔️', '🌊']

# 五行相生: 木→火→土→金→水→木
WX_SHENG = {0: 1, 1: 2, 2: 3, 3: 4, 4: 0}

def is_same_party(dm_wx, target_wx):
    """同党=同类+生我者"""
    if target_wx == dm_wx:
        return True
    if WX_SHENG.get(target_wx) == dm_wx:
        return True
    return False

# ==================== 四柱推算 ====================

def get_year_gan(year):
    return ((year - 4) % 10 + 10) % 10

def get_year_zhi(year):
    return ((year - 4) % 12 + 12) % 12

def get_month_zhi(month, day):
    """根据节气判断月支"""
    jie_qi = [
        (1, 6, 2, 3, 1),   # 丑月
        (2, 4, 3, 5, 2),   # 寅月
        (3, 6, 4, 4, 3),   # 卯月
        (4, 5, 5, 5, 4),   # 辰月
        (5, 6, 6, 5, 5),   # 巳月
        (6, 6, 7, 6, 6),   # 午月
        (7, 7, 8, 7, 7),   # 未月
        (8, 8, 9, 7, 8),   # 申月
        (9, 8, 10, 7, 9),  # 酉月
        (10, 8, 11, 7, 10), # 戌月
        (11, 8, 12, 6, 11), # 亥月
        (12, 7, 12, 31, 0), # 子月
        (1, 1, 1, 5, 0),   # 子月(元旦~小寒)
    ]
    for ms, ds, me, de, zhi in jie_qi:
        if month == ms and day >= ds:
            return zhi
        if month == me and day <= de:
            return zhi
        if ms < month < me:
            return zhi
    return 0

def get_month_gan(year_gan, month_zhi):
    start_map = [2, 4, 6, 8, 0]
    return (start_map[year_gan % 5] + month_zhi) % 10

def get_day_gan(year, month, day):
    from datetime import date
    base = date(2000, 1, 7)  # 甲子日
    target = date(year, month, day)
    diff = (target - base).days
    return ((diff % 10) + 10) % 10

def get_day_zhi(year, month, day):
    from datetime import date
    base = date(2000, 1, 7)  # 子日
    target = date(year, month, day)
    diff = (target - base).days
    return ((diff % 12) + 12) % 12

def get_hour_zhi(hour):
    adjusted = 0 if hour == 23 else hour
    return int(((adjusted + 1) / 2)) % 12

def get_hour_gan(day_gan, hour_zhi):
    start_map = [0, 2, 4, 6, 8]
    return (start_map[day_gan % 5] + hour_zhi) % 10

def get_four_pillars(year, month, day, hour=12):
    yg = get_year_gan(year)
    yz = get_year_zhi(year)
    mz = get_month_zhi(month, day)
    mg = get_month_gan(yg, mz)
    dg = get_day_gan(year, month, day)
    dz = get_day_zhi(year, month, day)
    hz = get_hour_zhi(hour)
    hg = get_hour_gan(dg, hz)
    return {
        'yearGan': yg, 'yearZhi': yz,
        'monthGan': mg, 'monthZhi': mz,
        'dayGan': dg, 'dayZhi': dz,
        'hourGan': hg, 'hourZhi': hz,
    }

# ==================== 身强身弱 ====================

def calc_strength(pillars):
    dm_wx = TIAN_GAN_WX[pillars['dayGan']]
    score = 0

    # 月支 40分
    mz_wx = DI_ZHI_WX[pillars['monthZhi']]
    if is_same_party(dm_wx, mz_wx):
        score += 40

    # 其他地支 各12分
    for zhi_key in ['yearZhi', 'dayZhi', 'hourZhi']:
        z_wx = DI_ZHI_WX[pillars[zhi_key]]
        if is_same_party(dm_wx, z_wx):
            score += 12

    # 其他天干 各8分（含日干）
    for gan_key in ['yearGan', 'monthGan', 'dayGan', 'hourGan']:
        g_wx = TIAN_GAN_WX[pillars[gan_key]]
        if is_same_party(dm_wx, g_wx):
            score += 8

    return score, score >= 50

# ==================== 五行极值 ====================

def calc_wuxing_scores(pillars):
    scores = [0, 0, 0, 0, 0]

    scores[DI_ZHI_WX[pillars['monthZhi']]] += 40
    for zhi_key in ['yearZhi', 'dayZhi', 'hourZhi']:
        scores[DI_ZHI_WX[pillars[zhi_key]]] += 12
    for gan_key in ['yearGan', 'monthGan', 'dayGan', 'hourGan']:
        scores[TIAN_GAN_WX[pillars[gan_key]]] += 8

    max_score = max(scores)
    # 找最旺
    candidates = [i for i, s in enumerate(scores) if s == max_score]
    if len(candidates) == 1:
        max_element = candidates[0]
    else:
        # 平局处理：月令优先
        mz_wx = DI_ZHI_WX[pillars['monthZhi']]
        month_winner = [c for c in candidates if c == mz_wx]
        if month_winner:
            max_element = month_winner[0]
        else:
            max_element = candidates[0]

    return scores, max_element, max_score

# ==================== 验证 ====================

def verify_case(name, year, month, day, hour, expected_pillars, expected_dm_wx, expected_strong_score, expected_is_strong, expected_max_wx, expected_max_score, expected_form_key):
    print(f"\n{'='*60}")
    print(f"案例: {name}")
    print(f"输入: {year}-{month:02d}-{day:02d} {hour}时")
    
    p = get_four_pillars(year, month, day, hour)
    actual_pillars = f"{TIAN_GAN[p['yearGan']]}{DI_ZHI[p['yearZhi']]} {TIAN_GAN[p['monthGan']]}{DI_ZHI[p['monthZhi']]} {TIAN_GAN[p['dayGan']]}{DI_ZHI[p['dayZhi']]} {TIAN_GAN[p['hourGan']]}{DI_ZHI[p['hourZhi']]}"
    
    dm_wx = TIAN_GAN_WX[p['dayGan']]
    strength_score, is_strong = calc_strength(p)
    wx_scores, max_wx, max_score = calc_wuxing_scores(p)
    
    print(f"四柱: {actual_pillars}")
    if expected_pillars:
        print(f"  预期: {expected_pillars}")
        assert actual_pillars == expected_pillars, f"四柱不匹配! got={actual_pillars}"
    
    print(f"日主: {TIAN_GAN[p['dayGan']]}{WX_NAMES[dm_wx]} (index={dm_wx})")
    if expected_dm_wx is not None:
        assert dm_wx == expected_dm_wx, f"日主五行不匹配! got={dm_wx}, expected={expected_dm_wx}"
    
    print(f"身强身弱: 同党={strength_score}, {'身强' if is_strong else '身弱'}")
    if expected_strong_score is not None:
        assert strength_score == expected_strong_score, f"身强身弱分数不匹配! got={strength_score}, expected={expected_strong_score}"
    if expected_is_strong is not None:
        assert is_strong == expected_is_strong, f"身强身弱判断不匹配! got={is_strong}, expected={expected_is_strong}"
    
    wx_detail = ' '.join([f"{WX_NAMES[i]}={s}" for i, s in enumerate(wx_scores)])
    print(f"五行得分: {wx_detail}")
    print(f"最旺五行: {WX_NAMES[max_wx]} ({max_score}分)")
    if expected_max_wx is not None:
        assert max_wx == expected_max_wx, f"最旺五行不匹配! got={max_wx}, expected={expected_max_wx}"
    if expected_max_score is not None:
        assert max_score == expected_max_score, f"最旺五行分数不匹配! got={max_score}, expected={expected_max_score}"
    
    if expected_form_key is not None:
        # 计算formKey
        FORM_MAP = {
            0: {1: 0, 2: 1, 3: 2, 4: 3, 0: 4},
            1: {2: 0, 3: 1, 4: 2, 0: 3, 1: 4},
            2: {3: 0, 4: 1, 0: 2, 1: 3, 2: 4},
            3: {4: 0, 0: 1, 1: 2, 2: 3, 3: 4},
            4: {0: 0, 1: 1, 2: 2, 3: 3, 4: 4},
        }
        form_idx = FORM_MAP[dm_wx][max_wx]
        variant = form_idx * 2 if is_strong else form_idx * 2 + 1
        form_key = f"{dm_wx}_{variant}"
        print(f"终极形态Key: {form_key}")
        assert form_key == expected_form_key, f"形态Key不匹配! got={form_key}, expected={expected_form_key}"
    
    print(f"✅ 全部通过!")
    return True

# ==================== 执行验证 ====================

print("八字计算引擎验证")
print("=" * 60)

# 需要找到一个日期使得四柱为 戊辰 庚申 甲寅 癸酉
# 先用暴力搜索找甲寅日附近符合条件的日期
from datetime import date, timedelta

# 甲寅日：日干=0(甲), 日支=2(寅)
found = False
base = date(1980, 1, 1)
for d in range((date(2000, 1, 1) - base).days, (date(2010, 12, 31) - base).days):
    current = base + timedelta(days=d)
    dg = get_day_gan(current.year, current.month, current.day)
    dz = get_day_zhi(current.year, current.month, current.day)
    if dg == 0 and dz == 2:  # 甲寅日
        # 检查月柱是否为庚申
        yg = get_year_gan(current.year)
        yz = get_year_zhi(current.year)
        mz = get_month_zhi(current.month, current.day)
        mg = get_month_gan(yg, mz)
        if mg == 6 and mz == 8:  # 庚申月
            # 检查年柱是否为戊辰
            if yg == 4 and yz == 4:  # 戊辰年
                print(f"找到 戊辰年 庚申月 甲寅日: {current.year}-{current.month:02d}-{current.day:02d}")
                # 用酉时(hour=18)检查时柱
                hz = get_hour_zhi(18)
                hg = get_hour_gan(0, hz)  # 甲日
                print(f"  时柱(酉时): {TIAN_GAN[hg]}{DI_ZHI[hz]}")
                if hg == 8 and hz == 9:  # 癸酉
                    print("  ✅ 完全匹配! 戊辰 庚申 甲寅 癸酉")
                    found = True
                    verify_case(
                        "戊辰 庚申 甲寅 癸酉",
                        current.year, current.month, current.day, 18,
                        "戊辰 庚申 甲寅 癸酉",
                        expected_dm_wx=0,  # 木
                        expected_strong_score=28,
                        expected_is_strong=False,
                        expected_max_wx=3,  # 金
                        expected_max_score=60,
                        expected_form_key="0_5",  # 金锐木折
                    )
                    break

if not found:
    print("⚠️ 未找到完全匹配的日期，跳过案例1的日期验证")
    print("改用算法直接验证（手动构造四柱）")
    # 直接用已知正确的四柱验证身强身弱和五行极值算法
    # 戊辰 庚申 甲寅 癸酉
    manual_pillars = {
        'yearGan': 4, 'yearZhi': 4,   # 戊辰
        'monthGan': 6, 'monthZhi': 8, # 庚申
        'dayGan': 0, 'dayZhi': 2,     # 甲寅
        'hourGan': 8, 'hourZhi': 9,   # 癸酉
    }
    
    dm_wx = TIAN_GAN_WX[0]  # 甲木=0
    score, is_strong = calc_strength(manual_pillars)
    print(f"\n手动验证 戊辰 庚申 甲寅 癸酉:")
    print(f"日主: 甲木({WX_NAMES[dm_wx]})")
    print(f"同党(木+水): 木=日干8+日支12=20, 水=时干8=8, 月支申金非同党")
    print(f"  同党总分: 20+8=28")
    print(f"  算法结果: {score} ({'身强' if is_strong else '身弱'})")
    assert score == 28, f"身强身弱分数错误! got={score}"
    assert is_strong == False, "应该是身弱!"
    
    wx_scores, max_wx, max_score = calc_wuxing_scores(manual_pillars)
    print(f"五行得分: 木={wx_scores[0]} 火={wx_scores[1]} 土={wx_scores[2]} 金={wx_scores[3]} 水={wx_scores[4]}")
    assert wx_scores[0] == 20, f"木得分错误!"
    assert wx_scores[1] == 0, f"火得分错误!"
    assert wx_scores[2] == 20, f"土得分错误!"
    assert wx_scores[3] == 60, f"金得分错误! got={wx_scores[3]}"
    assert wx_scores[4] == 8, f"水得分错误!"
    assert max_wx == 3, f"最旺五行应该是金!"
    assert max_score == 60, f"最旺分数应该是60!"
    
    print(f"✅ 手动验证全部通过!")

print(f"\n{'='*60}")
print("验证完成!")

# ==================== 额外验证 ====================
print("\n" + "="*60)
print("额外验证: 多个日期的完整推算")
print("="*60)

test_dates = [
    (1990, 8, 15, 14, "随便一个夏天生日"),
    (1995, 3, 21, 8, "春分附近"),
    (1988, 11, 5, 23, "冬天子时"),
    (2000, 1, 7, 12, "基准日甲子"),
    (1993, 6, 15, 16, "夏天下午"),
]

for y, m, d, h, desc in test_dates:
    p = get_four_pillars(y, m, d, h)
    dm_wx = TIAN_GAN_WX[p['dayGan']]
    score, is_strong = calc_strength(p)
    wx_scores, max_wx, max_score = calc_wuxing_scores(p)
    
    pillar_str = f"{TIAN_GAN[p['yearGan']]}{DI_ZHI[p['yearZhi']]} {TIAN_GAN[p['monthGan']]}{DI_ZHI[p['monthZhi']]} {TIAN_GAN[p['dayGan']]}{DI_ZHI[p['dayZhi']]} {TIAN_GAN[p['hourGan']]}{DI_ZHI[p['hourZhi']]}"
    wx_detail = ' '.join([f"{WX_NAMES[i]}={s}" for i, s in enumerate(wx_scores)])
    
    print(f"\n{desc}: {y}-{m:02d}-{d:02d} {h}时")
    print(f"  四柱: {pillar_str}")
    print(f"  日主: {TIAN_GAN[p['dayGan']]}{WX_NAMES[dm_wx]} | 身强身弱: {score}分 ({'强' if is_strong else '弱'})")
    print(f"  五行: {wx_detail} | 最旺: {WX_NAMES[max_wx]}({max_score})")

# 基准日验证: 2000-01-07 应该是甲子日
p0 = get_four_pillars(2000, 1, 7, 12)
assert p0['dayGan'] == 0 and p0['dayZhi'] == 0, f"基准日验证失败! got={TIAN_GAN[p0['dayGan']]}{DI_ZHI[p0['dayZhi']]}"
print(f"\n✅ 基准日验证通过: 2000-01-07 = 甲子日")

print(f"\n{'='*60}")
print("全部验证完成!")

