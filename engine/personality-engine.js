/**
 * 荣格四维计分引擎 v3.0
 * 
 * 功能：答题数据 → 16型人格 + Grip + 核心困境 + 认知偏差
 * 
 * 31题结构（1出生日期 + 30选择题）：
 * - IE（内外向）：题2+3+4+5+6+24+28（7票）
 * - SN（直觉/感觉）：题7+8+9+25+26+21交叉（6票）
 * - TF（思考/情感）：题10+11+12+29+30+22交叉（6票）
 * - JP（判断/感知）：题13+14+15+16+27（5票）
 * - Grip（劣势功能）：题17+18（2票复测，不一致取题17）
 * - 核心困境：题19（单题直出，5选项，守护神Tie-Breaker）
 * - 认知偏差：题20（单题直出，4选项）
 * - 交叉IE×SN：题21（同时投IE和SN票）
 * - 交叉TF×JP：题22（同时投TF和JP票）
 * - 商业转化：题23（单题直出）
 */
(function(global) {
  'use strict';

  // ==================== 31题数据 v4（当代年轻人语境·5乐章节奏·彩蛋反转） ====================
  const QUESTIONS = [
    // ==================== 第1题：出生日期 ====================
    {
      id: 0, type: 'date',
      number: '第 1 题',
      title: '先报一下生日',
      subtitle: '选一个你大概出生的时间段就行',
    },

    // ==================== 🎵 入场（题2-6：轻松+共鸣） ====================

    // 第2题：IE ① — 加微信
    {
      id: 1, type: 'choice', dim: 'IE',
      number: '第 2 题',
      title: '刚认识一个人加了微信，你通常会——',
      options: [
        { label: 'A', text: '翻了一下对方的朋友圈了解大概，然后主动发个表情包破冰', value: 'E' },
        { label: 'B', text: '等对方先说话，但对方一开口你就聊停不下来', value: 'E' },
        { label: 'C', text: '等对方先找我，对方找了我秒回，但不会主动开启话题', value: 'I' },
        { label: 'D', text: '加了就加了，大概率不会再有对话', value: 'I' },
      ],
    },
    // 第3题：IE ② — 聚会后
    {
      id: 2, type: 'choice', dim: 'IE',
      number: '第 3 题',
      title: '跟朋友吃完火锅回到家，你的状态是——',
      options: [
        { label: 'A', text: '意犹未尽，在群里发了一堆表情包，开始约下次', value: 'E' },
        { label: 'B', text: '聊得挺开心，到家躺床上又回味了半天刚才的八卦', value: 'E' },
        { label: 'C', text: '开心是开心，但到家后只想一个人待着，一句话都不想说', value: 'I' },
        { label: 'D', text: '谢天谢地终于回来了，社交电量见底，感觉灵魂正在缓慢回血', value: 'I' },
      ],
    },
    // 第4题：IE ③ — 群聊
    {
      id: 3, type: 'choice', dim: 'IE',
      number: '第 4 题',
      title: '200人的工作群/学校群里有人@全体需要回复，你——',
      options: [
        { label: 'A', text: '秒回"收到"，顺便跟帖问了一句具体细节', value: 'E' },
        { label: 'B', text: '看到就回了个"收到"，不多说', value: 'E' },
        { label: 'C', text: '犹豫了一下要不要回，最后还是回了，但很简短', value: 'I' },
        { label: 'D', text: '心想"这么多人总有人回的"，把红点划掉了', value: 'I' },
      ],
    },
    // 第5题：IE ④ — 饭局十人
    {
      id: 4, type: 'choice', dim: 'IE',
      number: '第 5 题',
      title: '一桌十个人的饭局，你认识的人只有两个——',
      options: [
        { label: 'A', text: '主动跟旁边不认识的人搭话，散场时又加了好几个新朋友', value: 'E' },
        { label: 'B', text: '不主动搭话，但别人来找你聊天你很自在，聊完还挺开心', value: 'E' },
        { label: 'C', text: '听多过说，但遇到自己懂的话题会自然地插几句', value: 'I' },
        { label: 'D', text: '默默吃菜，全程当听众，偶尔跟认识的人说两句', value: 'I' },
      ],
    },
    // 第6题：IE ⑤ — 周末被叫出门
    {
      id: 5, type: 'choice', dim: 'IE',
      number: '第 6 题',
      title: '周五晚上十点，有人突然说"出来坐坐"，你会——',
      options: [
        { label: 'A', text: '"五分钟后到"，衣服都来不及换', value: 'E' },
        { label: 'B', text: '先问"还有谁去"，听到有认识的人就说"等我"', value: 'E' },
        { label: 'C', text: '"今天有点累……去也行吧"，出门前犹豫了半天', value: 'I' },
        { label: 'D', text: '"今天太累了下次吧"——其实啥也没干，就是在沙发上瘫着', value: 'I' },
      ],
    },

    // ==================== 🎵 上头（题7-12：梗+反转） ====================

    // 第7题：SN ① — 短视频
    {
      id: 6, type: 'choice', dim: 'SN',
      number: '第 7 题',
      title: '刷到一个三分钟的视频标题写着"看完改变你的人生"，你会——',
      options: [
        { label: 'A', text: '看完立刻去搜相关内容，越搜越深，回过神来已经半夜了', value: 'N' },
        { label: 'B', text: '看了，觉得有道理，收藏了，然后继续刷下一个', value: 'N' },
        { label: 'C', text: '划走了，但下一个视频还是这个博主，又忍不住看了几个', value: 'S' },
        { label: 'D', text: '看了一眼标题，心想"又一个割韭菜的"，直接划走', value: 'S' },
      ],
    },
    // 第8题：SN ② — 消费决策
    {
      id: 7, type: 'choice', dim: 'SN',
      number: '第 8 题',
      title: '想买一个东西（比如降噪耳机），你的购买流程是——',
      options: [
        { label: 'A', text: '先看测评对比参数查讨论帖，纠结好久，最后买了个完全不同但更有创意的东西', value: 'N' },
        { label: 'B', text: '看了看评价，挑了个口碑不错的，下单，完事', value: 'N' },
        { label: 'C', text: '先买个便宜的试试水，觉得好用再考虑换好的', value: 'S' },
        { label: 'D', text: '加购物车，犹豫好久，最后要么忘了买要么别人送了一个', value: 'S' },
      ],
    },
    // 第9题：SN ③ — 学新技能
    {
      id: 8, type: 'choice', dim: 'SN',
      number: '第 9 题',
      title: '心血来潮想学个新东西（剪辑/画画/编程），你的打开方式是——',
      options: [
        { label: 'A', text: '先看一堆"从零到精通"经验帖，研究最优路线，然后收藏了一堆教程视频，感觉很努力了', value: 'N' },
        { label: 'B', text: '先了解大概框架和原理，搞清楚学什么再动手', value: 'N' },
        { label: 'C', text: '直接找教程跟着做，做出来第一个丑到不行的成品，反而很有成就感', value: 'S' },
        { label: 'D', text: '买了全套装备和课程，到现在塑封膜都没撕', value: 'S' },
      ],
    },
    // 第10题：TF ① — 朋友创业点子
    {
      id: 9, type: 'choice', dim: 'TF',
      number: '第 10 题',
      title: '朋友兴冲冲跟你说"我要做一个AI驱动的宠物相亲平台"，你会——',
      options: [
        { label: 'A', text: '"等等，先说清楚——你怎么赚钱？用户从哪来？跟别人有什么不一样？"', value: 'T' },
        { label: 'B', text: '"想法挺好的，但你想过怎么落地吗？"——先肯定再追问', value: 'T' },
        { label: 'C', text: '"有点意思诶——你先说说，我帮你想想怎么完善"', value: 'F' },
        { label: 'D', text: '"太棒了！什么时候上线？我帮你宣传！"——比TA还激动', value: 'F' },
      ],
    },
    // 第11题：TF ② — 网上不同观点
    {
      id: 10, type: 'choice', dim: 'TF',
      number: '第 11 题',
      title: '刷到一个明显有问题的帖子，底下全是跟风的人，你会——',
      options: [
        { label: 'A', text: '打了一段逐条反驳，引用了数据来源，有理有据', value: 'T' },
        { label: 'B', text: '评论了一句指出了问题，然后懒得继续争了', value: 'T' },
        { label: 'C', text: '觉得不对，但争论下去没意义，直接划走', value: 'F' },
        { label: 'D', text: '打了一堆话又全删了，最后留了个表情', value: 'F' },
      ],
    },
    // 第12题：TF ③ — 朋友买丑东西
    {
      id: 11, type: 'choice', dim: 'TF',
      number: '第 12 题',
      title: '朋友花两千块买了个你觉得很丑的包，还特别开心地给你看，你会——',
      options: [
        { label: 'A', text: '"说实话，这个配色跟你的气质不太搭"', value: 'T' },
        { label: 'B', text: '"这个包挺特别的……不过你是不是可以试试另一个颜色？"——委婉提醒', value: 'T' },
        { label: 'C', text: '"哇挺好看的！你背这个真的很适合"', value: 'F' },
        { label: 'D', text: '拍照发群里说"快看我朋友的新包"，但心里在替TA的钱包默哀', value: 'F' },
      ],
    },

    // ==================== 🎵 扎心（题13-17：当代焦虑） ====================

    // 第13题：JP ① — 手机APP
    {
      id: 12, type: 'choice', dim: 'JP',
      number: '第 13 题',
      title: '你的手机APP是这样排的——',
      options: [
        { label: 'A', text: '按功能分文件夹，最常用的放首页黄金位置，换壁纸就重新排一遍', value: 'J' },
        { label: 'B', text: '有大致分类，但新下的APP经常随手一放，攒多了再整理', value: 'J' },
        { label: 'C', text: '偶尔下决心大整理一次，但通常坚持不到一周就恢复原样', value: 'P' },
        { label: 'D', text: '随便放，找APP靠搜索，有时候搜到了也不确定是哪个', value: 'P' },
      ],
    },
    // 第14题：JP ② — DDL
    {
      id: 13, type: 'choice', dim: 'JP',
      number: '第 14 题',
      title: '有一件事必须在三天后交，你通常会——',
      options: [
        { label: 'A', text: '第一天就做完，后面两天反复检查，交之前又改了两遍', value: 'J' },
        { label: 'B', text: '第一天列了个计划，中间拖了一下，第二天晚上赶完', value: 'J' },
        { label: 'C', text: '前两天一直在想"该做了该做了"，第三天才真的开始', value: 'P' },
        { label: 'D', text: '前两天完全忘了，第三天突然想起来，疯狂赶在最后一刻交上', value: 'P' },
      ],
    },
    // 第15题：JP ③ — 旅行
    {
      id: 14, type: 'choice', dim: 'JP',
      number: '第 15 题',
      title: '说走就走出去旅个游，你的风格是——',
      options: [
        { label: 'A', text: '提前做攻略精确到每个景点待多久，到了发现景点在装修', value: 'J' },
        { label: 'B', text: '列了个必去清单，安排好大致行程，偶尔灵活调整', value: 'J' },
        { label: 'C', text: '出发前做了攻略，但到了之后完全凭心情走', value: 'P' },
        { label: 'D', text: '带个行李箱出门，走到哪住到哪，主打随机', value: 'P' },
      ],
    },
    // 第16题：JP ④ — 三任务并行
    {
      id: 15, type: 'choice', dim: 'JP',
      number: '第 16 题',
      title: '手上同时有三个任务要处理，你的习惯是——',
      options: [
        { label: 'A', text: '先排优先级，一个一个搞定，做完一个勾一个', value: 'J' },
        { label: 'B', text: '按优先级做，但做第一个的时候脑子里偶尔会想到另外两个', value: 'J' },
        { label: 'C', text: '排了个优先级，但做到一半觉得另一个更急，临时切换，最后手忙脚乱', value: 'P' },
        { label: 'D', text: '三个同时开，哪个灵感来了先做哪个，最后发现都没做完', value: 'P' },
      ],
    },
    // 第17题：Grip ① — 突然心情差
    {
      id: 16, type: 'grip',
      number: '第 17 题',
      title: '某天你突然心情很差很差，你的本能反应是——',
      subtitle: '选最接近你本能反应的那个',
      options: [
        { label: 'A', text: '打开外卖连点好几家，边吃边刷短视频到半夜，第二天什么都不记得', grip: 'Se' },
        { label: 'B', text: '翻最近所有聊天记录，反复回想"是不是那句回得不对"', grip: 'Si' },
        { label: 'C', text: '对身边所有人说话都带刺，"你能不能别烦我"，一点小事就想发火', grip: 'Te' },
        { label: 'D', text: '关机，谁消息都不回，拉窗帘在床上躺着，外卖到了也不想开门', grip: 'Fe' },
      ],
    },

    // ==================== 🎵 深潜（题18-23：核心探测） ====================

    // 第18题：Grip ② — 持续焦虑复测
    {
      id: 17, type: 'grip',
      number: '第 18 题',
      title: '上题你选的是第一反应，那如果你持续焦虑一周，你会变成什么样——',
      subtitle: '这次认真想，和你第一反应可能不一样',
      options: [
        { label: 'A', text: '疯狂消费，买一堆不需要的东西，拆快递的时候才后悔', grip: 'Se' },
        { label: 'B', text: '把过去的事全翻出来想一遍，连很久不联系的人都想起来了', grip: 'Si' },
        { label: 'C', text: '试图控制一切，给身边每个人规定了"你应该怎么做"', grip: 'Te' },
        { label: 'D', text: '开始回避所有人，连最亲密的朋友发消息都想装没看到', grip: 'Fe' },
      ],
    },
    // 第19题：核心困境（→ 守护神Tie-Breaker）
    {
      id: 18, type: 'dilemma',
      number: '第 19 题',
      title: '下面哪个更像你最近的状态？',
      options: [
        { label: 'A', text: '我太累了，付出太多回报太少，好像没人看见我', dilemma: 'burdened' },
        { label: 'B', text: '脑子停不下来，越想越焦虑，但行动跟不上', dilemma: 'overthinking' },
        { label: 'C', text: '我知道该做什么，就是迈不动腿', dilemma: 'paralyzed' },
        { label: 'D', text: '关系里我总是付出更多的那个，但好像没人珍惜', dilemma: 'one_sided' },
        { label: 'E', text: '说不上哪里不对，就是觉得活着没劲', dilemma: 'numb' },
      ],
    },
    // 第20题：认知偏差
    {
      id: 19, type: 'cognition',
      number: '第 20 题',
      title: '你在朋友圈/小红书上的样子，和真实的你——',
      options: [
        { label: 'A', text: '看起来光鲜亮丽很厉害，但只有我知道我在硬撑', cognition: 'high' },
        { label: 'B', text: '看起来很佛很安静，但我脑子里已经吵了八百回合', cognition: 'low' },
        { label: 'C', text: '我发什么就是什么，懒得立人设，也没精力演', cognition: 'accurate' },
        { label: 'D', text: '我不怎么发朋友圈，别人眼中的我是个谜，连我自己都不知道', cognition: 'hidden' },
      ],
    },
    // 第21题：交叉 IE×SN — 万字长文
    {
      id: 20, type: 'cross',
      number: '第 21 题',
      title: '一个朋友给你发了一篇万字长文分析当前的经济形势，你会——',
      options: [
        { label: 'A', text: '立刻看完，然后转发到群里配上自己的思考，又引发一轮讨论', crossIE: 'E', crossSN: 'N' },
        { label: 'B', text: '看完但懒得转发，心里已经想了一圈，啥也没说', crossIE: 'I', crossSN: 'N' },
        { label: 'C', text: '收了但没看，觉得没必要想那么多，过好自己的日子比什么都强', crossIE: 'I', crossSN: 'S' },
        { label: 'D', text: '在群里吐槽"谁要看这么长"，但偷偷点开看了两段', crossIE: 'E', crossSN: 'S' },
      ],
    },
    // 第22题：交叉 TF×JP — 家务吵架
    {
      id: 21, type: 'cross',
      number: '第 22 题',
      title: '你和室友/伴侣因为做家务的事又吵了一架，你的后续操作是——',
      options: [
        { label: 'A', text: '列一张家务分工表贴在冰箱上，精确到谁倒垃圾谁洗碗', crossTF: 'T', crossJP: 'J' },
        { label: 'B', text: '等气消了找TA聊，条理清晰地讲了一遍你的不满和期望', crossTF: 'T', crossJP: 'P' },
        { label: 'C', text: '先冷静下来，等情绪过去了再聊，聊的时候尽量照顾对方感受', crossTF: 'F', crossJP: 'P' },
        { label: 'D', text: '自己默默把活干了，假装没事，但下次还是因为同样的事吵', crossTF: 'F', crossJP: 'J' },
      ],
    },
    // 第23题：商业转化
    {
      id: 22, type: 'business',
      number: '第 23 题',
      title: '如果人生是一个开放世界游戏，你现在最想获得的道具是——',
      options: [
        { label: 'A', text: '一张地图——装备和等级都有了，但不知道主线任务是什么', business: 'direction' },
        { label: 'B', text: '一双加速跑鞋——知道要去哪，但腿就是迈不动', business: 'execution' },
        { label: 'C', text: '一瓶回血药——什么都有，但状态太差了，需要回城休息一下', business: 'health' },
        { label: 'D', text: '一个召唤卷轴——一个人刷副本太孤独了，想召唤靠谱的队友', business: 'teamwork' },
      ],
    },

    // ==================== 🎵 回暖（题24-31：轻松第二轮+彩蛋收尾） ====================

    // 第24题：IE ⑥ — 线上社群
    {
      id: 23, type: 'choice', dim: 'IE',
      number: '第 24 题',
      title: '被拉进一个不太熟的微信群（比如业主群/行业交流群），你的画风是——',
      options: [
        { label: 'A', text: '没几天就冒泡好几次，比在群里两年的老成员还活跃', value: 'E' },
        { label: 'B', text: '有人提问刚好你懂，就自然地回了几句，回完继续潜水', value: 'E' },
        { label: 'C', text: '默默观察了挺久，偶尔看到特别感兴趣的话题才第一次说话', value: 'I' },
        { label: 'D', text: '潜水到底，第一条消息通常是帮人点个链接', value: 'I' },
      ],
    },
    // 第25题：SN ④ — 讲故事方式
    {
      id: 24, type: 'choice', dim: 'SN',
      number: '第 25 题',
      title: '跟朋友讲一件事的时候，你的习惯是——',
      options: [
        { label: 'A', text: '讲着讲着就开始分析原因，扯出背后的逻辑和关联', value: 'N' },
        { label: 'B', text: '讲着讲着就扯到更大的话题上了，"对了这让我想到……"', value: 'N' },
        { label: 'C', text: '"那天下午在那个地方，那个人跟我说了这么一句话"——先交代细节', value: 'S' },
        { label: 'D', text: '讲着讲着就跑题了，最后自己也忘了最初要讲什么', value: 'S' },
      ],
    },
    // 第26题：SN ⑤ — 看说明书
    {
      id: 25, type: 'choice', dim: 'SN',
      number: '第 26 题',
      title: '买了一个新电器（比如空气炸锅/投影仪），你的第一反应是——',
      options: [
        { label: 'A', text: '不看说明书，自己先乱按一通，摸索出一套自己的用法', value: 'N' },
        { label: 'B', text: '翻了翻说明书看个大概，然后就开始自己琢磨', value: 'N' },
        { label: 'C', text: '先把说明书从头到尾看一遍，然后按步骤来', value: 'S' },
        { label: 'D', text: '去搜搜别人的使用视频，看别人怎么操作的，比看说明书直观', value: 'S' },
      ],
    },
    // 第27题：JP ⑤ — 搬家整理
    {
      id: 26, type: 'choice', dim: 'JP',
      number: '第 27 题',
      title: '要搬个家/整理房间，你的风格是——',
      options: [
        { label: 'A', text: '先扔后搬，断舍离好几箱，每样东西都有固定位置', value: 'J' },
        { label: 'B', text: '大件归位，小件先装箱到了再说，但会标记"待整理"', value: 'J' },
        { label: 'C', text: '整理的时候发誓以后要保持，搬完一个月后又恢复猪窝模式', value: 'P' },
        { label: 'D', text: '全塞箱子，到了新地方再说，有些箱子到现在都没拆开', value: 'P' },
      ],
    },
    // 第28题：IE ⑦ — 独处vs社交
    {
      id: 27, type: 'choice', dim: 'IE',
      number: '第 28 题',
      title: '连续一周没有任何社交安排，你的感觉是——',
      options: [
        { label: 'A', text: '到第五天就开始不安了，疯狂约人，哪怕是楼下便利店见面都行', value: 'E' },
        { label: 'B', text: '前三天很享受，后面开始想找人聊聊，就主动约了顿饭', value: 'E' },
        { label: 'C', text: '前两天很爽，后来有点无聊了，偷偷刷了一下朋友圈', value: 'I' },
        { label: 'D', text: '爽！这就是天堂！请再给我一周！', value: 'I' },
      ],
    },
    // 第29题：TF ④ — 同事被批评
    {
      id: 28, type: 'choice', dim: 'TF',
      number: '第 29 题',
      title: '你的同事能力很强但人很讨厌，TA被领导批评了，你的反应是——',
      options: [
        { label: 'A', text: '跟人无关，TA做事确实有问题，被批评不意外', value: 'T' },
        { label: 'B', text: '心里觉得正常，毕竟TA确实做错了', value: 'T' },
        { label: 'C', text: '虽然TA平时很烦，但看TA被骂还是有点不忍心', value: 'F' },
        { label: 'D', text: '表面上说"太惨了"，心里其实有点幸灾乐祸', value: 'F' },
      ],
    },
    // 第30题：TF ⑤ — 帮朋友做决策
    {
      id: 29, type: 'choice', dim: 'TF',
      number: '第 30 题',
      title: '朋友问你"我该不该分手/辞职/考研"，你会——',
      options: [
        { label: 'A', text: '帮TA列一个利弊分析表，把能想到的结果都写出来让TA自己选', value: 'T' },
        { label: 'B', text: '"你先说说具体情况"，然后开始一条一条帮TA分析', value: 'T' },
        { label: 'C', text: '"你要是来问我，那肯定是心里已经有答案了"——陪TA想清楚', value: 'F' },
        { label: 'D', text: '先问TA的感受，"你自己到底想要什么"，陪TA把情绪理清楚', value: 'F' },
      ],
    },
    // 第31题：JP ⑥ — 收尾彩蛋
    {
      id: 30, type: 'choice', dim: 'JP',
      number: '第 31 题',
      title: '马上就要看结果了，你现在的心情是——',
      options: [
        { label: 'A', text: '赶紧出结果！我要看！看完立刻分享给朋友测', value: 'J' },
        { label: 'B', text: '已经在想分享文案了，甚至想好发哪几个群', value: 'J' },
        { label: 'C', text: '有点慌，想回去重看几道题确认一下自己选得对不对', value: 'P' },
        { label: 'D', text: '无所谓了，反正守护神才是重点', value: 'P' },
      ],
    },
  ];

  // ==================== 16型灵魂称号 ====================
  const TYPE_16 = {
    INTJ: { title: '下棋的人', emoji: '🎯', tagline: '别人在下棋，你连棋盘都重新设计了', roast: '你在脑子里赢了100场仗，现实里一场都没打过' },
    INTP: { title: '精神上的扫地机器人', emoji: '🤖', tagline: '扫了一遍全屋，垃圾没扔，因为每片垃圾都在研究它为什么是垃圾', roast: '你能解释宇宙大爆炸，但解释不了为什么你还没开始做事' },
    ENTJ: { title: '方向盘给我型', emoji: '🏎️', tagline: '不是你想开车，是你看不得别人开偏了', roast: '什么都想管，结果什么都管得太累。管到别人喘不过气，自己也快窒息' },
    ENTP: { title: '脑洞不限速型', emoji: '💡', tagline: '上一秒在想改变世界，下一秒在研究怎么用AI自动翻煎饼', roast: '你开的坑比填的多，但每个坑你都讲得像已经填好了似的' },
    INFJ: { title: '全网最准的互联网嘴替', emoji: '🎙️', tagline: '你说的每句话别人都想转发，但你自己只有3条朋友圈', roast: '别人难受了都来找你，你难受了没人找' },
    INFP: { title: '精神上的流浪汉', emoji: '🌙', tagline: '世界是粗糙的，但你的内心有一座精装修的图书馆', roast: '理想和现实差太远，你卡在中间，两边都够不着' },
    ENFJ: { title: '精神上的养妈', emoji: '👩‍🍼', tagline: '别人不开心你来哄，你自己不开心了没人哄', roast: '你恨不得拯救全人类，但你连自己的晚饭都没解决' },
    ENFP: { title: '人形社交APP', emoji: '🎉', tagline: '每个人的列表里都有你，但你的列表里谁都不在首页', roast: '你的热情保质期比酸奶还短，但每次重启都像第一次一样认真' },
    ISTJ: { title: '人形Excel', emoji: '📊', tagline: '世界可以乱，你的表格不能乱', roast: '你的Excel表格精确到小数点后两位，但生活这道题没有标准答案' },
    ISFJ: { title: '感动中国幕后组', emoji: '🛡️', tagline: '你是所有人最后的退路，但你的"开始"键从来没按过', roast: '你是全世界的避风港，但你自己的港湾在哪里' },
    ESTJ: { title: '人生的项目经理', emoji: '📋', tagline: '全世界都没急，就你急', roast: '你效率最高，但跟你在一起的人压力也最大' },
    ESFJ: { title: '人形群公告', emoji: '📢', tagline: '没你组织饭局，这帮人能饿一星期', roast: '你是所有人的好朋友，但深夜打开通讯录不知道该打给谁' },
    ISTP: { title: '低功耗高能效型', emoji: '⚙️', tagline: '别人在内耗，你在拆门把手。不是修不好，是嫌慢', roast: '你什么都能修好，就是修不好自己的人际关系' },
    ISFP: { title: '薛定谔的佛系', emoji: '🎨', tagline: '表面佛系，内心比谁都清楚自己想要什么', roast: '你很会照顾自己，但你不敢让别人看到真正的你' },
    ESTP: { title: '人体肾上腺素泵', emoji: '🔥', tagline: '别人在想"会不会出事"，你在想"出了事再跑也不迟"', roast: '胆子大是好事，但不是每次都能跑掉' },
    ESFP: { title: '行走的充电宝', emoji: '🔋', tagline: '有你在的地方大家都很开心，但你回家之后一句话都不想说', roast: '热闹是你的，但散场之后只剩你一个人' },
  };

  // ==================== Grip警告数据 ====================
  const GRIP_DATA = {
    Se: {
      title: '你的「本能开关」会失灵',
      translate: '你平时活在脑子里，活在计划里，活在「未来某个时候」',
      hit: '但你压力一大，这个开关就失灵了——你会暴饮暴食、疯狂下单、刷短视频到凌晨四点。你不是在享受当下，你是在用感官刺激麻痹自己的焦虑',
      advice: '你的「本能开关」不是坏的，它只是太久没用了。偶尔允许自己不思考、只感受',
    },
    Si: {
      title: '你的「回放键」会卡住',
      translate: '你是个向前看的人，过去对你来说只是数据',
      hit: '但你压力一大，「回放键」就卡住了——你会反复翻旧账、强迫检查、恐惧最坏的结果。你不是洒脱，你是连自己的过去都放不下',
      advice: '你的「过去」不是敌人。偶尔回头看一眼，不是认输，是确认自己走了多远',
    },
    Te: {
      title: '你的「情感盖子」会爆开',
      translate: '你是个有原则的人，忠于自己的感受，平时看起来温柔但坚定',
      hit: '但你压力一大，那个盖子就爆了——你会突然对所有人发火、变得控制欲极强、连猫吃饭都得按你的规矩来。你平时追求真实，崩溃时最虚伪',
      advice: '你的「控制欲」不是坏的，它只是太久没被理解了。允许自己偶尔不完美',
    },
    Fe: {
      title: '你的「连接线」会断裂',
      translate: '你是个独立的人，平时不太需要别人，觉得感情这东西太麻烦',
      hit: '但你压力一大，「连接线」就断了——你会关掉手机谁都不理、拉上窗帘躺三天、仿佛人间蒸发。你平时觉得感情都是多余，崩溃时比谁都矫情',
      advice: '你的「孤独」不是自由，是逃避。偶尔让一个人进来，不会死',
    },
  };

  // ==================== 计分引擎 ====================

  // Grip第一票（题17）的缓存，用于复测不一致时回退
  let _gripFirstVote = null;

  /**
   * 初始化答题状态
   */
  function createAnswers() {
    _gripFirstVote = null;
    return {
      birth: null,    // { year, month, day, hour }
      IE: [],         // 存储每题的值 'I'|'E'|null
      SN: [],
      TF: [],
      JP: [],
      grip: null,     // 'Se'|'Si'|'Te'|'Fe'
      dilemma: null,  // 'output_overload'|'input_choked'|'pressure_crushed'|'lost_empty'
      cognition: null, // 'high'|'low'|'accurate'
      business: null, // 'direction'|'execution'|'health'|'teamwork'
    };
  }

  /**
   * 记录答案
   */
  function recordAnswer(answers, questionId, optionIndex) {
    const q = QUESTIONS[questionId];
    if (!q) return;

    if (q.type === 'date') return;
    if (q.type === 'grip') {
      const gripVal = q.options[optionIndex].grip;
      // 复测逻辑：第一次（题17）缓存，第二次（题18）对比
      if (_gripFirstVote === null) {
        _gripFirstVote = gripVal;
        answers.grip = gripVal;
      } else {
        // 不一致时取第一票（本能反应更准）
        answers.grip = _gripFirstVote;
      }
      return;
    }
    if (q.type === 'dilemma') {
      answers.dilemma = q.options[optionIndex].dilemma;
      return;
    }
    if (q.type === 'cognition') {
      answers.cognition = q.options[optionIndex].cognition;
      return;
    }
    if (q.type === 'cross') {
      const opt = q.options[optionIndex];
      if (opt.crossIE) answers.IE.push(opt.crossIE);
      if (opt.crossSN) answers.SN.push(opt.crossSN);
      if (opt.crossTF) answers.TF.push(opt.crossTF);
      if (opt.crossJP) answers.JP.push(opt.crossJP);
      return;
    }
    if (q.type === 'business') {
      answers.business = q.options[optionIndex].business;
      return;
    }

    // 标准维度题 (IE/SN/TF/JP)
    if (q.dim) {
      const value = q.options[optionIndex].value;
      if (value) answers[q.dim].push(value);
    }
  }

  /**
   * 多数票判定
   */
  function majorityVote(votes) {
    const valid = votes.filter(function(v) { return v !== null && v !== undefined; });
    if (valid.length === 0) return null;
    var counts = {};
    for (var i = 0; i < valid.length; i++) {
      counts[valid[i]] = (counts[valid[i]] || 0) + 1;
    }
    var max = 0, result = null;
    var keys = Object.keys(counts);
    for (var j = 0; j < keys.length; j++) {
      if (counts[keys[j]] > max) { max = counts[keys[j]]; result = keys[j]; }
    }
    return result;
  }

  /**
   * 计算最终16型人格
   */
  function calcType16(answers) {
    var ie = majorityVote(answers.IE) || 'I';
    var sn = majorityVote(answers.SN) || 'S';
    var tf = majorityVote(answers.TF) || 'T';
    var jp = majorityVote(answers.JP) || 'J';
    return ie + sn + tf + jp;
  }

  /**
   * 完整分析
   */
  function analyzePersonality(answers) {
    var type16 = calcType16(answers);
    var typeInfo = TYPE_16[type16];
    var gripInfo = answers.grip ? GRIP_DATA[answers.grip] : null;

    return {
      type16: type16,
      typeInfo: typeInfo,
      grip: answers.grip,
      gripInfo: gripInfo,
      dilemma: answers.dilemma,
      cognition: answers.cognition,
      business: answers.business,
      votes: {
        IE: answers.IE,
        SN: answers.SN,
        TF: answers.TF,
        JP: answers.JP,
      },
    };
  }

  // ==================== 导出 ====================
  global.PersonalityEngine = {
    QUESTIONS: QUESTIONS,
    TYPE_16: TYPE_16,
    GRIP_DATA: GRIP_DATA,
    createAnswers: createAnswers,
    recordAnswer: recordAnswer,
    majorityVote: majorityVote,
    calcType16: calcType16,
    analyzePersonality: analyzePersonality,
  };

})(typeof window !== 'undefined' ? window : this);
