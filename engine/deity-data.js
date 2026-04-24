/**
 * deity-data.js — 8神处方 + 认知偏差文案
 * 
 * 数据来源: deity-prescription.md + review-results.md 附录D
 * 
 * 匹配逻辑:
 * 1. 16型人格 → 主神 + 辅神
 * 2. 第15题核心困境 → 静心建议微调
 * 3. 第16题认知偏差 → 3种认知类型×16型 = 48条文案
 */
(function(global) {
  'use strict';

  // ==================== 8神基础信息 ====================
  var DEITIES = {
    wukong:    { name: '孙悟空',   emoji: '🐵', position: '破除心魔、勇猛精进',     product: '朱砂 / 红玛瑙' },
    nezha:     { name: '哪吒',     emoji: '🔥', position: '剔骨还心、重塑真我',     product: '绿檀 / 白菩提' },
    wenshu:    { name: '文殊菩萨', emoji: '🦁', position: '破迷开悟、照见本质',     product: '黄水晶 / 文殊智慧笔' },
    damo:      { name: '达摩祖师', emoji: '🧘', position: '面壁专注、一苇渡江',     product: '白水晶 / 菩提子' },
    guanyin:   { name: '观音大士', emoji: '🪷', position: '慈悲疗愈、寻声救苦',     product: '粉水晶 / 莲花手串' },
    dizang:    { name: '地藏菩萨', emoji: '🌍', position: '承载苦难、穿越幽暗',     product: '黑曜石 / 地藏牌' },
    guandi:    { name: '关圣帝君', emoji: '⚔️', position: '守住底线、重获力量',     product: '红玛瑙 / 关公像' },
    zhenwu:    { name: '真武大帝', emoji: '🛡️', position: '荡魔护身、重建根基',     product: '玄武令 / 黑碧玺' },
  };

  // ==================== 16型 → 主神辅神映射 ====================
  var TYPE_DEITY_MAP = {
    INTJ: { main: 'wenshu', sub: 'damo',    mainReason: '洞察全局→文殊的智慧匹配战略思维',     subReason: '面壁专注→达摩的定力辅助深度思考' },
    INTP: { main: 'wenshu', sub: 'wukong',  mainReason: '知识爆炸→文殊破迷开悟',              subReason: '行动破局→悟空打破思维茧房' },
    ENTJ: { main: 'zhenwu', sub: 'wenshu',  mainReason: '执行力拉满→真武的刚毅匹配领导力',     subReason: '战略清晰→文殊补充决策智慧' },
    ENTP: { main: 'wukong', sub: 'wenshu',  mainReason: '创意破局→悟空的颠覆力匹配发散思维',   subReason: '深度分析→文殊为灵感提供方向' },
    INFJ: { main: 'guanyin', sub: 'wenshu',  mainReason: '深度共情→观音的慈悲匹配渡人本能',     subReason: '洞察本质→文殊为直觉提供理性支撑' },
    INFP: { main: 'dizang',  sub: 'guanyin', mainReason: '内心承载→地藏的大愿匹配内在深度',     subReason: '疗愈自爱→观音的慈悲呵护柔软内心' },
    ENFJ: { main: 'guanyin', sub: 'zhenwu',  mainReason: '天然引导者→观音渡人的感染力',       subReason: '守护他人→真武为慈悲加上行动力' },
    ENFP: { main: 'wukong', sub: 'guanyin', mainReason: '灵感四射→悟空的创造力匹配热情',       subReason: '情绪管理→观音为热情加上边界感' },
    ISTJ: { main: 'guandi',  sub: 'damo',    mainReason: '守原则→关公的忠义匹配责任感',          subReason: '专注当下→达摩的面壁辅助坚持' },
    ISFJ: { main: 'guanyin', sub: 'guandi',  mainReason: '照顾他人→观音的慈悲匹配奉献精神',     subReason: '守住边界→关公的原则感补充边界' },
    ESTJ: { main: 'zhenwu', sub: 'guandi',  mainReason: '推进力强→真武的行动力匹配执行力',     subReason: '守底线→关公的原则为执行加上方向' },
    ESFJ: { main: 'guanyin', sub: 'guandi',  mainReason: '团队核心→观音的温暖匹配凝聚力',       subReason: '守住自己→关公的原则防止过度付出' },
    ISTP: { main: 'damo',    sub: 'nezha',   mainReason: '独立冷静→达摩的面壁专注匹配独处力',     subReason: '自由精神→哪吒的重塑鼓励突破' },
    ISFP: { main: 'nezha',   sub: 'guanyin', mainReason: '活出自我→哪吒的重塑匹配真实感',       subReason: '情感疗愈→观音的慈悲呵护敏感内心' },
    ESTP: { main: 'wukong', sub: 'zhenwu',  mainReason: '即刻行动→悟空的敏捷匹配冒险精神',     subReason: '稳健底盘→真武为行动加上定力' },
    ESFP: { main: 'nezha',   sub: 'wukong',  mainReason: '尽情绽放→哪吒的洒脱匹配自由精神',     subReason: '创意行动→悟空的自由为洒脱加油' },
  };

  // ==================== 核心困境 → 静心建议 ====================
  var DILEMMA_ADVICE = {
    output_overload: {
      label: '输出过度型',
      mainAdvice: '点燃一支线香，闭上眼睛，把今天所有的输出关掉5分钟。你不需要时刻发光，星星也是一闪一闪的',
      subAdvice: '允许自己「没有产出」的一天。休息不是偷懒，是给下一轮爆发蓄能',
    },
    input_choked: {
      label: '输入窒息型',
      mainAdvice: '关掉所有APP通知，选一件最小的事，今天只做这一件。不是因为简单，是因为你需要一个「开始」',
      subAdvice: '想法再多不如一个行动。先动起来，方向会在走的过程中出现',
    },
    pressure_crushed: {
      label: '压力摧残型',
      mainAdvice: '你现在最需要的不是更大的力量，而是一个安全的角落。允许自己暂时撤退，退一步不是认输，是保留反击的力气',
      subAdvice: '如果环境让你窒息，换一个。土壤不对，种子再好也长不出来',
    },
    lost_empty: {
      label: '迷失空虚型',
      mainAdvice: '迷茫说明你在找路。去找一件让你忘记看手机的事——那件事里藏着你真正的方向',
      subAdvice: '不要害怕「什么都不做」的时光。有时候，空白才是最好的画布',
    },
  };

  // ==================== 认知偏差文案 ====================
  // 3种认知类型 × 16型人格 = 48条
  var COGNITION_DATA = {
    high: {
      // 认知偏高：外界评价高于自我评价
      INTJ: { external: '天生战略家，什么都能掌控',        internal: '你只是在所有人行动之前，先把所有可能出错的路都想了一遍，然后选了一条最不坏的', advice: '你不需要预判一切，有时候直接走进去，门本身就是开着的' },
      INTP: { external: '聪明到让人有压力，什么都能拆解',   internal: '你拆开了100个问题，解决了0个。你不是在思考，你是在用思考逃避行动', advice: '想清楚第101个问题的同时，先去做第1个' },
      ENTJ: { external: '生来就是当领导的，执行力爆表',     internal: '你只是比大多数人更害怕失控，所以拼命控制一切', advice: '你不是必须一个人扛，偶尔示弱不是认输，是让别人有机会跟你一起走' },
      ENTP: { external: '脑洞大王，点子永远用不完',         internal: '点子确实用不完，但你的问题不是没想法，是没有一个想法你真的坚持到了最后', advice: '找一个让你觉得"boring但值得"的事，坚持做完它' },
      INFJ: { external: '洞察人心的智者，总能在关键时刻说出最对的话', internal: '你说出的每句"对的话"，都是因为你提前在脑子里彩排了800遍', advice: '你不需要预判别人的反应。试着不排练，说出第一句心里的话' },
      INFP: { external: '理想主义者，温柔又有力量',       internal: '你把"温柔"当成了不表达的借口。你不说话不是因为你大度，是因为你害怕冲突', advice: '你不需要和所有人和平共处，有些冲突恰恰说明你真的在意' },
      ENFJ: { external: '团队灵魂人物，天生的领导者',     internal: '你照顾了所有人，但你忘了问自己：我到底想不想当这个人', advice: '你可以不发光。偶尔关掉灯，看看谁会来找你' },
      ENFP: { external: '快乐源泉，永远充满能量',         internal: '你的"快乐"有50%是演出来的，因为你觉得如果不开心，就没有人会靠近你', advice: '真正喜欢你的人不需要你永远开心。你可以是那个也需要别人的人' },
      ISTJ: { external: '靠谱到变态，事情交给你一定没问题', internal: '你靠不靠谱取决于你为此放弃了多少自己的时间和感受', advice: '"靠谱"是个好标签，但不是你活着的全部意义' },
      ISFJ: { external: '温暖的照顾者，永远在替别人着想',   internal: '你替别人想了一万遍，却从没替自己说过一次"我需要"', advice: '你值得被照顾，不需要等别人发现你累了' },
      ESTJ: { external: '行动力最强的执行者，说到做到',   internal: '你的"说到做到"背后是对失控的深度恐惧。你不是勤奋，你是不敢停', advice: '停下来世界不会塌。你不是机器，允许自己有松懈的资格' },
      ESFJ: { external: '社交达人，人缘好到让人羡慕',     internal: '你花在维系关系上的精力，比你花在自己身上的多十倍', advice: '不用讨好所有人。真正的关系不需要你追着跑' },
      ISTP: { external: '冷酷的实干家，什么都会修',       internal: '你什么都会修，但你修不好自己的情绪。不是不会，是不敢碰', advice: '允许自己"坏掉"一次，不一定什么都要自己修' },
      ISFP: { external: '安静的艺术家，审美在线气质好',   internal: '你的"佛系"有一半是装的，你其实心里有很多想法但不知道怎么说', advice: '你不需要用沉默来保护自己，说出来也不会世界末日' },
      ESTP: { external: '行动力爆表，说干就干的行动派',   internal: '你的"果断"有时候只是冲动。快速做了决定之后，你得花三倍时间收拾烂摊子', advice: '快和好不矛盾。偶尔慢下来想一想，不丢人' },
      ESFP: { external: '聚会焦点，天生会带动气氛',       internal: '你害怕安静。一旦停下来，你就不知道自己是谁了', advice: '你不需要舞台灯光才能存在。一个人的时候你也值得被看见' },
    },
    low: {
      // 认知偏低：外界评价低于自我评价
      INTJ: { external: '沉闷，不太合群，有点冷淡',       internal: '你不是冷淡，你是在心里建了一座完整的城市，只是懒得给别人导游', advice: '你的内心世界很有价值。不用全部开放，但至少给一个人一把钥匙' },
      INTP: { external: '慵懒，不靠谱，整天在发呆',       internal: '你不是在发呆，你是在同时处理18个抽象概念。只是别人看不见你的操作系统', advice: '你不需要证明自己在"思考"。偶尔把结论说出来，别人才知道你没在浪费生命' },
      ENTJ: { external: '太强势，控制欲强，不好相处',     internal: '你只是效率太高，显得别人很慢。你心里其实很想找到跟得上节奏的伙伴', advice: '强势不是缺点，但你可以试试"慢半拍"。给别人追上来的时间' },
      ENTP: { external: '嘴碎，不靠谱，只会说不会做',     internal: '你说100句废话的时候，第101句其实是一个改变局面的好主意。可惜别人已经不听了', advice: '少说两句。把那股聪明劲儿放在一个地方，你比你自己想象的靠谱得多' },
      INFJ: { external: '安静、乖巧、没什么主见',         internal: '你的安静是战略性的。你在观察一切，只是在等一个值得开口的时机', advice: '你观察够了。现在轮到你了，说你想说的' },
      INFP: { external: '软弱、太敏感、容易受伤',         internal: '你不是软弱，你只是在用别人看不见的方式跟世界对抗。你的柔软就是你的铠甲', advice: '你不需要变成石头。柔软本身就有力量' },
      ENFJ: { external: '善良但有点圣母，容易被利用',     internal: '你不是圣母。你心里有一把尺子，量得比谁都清楚。你只是在等别人自己醒过来', advice: '别等了。有些人不值得你的善意，你心里知道是谁' },
      ENFP: { external: '浮躁、不成熟、整天嘻嘻哈哈',     internal: '你的快乐是真的，但快乐下面盖着一层别人看不到的认真和焦虑', advice: '你可以认真。认真的时候你不需要笑' },
      ISTJ: { external: '无趣、死板、不懂变通',         internal: '你不是无趣，你只是把有趣留给了真正重要的事。只是别人没到那个层次', advice: '试着展示一下你"不靠谱"的那一面，你会发现世界没塌' },
      ISFJ: { external: '老好人、没脾气、随便怎么样都行', internal: '"都行"是你最大的谎言。你心里有很明确的好恶，只是你觉得说出来会伤害别人', advice: '说出来。你不表达的意见最终会变成你的内耗' },
      ESTJ: { external: '专横、不讲情面、只会下指令',     internal: '你心里有柔软的部分，只是你太害怕一旦暴露柔软就会失去掌控力', advice: '你可以柔软。铁笼子关住的不仅是别人，也是你自己' },
      ESFJ: { external: '八卦、管太多、没有边界感',       internal: '你不是八卦，你是真的关心。只是你表达关心的方式需要升级了', advice: '关心不需要黏着。学会退后一步，给对方空间' },
      ISTP: { external: '冷漠、不在乎、跟谁都不亲',       internal: '你不是不在乎，你是在心里给每个人打分。只是及格的人不多', advice: '你可以让人靠近。冰山底下那部分，有人会喜欢' },
      ISFP: { external: '佛系、没上进心、活在自己的世界里', internal: '你有很强的价值观和审美判断力，只是你不觉得需要跟别人解释', advice: '你的世界很美。偶尔打开窗户，让别人也能看到' },
      ESTP: { external: '鲁莽、冲动、做事不经过大脑',     internal: '你的"冲动"其实是你处理信息的速度比别人快。你一秒钟做完的决定，别人要花一小时才能理解', advice: '你可以给别人解释一下你的逻辑。不是每个人都能跟上你的速度' },
      ESFP: { external: '肤浅、只知道玩、没有深度',       internal: '你不是肤浅，你只是在用最快的方式感受这个世界。肤浅的人感受不到你感受到的层次', advice: '你可以深沉。不用一直当那个负责气氛的人' },
    },
    accurate: {
      // 认知准确：自我认知与外界评价一致
      INTJ: { external: '你确实是有远见的人',              internal: '你的远见有时候会变成孤见。不是所有事情都需要你一个人看清楚', advice: '学会信任别人的判断力。你不需要垄断"正确"' },
      INTP: { external: '你确实思维活跃，对知识有天然的好奇', internal: '你的好奇心把你带到了100个领域，但从未在任何一块土地扎根', advice: '选一块地，种下去。好奇心不需要有边界，但行动需要' },
      ENTJ: { external: '你确实是天生的领导者',           internal: '你推动的事情太多了，有时候你需要停下来问自己：这是我要的，还是我能做的', advice: '效率不是人生的唯一KPI。有些事值得慢慢来' },
      ENTP: { external: '你确实点子多脑洞大',             internal: '你的点子太多了，多到连你自己都分不清哪个是真心想做的', advice: '挑一个最"无聊"但最有用的，坚持一年。你会感谢现在的决定' },
      INFJ: { external: '你确实共情能力强',               internal: '你的共情力有时候会让你太累。不是所有人的情绪都需要你来承接', advice: '学会区分"这是我的情绪"和"这是别人的情绪"' },
      INFP: { external: '你确实温柔且富有创造力',         internal: '你的温柔有时候变成了逃避冲突的借口，而你的创造力被完美主义拖了后腿', advice: '完成比完美重要。先拿出60分的作品，再打磨到90分' },
      ENFJ: { external: '你确实有感染力和凝聚力',         internal: '你太习惯照顾别人了，有时候忘了自己也需要被照顾', advice: '让别人来照顾你一次。你值得' },
      ENFP: { external: '你确实有感染力且充满活力',       internal: '你的活力有时候是靠消耗自己维持的。注意你的能量条', advice: '不是每场聚局都需要你去活跃气氛。偶尔坐在角落就好' },
      ISTJ: { external: '你确实靠谱且有执行力',           internal: '你的靠谱有时候变成了不灵活。有些事情需要"差不多"而不是"完全正确"', advice: '80%的正确+20%的灵活性 = 100%的生活智慧' },
      ISFJ: { external: '你确实善良且有服务精神',         internal: '你的善良有时候变成了不拒绝。但你需要学会说"不"来保护自己', advice: '"不"是一个完整的句子。试试看，不会有人因此离开你' },
      ESTJ: { external: '你确实高效且执行力强',           internal: '你的高效有时候让身边的人感到压力。适当放慢节奏也是一种领导力', advice: '偶尔放慢脚步，让别人跟上来。一个人走得快，一群人走得远' },
      ESFJ: { external: '你确实善于维系人际关系',         internal: '你的社交能力让你成为了所有人的朋友，但你需要更深层的连接', advice: '少一点社交，多一点深度交流。质量比数量重要' },
      ISTP: { external: '你确实动手能力强且冷静',         internal: '你的冷静有时候变成了冷漠。偶尔表达一下感受，不会少块肉', advice: '你解决得了所有技术问题，但人际关系的"bug"也需要修复' },
      ISFP: { external: '你确实有审美和艺术天赋',         internal: '你的审美让你对世界有了独特的感受，但你有时候需要把它分享出来', advice: '把你的世界打开一扇窗。你的审美值得被更多人看到' },
      ESTP: { external: '你确实果断且适应力强',           internal: '你的果断有时候变成了鲁莽。在做决定之前，多想三秒钟', advice: '快和好不矛盾。加上三秒钟的思考，你的行动力会更完美' },
      ESFP: { external: '你确实有感染力且享受当下',       internal: '你太享受当下了，有时候需要想想明天。不是每个问题都能用"开心就好"解决', advice: '享受当下的同时，偶尔为未来留一点准备' },
    },
  };

  // ==================== 导出 ====================
  global.DeityData = {
    DEITIES,
    TYPE_DEITY_MAP,
    DILEMMA_ADVICE,
    COGNITION_DATA,
  };

})(typeof window !== 'undefined' ? window : this);
