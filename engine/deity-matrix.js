/**
 * deity-matrix.js — 守护神映射矩阵 v3.0
 * 
 * 算法：用神五行(5) × MBTI阵营(4) = 20格 → 19位守护神（含1位Tie-Breaker备选）
 * 输入：cureElement(0-4) + type16('INTJ'等) → 主神 + 三幕结论文案
 * 
 * v3.0 变化：
 *   - DEITIES 全部升级为存在维度定位（position/quote/product）
 *   - CONCLUSIONS 从4层结构升级为三幕叙事（act1请神/act2验神/act3用神）
 *   - 复用神（哪吒/东岳/悟空）各有独立第一幕，差异化增强
 * 
 * 数据来源：deity-matrix-algorithm.md + cure-element-v2.md
 */
(function(global) {
  'use strict';

  // ==================== 阵营映射 ====================
  // 16型 → MBTI阵营（4种）
  var TYPE_TO_CAMP = {
    INTJ: 'NT', INTP: 'NT', ENTJ: 'NT', ENTP: 'NT',
    INFJ: 'NF', INFP: 'NF', ENFJ: 'NF', ENFP: 'NF',
    ISTJ: 'SJ', ISFJ: 'SJ', ESTJ: 'SJ', ESFJ: 'SJ',
    ISTP: 'SP', ISFP: 'SP', ESTP: 'SP', ESFP: 'SP',
  };

  var CAMP_INFO = {
    NT: { name: '', emoji: '🧠' },
    NF: { name: '', emoji: '💜' },
    SJ: { name: '', emoji: '⚓' },
    SP: { name: '', emoji: '🔥' },
  };

  // 用神五行编号 → 名称/emoji（与 bazi-engine.js BA_ZI.wuXingNames/Emoji 一致）
  var WX_INFO = [
    { name: '木', emoji: '🌱' },
    { name: '火', emoji: '🔥' },
    { name: '土', emoji: '⛰️' },
    { name: '金', emoji: '⚔️' },
    { name: '水', emoji: '🌊' },
  ];

  // ==================== 19位守护神完整数据 ====================
  var DEITIES = {
    // ---- 木行神明（生命力与生长 — 你枯了吗） ----
    wenshu: {
      name: '文殊菩萨', emoji: '🦁',
      element: '木',
      position: '看穿虚妄的智慧——不是给你答案，是帮你看到什么该放下',
      quote: '般若之剑，斩的不是敌人，是你脑子里多余的选项',
      product: '黄水晶、文殊智慧笔',
    },
    yuelao: {
      name: '月老星君', emoji: '🌙',
      element: '木',
      position: '关系的真相——不是帮你绑住谁，是帮你看到关系真正的样子',
      quote: '红线不是绳子，是镜子。照出你到底在抓什么',
      product: '红线手串、桃花水晶',
    },
    wenchang: {
      name: '文昌帝君', emoji: '📚',
      element: '木',
      position: '暗中做的事终会结果——你默默做过的一切，时间会替你兑现',
      quote: '你浇过的水不会蒸发，它会流到该浇的根上',
      product: '文昌塔、檀木手串',
    },
    leishen: {
      name: '九天应元雷声普化天尊', emoji: '⚡',
      element: '木',
      position: '打破僵局的力量——劈掉挡路的东西，让新的能进来',
      quote: '一雷惊醒梦中人。但梦里的人不觉得在梦',
      product: '雷击木手串、雷击枣木',
    },

    // ---- 火行神明（温度与存在感 — 你被看见了吗） ----
    guandi: {
      name: '关圣帝君', emoji: '⚔️',
      element: '火',
      position: '认准了就不回头——不是勇敢，是清楚自己要什么',
      quote: '过五关斩六将，从来不写可行性报告',
      product: '关公摆件、红玛瑙',
    },
    nezha: {
      name: '哪吒三太子', emoji: '🔥',
      element: '火',
      position: '重塑自我的勇气——不是叛逆，是有能力决定"我是谁"',
      quote: '我命由我不由天。但这句话不是喊出来的，是活出来的',
      product: '莲花手串、火焰挂件',
    },
    yangjian: {
      name: '杨戬真君', emoji: '🐂',
      element: '火',
      position: '守住边界的力量——不是冷酷，是分得清"你的事"和"我的事"',
      quote: '哮天犬守的不是路，是边界。踏进来一步，别怪我不客气',
      product: '三尖刀挂件、黑曜石',
    },
    huode: {
      name: '火德星君', emoji: '☀️',
      element: '火',
      position: '被看见的力量——不是追求关注，是让自己的存在本身就有光',
      quote: '太阳不追着谁跑，但它在那，所有人都看得见',
      product: '朱砂手串、红玛瑙挂件',
    },

    // ---- 土行神明（根基与归属 — 你站得稳吗） ----
    dongyue: {
      name: '东岳大帝', emoji: '⛰️',
      element: '土',
      position: '定海的力量——不是消除焦虑，是让你知道"这里不会塌"',
      quote: '泰山不知道明天下不下雨，但它知道自己不会塌',
      product: '泰山石敢当、玉石摆件',
    },
    dizang: {
      name: '地藏王菩萨', emoji: '🌍',
      element: '土',
      position: '不放弃任何人的陪伴——不是替你扛，是在最深处陪你站着',
      quote: '地狱不空誓不成佛。他蹲在你最深的坑里，等你站',
      product: '地藏经手串、黑曜石',
    },
    houtu: {
      name: '后土娘娘', emoji: '🏔️',
      element: '土',
      position: '无条件托底——什么都不做也不被抛弃的安全感',
      quote: '大地不说"你得长点什么"，它就托着你',
      product: '黄玉石、大地色手串',
    },
    chenghuang: {
      name: '城隍爷', emoji: '🏯',
      element: '土',
      position: '一方守护的力量——不是外面的城墙，是你心里的那个地基',
      quote: '城隍守的不是城，是人心里的那根柱子',
      product: '城隍符、城隍手串',
    },

    // ---- 金行神明（切割与判断 — 你断得了吗） ----
    wukong: {
      name: '齐天大圣', emoji: '🐵',
      element: '金',
      position: '把反叛变成力量——不是顺从，是找到值得投入的路',
      quote: '踏碎凌霄不是目的，找到自己的路才是',
      product: '朱砂手串、大圣摆件',
    },
    damo: {
      name: '达摩祖师', emoji: '🧘',
      element: '金',
      position: '停下来的力量——不是放弃思考，是允许自己不急',
      quote: '面壁九年不是在想答案，是等答案自己来',
      product: '达摩挂件、檀木手串',
    },
    caishen: {
      name: '财神爷', emoji: '💰',
      element: '金',
      position: '尊重自己的价值——不是贪财，是知道自己的分量',
      quote: '义中取财。不值钱的免费送，值钱的要收好',
      product: '招财手串、貔貅挂件',
    },
    zhongkui: {
      name: '钟馗天师', emoji: '👻',
      element: '金',
      position: '斩断混乱的力量——不是心狠，是知道什么该留什么该走',
      quote: '一剑斩妖魔，不斩的是自己人',
      product: '钟馗挂件、黑曜石',
    },

    // ---- 水行神明（柔韧与变通 — 你卡住了吗） ----
    laojun: {
      name: '太上老君', emoji: '☯️',
      element: '水',
      position: '以柔克刚的智慧——不是认输，是找到更聪明的路',
      quote: '水不跟石头硬刚，它绕过去。一百年后石头圆了',
      product: '太极挂件、道家香',
    },
    guanyin: {
      name: '观世音菩萨', emoji: '🪷',
      element: '水',
      position: '慈悲的边界——不是不帮人，是知道先把自己活好才能帮人',
      quote: '先把自己灌满，溢出来的才叫慈悲',
      product: '莲花手串、粉水晶',
    },
    zhenwu: {
      name: '真武大帝', emoji: '🛡️',
      element: '水',
      position: '稳定中的灵活——不是不稳定，是稳得够实所以敢动',
      quote: '最坚固的墙不是不动，是该动的时候敢动',
      product: '玄武挂件、黑檀手串',
    },
    longwang: {
      name: '东海龙王', emoji: '🐉',
      element: '水',
      position: '掌控节奏——不是随波逐流，是知道什么时候该顺什么时候该逆',
      quote: '潜龙勿用不是认怂，是在等水位够了再起飞',
      product: '龙形吊坠、海蓝宝',
    },
    mazu: {
      name: '妈祖', emoji: '🏔️',
      element: '水',
      position: '在风暴中看清方向——不是不害怕，是害怕的时候还能看见路',
      quote: '海上有灯，就不怕暗。但灯不会替你划船',
      product: '妈祖吊坠、海洋水晶',
    },
  };

  // ==================== 20格矩阵 ====================
  // MATRIX[用神五行编号][阵营] = 神明key
  // 用神五行: 0=木, 1=火, 2=土, 3=金, 4=水
  // 阵营: NT, NF, SJ, SP
  var MATRIX = {
    0: { NT: 'wenshu',   NF: 'yuelao',  SJ: 'wenchang', SP: 'leishen' },
    1: { NT: 'guandi',   NF: 'nezha',   SJ: 'huode',   SP: 'yangjian' },
    2: { NT: 'dongyue',  NF: 'dizang',  SJ: 'chenghuang', SP: 'houtu' },
    3: { NT: 'damo',     NF: 'wukong',  SJ: 'caishen',  SP: 'zhongkui' },
    4: { NT: 'laojun',   NF: 'guanyin', SJ: 'zhenwu',   SP: 'longwang'},
  };

  // ==================== 20格结论文案（三幕叙事）====================
  // v3.0 结构：{ act1(请神·敬畏), act2(验神·共鸣), act3(用神·想动手) }
  // 情绪曲线：哇 → 是我 → 我要试试
  // 文案来源：deity-prescription-v2.md
  var CONCLUSIONS = {
    // ===== 木行 =====
    '0_NT': {
      act1: '五台山清凉石上，文殊手持慧剑，一剑劈开云雾。诸菩萨中，唯他管"斩"。不斩妖魔，斩虚妄——你脑子里那些"不可能"，在他剑下都是雾。',
      act2: '他专门帮那种"想太多做太少"的人。800个可能性同时弹出来的时候，别人懵了，他一剑下去，留一个，其余全砍掉。所以他能帮你——他让你不再纠结"选哪个"，而是"先选一个"。',
      act3: '他教你一招：数到三，直接动。不用想明白再动，动起来答案自然就有了。',
    },
    '0_NF': {
      act1: '月老手中的红线，不是绑人的绳子，是照妖镜。他管的是"看清"——让你看见你抓着的到底是什么。你以为你在爱，他让你看看那是爱还是恐惧。',
      act2: '他能帮你搞清楚一件事：你到底是爱这个人，还是害怕一个人待着。太多人分不清这两件事，把"害怕孤独"当成了"非ta不可"。他手里那面镜子，专照这种盲区。',
      act3: '他给你一个底线：跟任何人在一起，心里永远留三成给自己。给了七成就够了，剩下的给自己留着。',
    },
    '0_SJ': {
      act1: '文昌帝君掌天下文运。但他记的不是考卷上的分数——他记的是每个人暗中做过的事。你浇过的水、读过的书、扛过的夜，他都有本账。',
      act2: '他帮你解决一个问题：总觉得自己"还没准备好"。他不管你准备得怎么样，做了他就记，没做他连看都不看。所以他特别适合那种"想做到完美再出手"的人——他告诉你，根本不需要完美。',
      act3: '他说得很简单：搁了一周以上的事，今天只做第一步。做到什么程度无所谓，动了就行。',
    },
    '0_SP': {
      act1: '九天之上，雷声一震，万木震颤。雷神管的是"破"——不是温柔地推开门，是从天上劈下去。墙碎了就是路，旧的不去，新的进不来。',
      act2: '他专治"试试看"——试了三天没效果就放弃的人太多了。他不管你准没准备好，他直接劈。所以他适合帮那种"万事俱备就是不动"的人——他帮你把那堵挡路的墙直接砸了。',
      act3: '他说：别"试试"了，直接干。挑一件你说过"试试看"但还没真正动手的事，今天做完它。',
    },

    // ===== 火行 =====
    '1_NT': {
      act1: '关公单刀赴会的时候，没有人给他写可行性报告。过五关斩六将，靠的不是兵力——是"这个方向，老子认了"。诸神中，唯他管"不回头"。',
      act2: '他帮你解决一个问题：用"分析"来掩饰"不敢动"。方案写了ABC三版，但一个都没执行——他一眼就看出这不是认真，是在拖延。他给你的东西很简单：认准一个，走。',
      act3: '他说：那件事分析了三遍还没动——合上方案，今天只做第一步。做了再说。',
    },
    '1_NF': {
      act1: '哪吒削骨还父、莲花重生。他是所有神明里唯一一个先把自己拆了再重组的。不是因为不爱父母——是因为他得先找到"我"是谁，才能决定"我的命归谁管"。',
      act2: '他帮的是那种"对谁都好，对自己不好"的人。别人找你帮忙你不好意思拒绝，同事甩锅你默默接了，到头来最累的是你自己。他敢把自己拆了重组——他最清楚：照顾好自己，才有力气帮别人。',
      act3: '他说：这周拒绝一件不想做的事。就三个字——不方便。不用解释，不用道歉。',
    },
    '1_SJ': {
      act1: '火德是天上的太阳。灶台上的火追着锅跑，烧完就灭了。太阳不追谁——但它在那，所有人都看得见。火行正神，管的是"主动发光"，不是"被动燃烧"。',
      act2: '他帮你解决一个问题：每天忙得要死，但细想一下，没一件是为自己做的。全是别人安排的、"应该做的"。他管的是"为自己发光"——他让你搞清楚：你在给谁活？',
      act3: '他说：这周拿出半小时，做一件没有任何人要求你做、但你就是想做的事。就半小时，但那是你自己的时间。',
    },
    '1_SP': {
      act1: '杨戬额开天眼，一眼辨妖魔。他不是不近人情——他是最清楚"谁是自己人"的那个。哮天犬在侧，三尖刀在手，踏错一步他知道。',
      act2: '他帮的是那种"分不清远近"的人。对谁都太好，对谁都太近，近到分不清谁是真正值得的。他告诉你：远近是有价格的，你得先知道自己的边界在哪。',
      act3: '他说：这周对一个人说不。不用理由，不用道歉，就三个字——不方便。',
    },

    // ===== 土行 =====
    '2_NT': {
      act1: '东岳泰山。泰山不知道明天下不下雨、后天会不会地震——但它知道自己不会塌。诸神之中，唯他管"定"。不是消除焦虑，是让你站的地方本身就不会动摇。',
      act2: '他帮的是那种"把90%的精力花在担心上"的人。工作怕被裁、关系怕变淡、身体怕出问题——每天都在担心还没发生的事。他站了三千年，从没担心过明天——他能帮你把脚跟站稳。',
      act3: '他说：今天关掉待办清单，什么都不计划，过一天。试试看，天塌了吗？',
    },
    '2_NF': {
      act1: '地藏王菩萨蹲在地狱最深处。"地狱不空，誓不成佛"——所有神明都在天上，唯他在地下。他管的是"不放弃"——不是拉你出来，是陪你站在最深的坑里。',
      act2: '他帮的是那种"什么苦都自己扛"的人。累了也不说，觉得说出来就是给别人添麻烦。但他管的是最深最烂的地方，从来不嫌脏。他告诉你：说出来不丢人，硬扛才蠢。',
      act3: '他说：找一个你信得过的人，发一句"最近有点累"。就这一句。你会收到你没想到的回应。',
    },
    '2_SJ': {
      act1: '城隍爷守的不是一座城，是城里所有人的心安。他在山野里封了神，心里装的还是人间那点事——谁家有人病了、谁最近丢了东西、谁心里不踏实。守一方土地，护一方人心。',
      act2: '他帮的是那种"四海为家但哪都不是家"的人。换了很多地方，认识很多人，但没有一个人、一块地能让他安心。他告诉你：地基不是找出来的，是建出来的。',
      act3: '他说：想一个你能随时回去的地方。不用在那住，就是知道——累了可以回。',
    },
    '2_SP': {
      act1: '后土娘娘，大地之母。她不说话，不要求，不催促。她只做一件事——托着。种子落上去就能发芽，鸟落上去就能歇脚。想走随时能走，想回随时能回。',
      act2: '她帮的是那种"在哪都待不踏实"的人。换了工作换了城市换了圈子，但到哪都有一种"不属于这里"的感觉。她给你一样东西：一个你知道随时可以回去的地方。有了这个，才敢真正往前走。',
      act3: '她说：想三个让你觉得安全的地方或人。不用做什么，就是在那待一会儿。知道自己随时能回来，才敢走远。',
    },

    // ===== 金行 =====
    '3_NT': {
      act1: '达摩面壁九年，一苇渡江。九年不是在想答案——是等答案自己来。他的果断不是冲动，是想到底之后的绝不回头。诸神之中，唯他管"停"。',
      act2: '他帮的是那种"什么都纠结"的人。买个东西能纠结一周，换个工作能纠结半年——他告诉你：想到底了就停。停在"再想想"里面，比走错路更浪费时间。',
      act3: '他说：纠结超过两周的事，抛一枚硬币。硬币落地那一刻你会知道自己到底想要什么。',
    },
    '3_NF': {
      act1: '悟空的金箍棒一万三千五百斤。小的时候收到耳朵里不伤人，大的时候一棒横扫十万天兵不废话。能大能小，能收能放——诸神之中，唯他管"有锋芒的温柔"。',
      act2: '他帮的是那种"不会拒绝"的人。善良但没底线，拒绝了还会自责三天，觉得说"不"就是伤害别人。他告诉你：该翻脸的时候翻脸，这才是真本事。',
      act3: '他说：以后不好意思拒绝的时候就说三个字——不方便。不用解释。真正在意你的人，不会因为这三个字离开。',
    },
    '3_SJ': {
      act1: '财神爷赵公明，骑黑虎持铁鞭。武财神——不是做慈善的。他管的是"值多少收多少"。义中取财，不贱卖自己的时间和能力。',
      act2: '他帮的是那种"做了100分只敢收50分"的人。把差价叫"人情"，把亏本叫"体面"。他告诉你：长期免费等于告诉所有人"我的时间不值钱"。你值多少，就收多少。',
      act3: '他说：给你一直在免费帮忙的事标个价。不是真要收钱，是让你自己知道时间值多少钱。',
    },
    '3_SP': {
      act1: '钟馗是所有神明里最不好说话的那个。满身杀气，一剑斩妖魔。但他最厉害的不是杀——是他在斩之前，能一眼分辨"这是妖还是人"。斩得干净，断得分明。',
      act2: '他帮的是那种"该翻脸不翻脸"的人。明知道那个人在占便宜、那段关系在消耗你、那个习惯在拖后腿，但就是拉不下脸。他告诉你：不好意思拒绝，才是最贵的代价。',
      act3: '他说：这周了结一件你拖着没断的事。不用解释，不用好聚好散，就让它过去。',
    },

    // ===== 水行 =====
    '4_NT': {
      act1: '太上老君，道教最高神。"上善若水"——水不跟石头硬刚，它绕过去。一百年后，石头被水磨圆了。诸神之中，唯他管"绕"。',
      act2: '他见过太多聪明人死磕一条路，磕了十年，路还是那条路，人已经废了。所以他特别能帮你——他一眼就能看出：这条路走不通的时候，该停、该拐弯、该换一条。',
      act3: '他说：路走不通就换一条。绕路不丢人，撞墙才蠢。',
    },
    '4_NF': {
      act1: '观世音菩萨——"观"世间音。她能听到所有人的声音。但她从不是把自己倒空了去渡人——她能听到，是因为她自己的井从未枯竭。诸神之中，唯她管"先灌满自己"。',
      act2: '她帮的是那种"把所有力气都给了别人"的人。朋友找你倾诉你陪到半夜，同事有困难你第一个冲上去，但你自己难受的时候，身边没人。她能帮到你——因为她让你明白一个道理：杯子空了，倒不出任何东西。',
      act3: '她说：这周做一件完全只为自己的事。不为了任何人，不因为任何"应该"。先把自己照顾好，剩下的自然会来。',
    },
    '4_SJ': {
      act1: '真武大帝——玄武，龟+蛇。龟是固守，蛇是灵活。他之所以能镇守北方，不是因为他足够硬——是因为他比所有妖魔都灵活。最坚固的防线不是僵硬的墙，是流动的水。',
      act2: '他帮的是那种"什么都要按规矩来"的人。规矩定了就不改，方法定了就不换，环境变了还是老一套。他告诉你：规矩是死的，人是活的。最厉害的人不是最硬的，是最会变通的。',
      act3: '他说：找一个你从来不让步的地方，今天做一次让步。试试看，天真的会塌吗？',
    },
    '4_SP': {
      act1: '东海龙王——"潜龙勿用，飞龙在天"。同一条龙，在浅水里被人当泥鳅笑，在深海里翻个身就是海啸。他管的是"找对自己的海"。',
      act2: '他帮的是那种"拼命但没用对地方"的人。在一个不适合自己的环境里死磕，越拼越累，越累越不服。他一眼就能看出来：你不是不行，是你待错了地方。',
      act3: '他说：想想你最近最累的那件事——是事情本身难，还是你放错了位置？换一个地方试试，可能事半功倍。',
    },
  };

  // ==================== Tie-Breaker ====================
  // 水×NF：用户核心困境为"过度付出/输出过载"时，妈祖替换观音
  var TIE_BREAKERS = {
    '4_NF': {
      primary: 'guanyin',
      alternate: 'mazu',
      trigger: 'output_overload', // personality.dilemma === 'output_overload' 时切换
    },
  };

  // ==================== 核心函数 ====================

  /**
   * 16型 → 阵营
   * @param {string} type16 如 'INTJ'
   * @returns {string} 'NT'|'NF'|'SJ'|'SP'
   */
  function getCamp(type16) {
    return TYPE_TO_CAMP[type16] || 'NT'; // 默认NT
  }

  /**
   * 主入口：用神五行 × 16型 → 守护神完整结果
   * 
   * @param {number} cureElementWX 用神五行编号 (0=木,1=火,2=土,3=金,4=水)
   * @param {string} type16 16型人格如 'INTJ'
   * @param {string} [dilemma] 核心困境key（用于Tie-Breaker）
   * @returns {object} { deity, conclusion, camp, cureElement, matrixKey }
   */
  function getDeityPrescription(cureElementWX, type16, dilemma) {
    var camp = getCamp(type16);
    var matrixKey = cureElementWX + '_' + camp;

    // 查矩阵
    var deityKey = MATRIX[cureElementWX] ? MATRIX[cureElementWX][camp] : null;
    if (!deityKey) return null;

    // Tie-Breaker检查
    var tb = TIE_BREAKERS[matrixKey];
    if (tb && dilemma === tb.trigger) {
      deityKey = tb.alternate;
    }

    var deity = DEITIES[deityKey];
    var conclusion = CONCLUSIONS[matrixKey] || null;

    return {
      deityKey: deityKey,
      deity: deity,
      conclusion: conclusion,
      camp: camp,
      campInfo: CAMP_INFO[camp],
      cureElement: WX_INFO[cureElementWX],
      matrixKey: matrixKey,
    };
  }

  /**
   * 简化版：直接查矩阵返回神明key
   * @param {number} cureElementWX 用神五行编号
   * @param {string} camp 阵营 'NT'|'NF'|'SJ'|'SP'
   * @returns {string} 神明key
   */
  function lookupMatrix(cureElementWX, camp) {
    return MATRIX[cureElementWX] ? MATRIX[cureElementWX][camp] : null;
  }

  // ==================== 向后兼容 ====================
  // 保留旧的8神数据结构，让前端逐步迁移
  var DEITIES_OLD = {
    wukong:    { name: '齐天大圣', emoji: '🐵', position: '破除心魔、勇猛精进',     product: '朱砂 / 红玛瑙' },
    nezha:     { name: '哪吒三太子', emoji: '🔥', position: '剔骨还心、重塑真我',     product: '绿檀 / 白菩提' },
    wenshu:    { name: '文殊菩萨', emoji: '🦁', position: '破迷开悟、照见本质',     product: '黄水晶 / 文殊智慧笔' },
    damo:      { name: '达摩祖师', emoji: '🧘', position: '面壁专注、一苇渡江',     product: '白水晶 / 菩提子' },
    guanyin:   { name: '观音大士', emoji: '🪷', position: '慈悲疗愈、寻声救苦',     product: '粉水晶 / 莲花手串' },
    dizang:    { name: '地藏菩萨', emoji: '🌍', position: '承载苦难、穿越幽暗',     product: '黑曜石 / 地藏牌' },
    guandi:    { name: '关圣帝君', emoji: '⚔️', position: '守住底线、重获力量',     product: '红玛瑙 / 关公像' },
    zhenwu:    { name: '真武大帝', emoji: '🛡️', position: '荡魔护身、重建根基',     product: '玄武令 / 黑碧玺' },
  };

  // 旧的16型→主辅神映射（v1.0兼容）
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

  // ==================== 导出 ====================
  global.DeityMatrix = {
    // 新API（v2.0）
    DEITIES,
    MATRIX,
    CONCLUSIONS,
    TYPE_TO_CAMP,
    CAMP_INFO,
    WX_INFO,
    TIE_BREAKERS,
    getCamp,
    getDeityPrescription,
    lookupMatrix,

    // 旧API兼容（前端逐步迁移用）
    DEITIES_OLD,
    TYPE_DEITY_MAP,

    // 旧名字空间兼容（index.html 直接引用 DeityData 时不会报错）
    DEITIES_LEGACY: DEITIES_OLD,
  };

  // 同时挂 DeityData 名字空间，保证旧代码不报错
  global.DeityData = {
    DEITIES: DEITIES_OLD,
    TYPE_DEITY_MAP: TYPE_DEITY_MAP,
  };

})(typeof window !== 'undefined' ? window : this);
