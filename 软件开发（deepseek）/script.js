const loginPage = document.getElementById('loginPage');
const mainPage = document.getElementById('mainPage');
const userCenterPage = document.getElementById('userCenterPage');
const wrongNotePage = document.getElementById('wrongNotePage');
const subjectNameInput = document.getElementById('subjectName');
const gradeSelect = document.getElementById('gradeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const generateBtn = document.getElementById('generateBtn');
const newTopicBtn = document.getElementById('newTopicBtn');
const questionsContainer = document.getElementById('questionsContainer');

// 后端 API 地址
const API_BASE = '';

// 手机号校验：严格11位纯数字，以1开头
const phoneReg = /^1\d{10}$/;

// 本地登录凭证
let loginToken = null;
let currentUserPhone = null;
let currentFullPhone = null;  // 存储完整手机号

// 题目数据
let currentQuestions = [];
let allLoadedQuestions = [];  // 加载更多的所有题目
let hideAnswers = false;  // 隐藏答案开关

// 学科分类数据（与左侧栏结构一致）
const subjectCategories = {
  computer: [
    { major: '计算机科学与技术', subjects: ['Java程序设计', '数据结构', '计算机网络', '操作系统'] },
    { major: '软件工程', subjects: ['Web前端开发', '数据库', '软件测试'] },
    { major: '网络工程', subjects: ['路由交换技术', '网络安全'] },
    { major: '信息安全', subjects: ['密码学', '渗透测试'] },
    { major: '人工智能', subjects: ['机器学习', '深度学习'] },
    { major: '数据科学与大数据技术', subjects: ['大数据分析', 'Python开发'] },
    { major: '物联网工程', subjects: ['嵌入式开发', '传感器技术'] }
  ],
  electrical: [
    { major: '电气工程及其自动化', subjects: ['电路原理', '电力系统分析'] },
    { major: '自动化', subjects: ['自动控制原理', 'PLC应用'] },
    { major: '电子信息工程', subjects: ['模拟电子技术', '数字电子技术'] },
    { major: '通信工程', subjects: ['通信原理', '信号处理'] }
  ],
  mechanical: [
    { major: '机械设计制造及其自动化', subjects: ['机械制图', '机械设计'] },
    { major: '土木工程', subjects: ['建筑力学', '土力学'] },
    { major: '建筑环境与能源应用工程', subjects: ['暖通空调', '流体力学'] },
    { major: '车辆工程', subjects: ['汽车构造', '汽车理论'] }
  ],
  management: [
    { major: '会计学', subjects: ['基础会计', '中级财务会计'] },
    { major: '财务管理', subjects: ['财务管理学', '证券投资'] },
    { major: '工商管理', subjects: ['管理学原理', '市场营销'] },
    { major: '经济学', subjects: ['微观经济学', '宏观经济学'] }
  ],
  agriculture: [
    { major: '农学', subjects: ['植物生理学', '作物栽培学'] },
    { major: '林学', subjects: ['森林生态学', '树木学'] },
    { major: '动物科学', subjects: ['动物生理学', '饲料学'] },
    { major: '生物技术', subjects: ['分子生物学', '基因工程'] }
  ],
  arts: [
    { major: '汉语言文学', subjects: ['古代文学', '现代汉语'] },
    { major: '英语', subjects: ['综合英语', '英美文学'] },
    { major: '法学', subjects: ['民法', '刑法'] },
    { major: '新闻学', subjects: ['新闻采访', '传播学'] },
    { major: '视觉传达设计', subjects: ['平面设计', '色彩构成'] },
    { major: '环境设计', subjects: ['室内设计', '景观设计'] }
  ],
  medical: [
    { major: '临床医学', subjects: ['人体解剖学', '生理学'] },
    { major: '护理学', subjects: ['基础护理学', '内科护理'] },
    { major: '药学', subjects: ['药理学', '药剂学'] },
    { major: '预防医学', subjects: ['流行病学', '卫生统计学'] }
  ]
};

// ============================================
// 本地题库数据（所有课程的预存习题）
// ============================================
const localQuestionBank = {
  // 计算机与信息类
  'Java程序设计': {
    初级: [
      { question: 'Java中int类型占用多少字节？', answer: '4字节' },
      { question: 'Java中如何定义一个常量？', answer: '使用final关键字，如：final int MAX = 100;' },
      { question: 'Java中main方法的签名是什么？', answer: 'public static void main(String[] args)' },
      { question: 'Java中如何创建一个数组？', answer: 'int[] arr = new int[5]; 或 int[] arr = {1,2,3,4,5};' }
    ],
    中级: [
      { question: 'Java中String、StringBuilder、StringBuffer的区别是什么？', answer: 'String是不可变的，StringBuilder和StringBuffer是可变的；StringBuilder是非线程安全的，StringBuffer是线程安全的' },
      { question: 'Java中==和equals()方法的区别是什么？', answer: '==比较的是内存地址，equals()比较的是对象内容（String类重写了equals方法）' },
      { question: 'Java中什么是多态？如何实现？', answer: '多态是指同一个方法调用，由于对象不同可能会有不同的行为。通过方法重写和父类引用指向子类对象实现' },
      { question: 'Java中异常处理的try-catch-finally执行顺序是什么？', answer: '先执行try块，如果异常则执行catch块，finally块无论是否异常都会执行' }
    ],
    高级: [
      { question: 'Java中HashMap的实现原理是什么？', answer: 'HashMap基于数组+链表+红黑树实现，通过key的hashCode计算数组索引，冲突时使用链表或红黑树解决' },
      { question: 'Java中JVM的内存结构是怎样的？', answer: 'JVM内存分为堆、栈、方法区、程序计数器、本地方法栈。堆存储对象实例，栈存储方法调用和局部变量' },
      { question: 'Java中什么是垃圾回收？有哪些算法？', answer: '垃圾回收是自动回收不再使用的对象内存。常见算法有标记-清除、复制、标记-整理、分代回收' },
      { question: 'Java中如何实现线程安全的单例模式？', answer: '使用双重检查锁、静态内部类、枚举等方式实现线程安全的单例模式' }
    ]
  },
  '数据结构': {
    初级: [
      { question: '什么是栈？它的特点是什么？', answer: '栈是一种后进先出（LIFO）的线性数据结构，只允许在一端进行插入和删除操作' },
      { question: '什么是队列？它的特点是什么？', answer: '队列是一种先进先出（FIFO）的线性数据结构，在一端插入，在另一端删除' },
      { question: '数组和链表的区别是什么？', answer: '数组在内存中连续存储，访问快但插入删除慢；链表不连续，访问慢但插入删除快' },
      { question: '什么是时间复杂度？', answer: '时间复杂度是算法执行时间随输入规模增长的度量，常用大O表示法描述' }
    ],
    中级: [
      { question: '二叉树的前序、中序、后序遍历有什么区别？', answer: '前序：根-左-右；中序：左-根-右；后序：左-右-根' },
      { question: '快速排序的基本思想是什么？', answer: '选择一个基准元素，将数组分为两部分，左边小于基准，右边大于基准，然后递归排序' },
      { question: '哈希表是什么？如何解决哈希冲突？', answer: '哈希表通过哈希函数将键映射到存储位置。冲突解决方法有链地址法、开放地址法、再哈希法' },
      { question: '什么是堆？堆有哪些类型？', answer: '堆是一种特殊的完全二叉树，分为最大堆（父节点大于子节点）和最小堆（父节点小于子节点）' }
    ],
    高级: [
      { question: '红黑树的特点是什么？', answer: '红黑树是一种自平衡二叉查找树，节点有红黑两种颜色，满足根黑、叶黑、红不连续、黑高等性质' },
      { question: '图的最短路径算法有哪些？', answer: 'Dijkstra算法（适用于非负权图）、Bellman-Ford算法（适用于有负权图）、Floyd-Warshall算法（求所有节点对最短路径）' },
      { question: '什么是动态规划？适用条件是什么？', answer: '动态规划将问题分解为子问题，通过存储子问题的解避免重复计算。适用条件：最优子结构、重叠子问题、无后效性' },
      { question: 'B树和B+树的区别是什么？', answer: 'B树所有节点都存储数据，B+树只有叶子节点存储数据，B+树叶子节点通过链表连接，适合范围查询' }
    ]
  },
  '计算机网络': {
    初级: [
      { question: 'OSI七层模型有哪些层？', answer: '物理层、数据链路层、网络层、传输层、会话层、表示层、应用层' },
      { question: 'TCP和UDP的区别是什么？', answer: 'TCP是面向连接的可靠传输协议，UDP是无连接的不可靠传输协议' },
      { question: 'HTTP和HTTPS的区别是什么？', answer: 'HTTPS在HTTP基础上增加了SSL/TLS加密层，更安全' },
      { question: '什么是IP地址？IPv4和IPv6有什么区别？', answer: 'IP地址是网络设备的标识。IPv4是32位地址，IPv6是128位地址' }
    ],
    中级: [
      { question: 'TCP三次握手的过程是什么？', answer: '客户端发送SYN，服务端回复SYN+ACK，客户端回复ACK，建立连接' },
      { question: '什么是DNS？DNS解析过程是什么？', answer: 'DNS是域名系统，将域名解析为IP地址。解析过程：浏览器缓存→本地DNS缓存→本地DNS服务器→根域名服务器→顶级域名服务器→权威域名服务器' },
      { question: '什么是ARP协议？', answer: 'ARP（地址解析协议）将IP地址解析为MAC地址' },
      { question: 'HTTP请求方法有哪些？', answer: 'GET、POST、PUT、DELETE、HEAD、OPTIONS、PATCH等' }
    ],
    高级: [
      { question: 'TCP拥塞控制有哪些算法？', answer: '慢启动、拥塞避免、快重传、快恢复' },
      { question: '什么是CDN？它的工作原理是什么？', answer: 'CDN（内容分发网络）通过在各地部署缓存服务器，将内容缓存到离用户最近的服务器，提高访问速度' },
      { question: '什么是负载均衡？常见算法有哪些？', answer: '负载均衡将请求分发到多台服务器。常见算法：轮询、加权轮询、最少连接、IP哈希' },
      { question: '什么是WebSocket？它和HTTP的区别是什么？', answer: 'WebSocket是全双工通信协议，支持服务器主动推送。HTTP是单向请求-响应模式' }
    ]
  },
  '操作系统': {
    初级: [
      { question: '什么是进程？什么是线程？', answer: '进程是资源分配的基本单位，线程是CPU调度的基本单位。一个进程可以包含多个线程' },
      { question: '什么是死锁？', answer: '死锁是指两个或多个进程因争夺资源而造成互相等待的现象' },
      { question: '什么是虚拟内存？', answer: '虚拟内存是操作系统提供的一种内存管理技术，将物理内存和磁盘空间结合起来，扩大可用内存' },
      { question: '什么是文件系统？', answer: '文件系统是操作系统用于管理存储设备上文件和目录的机制' }
    ],
    中级: [
      { question: '进程调度算法有哪些？', answer: '先来先服务、短作业优先、时间片轮转、优先级调度、多级反馈队列' },
      { question: '什么是分页和分段？', answer: '分页将内存划分为固定大小的页，分段按逻辑结构划分。分页提高内存利用率，分段便于共享和保护' },
      { question: '什么是中断？中断类型有哪些？', answer: '中断是CPU暂停当前程序执行转而处理紧急事件的机制。类型：硬件中断、软件中断、异常' },
      { question: '什么是同步和互斥？', answer: '同步是协调多个进程的执行顺序，互斥是保证同一时间只有一个进程访问共享资源' }
    ],
    高级: [
      { question: '什么是银行家算法？', answer: '银行家算法是一种避免死锁的算法，通过模拟资源分配，确保系统始终处于安全状态' },
      { question: '什么是LRU页面置换算法？', answer: 'LRU（最近最少使用）算法淘汰最长时间未被访问的页面' },
      { question: '什么是系统调用？', answer: '系统调用是用户程序请求操作系统服务的接口，如文件操作、进程控制等' },
      { question: '什么是微内核和宏内核？', answer: '微内核只保留最基本的功能在内核态，宏内核将大部分功能放在内核态。微内核更灵活，宏内核性能更好' }
    ]
  },
  'Web前端开发': {
    初级: [
      { question: 'HTML、CSS、JavaScript的作用是什么？', answer: 'HTML定义页面结构，CSS控制页面样式，JavaScript实现页面交互' },
      { question: '如何引入CSS样式？', answer: '内联样式、内部样式表、外部样式表' },
      { question: 'JavaScript中如何声明变量？', answer: '使用var、let、const关键字声明变量' },
      { question: '什么是DOM？', answer: 'DOM（文档对象模型）是HTML文档的编程接口，允许JavaScript操作页面元素' }
    ],
    中级: [
      { question: '什么是盒模型？', answer: '盒模型包括内容、内边距、边框、外边距四个部分' },
      { question: '什么是事件冒泡和事件捕获？', answer: '事件冒泡是从内到外传播，事件捕获是从外到内传播' },
      { question: '什么是闭包？', answer: '闭包是函数和其词法环境的组合，允许函数访问外部作用域的变量' },
      { question: '什么是Promise？', answer: 'Promise是处理异步操作的对象，有三种状态：pending、fulfilled、rejected' }
    ],
    高级: [
      { question: '什么是虚拟DOM？', answer: '虚拟DOM是真实DOM的内存表示，通过对比差异更新真实DOM，提高性能' },
      { question: '什么是事件循环？', answer: '事件循环是JavaScript的异步机制，包括调用栈、任务队列、微任务队列' },
      { question: '什么是模块化？', answer: '模块化是将代码分割为独立可复用的模块，如ES6模块、CommonJS、AMD' },
      { question: '什么是响应式设计？', answer: '响应式设计使网页适应不同设备屏幕，通过媒体查询、弹性布局、相对单位实现' }
    ]
  },
  '数据库': {
    初级: [
      { question: '什么是SQL？', answer: 'SQL（结构化查询语言）是用于管理关系数据库的语言' },
      { question: '什么是主键？', answer: '主键是唯一标识表中每条记录的字段，不能为空且唯一' },
      { question: '什么是外键？', answer: '外键是一个表中的字段，指向另一个表的主键，用于建立表之间的关联' },
      { question: '什么是索引？', answer: '索引是提高查询速度的数据结构，类似于书的目录' }
    ],
    中级: [
      { question: '什么是事务？ACID特性是什么？', answer: '事务是一组SQL操作，ACID特性：原子性、一致性、隔离性、持久性' },
      { question: '什么是内连接和外连接？', answer: '内连接只返回匹配的行，外连接返回匹配和不匹配的行（左外连接、右外连接、全外连接）' },
      { question: '什么是视图？', answer: '视图是虚拟表，基于SQL查询结果，不存储实际数据' },
      { question: '什么是存储过程？', answer: '存储过程是预编译的SQL语句集合，存储在数据库中可重复调用' }
    ],
    高级: [
      { question: '什么是数据库范式？', answer: '范式是数据库设计的规范，包括1NF、2NF、3NF、BCNF等，用于消除数据冗余和异常' },
      { question: '什么是数据库锁？', answer: '数据库锁用于控制并发访问，包括共享锁、排他锁、乐观锁、悲观锁' },
      { question: '什么是数据库优化？', answer: '数据库优化包括索引优化、查询优化、表结构优化、配置优化等' },
      { question: '什么是主从复制？', answer: '主从复制是将主数据库的数据同步到从数据库，用于读写分离和备份' }
    ]
  },
  '软件测试': {
    初级: [
      { question: '什么是软件测试？', answer: '软件测试是评估软件质量的过程，发现缺陷和问题' },
      { question: '什么是黑盒测试和白盒测试？', answer: '黑盒测试不考虑内部结构，白盒测试基于代码内部逻辑' },
      { question: '什么是单元测试？', answer: '单元测试是对软件中最小可测试单元（函数、方法）进行测试' },
      { question: '什么是回归测试？', answer: '回归测试是在软件修改后重新测试，确保修改没有引入新的缺陷' }
    ],
    中级: [
      { question: '什么是测试用例？', answer: '测试用例是测试的详细描述，包括输入、预期结果、测试步骤等' },
      { question: '什么是边界值分析？', answer: '边界值分析是测试输入的边界情况，如最小值、最大值、边界附近值' },
      { question: '什么是等价类划分？', answer: '等价类划分是将输入分为若干等价类，从每个类中选取代表值测试' },
      { question: '什么是集成测试？', answer: '集成测试是测试多个模块组合后的功能和接口' }
    ],
    高级: [
      { question: '什么是自动化测试？', answer: '自动化测试是使用工具和脚本自动执行测试，提高效率和覆盖率' },
      { question: '什么是性能测试？', answer: '性能测试是评估软件性能指标，如响应时间、吞吐量、并发用户数' },
      { question: '什么是压力测试？', answer: '压力测试是测试系统在超负荷情况下的表现，发现系统的极限和瓶颈' },
      { question: '什么是测试驱动开发（TDD）？', answer: 'TDD是先编写测试用例，再编写代码，通过测试驱动开发' }
    ]
  },
  '路由交换技术': {
    初级: [
      { question: '什么是路由器？', answer: '路由器是网络层设备，用于连接不同网络，实现数据包转发' },
      { question: '什么是交换机？', answer: '交换机是数据链路层设备，用于连接同一网络内的设备，实现数据帧转发' },
      { question: '什么是IP地址？', answer: 'IP地址是网络设备的逻辑地址，用于标识网络中的设备' },
      { question: '什么是子网掩码？', answer: '子网掩码用于区分IP地址中的网络部分和主机部分' }
    ],
    中级: [
      { question: '什么是静态路由和动态路由？', answer: '静态路由由管理员手动配置，动态路由通过路由协议自动学习' },
      { question: '什么是RIP协议？', answer: 'RIP（路由信息协议）是一种距离向量路由协议，使用跳数作为度量' },
      { question: '什么是OSPF协议？', answer: 'OSPF（开放最短路径优先）是一种链路状态路由协议，使用Dijkstra算法计算最短路径' },
      { question: '什么是VLAN？', answer: 'VLAN（虚拟局域网）将物理网络划分为多个逻辑网络，提高网络安全性和管理效率' }
    ],
    高级: [
      { question: '什么是BGP协议？', answer: 'BGP（边界网关协议）是互联网的核心路由协议，用于自治系统之间的路由交换' },
      { question: '什么是MPLS？', answer: 'MPLS（多协议标签交换）是一种数据转发技术，提高网络性能和灵活性' },
      { question: '什么是NAT？', answer: 'NAT（网络地址转换）将私有IP地址转换为公有IP地址，解决IP地址不足问题' },
      { question: '什么是QoS？', answer: 'QoS（服务质量）是网络对数据传输的优先级控制，保证重要业务的传输质量' }
    ]
  },
  '网络安全': {
    初级: [
      { question: '什么是防火墙？', answer: '防火墙是网络安全设备，用于监控和控制网络流量，阻止未授权访问' },
      { question: '什么是病毒和木马？', answer: '病毒是自我复制的恶意程序，木马是伪装成合法程序的恶意软件' },
      { question: '什么是钓鱼攻击？', answer: '钓鱼攻击是通过伪造网站或邮件骗取用户敏感信息' },
      { question: '什么是强密码？', answer: '强密码包含大小写字母、数字、特殊字符，长度至少8位' }
    ],
    中级: [
      { question: '什么是DDoS攻击？', answer: 'DDoS（分布式拒绝服务）攻击通过大量请求使服务器瘫痪' },
      { question: '什么是SQL注入？', answer: 'SQL注入是通过输入恶意SQL语句获取或篡改数据库数据' },
      { question: '什么是XSS攻击？', answer: 'XSS（跨站脚本）攻击是在网页中插入恶意脚本，窃取用户信息' },
      { question: '什么是HTTPS？', answer: 'HTTPS是HTTP的安全版本，使用SSL/TLS加密传输数据' }
    ],
    高级: [
      { question: '什么是加密算法？对称加密和非对称加密的区别？', answer: '加密算法用于保护数据安全。对称加密使用相同密钥加密解密，非对称加密使用公钥私钥对' },
      { question: '什么是数字证书？', answer: '数字证书是由权威机构签发的电子文档，用于验证网站或用户身份' },
      { question: '什么是入侵检测系统（IDS）？', answer: 'IDS是监控网络流量，检测和报告异常行为的系统' },
      { question: '什么是零信任架构？', answer: '零信任架构是不信任任何内部或外部网络，对所有访问进行严格验证的安全模型' }
    ]
  },
  '密码学': {
    初级: [
      { question: '什么是加密？', answer: '加密是将明文转换为密文的过程，保护数据安全' },
      { question: '什么是解密？', answer: '解密是将密文转换为明文的过程，需要正确的密钥' },
      { question: '什么是密钥？', answer: '密钥是加密和解密的关键参数，分为对称密钥和非对称密钥' },
      { question: '什么是哈希函数？', answer: '哈希函数将任意长度的数据映射为固定长度的哈希值，用于数据完整性验证' }
    ],
    中级: [
      { question: '什么是DES算法？', answer: 'DES（数据加密标准）是一种对称加密算法，使用56位密钥' },
      { question: '什么是AES算法？', answer: 'AES（高级加密标准）是一种对称加密算法，支持128、192、256位密钥' },
      { question: '什么是RSA算法？', answer: 'RSA是一种非对称加密算法，基于大数分解难题，用于加密和数字签名' },
      { question: '什么是MD5和SHA？', answer: 'MD5和SHA是哈希算法，用于生成消息摘要，验证数据完整性' }
    ],
    高级: [
      { question: '什么是椭圆曲线加密？', answer: '椭圆曲线加密是基于椭圆曲线数学问题的非对称加密算法，比RSA更高效' },
      { question: '什么是数字签名？', answer: '数字签名是用私钥对数据进行加密，用公钥验证，确保数据完整性和身份认证' },
      { question: '什么是PKI？', answer: 'PKI（公钥基础设施）是管理公钥和数字证书的框架，提供安全通信服务' },
      { question: '什么是量子加密？', answer: '量子加密利用量子力学原理实现无条件安全的通信，如量子密钥分发' }
    ]
  },
  '渗透测试': {
    初级: [
      { question: '什么是渗透测试？', answer: '渗透测试是模拟黑客攻击，评估系统安全性的过程' },
      { question: '什么是漏洞扫描？', answer: '漏洞扫描是使用工具自动发现系统中的安全漏洞' },
      { question: '什么是端口扫描？', answer: '端口扫描是检测目标主机开放的端口和服务' },
      { question: '什么是社会工程学攻击？', answer: '社会工程学攻击是通过欺骗手段获取敏感信息' }
    ],
    中级: [
      { question: '什么是Metasploit？', answer: 'Metasploit是渗透测试框架，提供漏洞利用工具和漏洞库' },
      { question: '什么是Burp Suite？', answer: 'Burp Suite是Web应用安全测试工具，用于拦截、修改、重放HTTP请求' },
      { question: '什么是SQL注入工具？', answer: 'SQL注入工具如SQLMap，用于自动化检测和利用SQL注入漏洞' },
      { question: '什么是XSS测试？', answer: 'XSS测试是检测网页中的跨站脚本漏洞，如反射型、存储型、DOM型XSS' }
    ],
    高级: [
      { question: '什么是提权？', answer: '提权是通过漏洞获取更高权限，如从普通用户提升到管理员' },
      { question: '什么是内网渗透？', answer: '内网渗透是在获得外网访问权限后，进一步攻击内部网络' },
      { question: '什么是APT攻击？', answer: 'APT（高级持续性威胁）是针对特定目标的长期、隐蔽的攻击' },
      { question: '什么是红队和蓝队？', answer: '红队是攻击方，模拟真实攻击；蓝队是防守方，检测和响应攻击' }
    ]
  },
  '机器学习': {
    初级: [
      { question: '什么是机器学习？', answer: '机器学习是让计算机从数据中学习规律，自动改进性能的技术' },
      { question: '什么是监督学习和无监督学习？', answer: '监督学习使用有标签的数据训练，无监督学习使用无标签的数据发现模式' },
      { question: '什么是训练集和测试集？', answer: '训练集用于模型训练，测试集用于评估模型性能' },
      { question: '什么是过拟合？', answer: '过拟合是模型在训练集上表现很好，但在测试集上表现差' }
    ],
    中级: [
      { question: '什么是决策树？', answer: '决策树是通过一系列规则进行分类或回归的树形结构' },
      { question: '什么是随机森林？', answer: '随机森林是由多个决策树组成的集成学习方法，通过投票或平均提高性能' },
      { question: '什么是支持向量机（SVM）？', answer: 'SVM是一种分类算法，通过找到最优超平面将数据分开' },
      { question: '什么是K-近邻算法？', answer: 'K-近邻算法根据最近的K个邻居的类别来预测新样本的类别' }
    ],
    高级: [
      { question: '什么是神经网络？', answer: '神经网络是模拟人脑结构的计算模型，由多个神经元层组成' },
      { question: '什么是反向传播算法？', answer: '反向传播是训练神经网络的算法，通过计算梯度更新权重' },
      { question: '什么是梯度下降？', answer: '梯度下降是优化算法，通过沿梯度方向迭代更新参数，最小化损失函数' },
      { question: '什么是交叉验证？', answer: '交叉验证是将数据分成多个子集，轮流作为训练集和测试集，评估模型性能' }
    ]
  },
  '深度学习': {
    初级: [
      { question: '什么是深度学习？', answer: '深度学习是机器学习的分支，使用多层神经网络学习数据特征' },
      { question: '什么是卷积神经网络（CNN）？', answer: 'CNN是专门处理图像数据的神经网络，通过卷积层提取特征' },
      { question: '什么是循环神经网络（RNN）？', answer: 'RNN是处理序列数据的神经网络，具有记忆功能' },
      { question: '什么是激活函数？', answer: '激活函数引入非线性，如ReLU、Sigmoid、Tanh' }
    ],
    中级: [
      { question: '什么是池化层？', answer: '池化层用于降低特征维度，如最大池化、平均池化' },
      { question: '什么是LSTM？', answer: 'LSTM（长短期记忆网络）是改进的RNN，解决长期依赖问题' },
      { question: '什么是Dropout？', answer: 'Dropout是正则化技术，随机丢弃神经元防止过拟合' },
      { question: '什么是Batch Normalization？', answer: 'Batch Normalization是对每一批数据进行归一化，加速训练和稳定梯度' }
    ],
    高级: [
      { question: '什么是Transformer？', answer: 'Transformer是基于注意力机制的神经网络架构，用于自然语言处理' },
      { question: '什么是注意力机制？', answer: '注意力机制让模型关注输入的重要部分，提高性能' },
      { question: '什么是GAN？', answer: 'GAN（生成对抗网络）由生成器和判别器组成，通过对抗训练生成真实数据' },
      { question: '什么是迁移学习？', answer: '迁移学习是将预训练模型应用到新任务，减少训练数据和时间' }
    ]
  },
  '大数据分析': {
    初级: [
      { question: '什么是大数据？', answer: '大数据是规模大、类型多、处理速度快的数据集合' },
      { question: '什么是Hadoop？', answer: 'Hadoop是分布式计算框架，用于存储和处理大数据' },
      { question: '什么是HDFS？', answer: 'HDFS（Hadoop分布式文件系统）是Hadoop的存储组件，分布式存储大文件' },
      { question: '什么是MapReduce？', answer: 'MapReduce是Hadoop的计算模型，分为Map和Reduce两个阶段' }
    ],
    中级: [
      { question: '什么是Spark？', answer: 'Spark是内存计算框架，比MapReduce更快' },
      { question: '什么是Hive？', answer: 'Hive是数据仓库工具，提供SQL接口查询Hadoop数据' },
      { question: '什么是HBase？', answer: 'HBase是NoSQL数据库，基于HDFS，支持实时读写' },
      { question: '什么是Flume？', answer: 'Flume是日志收集工具，将日志数据传输到HDFS' }
    ],
    高级: [
      { question: '什么是Kafka？', answer: 'Kafka是分布式消息队列，用于实时数据流处理' },
      { question: '什么是Storm？', answer: 'Storm是实时计算框架，处理流式数据' },
      { question: '什么是Flink？', answer: 'Flink是流处理框架，支持批处理和流处理' },
      { question: '什么是数据挖掘？', answer: '数据挖掘是从大数据中发现有价值的信息和模式' }
    ]
  },
  'Python开发': {
    初级: [
      { question: 'Python中如何定义变量？', answer: '直接赋值，如：x = 10' },
      { question: 'Python中如何定义函数？', answer: '使用def关键字，如：def hello(): print("Hello")' },
      { question: 'Python中如何定义列表？', answer: '使用方括号，如：list = [1, 2, 3]' },
      { question: 'Python中如何定义字典？', answer: '使用花括号，如：dict = {"key": "value"}' }
    ],
    中级: [
      { question: 'Python中什么是装饰器？', answer: '装饰器是修改函数或类功能的工具，使用@语法' },
      { question: 'Python中什么是生成器？', answer: '生成器是使用yield关键字的函数，可以迭代产生值' },
      { question: 'Python中什么是列表推导式？', answer: '列表推导式是简洁创建列表的方式，如：[x*2 for x in range(5)]' },
      { question: 'Python中什么是异常处理？', answer: '使用try-except捕获和处理异常' }
    ],
    高级: [
      { question: 'Python中什么是元类？', answer: '元类是创建类的类，可以控制类的创建行为' },
      { question: 'Python中什么是多线程和多进程？', answer: '多线程是多个线程共享内存，多进程是多个进程独立内存' },
      { question: 'Python中什么是GIL？', answer: 'GIL（全局解释器锁）是Python解释器的锁，限制多线程并行执行' },
      { question: 'Python中什么是异步编程？', answer: '异步编程使用async/await语法，提高IO密集型任务性能' }
    ]
  },
  '嵌入式开发': {
    初级: [
      { question: '什么是嵌入式系统？', answer: '嵌入式系统是专用计算机系统，集成在设备中执行特定功能' },
      { question: '什么是单片机？', answer: '单片机是将CPU、存储器、外设集成在一个芯片上的微型计算机' },
      { question: '什么是GPIO？', answer: 'GPIO（通用输入输出）是单片机的引脚，可以配置为输入或输出' },
      { question: '什么是中断？', answer: '中断是外部事件触发CPU暂停当前程序执行的处理机制' }
    ],
    中级: [
      { question: '什么是PWM？', answer: 'PWM（脉冲宽度调制）是通过改变脉冲宽度控制模拟信号的数字技术' },
      { question: '什么是ADC？', answer: 'ADC（模数转换器）将模拟信号转换为数字信号' },
      { question: '什么是UART？', answer: 'UART（通用异步收发器）是串行通信接口' },
      { question: '什么是I2C？', answer: 'I2C是两线串行通信协议，用于连接多个设备' }
    ],
    高级: [
      { question: '什么是RTOS？', answer: 'RTOS（实时操作系统）是用于嵌入式系统的操作系统，保证任务实时响应' },
      { question: '什么是FreeRTOS？', answer: 'FreeRTOS是开源的实时操作系统，支持任务调度、通信、同步' },
      { question: '什么是嵌入式Linux？', answer: '嵌入式Linux是裁剪的Linux系统，用于嵌入式设备' },
      { question: '什么是Bootloader？', answer: 'Bootloader是系统启动时运行的程序，负责加载操作系统' }
    ]
  },
  '传感器技术': {
    初级: [
      { question: '什么是传感器？', answer: '传感器是检测物理量并转换为电信号的设备' },
      { question: '什么是温度传感器？', answer: '温度传感器检测温度变化，如热敏电阻、热电偶' },
      { question: '什么是湿度传感器？', answer: '湿度传感器检测空气湿度，如电容式湿度传感器' },
      { question: '什么是压力传感器？', answer: '压力传感器检测压力变化，如压阻式压力传感器' }
    ],
    中级: [
      { question: '什么是加速度传感器？', answer: '加速度传感器检测加速度变化，用于运动检测' },
      { question: '什么是陀螺仪？', answer: '陀螺仪检测角速度变化，用于姿态控制' },
      { question: '什么是磁力传感器？', answer: '磁力传感器检测磁场强度，用于指南针' },
      { question: '什么是光电传感器？', answer: '光电传感器检测光线变化，用于光控开关' }
    ],
    高级: [
      { question: '什么是MEMS传感器？', answer: 'MEMS（微机电系统）传感器是微型化的传感器，集成在芯片上' },
      { question: '什么是无线传感器网络？', answer: '无线传感器网络是由多个传感器节点组成的网络，用于环境监测' },
      { question: '什么是传感器融合？', answer: '传感器融合是结合多个传感器的数据，提高测量精度' },
      { question: '什么是智能传感器？', answer: '智能传感器集成了传感器、处理器、通信接口，具有自诊断和自校准功能' }
    ]
  },
  // 电气自动化类
  '电路原理': {
    初级: [
      { question: '什么是电压？', answer: '电压是电势差，单位是伏特（V）' },
      { question: '什么是电流？', answer: '电流是电荷的定向移动，单位是安培（A）' },
      { question: '什么是电阻？', answer: '电阻是阻碍电流流动的物理量，单位是欧姆（Ω）' },
      { question: '什么是欧姆定律？', answer: '欧姆定律：电压=电流×电阻（V=IR）' }
    ],
    中级: [
      { question: '什么是串联电路？', answer: '串联电路是元件依次连接，电流相同，电压相加' },
      { question: '什么是并联电路？', answer: '并联电路是元件并列连接，电压相同，电流相加' },
      { question: '什么是基尔霍夫定律？', answer: '基尔霍夫电流定律：节点电流代数和为零；电压定律：回路电压代数和为零' },
      { question: '什么是功率？', answer: '功率是单位时间做功，电功率P=UI' }
    ],
    高级: [
      { question: '什么是交流电路？', answer: '交流电路是电压和电流随时间变化的电路' },
      { question: '什么是阻抗？', answer: '阻抗是交流电路中的总阻碍，包括电阻和电抗' },
      { question: '什么是谐振？', answer: '谐振是电路中感抗和容抗相等，电路呈现纯电阻性' },
      { question: '什么是三相电路？', answer: '三相电路是三个相位相差120°的交流电路，用于电力传输' }
    ]
  },
  '电力系统分析': {
    初级: [
      { question: '什么是电力系统？', answer: '电力系统是发电、输电、配电、用电的整体' },
      { question: '什么是发电机？', answer: '发电机是将机械能转换为电能的设备' },
      { question: '什么是变压器？', answer: '变压器是改变电压的设备，基于电磁感应原理' },
      { question: '什么是输电线路？', answer: '输电线路是传输电能的线路，包括架空线和电缆' }
    ],
    中级: [
      { question: '什么是短路？', answer: '短路是电路中电流异常增大的故障' },
      { question: '什么是继电保护？', answer: '继电保护是检测故障并隔离故障的保护装置' },
      { question: '什么是潮流计算？', answer: '潮流计算是计算电力系统中电压、电流、功率分布的方法' },
      { question: '什么是电力负荷？', answer: '电力负荷是系统消耗的功率，分为有功负荷和无功负荷' }
    ],
    高级: [
      { question: '什么是电力系统稳定性？', answer: '电力系统稳定性是系统在扰动后恢复正常运行的能力' },
      { question: '什么是电力市场？', answer: '电力市场是电能交易的市场，包括发电、输电、配电、售电' },
      { question: '什么是智能电网？', answer: '智能电网是集成信息通信技术的现代化电力系统' },
      { question: '什么是新能源并网？', answer: '新能源并网是将风电、光伏等新能源接入电力系统' }
    ]
  },
  '自动控制原理': {
    初级: [
      { question: '什么是控制系统？', answer: '控制系统是控制输出量跟随输入量的系统' },
      { question: '什么是开环控制？', answer: '开环控制是没有反馈的控制，输出不影响输入' },
      { question: '什么是闭环控制？', answer: '闭环控制是有反馈的控制，输出影响输入' },
      { question: '什么是传递函数？', answer: '传递函数是系统输出与输入的拉普拉斯变换之比' }
    ],
    中级: [
      { question: '什么是PID控制？', answer: 'PID控制是比例、积分、微分控制的组合' },
      { question: '什么是系统稳定性？', answer: '系统稳定性是系统在扰动后恢复平衡的能力' },
      { question: '什么是根轨迹？', answer: '根轨迹是系统参数变化时极点在复平面上的轨迹' },
      { question: '什么是频率响应？', answer: '频率响应是系统对不同频率输入的响应特性' }
    ],
    高级: [
      { question: '什么是状态空间法？', answer: '状态空间法是用状态变量描述系统的方法' },
      { question: '什么是现代控制理论？', answer: '现代控制理论是基于状态空间的控制理论' },
      { question: '什么是最优控制？', answer: '最优控制是寻找使性能指标最优的控制策略' },
      { question: '什么是自适应控制？', answer: '自适应控制是控制器参数自动调整的控制方法' }
    ]
  },
  'PLC应用': {
    初级: [
      { question: '什么是PLC？', answer: 'PLC（可编程逻辑控制器）是工业自动化控制设备' },
      { question: '什么是梯形图？', answer: '梯形图是PLC的编程语言，类似电气原理图' },
      { question: '什么是输入输出？', answer: '输入是传感器信号，输出是执行器控制信号' },
      { question: '什么是定时器？', answer: '定时器是PLC的定时功能，用于延时控制' }
    ],
    中级: [
      { question: '什么是计数器？', answer: '计数器是PLC的计数功能，用于统计脉冲数量' },
      { question: '什么是比较指令？', answer: '比较指令是比较两个数值大小，如大于、小于、等于' },
      { question: '什么是移位指令？', answer: '移位指令是将数据位左移或右移' },
      { question: '什么是子程序？', answer: '子程序是可重复调用的程序块' }
    ],
    高级: [
      { question: '什么是PLC通信？', answer: 'PLC通信是PLC之间或PLC与上位机的数据交换' },
      { question: '什么是PLC网络？', answer: 'PLC网络是多个PLC组成的控制系统网络' },
      { question: '什么是PLC安全？', answer: 'PLC安全是防止PLC系统故障和攻击的措施' },
      { question: '什么是PLC编程标准？', answer: 'PLC编程标准是IEC 61131-3，定义了5种编程语言' }
    ]
  },
  '模拟电子技术': {
    初级: [
      { question: '什么是二极管？', answer: '二极管是单向导电的半导体器件' },
      { question: '什么是三极管？', answer: '三极管是电流控制器件，用于放大和开关' },
      { question: '什么是运算放大器？', answer: '运算放大器是高增益的差分放大器' },
      { question: '什么是滤波器？', answer: '滤波器是滤除特定频率信号的电路' }
    ],
    中级: [
      { question: '什么是整流电路？', answer: '整流电路是将交流电转换为直流电的电路' },
      { question: '什么是放大电路？', answer: '放大电路是放大信号幅度的电路' },
      { question: '什么是反馈？', answer: '反馈是将输出信号返回输入，影响系统性能' },
      { question: '什么是振荡电路？', answer: '振荡电路是产生周期性信号的电路' }
    ],
    高级: [
      { question: '什么是差分放大电路？', answer: '差分放大电路是放大两个信号差值的电路' },
      { question: '什么是功率放大器？', answer: '功率放大器是放大信号功率的电路' },
      { question: '什么是锁相环？', answer: '锁相环是使输出信号与输入信号相位同步的电路' },
      { question: '什么是模数转换器？', answer: '模数转换器是将模拟信号转换为数字信号的电路' }
    ]
  },
  '数字电子技术': {
    初级: [
      { question: '什么是数字信号？', answer: '数字信号是离散的二进制信号，只有0和1' },
      { question: '什么是逻辑门？', answer: '逻辑门是实现基本逻辑运算的电路，如与门、或门、非门' },
      { question: '什么是触发器？', answer: '触发器是存储一位二进制信息的电路' },
      { question: '什么是编码器？', answer: '编码器是将输入信号转换为二进制代码的电路' }
    ],
    中级: [
      { question: '什么是译码器？', answer: '译码器是将二进制代码转换为输出信号的电路' },
      { question: '什么是计数器？', answer: '计数器是统计脉冲数量的电路' },
      { question: '什么是寄存器？', answer: '寄存器是存储多位二进制信息的电路' },
      { question: '什么是时序电路？', answer: '时序电路是输出不仅与输入有关，还与状态有关的电路' }
    ],
    高级: [
      { question: '什么是组合逻辑电路？', answer: '组合逻辑电路是输出仅与输入有关的电路' },
      { question: '什么是状态机？', answer: '状态机是根据输入和状态转换输出的电路' },
      { question: '什么是存储器？', answer: '存储器是存储数据的电路，如RAM、ROM' },
      { question: '什么是FPGA？', answer: 'FPGA（现场可编程门阵列）是可编程的数字电路' }
    ]
  },
  '通信原理': {
    初级: [
      { question: '什么是通信系统？', answer: '通信系统是传输信息的系统，包括发送、传输、接收' },
      { question: '什么是调制？', answer: '调制是将信息加载到载波上的过程' },
      { question: '什么是解调？', answer: '解调是从载波中提取信息的过程' },
      { question: '什么是信道？', answer: '信道是传输信号的媒介，如有线、无线' }
    ],
    中级: [
      { question: '什么是带宽？', answer: '带宽是信号占据的频率范围' },
      { question: '什么是信噪比？', answer: '信噪比是信号功率与噪声功率的比值' },
      { question: '什么是误码率？', answer: '误码率是传输错误比特占总比特的比例' },
      { question: '什么是多路复用？', answer: '多路复用是在同一信道传输多路信号的技术' }
    ],
    高级: [
      { question: '什么是数字调制？', answer: '数字调制是将数字信号调制到载波上，如ASK、FSK、PSK' },
      { question: '什么是扩频通信？', answer: '扩频通信是将信号扩展到更宽频带的通信方式' },
      { question: '什么是信道编码？', answer: '信道编码是添加冗余提高传输可靠性的技术' },
      { question: '什么是MIMO？', answer: 'MIMO（多输入多输出）是使用多个天线提高通信性能的技术' }
    ]
  },
  '信号处理': {
    初级: [
      { question: '什么是信号？', answer: '信号是携带信息的物理量，如电信号、声信号' },
      { question: '什么是模拟信号？', answer: '模拟信号是连续变化的信号' },
      { question: '什么是数字信号？', answer: '数字信号是离散的信号' },
      { question: '什么是采样？', answer: '采样是将连续信号转换为离散信号的过程' }
    ],
    中级: [
      { question: '什么是量化？', answer: '量化是将连续幅度转换为离散幅度的过程' },
      { question: '什么是编码？', answer: '编码是将量化值转换为二进制代码的过程' },
      { question: '什么是滤波？', answer: '滤波是滤除信号中不需要的频率分量' },
      { question: '什么是傅里叶变换？', answer: '傅里叶变换是将信号从时域转换到频域的方法' }
    ],
    高级: [
      { question: '什么是数字滤波器？', answer: '数字滤波器是用数字算法实现滤波的设备' },
      { question: '什么是快速傅里叶变换（FFT）？', answer: 'FFT是快速计算傅里叶变换的算法' },
      { question: '什么是小波变换？', answer: '小波变换是同时提供时域和频域信息的变换方法' },
      { question: '什么是自适应滤波？', answer: '自适应滤波是滤波器参数自动调整的滤波方法' }
    ]
  },
  // 机械土木类
  '机械制图': {
    初级: [
      { question: '什么是机械制图？', answer: '机械制图是用图形表达机械零件和装配的技术' },
      { question: '什么是三视图？', answer: '三视图是主视图、俯视图、左视图的组合' },
      { question: '什么是剖视图？', answer: '剖视图是假想剖开物体表达内部结构的视图' },
      { question: '什么是尺寸标注？', answer: '尺寸标注是标注零件大小和位置的技术要求' }
    ],
    中级: [
      { question: '什么是公差？', answer: '公差是允许的尺寸变动范围' },
      { question: '什么是配合？', answer: '配合是孔和轴的尺寸关系，如间隙配合、过盈配合' },
      { question: '什么是表面粗糙度？', answer: '表面粗糙度是表面微观不平度的指标' },
      { question: '什么是形位公差？', answer: '形位公差是形状和位置公差，控制零件几何精度' }
    ],
    高级: [
      { question: '什么是CAD？', answer: 'CAD（计算机辅助设计）是用计算机进行设计的技术' },
      { question: '什么是装配图？', answer: '装配图是表达零件装配关系的图纸' },
      { question: '什么是零件图？', answer: '零件图是表达单个零件的图纸' },
      { question: '什么是工程图标准？', answer: '工程图标准是制图规范，如ISO、GB' }
    ]
  },
  '机械设计': {
    初级: [
      { question: '什么是机械设计？', answer: '机械设计是设计机械零件和系统的过程' },
      { question: '什么是齿轮？', answer: '齿轮是传递运动和动力的零件' },
      { question: '什么是轴承？', answer: '轴承是支撑旋转零件的部件' },
      { question: '什么是联轴器？', answer: '联轴器是连接两轴传递扭矩的部件' }
    ],
    中级: [
      { question: '什么是传动？', answer: '传动是传递运动和动力的方式，如齿轮传动、带传动' },
      { question: '什么是强度？', answer: '强度是材料抵抗破坏的能力' },
      { question: '什么是刚度？', answer: '刚度是材料抵抗变形的能力' },
      { question: '什么是疲劳？', answer: '疲劳是材料在循环载荷下的破坏现象' }
    ],
    高级: [
      { question: '什么是有限元分析？', answer: '有限元分析是数值计算方法，用于结构分析' },
      { question: '什么是优化设计？', answer: '优化设计是寻找最优设计方案的方法' },
      { question: '什么是可靠性设计？', answer: '可靠性设计是提高产品可靠性的设计方法' },
      { question: '什么是绿色设计？', answer: '绿色设计是考虑环境影响的设计方法' }
    ]
  },
  '建筑力学': {
    初级: [
      { question: '什么是建筑力学？', answer: '建筑力学是研究建筑结构受力和变形的学科' },
      { question: '什么是力？', answer: '力是物体间的相互作用，有大小、方向、作用点' },
      { question: '什么是力矩？', answer: '力矩是力对物体转动效果的度量' },
      { question: '什么是平衡？', answer: '平衡是物体处于静止或匀速运动状态' }
    ],
    中级: [
      { question: '什么是梁？', answer: '梁是承受弯曲的构件' },
      { question: '什么是柱？', answer: '柱是承受压力的构件' },
      { question: '什么是桁架？', answer: '桁架是由杆件组成的结构' },
      { question: '什么是应力？', answer: '应力是单位面积上的内力' }
    ],
    高级: [
      { question: '什么是应变？', answer: '应变是物体变形程度的度量' },
      { question: '什么是弹性模量？', answer: '弹性模量是材料抵抗弹性变形的能力' },
      { question: '什么是塑性？', answer: '塑性是材料在载荷作用下产生永久变形的性质' },
      { question: '什么是结构稳定性？', answer: '结构稳定性是结构保持平衡状态的能力' }
    ]
  },
  '土力学': {
    初级: [
      { question: '什么是土力学？', answer: '土力学是研究土的工程性质的学科' },
      { question: '什么是土的组成？', answer: '土由固相、液相、气相组成' },
      { question: '什么是土的密度？', answer: '土的密度是单位体积土的质量' },
      { question: '什么是土的含水率？', answer: '土的含水率是土中水的质量与干土质量的比值' }
    ],
    中级: [
      { question: '什么是土的压缩性？', answer: '土的压缩性是土在压力作用下体积减小的性质' },
      { question: '什么是土的抗剪强度？', answer: '土的抗剪强度是土抵抗剪切破坏的能力' },
      { question: '什么是土压力？', answer: '土压力是土对挡土结构的压力' },
      { question: '什么是地基承载力？', answer: '地基承载力是地基承受荷载的能力' }
    ],
    高级: [
      { question: '什么是土坡稳定性？', answer: '土坡稳定性是土坡保持稳定不滑塌的能力' },
      { question: '什么是土的固结？', answer: '土的固结是土在压力作用下孔隙水排出、体积减小的过程' },
      { question: '什么是土的液化？', answer: '土的液化是饱和砂土在震动下失去强度的现象' },
      { question: '什么是地基处理？', answer: '地基处理是改善地基工程性质的技术' }
    ]
  },
  '暖通空调': {
    初级: [
      { question: '什么是暖通空调？', answer: '暖通空调是采暖、通风、空调系统的总称' },
      { question: '什么是采暖？', answer: '采暖是保持室内温度舒适的系统' },
      { question: '什么是通风？', answer: '通风是室内外空气交换的系统' },
      { question: '什么是空调？', answer: '空调是调节室内温度、湿度、空气质量的系统' }
    ],
    中级: [
      { question: '什么是制冷？', answer: '制冷是降低温度的过程，通过制冷剂循环实现' },
      { question: '什么是热泵？', answer: '热泵是逆向制冷循环，用于制热' },
      { question: '什么是空气处理机组？', answer: '空气处理机组是处理空气的设备，包括加热、冷却、加湿、除湿' },
      { question: '什么是风机盘管？', answer: '风机盘管是末端空调设备，用于局部空调' }
    ],
    高级: [
      { question: '什么是空调负荷计算？', answer: '空调负荷计算是计算空调系统冷热负荷的方法' },
      { question: '什么是气流组织？', answer: '气流组织是室内空气流动的分布设计' },
      { question: '什么是空调水系统？', answer: '空调水系统是输送冷热媒的管网系统' },
      { question: '什么是空调自控？', answer: '空调自控是自动控制空调系统运行的系统' }
    ]
  },
  '流体力学': {
    初级: [
      { question: '什么是流体？', answer: '流体是容易流动的物质，包括液体和气体' },
      { question: '什么是密度？', answer: '密度是单位体积流体的质量' },
      { question: '什么是粘度？', answer: '粘度是流体流动阻力的度量' },
      { question: '什么是压力？', answer: '压力是单位面积上的力' }
    ],
    中级: [
      { question: '什么是伯努利方程？', answer: '伯努利方程是流体能量守恒方程' },
      { question: '什么是连续性方程？', answer: '连续性方程是流体质量守恒方程' },
      { question: '什么是雷诺数？', answer: '雷诺数是判断流体流动状态的参数' },
      { question: '什么是层流和湍流？', answer: '层流是有序流动，湍流是无序流动' }
    ],
    高级: [
      { question: '什么是边界层？', answer: '边界层是流体在固体表面附近的薄层' },
      { question: '什么是阻力？', answer: '阻力是流体流动的阻碍力' },
      { question: '什么是升力？', answer: '升力是垂直于流动方向的力' },
      { question: '什么是流体机械？', answer: '流体机械是利用流体能量的设备，如泵、风机' }
    ]
  },
  '汽车构造': {
    初级: [
      { question: '什么是汽车构造？', answer: '汽车构造是汽车各组成部分的结构和原理' },
      { question: '什么是发动机？', answer: '发动机是汽车的动力源' },
      { question: '什么是底盘？', answer: '底盘是汽车的支撑和传动系统' },
      { question: '什么是车身？', answer: '车身是汽车的外壳和乘员空间' }
    ],
    中级: [
      { question: '什么是传动系统？', answer: '传动系统是传递发动机动力的系统' },
      { question: '什么是行驶系统？', answer: '行驶系统是支撑汽车行驶的系统' },
      { question: '什么是转向系统？', answer: '转向系统是控制汽车行驶方向的系统' },
      { question: '什么是制动系统？', answer: '制动系统是使汽车减速或停止的系统' }
    ],
    高级: [
      { question: '什么是电控系统？', answer: '电控系统是控制汽车各系统的电子系统' },
      { question: '什么是新能源汽车？', answer: '新能源汽车是使用新能源的汽车，如电动车、混合动力车' },
      { question: '什么是智能汽车？', answer: '智能汽车是具有自动驾驶和智能互联功能的汽车' },
      { question: '什么是汽车轻量化？', answer: '汽车轻量化是减轻汽车重量，提高燃油经济性' }
    ]
  },
  '汽车理论': {
    初级: [
      { question: '什么是汽车理论？', answer: '汽车理论是研究汽车性能和原理的学科' },
      { question: '什么是动力性？', answer: '动力性是汽车加速、爬坡、最高速度的能力' },
      { question: '什么是经济性？', answer: '经济性是汽车燃油消耗的效率' },
      { question: '什么是制动性？', answer: '制动性是汽车减速和停止的能力' }
    ],
    中级: [
      { question: '什么是操纵稳定性？', answer: '操纵稳定性是汽车按驾驶员意图行驶的能力' },
      { question: '什么是平顺性？', answer: '平顺性是汽车行驶的舒适程度' },
      { question: '什么是通过性？', answer: '通过性是汽车通过障碍的能力' },
      { question: '什么是汽车空气动力学？', answer: '汽车空气动力学是研究汽车与空气相互作用的学科' }
    ],
    高级: [
      { question: '什么是汽车NVH？', answer: '汽车NVH是噪声、振动、声振粗糙度的总称' },
      { question: '什么是汽车碰撞安全？', answer: '汽车碰撞安全是汽车在碰撞中保护乘员的能力' },
      { question: '什么是汽车排放？', answer: '汽车排放是汽车尾气对环境的污染' },
      { question: '什么是汽车测试？', answer: '汽车测试是评价汽车性能和质量的试验' }
    ]
  },
  // 经管财会类
  '基础会计': {
    初级: [
      { question: '什么是会计？', answer: '会计是记录、分类、汇总经济活动的信息系统' },
      { question: '什么是资产？', answer: '资产是企业拥有或控制的资源，能带来经济利益' },
      { question: '什么是负债？', answer: '负债是企业承担的现时义务' },
      { question: '什么是所有者权益？', answer: '所有者权益是企业所有者享有的权益' }
    ],
    中级: [
      { question: '什么是会计等式？', answer: '会计等式：资产=负债+所有者权益' },
      { question: '什么是复式记账？', answer: '复式记账是每笔业务在两个或多个账户中记录' },
      { question: '什么是会计科目？', answer: '会计科目是对会计要素的分类' },
      { question: '什么是会计凭证？', answer: '会计凭证是记录经济业务的书面证明' }
    ],
    高级: [
      { question: '什么是会计账簿？', answer: '会计账簿是系统记录会计信息的簿籍' },
      { question: '什么是财务报表？', answer: '财务报表是反映企业财务状况和经营成果的报告' },
      { question: '什么是会计循环？', answer: '会计循环是会计处理的完整流程' },
      { question: '什么是会计准则？', answer: '会计准则是会计工作的规范和标准' }
    ]
  },
  '中级财务会计': {
    初级: [
      { question: '什么是财务会计？', answer: '财务会计是对外提供财务信息的会计' },
      { question: '什么是收入？', answer: '收入是企业在日常活动中形成的经济利益流入' },
      { question: '什么是费用？', answer: '费用是企业在日常活动中发生的经济利益流出' },
      { question: '什么是利润？', answer: '利润是企业在一定期间的经营成果' }
    ],
    中级: [
      { question: '什么是应收账款？', answer: '应收账款是企业因销售商品应收的款项' },
      { question: '什么是存货？', answer: '存货是企业持有的待售商品或生产材料' },
      { question: '什么是固定资产？', answer: '固定资产是使用寿命超过一年的有形资产' },
      { question: '什么是无形资产？', answer: '无形资产是没有实物形态的可辨认资产' }
    ],
    高级: [
      { question: '什么是投资？', answer: '投资是企业为获得收益而进行的资产配置' },
      { question: '什么是负债重组？', answer: '负债重组是修改债务条件或转换债务' },
      { question: '什么是所得税会计？', answer: '所得税会计是处理企业所得税的会计方法' },
      { question: '什么是会计政策变更？', answer: '会计政策变更是改变会计处理方法' }
    ]
  },
  '财务管理学': {
    初级: [
      { question: '什么是财务管理？', answer: '财务管理是企业资金筹集、使用、分配的管理' },
      { question: '什么是资金时间价值？', answer: '资金时间价值是资金随时间增值的能力' },
      { question: '什么是现值？', answer: '现值是未来资金的当前价值' },
      { question: '什么是终值？', answer: '终值是当前资金的未来价值' }
    ],
    中级: [
      { question: '什么是净现值？', answer: '净现值是项目未来现金流的现值减去初始投资' },
      { question: '什么是内部收益率？', answer: '内部收益率是使项目净现值为零的折现率' },
      { question: '什么是投资回收期？', answer: '投资回收期是收回初始投资所需的时间' },
      { question: '什么是资本成本？', answer: '资本成本是企业筹集资金所付出的代价' }
    ],
    高级: [
      { question: '什么是资本结构？', answer: '资本结构是企业各种资本的构成比例' },
      { question: '什么是股利政策？', answer: '股利政策是企业利润分配的策略' },
      { question: '什么是营运资金管理？', answer: '营运资金管理是对流动资产和流动负债的管理' },
      { question: '什么是财务分析？', answer: '财务分析是评价企业财务状况和经营成果的方法' }
    ]
  },
  '证券投资': {
    初级: [
      { question: '什么是证券？', answer: '证券是证明权利的书面凭证，如股票、债券' },
      { question: '什么是股票？', answer: '股票是股份公司所有权的凭证' },
      { question: '什么是债券？', answer: '债券是政府或企业发行的借款凭证' },
      { question: '什么是基金？', answer: '基金是集合投资工具，由专业机构管理' }
    ],
    中级: [
      { question: '什么是市盈率？', answer: '市盈率是股价与每股收益的比值' },
      { question: '什么是股息率？', answer: '股息率是每股股息与股价的比值' },
      { question: '什么是收益率？', answer: '收益率是投资收益与投资成本的比值' },
      { question: '什么是风险？', answer: '风险是投资收益的不确定性' }
    ],
    高级: [
      { question: '什么是投资组合？', answer: '投资组合是多种资产的组合，用于分散风险' },
      { question: '什么是资本资产定价模型？', answer: 'CAPM是衡量资产预期收益与风险关系的模型' },
      { question: '什么是有效市场假说？', answer: '有效市场假说认为股价反映所有可用信息' },
      { question: '什么是技术分析？', answer: '技术分析是通过股价图表预测未来走势的方法' }
    ]
  },
  '管理学原理': {
    初级: [
      { question: '什么是管理？', answer: '管理是通过他人完成组织目标的过程' },
      { question: '什么是计划？', answer: '计划是设定目标和实现途径的过程' },
      { question: '什么是组织？', answer: '组织是分配资源和协调活动的结构' },
      { question: '什么是领导？', answer: '领导是激励和指导员工的过程' }
    ],
    中级: [
      { question: '什么是控制？', answer: '控制是监控和纠正偏差的过程' },
      { question: '什么是决策？', answer: '决策是从多个方案中选择最优方案的过程' },
      { question: '什么是组织结构？', answer: '组织结构是组织内部权力和责任的分配方式' },
      { question: '什么是企业文化？', answer: '企业文化是组织共同的价值观和行为准则' }
    ],
    高级: [
      { question: '什么是战略管理？', answer: '战略管理是制定和实施长期战略的过程' },
      { question: '什么是人力资源管理？', answer: '人力资源管理是管理员工的招聘、培训、薪酬等' },
      { question: '什么是变革管理？', answer: '变革管理是引导组织适应环境变化的过程' },
      { question: '什么是知识管理？', answer: '知识管理是组织知识的创造、存储、共享和应用' }
    ]
  },
  '市场营销': {
    初级: [
      { question: '什么是市场营销？', answer: '市场营销是创造、传递、捕获客户价值的过程' },
      { question: '什么是产品？', answer: '产品是满足市场需求的商品或服务' },
      { question: '什么是价格？', answer: '价格是产品价值的货币表现' },
      { question: '什么是渠道？', answer: '渠道是产品从生产者到消费者的路径' }
    ],
    中级: [
      { question: '什么是促销？', answer: '促销是促进产品销售的活动' },
      { question: '什么是市场细分？', answer: '市场细分是将市场划分为不同客户群体的过程' },
      { question: '什么是目标市场？', answer: '目标市场是企业选择服务的客户群体' },
      { question: '什么是市场定位？', answer: '市场定位是在消费者心中建立产品形象' }
    ],
    高级: [
      { question: '什么是品牌？', answer: '品牌是产品或服务的标识和声誉' },
      { question: '什么是客户关系管理？', answer: '客户关系管理是维护和发展客户关系的策略' },
      { question: '什么是数字营销？', answer: '数字营销是通过数字渠道进行的营销活动' },
      { question: '什么是营销策略？', answer: '营销策略是实现营销目标的行动计划' }
    ]
  },
  '微观经济学': {
    初级: [
      { question: '什么是微观经济学？', answer: '微观经济学研究个体经济单位的行为' },
      { question: '什么是需求？', answer: '需求是消费者在不同价格下愿意购买的数量' },
      { question: '什么是供给？', answer: '供给是生产者在不同价格下愿意提供的数量' },
      { question: '什么是均衡价格？', answer: '均衡价格是需求等于供给时的价格' }
    ],
    中级: [
      { question: '什么是弹性？', answer: '弹性是需求或供给对价格变化的敏感程度' },
      { question: '什么是效用？', answer: '效用是消费者从商品中获得的满足程度' },
      { question: '什么是边际效用？', answer: '边际效用是增加一单位消费带来的额外效用' },
      { question: '什么是生产函数？', answer: '生产函数是投入与产出的关系' }
    ],
    高级: [
      { question: '什么是成本函数？', answer: '成本函数是生产成本与产量的关系' },
      { question: '什么是市场结构？', answer: '市场结构是市场的竞争程度，如完全竞争、垄断' },
      { question: '什么是博弈论？', answer: '博弈论是研究策略互动的数学理论' },
      { question: '什么是信息不对称？', answer: '信息不对称是交易双方信息不平等的现象' }
    ]
  },
  '宏观经济学': {
    初级: [
      { question: '什么是宏观经济学？', answer: '宏观经济学研究整体经济运行' },
      { question: '什么是GDP？', answer: 'GDP是国内生产总值，衡量经济总量' },
      { question: '什么是通货膨胀？', answer: '通货膨胀是物价水平持续上涨' },
      { question: '什么是失业率？', answer: '失业率是失业人口占劳动力的比例' }
    ],
    中级: [
      { question: '什么是财政政策？', answer: '财政政策是政府通过税收和支出调节经济' },
      { question: '什么是货币政策？', answer: '货币政策是央行通过货币供应调节经济' },
      { question: '什么是经济增长？', answer: '经济增长是经济总量的持续增加' },
      { question: '什么是经济周期？', answer: '经济周期是经济活动的波动' }
    ],
    高级: [
      { question: '什么是国际贸易？', answer: '国际贸易是各国之间的商品和服务交换' },
      { question: '什么是汇率？', answer: '汇率是两国货币的兑换比例' },
      { question: '什么是国际收支？', answer: '国际收支是一国对外经济交易的记录' },
      { question: '什么是经济全球化？', answer: '经济全球化是各国经济日益融合的过程' }
    ]
  },
  // 农林生物类
  '植物生理学': {
    初级: [
      { question: '什么是植物生理学？', answer: '植物生理学研究植物生命活动的规律' },
      { question: '什么是光合作用？', answer: '光合作用是植物利用光能合成有机物的过程' },
      { question: '什么是呼吸作用？', answer: '呼吸作用是植物分解有机物释放能量的过程' },
      { question: '什么是蒸腾作用？', answer: '蒸腾作用是植物通过叶片散失水分的过程' }
    ],
    中级: [
      { question: '什么是植物激素？', answer: '植物激素是调节植物生长的化学物质' },
      { question: '什么是植物营养？', answer: '植物营养是植物吸收和利用必需元素的过程' },
      { question: '什么是水分生理？', answer: '水分生理是植物对水分吸收和运输的机制' },
      { question: '什么是矿质营养？', answer: '矿质营养是植物对无机盐的吸收和利用' }
    ],
    高级: [
      { question: '什么是植物逆境生理？', answer: '植物逆境生理是植物在不良环境下的生理反应' },
      { question: '什么是植物分子生物学？', answer: '植物分子生物学是研究植物基因和蛋白质的学科' },
      { question: '什么是植物生物技术？', answer: '植物生物技术是利用生物技术改良植物的方法' },
      { question: '什么是植物代谢工程？', answer: '植物代谢工程是改造植物代谢途径的技术' }
    ]
  },
  '作物栽培学': {
    初级: [
      { question: '什么是作物栽培学？', answer: '作物栽培学研究作物种植的理论和技术' },
      { question: '什么是作物品种？', answer: '作物品种是具有稳定遗传特征的作物群体' },
      { question: '什么是播种？', answer: '播种是将种子播入土壤的过程' },
      { question: '什么是施肥？', answer: '施肥是为作物提供养分的过程' }
    ],
    中级: [
      { question: '什么是灌溉？', answer: '灌溉是为作物提供水分的过程' },
      { question: '什么是病虫害防治？', answer: '病虫害防治是预防和治理作物病虫害' },
      { question: '什么是收获？', answer: '收获是获取成熟作物的过程' },
      { question: '什么是作物轮作？', answer: '作物轮作是不同作物轮流种植的制度' }
    ],
    高级: [
      { question: '什么是精准农业？', answer: '精准农业是利用信息技术精确管理农业' },
      { question: '什么是设施农业？', answer: '设施农业是利用设施控制环境进行生产' },
      { question: '什么是有机农业？', answer: '有机农业是不使用化学品的农业生产方式' },
      { question: '什么是智慧农业？', answer: '智慧农业是集成物联网、大数据的现代农业' }
    ]
  },
  '森林生态学': {
    初级: [
      { question: '什么是森林生态学？', answer: '森林生态学研究森林生态系统的结构和功能' },
      { question: '什么是生态系统？', answer:
window.onload = function() {
  switchForm('login');
  initPhoneValidation();
  initQuickLogin();
  initSelectModal();
};

// ============================================
// 渲染筛选后的题目
// ============================================
function renderFilteredQuestions(questions) {
  if (!questions || questions.length === 0) {
    questionsContainer.innerHTML = '<div class="loading-txt">暂无该难度的试题数据</div>';
    return;
  }
  
  currentQuestions = [...questions];
  questionsContainer.innerHTML = '';
  
  let html = '';
  
  questions.forEach((q, i) => {
    const id = `ans-${Date.now()}-${i}`;
    const inputId = `input-${Date.now()}-${i}`;
    const submitId = `submit-${Date.now()}-${i}`;
    const resultId = `result-${Date.now()}-${i}`;
    
    // 获取难度标签样式
    let tagClass = '';
    let tagText = '';
    if (q.difficulty === '初级') {
      tagClass = 'tag-easy';
      tagText = '初级';
    } else if (q.difficulty === '中级') {
      tagClass = 'tag-medium';
      tagText = '中级';
    } else if (q.difficulty === '高级') {
      tagClass = 'tag-hard';
      tagText = '高级';
    }
    const tagHtml = tagClass ? `<span class="question-difficulty-tag ${tagClass}">${tagText}</span>` : '';
    
    let answerHtml = formatAnswer(q.answer);
    
    html += `
    <div class="question-card" data-index="${i}" data-difficulty="${q.difficulty || ''}">
      <div class="question-title">${tagHtml}第${i + 1}题：${q.question}</div>
      <div class="question-section">
        <label class="answer-label">请作答：</label>
        <textarea class="answer-input" id="${inputId}" placeholder="在此输入您的答案..."></textarea>
        <button class="submit-answer-btn" id="${submitId}" data-answer="${q.answer}" data-id="${inputId}" data-result="${resultId}">提交作答</button>
        <div class="answer-result" id="${resultId}"></div>
      </div>
      <button class="toggle-ans" data-id="${id}">查看答案</button>
      <div class="ans-box" id="${id}">
        <div class="answer-box">
          <div class="answer-content">
            ${answerHtml}
          </div>
        </div>
      </div>
    </div>`;
  });
  
  questionsContainer.innerHTML = html;
  
  // 绑定查看答案按钮
  document.querySelectorAll('.toggle-ans').forEach(btn => {
    btn.onclick = () => {
      const box = document.getElementById(btn.dataset.id);
      box.classList.toggle('show');
      btn.textContent = box.classList.contains('show') ? '收起答案' : '查看答案';
    };
  });
  
  // 绑定提交作答按钮
  document.querySelectorAll('.submit-answer-btn').forEach(btn => {
    btn.onclick = async () => {
      const inputEl = document.getElementById(btn.dataset.id);
      const resultEl = document.getElementById(btn.dataset.result);
      const correctAnswer = btn.dataset.answer;
      const userAnswer = inputEl.value.trim();
      const questionCard = btn.closest('.question-card');
      const questionText = questionCard.querySelector('.question-title').innerText;
      
      if (!userAnswer) {
        resultEl.innerHTML = '<span class="result-error">请先输入答案后再提交！</span>';
        return;
      }
      
      const score = calculateScore(userAnswer, correctAnswer);
      const isCorrect = score >= 60;
      
      resultEl.innerHTML = isCorrect 
        ? `<span class="result-correct">得分：${score}分  ✓ 回答正确！</span>`
        : `<span class="result-error">得分：${score}分  ✗ 回答错误</span><br><span class="result-detail">标准答案：${correctAnswer}</span>`;
      
      if (currentFullPhone) {
        try {
          await fetch(`${API_BASE}/api/answers/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: currentFullPhone,
              question: questionText,
              userAnswer,
              score,
              isCorrect
            })
          });
        } catch (e) {
          console.error('保存答题记录失败:', e);
        }
      }
      
      inputEl.disabled = true;
      btn.disabled = true;
    };
  });
}

// ============================================
// 手机号输入实时校验初始化
// ============================================
function initPhoneValidation() {
  const regPhone = document.getElementById('regPhone');
  const regPhoneErr = document.getElementById('regPhoneErr');
  
  regPhone.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^\d]/g, '');
    const phone = this.value.trim();
    if (phone.length === 11 && phoneReg.test(phone)) {
      regPhoneErr.style.display = 'none';
    }
  });
  
  regPhone.addEventListener('blur', function() {
    const phone = this.value.trim();
    if (phone.length > 0 && !phoneReg.test(phone)) {
      regPhoneErr.textContent = '请输入正确的11位手机号码';
      regPhoneErr.style.display = 'block';
    } else if (phone.length === 0) {
      regPhoneErr.style.display = 'none';
    }
  });
  
  const loginPhone = document.getElementById('loginPhone');
  const loginPhoneErr = document.getElementById('loginPhoneErr');
  
  loginPhone.addEventListener('input', function(e) {
    this.value = this.value.replace(/[^\d]/g, '');
    const phone = this.value.trim();
    if (phone.length === 11 && phoneReg.test(phone)) {
      loginPhoneErr.style.display = 'none';
    }
  });
  
  loginPhone.addEventListener('blur', function() {
    const phone = this.value.trim();
    if (phone.length > 0 && !phoneReg.test(phone)) {
      loginPhoneErr.textContent = '请输入正确的11位手机号码';
      loginPhoneErr.style.display = 'block';
    } else if (phone.length === 0) {
      loginPhoneErr.style.display = 'none';
    }
  });
}

// ============================================
// 加载状态
// ============================================
function setLoading() {
  questionsContainer.innerHTML = '<div class="loading-txt">正在请求试题，请稍后...</div>';
}

// ============================================
// 生成脱敏手机号：131****6966 格式
// ============================================
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

// ============================================
// 登录后选择弹窗逻辑
// ============================================
function initSelectModal() {
  if (!selectModal) return;
  
  modalMajorCategory.addEventListener('change', function() {
    const category = this.value;
    modalSubject.innerHTML = '<option value="">请选择细分学科</option>';
    
    if (category && subjectCategories[category]) {
      const allSubjects = [];
      subjectCategories[category].forEach(major => {
        major.subjects.forEach(subject => {
          allSubjects.push({ major, subject });
        });
      });
      
      allSubjects.forEach(item => {
        const option = document.createElement('option');
        option.value = item.subject;
        option.textContent = `${item.major} - ${item.subject}`;
        modalSubject.appendChild(option);
      });
    }
  });
  
  modalCloseBtn.addEventListener('click', closeSelectModal);
  modalCancelBtn.addEventListener('click', closeSelectModal);
  
  modalConfirmBtn.addEventListener('click', function() {
    const subject = modalSubject.value;
    const grade = modalGrade.value;
    
    if (!subject) {
      alert('请选择对应学科');
      return;
    }
    
    saveSelection(subject, grade);
    closeSelectModal();
    
    subjectNameInput.value = subject;
    gradeSelect.value = grade;
    difficultySelect.value = '中级';
    
    allLoadedQuestions = [];
    
    enterMain();
    
    const subjectItems = document.querySelectorAll('.subject-item');
    subjectItems.forEach(s => s.classList.remove('active'));
    const matchedItem = Array.from(subjectItems).find(s => s.innerText === subject);
    if (matchedItem) {
      matchedItem.classList.add('active');
      matchedItem.closest('.major-sub-list').classList.add('open');
      matchedItem.closest('.major-sub-list').previousElementSibling.classList.add('active');
    }
    
    setTimeout(() => {
      generateQuestions(subject, grade, '中级');
    }, 100);
  });
}

function showSelectModal() {
  if (!selectModal) return;
  
  const saved = getSavedSelection();
  if (saved) {
    modalSubject.innerHTML = '<option value="">请选择细分学科</option>';
    if (saved.category && subjectCategories[saved.category]) {
      const allSubjects = [];
      subjectCategories[saved.category].forEach(major => {
        major.subjects.forEach(subject => {
          allSubjects.push({ major, subject });
        });
      });
      allSubjects.forEach(item => {
        const option = document.createElement('option');
        option.value = item.subject;
        option.textContent = `${item.major} - ${item.subject}`;
        if (item.subject === saved.subject) option.selected = true;
        modalSubject.appendChild(option);
      });
      modalMajorCategory.value = saved.category;
    }
    if (saved.grade) {
      modalGrade.value = saved.grade;
    }
  }
  
  selectModal.style.display = 'flex';
}

function closeSelectModal() {
  if (!selectModal) return;
  selectModal.style.display = 'none';
  
  enterMain();
}

function getSavedSelection() {
  try {
    const saved = localStorage.getItem('exam_selection');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function saveSelection(subject, grade) {
  try {
    let category = '';
    for (const [key, majors] of Object.entries(subjectCategories)) {
      for (const major of majors) {
        if (major.subjects.includes(subject)) {
          category = key;
          break;
        }
      }
      if (category) break;
    }
    
    localStorage.setItem('exam_selection', JSON.stringify({
      category,
      subject,
      grade
    }));
  } catch (e) {
    console.error('保存选择失败:', e);
  }
}

// ============================================
// 格式化答案：识别===解题解析===和===完整代码===标记
// ============================================
function formatAnswer(answer) {
  const analysisMarker = '===解题解析===';
  const codeMarker = '===完整代码===';
  
  if (answer.includes(analysisMarker) && answer.includes(codeMarker)) {
    const parts = answer.split(codeMarker);
    const analysisPart = parts[0].replace(analysisMarker, '').trim();
    const codePart = parts[1].trim();
    
    const formattedAnalysis = analysisPart.replace(/\n/g, '<br>');
    const formattedCode = codePart.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    
    return `
      <div class="analysis-section">
        <strong>📝 解题解析：</strong><br>
        ${formattedAnalysis}
      </div>
      <div class="code-section">
        <strong>💻 完整代码：</strong>
        <pre class="code-block">${formattedCode}</pre>
      </div>`;
  } else if (answer.includes(codeMarker)) {
    const parts = answer.split(codeMarker);
    const codePart = parts[1] ? parts[1].trim() : parts[0].trim();
    const formattedCode = codePart.replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    
    return `
      <div class="code-section">
        <strong>💻 完整代码：</strong>
        <pre class="code-block">${formattedCode}</pre>
      </div>`;
  } else {
    const formattedAnswer = answer.replace(/\n/g, '<br>');
    return `<strong>标准答案：</strong><br>${formattedAnswer}`;
  }
}

// ============================================
// 渲染题目（包含答题功能）
// ============================================
function render(qs, append = false) {
  if (!qs || qs.length === 0) {
    if (!append) questionsContainer.innerHTML = '<div class="loading-txt">暂无试题数据</div>';
    return;
  }
  
  if (!append) {
    currentQuestions = [...qs];
    allLoadedQuestions = [...qs];
    questionsContainer.innerHTML = '';
  } else {
    allLoadedQuestions = [...allLoadedQuestions, ...qs];
  }
  
  let html = questionsContainer.innerHTML;
  
  qs.forEach((q, i) => {
    const id = `ans-${Date.now()}-${i}`;
    const inputId = `input-${Date.now()}-${i}`;
    const submitId = `submit-${Date.now()}-${i}`;
    const resultId = `result-${Date.now()}-${i}`;
    
    let answerHtml = formatAnswer(q.answer);
    const escapedAnswer = q.answer.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    
    html += `
    <div class="question-card" data-index="${append ? allLoadedQuestions.length - qs.length + i : i}">
      <div class="question-title">第${(append ? allLoadedQuestions.length - qs.length : 0) + i + 1}题：${q.question}</div>
      <div class="question-section">
        <label class="answer-label">请作答：</label>
        <textarea class="answer-input" id="${inputId}" placeholder="在此输入您的答案..."></textarea>
        <button class="submit-answer-btn" id="${submitId}" data-answer="${escapedAnswer}" data-id="${inputId}" data-result="${resultId}">提交作答</button>
        <div class="answer-result" id="${resultId}"></div>
      </div>
      <button class="toggle-ans" data-id="${id}">查看答案</button>
      <div class="ans-box" id="${id}">
        <div class="answer-box">
          <div class="answer-content">
            ${answerHtml}
          </div>
        </div>
      </div>
    </div>`;
  });
  
  questionsContainer.innerHTML = html;

  // 绑定查看答案按钮
  document.querySelectorAll('.toggle-ans').forEach(btn => {
    btn.onclick = () => {
      const box = document.getElementById(btn.dataset.id);
      box.classList.toggle('show');
      btn.textContent = box.classList.contains('show') ? '收起答案' : '查看答案';
    };
  });

  // 绑定提交作答按钮
  document.querySelectorAll('.submit-answer-btn').forEach(btn => {
    btn.onclick = async () => {
      const inputEl = document.getElementById(btn.dataset.id);
      const resultEl = document.getElementById(btn.dataset.result);
      const correctAnswer = btn.dataset.answer;
      const userAnswer = inputEl.value.trim();
      const questionCard = btn.closest('.question-card');
      const questionText = questionCard.querySelector('.question-title').innerText;
      
      if (!userAnswer) {
        resultEl.innerHTML = '<span class="result-error">请先输入答案后再提交！</span>';
        return;
      }
      
      // 简单的相似度评分
      const score = calculateScore(userAnswer, correctAnswer);
      const isCorrect = score >= 60;
      
      resultEl.innerHTML = isCorrect 
        ? `<span class="result-correct">得分：${score}分  ✓ 回答正确！</span>`
        : `<span class="result-error">得分：${score}分  ✗ 回答错误</span><br><span class="result-detail">标准答案：${correctAnswer}</span>`;
      
      // 保存答题记录到后端
      if (currentFullPhone) {
        try {
          await fetch(`${API_BASE}/api/answers/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: currentFullPhone,
              question: questionText,
              userAnswer,
              score,
              isCorrect
            })
          });
        } catch (e) {
          console.error('保存答题记录失败:', e);
        }
      }
      
      inputEl.disabled = true;
      btn.disabled = true;
    };
  });
}

// 简单的相似度评分函数
function calculateScore(userAnswer, correctAnswer) {
  if (!userAnswer || !correctAnswer) return 0;
  
  // 移除标点符号和空格进行比较
  const cleanUser = userAnswer.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
  const cleanCorrect = correctAnswer.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '').toLowerCase();
  
  if (cleanUser === cleanCorrect) return 100;
  
  // 计算包含度
  let matchCount = 0;
  for (let char of cleanCorrect) {
    if (cleanUser.includes(char)) matchCount++;
  }
  
  const similarity = (matchCount / cleanCorrect.length) * 100;
  return Math.round(similarity);
}

// ============================================
// 显示通知提示
// ============================================
function showNotification(message) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }
}

// ============================================
// 调用文心千帆接口
// ============================================
async function generateQuestions(subject, grade, diff) {
  const subjectVal = subject || subjectNameInput.value.trim();
  const gradeVal = grade || gradeSelect.value;
  const diffVal = diff || difficultySelect.value;

  if (!subjectVal) {
    alert("请先选择学科");
    return;
  }
  setLoading();

  try {
    const timestamp = Date.now();
    const reqUrl = `${API_BASE}/api/getQuestion?_t=${timestamp}`;
    const postData = {
      subject: subjectVal,
      grade: gradeVal,
      difficulty: diffVal,
      timestamp: timestamp,
      messages: [
        {
          role: "user",
          content: `【${subjectVal}】`
        }
      ]
    };

    const res = await fetch(reqUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      body: JSON.stringify(postData)
    });

    if (!res.ok) throw new Error("接口请求失败");
    const resData = await res.json();

    if (resData.result) {
      try {
        let resultText = resData.result.trim();
        if (resultText.startsWith('```json')) resultText = resultText.slice(7);
        else if (resultText.startsWith('```')) resultText = resultText.slice(3);
        if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);
        resultText = resultText.trim();
        
        const questionArr = JSON.parse(resultText);
        
        // 为每个题目添加难度属性
        const questionsWithDifficulty = questionArr.map(q => ({
          ...q,
          difficulty: diffVal,
          subject: subjectVal,
          grade: gradeVal
        }));
        
        // 渲染题目
        render(questionsWithDifficulty);
        
        if (resData.message) {
          showNotification(resData.message);
        }
      } catch (parseError) {
        console.error("JSON解析失败:", parseError);
        questionsContainer.innerHTML = `<div class="loading-txt">数据解析失败，请重新生成</div>`;
      }
    } else {
      questionsContainer.innerHTML = `<div class="loading-txt">请求异常：${resData.error_msg || '未知错误'}</div>`;
    }

  } catch (err) {
    console.error("请求报错：", err);
    showNotification('接口调用失败，已切换本地备用题库');
    questionsContainer.innerHTML = '<div class="loading-txt">接口调用失败，已切换本地备用题库</div>';
  }
}

// ============================================
// 加载更多题目（追加5道）
// ============================================
async function loadMoreQuestions() {
  const subjectVal = subjectNameInput.value.trim();
  const gradeVal = gradeSelect.value;
  const diffVal = difficultySelect.value;

  if (!subjectVal) {
    alert("请先选择学科");
    return;
  }

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = '加载中...';
  }

  try {
    const reqUrl = `${API_BASE}/api/getQuestion`;
    const postData = {
      subject: subjectVal,
      grade: gradeVal,
      difficulty: diffVal,
      messages: [
        {
          role: "user",
          content: `【${subjectVal}】`
        }
      ]
    };

    const res = await fetch(reqUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(postData)
    });

    if (!res.ok) throw new Error("接口请求失败");
    const resData = await res.json();

    if (resData.result) {
      try {
        let resultText = resData.result.trim();
        if (resultText.startsWith('```json')) resultText = resultText.slice(7);
        else if (resultText.startsWith('```')) resultText = resultText.slice(3);
        if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);
        resultText = resultText.trim();
        
        const questionArr = JSON.parse(resultText);
        
        // 保留后端返回的难度属性，同时添加学科和年级信息
        const questionsWithMeta = questionArr.map(q => ({
          ...q,
          difficulty: diffVal,
          subject: subjectVal,
          grade: gradeVal
        }));
        
        // 渲染并追加题目
        render(questionsWithMeta, true);
        
        if (loadMoreBtn) {
          loadMoreBtn.textContent = '加载更多题目';
          loadMoreBtn.disabled = false;
        }
      } catch (parseError) {
        console.error("JSON解析失败:", parseError);
        if (loadMoreBtn) {
          loadMoreBtn.textContent = '加载失败，点击重试';
          loadMoreBtn.disabled = false;
        }
      }
    } else {
      if (loadMoreBtn) {
        loadMoreBtn.textContent = '加载失败，点击重试';
        loadMoreBtn.disabled = false;
      }
    }

  } catch (err) {
    console.error("请求报错：", err);
    if (loadMoreBtn) {
      loadMoreBtn.textContent = '网络错误，点击重试';
      loadMoreBtn.disabled = false;
    }
  }
}

// ============================================
// 导出试题
// ============================================
function exportQuestions() {
  if (allLoadedQuestions.length === 0) {
    alert('暂无题目可导出');
    return;
  }
  
  let text = '=== 试题导出 ===\n';
  text += `学科：${subjectNameInput.value}\n`;
  text += `年级：${gradeSelect.value}\n`;
  text += `难度：${difficultySelect.value}\n`;
  text += '================\n\n';
  
  allLoadedQuestions.forEach((q, i) => {
    text += `【第${i + 1}题】\n`;
    text += `题目：${q.question}\n`;
    if (!hideAnswers) {
      text += `答案：${q.answer}\n`;
    }
    text += '\n';
  });
  
  text += '================\n';
  text += hideAnswers ? '（答案已隐藏）' : '（答案已展示）';
  
  // 创建下载
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `试题_${subjectNameInput.value}_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// 切换答案显示/隐藏
// ============================================
function toggleAnswers() {
  hideAnswers = !hideAnswers;
  document.querySelectorAll('.ans-box').forEach(box => {
    if (hideAnswers) {
      box.classList.add('hidden');
    } else {
      box.classList.remove('hidden');
    }
  });
  // 更新按钮文本
  const toggleBtn = document.querySelector('.toggle-answers-btn');
  if (toggleBtn) {
    toggleBtn.textContent = hideAnswers ? '显示答案' : '隐藏答案';
  }
}

// ============================================
// 登录/注册 标签切换
// ============================================
const tabItems = document.querySelectorAll('.tab-item');
const formWraps = document.querySelectorAll('.form-wrap');
const switchLinks = document.querySelectorAll('.switch-tab');

function switchForm(type) {
  tabItems.forEach(tab => tab.classList.toggle('active', tab.dataset.type === type));
  formWraps.forEach(form => form.classList.toggle('show', form.id === type + 'Form'));
  clearAllErrors();
  if (type === 'login' || type === 'register') {
    clearAllInputs();
  }
}

function clearAllErrors() {
  document.querySelectorAll('.error-tip').forEach(el => {
    el.style.display = 'none';
    if (el.id === 'loginPhoneErr') el.textContent = '请输入有效的11位手机号';
    if (el.id === 'loginPwdErr') el.textContent = '密码不能为空';
    if (el.id === 'regPhoneErr') el.textContent = '请输入正确的11位手机号码';
    if (el.id === 'regPwdErr') el.textContent = '密码长度不能少于6位';
    if (el.id === 'regRePwdErr') el.textContent = '两次密码不一致';
  });
}

function clearAllInputs() {
  document.getElementById('loginPhone').value = '';
  document.getElementById('loginPwd').value = '';
  document.getElementById('regPhone').value = '';
  document.getElementById('regPwd').value = '';
  document.getElementById('regRePwd').value = '';
}

tabItems.forEach(t => t.onclick = () => switchForm(t.dataset.type));
switchLinks.forEach(a => a.onclick = () => switchForm(a.dataset.target));

// ============================================
// 登录成功进入主页
// ============================================
function enterMain() {
  console.log('enterMain called, currentFullPhone:', currentFullPhone);
  console.log('loginPage:', loginPage);
  console.log('mainPage:', mainPage);
  
  try {
    if (loginPage) loginPage.style.display = 'none';
    if (userCenterPage) userCenterPage.style.display = 'none';
    if (wrongNotePage) wrongNotePage.style.display = 'none';
    if (mainPage) mainPage.style.display = 'flex';
    
    if (currentFullPhone) {
      const maskedPhone = maskPhone(currentFullPhone);
      const userPhoneEl = document.getElementById('userPhone');
      if (userPhoneEl) userPhoneEl.textContent = maskedPhone;
    }
    
    if (!subjectNameInput.value.trim()) {
      subjectNameInput.value = 'Java程序设计';
    }
    
    if (allLoadedQuestions.length === 0) {
      questionsContainer.innerHTML = '<div class="loading-txt">请选择学科、年级后点击「生成试题」</div>';
    }
  } catch (e) {
    console.error('enterMain error:', e);
    alert('进入主页失败: ' + e.message);
  }
}

// ============================================
// 进入用户中心
// ============================================
async function enterUserCenter() {
  mainPage.style.display = 'none';
  wrongNotePage.style.display = 'none';
  userCenterPage.style.display = 'flex';
  
  // 显示脱敏手机号和完整手机号
  if (currentFullPhone) {
    const maskedPhoneEl = document.getElementById('ucPhone');
    const fullPhoneEl = document.getElementById('ucFullPhone');
    if (maskedPhoneEl) maskedPhoneEl.textContent = maskPhone(currentFullPhone);
    if (fullPhoneEl) fullPhoneEl.textContent = currentFullPhone;
  }
  
  // 获取用户答题统计
  try {
    const res = await fetch(`${API_BASE}/api/answers/${currentFullPhone}`);
    const data = await res.json();
    
    if (data.success) {
      const totalEl = document.getElementById('ucTotalQuestions');
      const correctEl = document.getElementById('ucCorrectCount');
      const wrongEl = document.getElementById('ucWrongCount');
      const lastTimeEl = document.getElementById('ucLastTime');
      
      if (totalEl) totalEl.textContent = data.data.totalQuestions;
      if (correctEl) correctEl.textContent = data.data.correctCount;
      if (wrongEl) wrongEl.textContent = data.data.wrongCount;
      if (lastTimeEl) {
        lastTimeEl.textContent = data.data.totalQuestions > 0 
          ? new Date(Math.max(...data.data.wrongQuestions.map(w => w.savedAt))).toLocaleString()
          : '暂无';
      }
    }
  } catch (e) {
    console.error('获取用户数据失败:', e);
  }
}

// ============================================
// 进入错题本
// ============================================
async function enterWrongNote() {
  mainPage.style.display = 'none';
  userCenterPage.style.display = 'none';
  wrongNotePage.style.display = 'flex';
  
  const wrongNoteContainer = document.getElementById('wrongNoteContainer');
  if (!wrongNoteContainer) return;
  
  wrongNoteContainer.innerHTML = '<div class="loading-txt">正在加载错题...</div>';
  
  try {
    const res = await fetch(`${API_BASE}/api/answers/${currentFullPhone}`);
    const data = await res.json();
    
    if (data.success && data.data.wrongQuestions && data.data.wrongQuestions.length > 0) {
      let html = '';
      data.data.wrongQuestions.forEach((item, i) => {
        html += `
        <div class="question-card">
          <div class="question-title">【错题${i + 1}】${item.question}</div>
          <div class="wrong-answer">您的答案：${item.userAnswer}</div>
          <div class="correct-answer">正确答案：${item.answer || '未知'}</div>
          <div class="score-info">得分：${item.score}分</div>
        </div>`;
      });
      wrongNoteContainer.innerHTML = html || '<div class="loading-txt">暂无错题记录</div>';
    } else {
      wrongNoteContainer.innerHTML = '<div class="loading-txt">暂无错题记录，继续加油！</div>';
    }
  } catch (e) {
    console.error('获取错题失败:', e);
    wrongNoteContainer.innerHTML = '<div class="loading-txt">加载失败，请重试</div>';
  }
}

// ============================================
// 退出登录
// ============================================
document.getElementById('logoutBtn').onclick = () => {
  loginToken = null;
  currentUserPhone = null;
  currentFullPhone = null;
  currentQuestions = [];
  allLoadedQuestions = [];
  clearAllInputs();
  
  // 清除页面缓存
  mainPage.style.display = 'none';
  userCenterPage.style.display = 'none';
  wrongNotePage.style.display = 'none';
  loginPage.style.display = 'block';
  questionsContainer.innerHTML = '';
  subjectNameInput.value = '';
  
  switchForm('login');
};

// 微信/QQ 快捷登录
function initQuickLogin() {
  const wechatLogin = document.getElementById('wechatLogin');
  const qqLogin = document.getElementById('qqLogin');
  const forgotPwd = document.getElementById('forgotPwd');
  
  if (wechatLogin) {
    wechatLogin.onclick = () => {
      currentFullPhone = '13812348888';
      loginToken = 'quick_login_' + Date.now();
      showSelectModal();
    };
  }
  
  if (qqLogin) {
    qqLogin.onclick = () => {
      currentFullPhone = '13812348888';
      loginToken = 'quick_login_' + Date.now();
      showSelectModal();
    };
  }
  
  if (forgotPwd) {
    forgotPwd.onclick = () => {
      alert('请联系管理员重置密码：admin@example.com');
    };
  }
}

// ============================================
// 登录校验与后端交互
// ============================================
document.getElementById('loginBtn').onclick = async () => {
  let pass = true;
  const phone = document.getElementById('loginPhone').value.trim();
  const pwd = document.getElementById('loginPwd').value.trim();
  
  clearAllErrors();
  
  if (!phoneReg.test(phone)) {
    document.getElementById('loginPhoneErr').textContent = '请输入正确的11位手机号码';
    document.getElementById('loginPhoneErr').style.display = 'block';
    pass = false;
  }
  
  if (!pwd) {
    document.getElementById('loginPwdErr').style.display = 'block';
    pass = false;
  }
  
  if (pass) {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: pwd })
      });
      
      const data = await res.json();
      
      if (data.success) {
        loginToken = data.data.token;
        currentFullPhone = data.data.phone;  // 使用完整手机号
        currentUserPhone = data.data.maskedPhone;
        showSelectModal();
      } else {
        if (data.message.includes('未注册')) {
          alert(data.message);
          switchForm('register');
        } else if (data.message === '密码错误') {
          document.getElementById('loginPwdErr').textContent = '密码错误';
          document.getElementById('loginPwdErr').style.display = 'block';
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      alert('网络错误，请检查后端服务是否启动');
    }
  }
};

// ============================================
// 注册校验与后端交互
// ============================================
document.getElementById('regBtn').onclick = async () => {
  let pass = true;
  const phone = document.getElementById('regPhone').value.trim();
  const pwd = document.getElementById('regPwd').value;
  const repwd = document.getElementById('regRePwd').value;
  
  clearAllErrors();
  
  if (!phoneReg.test(phone)) {
    document.getElementById('regPhoneErr').textContent = '请输入正确的11位手机号码';
    document.getElementById('regPhoneErr').style.display = 'block';
    pass = false;
  }
  
  if (pwd.includes(' ')) {
    document.getElementById('regPwdErr').textContent = '密码不能包含空格';
    document.getElementById('regPwdErr').style.display = 'block';
    pass = false;
  } else if (pwd.length < 6) {
    document.getElementById('regPwdErr').style.display = 'block';
    pass = false;
  }
  
  if (pwd !== repwd) {
    document.getElementById('regRePwdErr').style.display = 'block';
    pass = false;
  }
  
  if (pass) {
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password: pwd })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('注册成功！');
        document.getElementById('regPhone').value = '';
        document.getElementById('regPwd').value = '';
        document.getElementById('regRePwd').value = '';
        switchForm('login');
        document.getElementById('loginPhone').value = phone;
      } else {
        if (data.message.includes('已注册')) {
          document.getElementById('regPhoneErr').textContent = '该手机号已注册，请直接登录';
          document.getElementById('regPhoneErr').style.display = 'block';
          setTimeout(() => {
            switchForm('login');
            document.getElementById('loginPhone').value = phone;
          }, 1500);
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('注册请求失败:', error);
      alert('网络错误，请检查后端服务是否启动');
    }
  }
};

// ============================================
// 修改密码
// ============================================
function updatePassword() {
  const oldPwd = document.getElementById('oldPassword');
  const newPwd = document.getElementById('newPassword');
  const confirmPwd = document.getElementById('confirmPassword');
  
  if (!oldPwd || !newPwd || !confirmPwd) return;
  
  const oldPwdVal = oldPwd.value.trim();
  const newPwdVal = newPwd.value;
  const confirmPwdVal = confirmPwd.value;
  
  if (!oldPwdVal || !newPwdVal || !confirmPwdVal) {
    alert('请填写所有密码字段');
    return;
  }
  
  if (newPwdVal !== confirmPwdVal) {
    alert('新密码与确认密码不一致');
    return;
  }
  
  if (newPwdVal.includes(' ') || newPwdVal.length < 6) {
    alert('新密码长度不能少于6位且不能包含空格');
    return;
  }
  
  fetch(`${API_BASE}/api/user/updatePassword`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: currentFullPhone,
      oldPassword: oldPwdVal,
      newPassword: newPwdVal
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    if (data.success) {
      oldPwd.value = '';
      newPwd.value = '';
      confirmPwd.value = '';
    }
  })
  .catch(e => {
    console.error('修改密码失败:', e);
    alert('网络错误');
  });
}

// ============================================
// 返回主页
// ============================================
function backToMain() {
  userCenterPage.style.display = 'none';
  wrongNotePage.style.display = 'none';
  mainPage.style.display = 'flex';
}

// ============================================
// 学科分类展开/收起
// ============================================
const categoryItems = document.querySelectorAll('.major-category');
categoryItems.forEach(cate => {
  cate.onclick = () => {
    cate.classList.toggle('active');
    const next = cate.nextElementSibling;
    if (next) next.classList.toggle('open');
  };
});

const majorItems = document.querySelectorAll('.major-item');
majorItems.forEach(item => {
  item.onclick = () => {
    const subList = item.nextElementSibling;
    if (subList) subList.classList.toggle('open');
  };
});

let subjectItems = document.querySelectorAll('.subject-item');
subjectItems.forEach(sub => {
  sub.onclick = () => {
    subjectItems.forEach(s => s.classList.remove('active'));
    sub.classList.add('active');
    subjectNameInput.value = sub.innerText;
    allLoadedQuestions = [];
    generateQuestions();
  };
});

// 学科下拉框变化时刷新题目
subjectNameInput.addEventListener('change', () => {
  allLoadedQuestions = [];
  generateQuestions();
});

// 年级变化时联动刷新
gradeSelect.addEventListener('change', () => {
  allLoadedQuestions = [];
  generateQuestions();
});

// 难度变化时联动刷新
difficultySelect.addEventListener('change', () => {
  allLoadedQuestions = [];
  generateQuestions();
});

// 绑定按钮事件
function handleGenerateQuestions() {
  allLoadedQuestions = [];
  generateQuestions();
}

generateBtn.onclick = handleGenerateQuestions;
newTopicBtn.onclick = handleGenerateQuestions;
