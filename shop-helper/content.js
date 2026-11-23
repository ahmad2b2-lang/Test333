// Shop Helper content. Every text is [English, Arabic].
// Drafted by Claude; an experienced employee checks each product page in the app (green tick).
// Photos come from the Card Maker (Supabase bucket product-images).

const NEEDS = [
 {id:'drip', icon:'💧', t:['Fix or extend a drip line','إصلاح أو تمديد خط التنقيط'],
  sub:['Drippers, fittings, valves','نقاطات، وصلات، محابس'],
  qs:[
   {q:['What is broken or needed?','ما المشكلة أو ما المطلوب؟'], o:[
     {t:['Dripper gives no water / weak','النقاط لا يعطي ماء أو ضعيف'], p:['p1','p4']},
     {t:['Thin drip hose (16) leaking or cut','خرطوم التنقيط الرفيع (16) مقطوع أو يسرب'], p:['p2','p3','p4']},
     {t:['Big main pipe cracked','الماسورة الرئيسية الكبيرة مكسورة'], p:['p7']},
     {t:['New row / new branch','خط جديد أو تفريعة جديدة'], p:['p8','p5','p6','p2']},
     {t:['Close one row or area','قفل خط واحد أو منطقة'], p:['p6','p9']}]},
   {q:['Ask him to bring a piece of the pipe, or ask: thin drip hose or big main pipe?','اطلب منه قطعة من الماسورة، أو اسأل: خرطوم تنقيط رفيع أم ماسورة رئيسية كبيرة؟'], o:[
     {t:['Thin drip hose','خرطوم تنقيط رفيع'], p:['p1','p2','p3','p4','p5','p6']},
     {t:['Big main pipe','ماسورة رئيسية كبيرة'], p:['p7','p8','p9']}]}],
  p:['p1','p2','p3','p4','p5','p6','p7','p8','p9']},
 {id:'spray', icon:'🧴', t:['Spray pesticide or fertilizer','رش مبيد أو سماد'],
  sub:['Sprayers and spray hose','مرشات وهوز رش'],
  qs:[
   {q:['How big is the area?','كم حجم المكان؟'], o:[
     {t:['House garden / few pots','حديقة بيت أو أحواض قليلة'], p:['p10','p11']},
     {t:['Small farm, up to ~50 palms','مزرعة صغيرة، حتى 50 نخلة تقريبًا'], p:['p12','p13']},
     {t:['Many palms / tall trees','نخل كثير أو أشجار عالية'], p:['p14','p15']}]},
   {q:['Does he want to pump by hand?','هل يقبل الضخ باليد؟'], o:[
     {t:['Yes, cheaper is better','نعم، الأرخص أفضل'], p:['p12','p11']},
     {t:['No, wants less effort','لا، يريد تعب أقل'], p:['p13','p14']}]}],
  p:['p10','p11','p12','p13','p14','p15']},
 {id:'prune', icon:'🌴', t:['Prune palms and trees','تقليم النخل والأشجار'],
  sub:['Shears, loppers, saws, sickle','مقصات، منشار، منجل'],
  qs:[
   {q:['How thick is the branch?','كم سماكة الغصن؟'], o:[
     {t:['Thin, like a finger','رفيع مثل الإصبع'], p:['p16']},
     {t:['Like a thumb to a wrist','من الإبهام إلى المعصم'], p:['p17','p18']},
     {t:['Thicker than an arm / trunk','أسمك من الذراع أو جذع'], p:['p21','p18']},
     {t:['Palm fronds and thorns','سعف النخل والشوك'], p:['p19','p31','p33']}]},
   {q:['Is the branch high up?','هل الغصن عالي؟'], o:[
     {t:['Yes, can not reach','نعم، لا يصل إليه'], p:['p20']},
     {t:['No, by hand','لا، في متناول اليد'], p:['p16','p17']}]}],
  p:['p16','p17','p18','p19','p20','p21']},
 {id:'grass', icon:'🌾', t:['Cut grass and weeds','قص العشب والحشائش'],
  sub:['Brush cutters and blades','مكائن حش وسكاكين'],
  qs:[
   {q:['How much will he use it?','كم سيستعملها؟'], o:[
     {t:['Now and then, wants light','أحيانًا، يريدها خفيفة'], p:['p22','p24']},
     {t:['Often, long hours','كثيرًا، ساعات طويلة'], p:['p23','p24']}]},
   {q:['What will he cut?','ماذا سيقص؟'], o:[
     {t:['Thick weeds and small shrubs','حشائش قوية وشجيرات صغيرة'], p:['p24']},
     {t:['Normal grass','عشب عادي'], p:['p22','p23']}]}],
  p:['p22','p23','p24']},
 {id:'soil', icon:'⛏️', t:['Dig and prepare soil','حفر وتجهيز التربة'],
  sub:['Hoes, shovels, tiller','مساحي، كريكات، حراثة'],
  qs:[
   {q:['How big is the job?','كم حجم الشغل؟'], o:[
     {t:['Small beds / pots','أحواض صغيرة'], p:['p26']},
     {t:['Farm work by hand','شغل مزرعة باليد'], p:['p25','p27']},
     {t:['Large area, wants a machine','مساحة كبيرة ويريد مكينة'], p:['p28']}]}],
  p:['p25','p26','p27','p28']},
 {id:'protect', icon:'🛡️', t:['Protect dates and plants','حماية التمر والنباتات'],
  sub:['Date bags, bird net, shade','أكياس عذوق، شبك طيور، تظليل'],
  qs:[
   {q:['Protect from what?','الحماية من ماذا؟'], o:[
     {t:['Birds / insects on date bunches','الطيور أو الحشرات على العذوق'], p:['p29','p32']},
     {t:['Strong sun','الشمس القوية'], p:['p30']}]}],
  p:['p29','p32','p30']},
 {id:'safety', icon:'🧤', t:['Work safety','السلامة في العمل'],
  sub:['Gloves','قفازات'],
  qs:[
   {q:['What will he hold?','ماذا سيمسك؟'], o:[
     {t:['Thorns, wire, rough work','شوك، سلك، شغل خشن'], p:['p33']},
     {t:['Tools, wet or general work','عدد، شغل رطب أو عام'], p:['p31']}]}],
  p:['p31','p33']}
];

const PROBLEMS = [
 {t:['Dripper not giving water','النقاط لا ينزل ماء'], p:['p1','p4'], tip:['Usually dirt or salt blocking it. Open the end plug and flush the line first, then clean or replace the dripper. Ask if he has a filter at the pump.','غالبًا وساخة أو أملاح سادّة. افتح سدادة النهاية واغسل الخط أولًا، ثم نظّف النقاط أو غيّره. اسأله هل عنده فلتر عند المضخة.']},
 {t:['Drip hose leaking at a joint','خرطوم التنقيط يسرب عند الوصلة'], p:['p2','p3','p4'], tip:['Cut off the damaged end and push a new fitting all the way in. Hose must be the same size as the fitting (16).','قص الطرف التالف وادخل وصلة جديدة للآخر. لازم مقاس الخرطوم نفس مقاس الوصلة (16).']},
 {t:['Main pipe cracked or leaking','الماسورة الرئيسية مكسورة أو تسرب'], p:['p7'], tip:['Cut out the cracked part and join with a compression coupling of the SAME pipe size.','قص الجزء المكسور واربط بوصلة ضغط بنفس مقاس الماسورة.']},
 {t:['Wants a new branch from the main pipe','يريد تفريعة جديدة من الماسورة الرئيسية'], p:['p8','p5','p6'], tip:['Saddle clamp on the main pipe, start connector, then a mini valve to control the new row.','سرج تفريع على الماسورة الرئيسية، ثم بداية تنقيط، ثم محبس صغير للتحكم بالخط الجديد.']},
 {t:['Sprayer losing pressure','المرشة تفقد الضغط'], p:['p11','p12','p15'], tip:['Usually a worn seal (O-ring) or loose cap, or a cracked hose. Ask him to bring the sprayer so we see which part.','غالبًا جلدة (أورنق) تالفة أو غطاء غير محكم أو هوز مشقوق. اطلب منه يجيب المرشة نشوف أي قطعة.']},
 {t:['Pests on tall palms, spray does not reach','حشرات على نخل عالي والرش لا يصل'], p:['p14','p15'], tip:['A backpack sprayer will not reach the top of a tall palm. He needs the engine trolley sprayer with a long hose.','مرشة الظهر لا توصل لرأس النخلة العالية. يحتاج مرشة العربة بالمحرك مع هوز طويل.']},
 {t:['Birds eating dates','الطيور تاكل التمر'], p:['p29','p32'], tip:['Date bags on each bunch, or bird net for bigger cover.','أكياس عذوق على كل عذق، أو شبك طيور لتغطية أكبر.']},
 {t:['Grass and weeds too thick','الحشائش كثيفة وقوية'], p:['p22','p23','p24'], tip:['Brush cutter with a metal 3-teeth blade. Nylon line is only for soft grass.','مكينة حش بسكين حديد 3 أسنان. خيط النايلون للعشب الطري فقط.']},
 {t:['Ground too hard to dig','الأرض قاسية والحفر صعب'], p:['p25','p27','p28'], tip:['Tell him to water the ground the day before. Forged hoe for hand work, tiller for big areas.','قل له يسقي الأرض قبلها بيوم. المسحاة المطروقة للشغل اليدوي، والحراثة للمساحات الكبيرة.']},
 {t:['Plants burning in the sun','النباتات تحترق من الشمس'], p:['p30'], tip:['Shade net. Ask what plants: 80% is strong shade (seedlings, parking); many vegetables prefer lighter shade.','شبك تظليل. اسأله ما النبات: 80٪ تظليل قوي (شتلات، مواقف)، وكثير من الخضار يفضّل تظليل أخف.']},
 {t:['Hands hurt from palm thorns','الأيدي تتجرح من شوك النخل'], p:['p33','p31','p19'], tip:['Leather gloves protect best from thorns. Serrated sickle to cut fronds.','قفاز الجلد أفضل حماية من الشوك. المنجل المسنن لقص السعف.']},
 {t:['Branch too thick for scissors','الغصن أسمك من المقص'], p:['p17','p18','p21'], tip:['Lopper up to about a thumb-to-wrist size, saw above that, chainsaw for trunks.','مقص اليدين حتى سماكة الإبهام إلى المعصم تقريبًا، وفوقها المنشار، وللجذوع منشار السلسلة.']}
];

const S = 'g', M = 's', B = 'b'; // home garden, small farm, bigger farm

const P = {
p1:{img:['dv-dripper-4mm/69220102765028fe69bb0aeb0ca0108a.jpg'], n:['Adjustable dripper 4 mm (green cap)','نقاط تنقيط قابل للتعديل 4 مم'], need:'drip', suits:[S,M,B],
 kw:'dripper drip nozzle نقاط نقاطة دريبر تنقيط منقط',
 use:['Gives water drop by drop to one plant or tree. Turning the cap changes how much water comes out.','يعطي الماء نقطة نقطة لنبتة أو شجرة. لفّ الغطاء يغيّر كمية الماء.'],
 size:['Fits on 4 mm micro tube, or pushed straight into the drip hose using a hole punch. Ask how he connects it.','يركب على خرطوم صغير 4 مم، أو مباشرة في خرطوم التنقيط بعد خرمه بالخرامة. اسأله كيف يركّبه.'],
 qa:[
  [['How much water per hour?','كم ماء يعطي في الساعة؟'],['It is adjustable: almost closed gives a few drops, fully open gives a strong flow. The exact litres depend on his pump pressure, so tell him to test and adjust on site.','قابل للتعديل: شبه مقفل يعطي نقاط قليلة، ومفتوح كامل يعطي تدفق قوي. اللترات بالضبط تعتمد على ضغط المضخة، فقل له يجرب ويضبط في المزرعة.']],
  [['Why does it clog?','ليش ينسد؟'],['Sand, dirt and salts in the water. A filter at the pump and flushing the line once a month help a lot. The cap can be opened and cleaned.','رمل ووساخة وأملاح في الماء. الفلتر عند المضخة وغسل الخط مرة في الشهر يساعد كثير. الغطاء ينفتح وينظف.']],
  [['How many per palm or tree?','كم نقاط لكل نخلة أو شجرة؟'],['Small plant: 1. Young tree: 2. A big palm usually needs several around the trunk. Let him decide by his watering habit; do not give a fixed number as a rule.','نبتة صغيرة: 1. شجرة صغيرة: 2. النخلة الكبيرة عادة تحتاج عدة نقاطات حول الجذع. خلّه يقرر حسب طريقة سقيه، ولا تعطي رقم ثابت كقاعدة.']]],
 warn:[['Do not sell for very dirty water without telling him about a filter.','لا تبيعه لماء وسخ جدًا بدون ما تنبهه على الفلتر.']],
 with:['p4','p2','p6'],
 mis:[['Selling the dripper but forgetting to ask how he will connect it (hole punch, micro tube).','بيع النقاط ونسيان السؤال كيف سيركبه (خرامة، خرطوم صغير).']]},

p2:{img:['dv-barb-tee/d59f10d54c48e24d1b86b13414bdb91e.jpg'], n:['Barbed tee Φ16','تي تنقيط مسنن Φ16'], need:'drip', suits:[S,M,B],
 kw:'tee T تي ثلاثي تنقيط 16 barbed',
 use:['Splits one drip hose into two directions.','يقسم خرطوم التنقيط إلى اتجاهين.'],
 size:['Φ16 = the common 16 mm drip hose (farmers sometimes call it half inch). Hold his hose against the fitting to be sure.','Φ16 = خرطوم التنقيط الشائع 16 مم (بعض المزارعين يسميه نص إنش). قارن خرطومه بالوصلة للتأكد.'],
 qa:[
  [['Does it fit my hose?','يركب على خرطومي؟'],['Yes if his hose is 16 mm. Thinner hose (13 mm) needs a reducing fitting.','نعم إذا خرطومه 16 مم. الخرطوم الأرفع (13 مم) يحتاج وصلة تصغير.']],
  [['Will it leak at the joint?','بيسرب عند الوصلة؟'],['Not if the hose is pushed in all the way past the teeth. Warming the hose end in the sun or warm water makes it easier.','لا إذا دخل الخرطوم للآخر بعد الأسنان. تسخين طرف الخرطوم بالشمس أو ماء دافي يسهّل التركيب.']]],
 warn:[],
 with:['p3','p4','p6'],
 mis:[['Not checking the hose size before selling.','عدم التأكد من مقاس الخرطوم قبل البيع.']]},

p3:{img:['dv-barb-elbow/8abb5e3b3d22fa2d2af888e15c69e606.jpg'], n:['Barbed elbow Φ16','كوع تنقيط مسنن Φ16'], need:'drip', suits:[S,M,B],
 kw:'elbow كوع زاوية تنقيط 16',
 use:['Turns the drip hose 90 degrees at a corner without bending (kinking) it.','يلف خرطوم التنقيط 90 درجة عند الزاوية بدون ما ينثني.'],
 size:['Same as the tee: for 16 mm drip hose.','مثل التي: لخرطوم تنقيط 16 مم.'],
 qa:[
  [['Same size as my hose?','نفس مقاس خرطومي؟'],['Compare his hose with the fitting. 16 mm is the most common.','قارن خرطومه بالوصلة. 16 مم هو الأشهر.']],
  [['Do I need a clamp?','أحتاج مربط (كلامب)؟'],['Normally no. The teeth hold the hose. Only for high pressure lines.','عادة لا. الأسنان تمسك الخرطوم. فقط للخطوط ذات الضغط العالي.']]],
 warn:[],
 with:['p2','p4'],
 mis:[]},

p4:{img:['dv-barb-end-cap/67ec93510ef16c24aee43a7c90f3b5ed.jpg'], n:['Barbed end plug Φ16','سدادة نهاية تنقيط Φ16'], need:'drip', suits:[S,M,B],
 kw:'end plug cap سدادة نهاية طبة قفلة تنقيط 16',
 use:['Closes the end of a drip line. Can be removed to flush dirt out.','يقفل نهاية خط التنقيط. يمكن فتحه لغسل الوساخة.'],
 size:['For 16 mm drip hose.','لخرطوم تنقيط 16 مم.'],
 qa:[
  [['How do I close the end of the line?','كيف أقفل آخر الخط؟'],['Push this plug into the hose end. Some farmers just fold the hose, but it leaks and can not be flushed easily.','ادخل السدادة في آخر الخرطوم. بعض المزارعين يثني الخرطوم فقط، لكنه يسرب وما ينغسل بسهولة.']],
  [['Can I flush dirt out later?','أقدر أغسل الوساخة بعدين؟'],['Yes. Pull the plug, run water a minute until clean, put it back. Doing this monthly helps stop drippers clogging.','نعم. اسحب السدادة وشغل الماء دقيقة حتى ينظف ثم رجعها. عملها شهريًا يقلل انسداد النقاطات.']]],
 warn:[],
 with:['p1','p2'],
 mis:[['Selling a new drip line without end plugs.','بيع خط تنقيط جديد بدون سدادات نهاية.']]},

p5:{img:['dv-barb-male/f39a34911ed2bcf83477977128ce4ce3.jpg'], n:['Start connector, drip hose to 1/2 inch male thread','بداية تنقيط مسنن × سن خارجي نص إنش'], need:'drip', suits:[S,M,B],
 kw:'start connector adaptor بداية محول سن خارجي نص انش تنقيط',
 use:['Connects the 16 mm drip hose to a threaded outlet (1/2 inch), like a tap, valve or saddle clamp.','يربط خرطوم التنقيط 16 مم بمخرج مسنن نص إنش مثل حنفية أو محبس أو سرج تفريع.'],
 size:['Thread is 1/2 inch male. The outlet he connects to must be 1/2 inch female.','السن نص إنش خارجي. المخرج اللي بيركب عليه لازم يكون نص إنش داخلي.'],
 qa:[
  [['How do I connect drip hose to the main pipe or tap?','كيف أربط خرطوم التنقيط بالماسورة أو الحنفية؟'],['Main pipe: saddle clamp, then this connector into it. Tap: screw it into a 1/2 inch female outlet.','الماسورة الرئيسية: سرج تفريع ثم هذي البداية فيه. الحنفية: تركب في مخرج نص إنش داخلي.']],
  [['Will the thread leak?','السن بيسرب؟'],['Wrap Teflon tape 5–6 turns on the thread first.','لف شريط تفلون 5–6 لفات على السن قبل التركيب.']]],
 warn:[['Do not over-tighten with a wrench; plastic thread can crack.','لا تشد بقوة بالمفتاح؛ السن البلاستيك ممكن ينكسر.']],
 with:['p8','p6'],
 mis:[['Forgetting Teflon tape.','نسيان شريط التفلون.']]},

p6:{img:['dv-barb-mini-valve/a042a2b055e9f25ea9b526178848dc36.jpg'], n:['Mini valve for drip hose Φ16','محبس تنقيط صغير Φ16'], need:'drip', suits:[S,M,B],
 kw:'mini valve محبس صغير تنقيط 16 قفل خط',
 use:['Opens or closes one drip row without stopping the whole farm.','يفتح أو يقفل خط تنقيط واحد بدون إيقاف المزرعة كلها.'],
 size:['Barbed on both ends for 16 mm hose.','مسنن من الجهتين لخرطوم 16 مم.'],
 qa:[
  [['Can I shut one row only?','أقدر أقفل خط واحد بس؟'],['Yes, that is its job. Put one at the start of each row he wants to control.','نعم، هذا شغله. يركب واحد في بداية كل خط يبي يتحكم فيه.']],
  [['Does it handle my pump pressure?','يتحمل ضغط المضخة؟'],['It is made for normal drip pressure. For the big main pipe use a PP ball valve instead.','مصنوع لضغط التنقيط العادي. للماسورة الرئيسية الكبيرة استخدم محبس كروي PP.']]],
 warn:[],
 with:['p5','p2'],
 mis:[['Selling it for the main pipe; it is only for drip hose.','بيعه للماسورة الرئيسية؛ هو لخرطوم التنقيط فقط.']]},

p7:{img:['dv-coupling/d2d4cb23d3eb427282942e53e0e0cfbf.jpg'], n:['PP compression coupling','وصلة ضغط PP مستقيمة'], need:'drip', suits:[M,B],
 kw:'coupling compression joiner وصلة ضغط مستقيمة جوينت ماسورة PE بولي',
 use:['Joins two pieces of PE main pipe, or repairs a cracked pipe, without glue or heat.','يربط قطعتين من ماسورة PE الرئيسية أو يصلح ماسورة مكسورة، بدون غراء أو حرارة.'],
 size:['Sized by the OUTSIDE size of the pipe in mm. Common: 20 = 1/2", 25 = 3/4", 32 = 1", 40 = 1 1/4", 50 = 1 1/2", 63 = 2". Measure his pipe or ask for a piece.','المقاس حسب القطر الخارجي للماسورة بالمم. الشائع: 20 = نص إنش، 25 = ثلاث أرباع، 32 = 1 إنش، 40 = 1 وربع، 50 = 1 ونص، 63 = 2 إنش. قِس ماسورته أو اطلب قطعة منها.'],
 qa:[
  [['My main pipe cracked, can I fix it without glue?','الماسورة انكسرت، أقدر أصلحها بدون غراء؟'],['Yes. Cut out the cracked part straight, loosen the nuts, push each pipe end in fully, tighten by hand. If the gap is big, use two couplings with a new piece of pipe.','نعم. قص الجزء المكسور قص مستقيم، فك الصواميل، دخّل طرفي الماسورة للآخر، وشد باليد. إذا الفراغ كبير استخدم وصلتين مع قطعة ماسورة جديدة.']],
  [['Which size is my pipe, mm or inch?','ماسورتي كم، مم ولا إنش؟'],['These fittings are in mm (outside size). Use the table above to match his inch name.','هذي الوصلات بالمم (القطر الخارجي). استخدم الجدول فوق عشان تطابق اسمه بالإنش.']]],
 warn:[['Turn off the pump before repairing.','أطفئ المضخة قبل الإصلاح.']],
 with:['p8','p9'],
 mis:[['Giving an inch size by guess. Always confirm the mm size.','إعطاء مقاس بالإنش بالتخمين. دائمًا تأكد من المقاس بالمم.']]},

p8:{img:['dv-saddle-clamp/a684278bfb3087f13f041303f7557946.jpg'], n:['PP saddle clamp (tapping saddle)','سرج تفريع PP (قفيز)'], need:'drip', suits:[M,B],
 kw:'saddle clamp سرج تفريع قفيز مربط تفريعة',
 use:['Takes a new branch out of the main pipe without cutting it.','يأخذ تفريعة جديدة من الماسورة الرئيسية بدون قصها.'],
 size:['Two sizes matter: the main pipe size (mm) and the outlet thread (inch). Example: 63 x 1/2". Ask both.','مقاسين مهمين: مقاس الماسورة الرئيسية (مم) ومقاس السن المخرج (إنش). مثال: 63 × نص إنش. اسأل عن الاثنين.'],
 qa:[
  [['How do I take a branch without cutting the pipe?','كيف آخذ تفريعة بدون ما أقص الماسورة؟'],['Fix the saddle on the pipe, tighten the bolts evenly, then drill a hole in the pipe through the outlet. Then screw in the start connector or a valve.','ثبّت السرج على الماسورة، اشد البراغي بالتساوي، ثم اخرم الماسورة من خلال فتحة المخرج. بعدها ركّب البداية أو المحبس.']],
  [['Will it leak?','بيسرب؟'],['Not if the rubber seal sits right and the bolts are tightened evenly on both sides.','لا إذا الجلدة المطاطية في مكانها والبراغي مشدودة بالتساوي من الجهتين.']]],
 warn:[['Drill with the pump off.','الخرم والمضخة طافية.']],
 with:['p5','p6','p9'],
 mis:[['Asking only the main pipe size and forgetting the outlet thread size.','السؤال عن مقاس الماسورة فقط ونسيان مقاس سن المخرج.']]},

p9:{img:['dv-pp-ball-valve/38b89369ccdf5ba9242b062e00fef2ab.jpg'], n:['PP compression ball valve','محبس كروي ضغط PP'], need:'drip', suits:[M,B],
 kw:'ball valve محبس كروي بلف ضغط PP',
 use:['Opens or closes the main pipe or a big branch.','يفتح أو يقفل الماسورة الرئيسية أو تفريعة كبيرة.'],
 size:['Same mm sizes as the compression coupling. Match his pipe size.','نفس مقاسات وصلة الضغط بالمم. طابق مقاس ماسورته.'],
 qa:[
  [['Does it handle pump pressure?','يتحمل ضغط المضخة؟'],['Normal farm pump pressure, yes. The pressure rating is marked on the body (PN number); check it if his pump is strong.','ضغط مضخة المزرعة العادي نعم. تحمّل الضغط مكتوب على الجسم (رقم PN)؛ شيّك عليه إذا مضخته قوية.']],
  [['Will the handle break in the sun?','الذراع بينكسر من الشمس؟'],['Plastic gets weaker after years in direct sun. Covering the valve or keeping it in shade makes it last longer.','البلاستيك يضعف بعد سنوات في الشمس المباشرة. تغطية المحبس أو وضعه في الظل يطوّل عمره.']]],
 warn:[['Close and open slowly to avoid water hammer on the pipes.','اقفل وافتح ببطء لتجنب ضربة الماء على المواسير.']],
 with:['p7','p8'],
 mis:[]},

p10:{img:['mvkf05/b1f4558fec38160b403c6f6b6b3a2f92.jpg'], n:['2 L hand pressure sprayer (KF-2.0LA)','مرشة ضغط 2 لتر (KF-2.0LA)'], need:'spray', suits:[S],
 kw:'sprayer small hand مرشة صغيرة يدوية بخاخ 2 لتر رشاش',
 use:['Small sprayer for house plants and a few pots. Pump the top, then press to spray.','مرشة صغيرة لنباتات البيت وأحواض قليلة. اضخ من فوق ثم اضغط للرش.'],
 size:['2 litres. For more than a small garden, offer the 8 L.','2 لتر. لأكثر من حديقة صغيرة اعرض الـ 8 لتر.'],
 qa:[
  [['Is it enough for my home garden?','تكفي حديقة بيتي؟'],['For pots and a few small plants, yes. For a full garden he will refill many times; the 8 L is better.','للأحواض وكم نبتة صغيرة نعم. لحديقة كاملة بيعبيها مرات كثيرة؛ الـ 8 لتر أفضل.']],
  [['Can I use it for weed killer too?','أقدر أستخدمها لمبيد الحشائش كمان؟'],['Better not. Weed killer left in the sprayer can burn his plants later. Advise one sprayer only for weed killer, marked.','الأفضل لا. بقايا مبيد الحشائش في المرشة ممكن تحرق نباتاته بعدين. انصحه بمرشة خاصة لمبيد الحشائش ومعلّمة.']]],
 warn:[['Wash it with water after every use.','اغسلها بالماء بعد كل استعمال.'],['Release the pressure before opening the top.','فك الضغط قبل فتح الغطاء.']],
 with:['p11','p31'],
 mis:[]},

p11:{img:['mvkf02/b1fad09d5c0f5a6bff8a075d54cc4a98.jpg'], n:['8 L pressure sprayer with gauge (KF-8L-6)','مرشة ضغط 8 لتر بمانومتر (KF-8L-6)'], need:'spray', suits:[S,M],
 kw:'sprayer 8 litre gauge مرشة 8 لتر مانومتر ساعة ضغط',
 use:['Medium sprayer carried by hand or shoulder. Pump to build pressure, then spray for a while.','مرشة متوسطة تحمل باليد أو على الكتف. اضخ لبناء الضغط ثم رش لفترة.'],
 size:['8 litres: a big garden or a few rows.','8 لتر: حديقة كبيرة أو كم خط.'],
 qa:[
  [['How long does the pressure last?','كم يدوم الضغط؟'],['Some minutes of spraying, then pump again. The gauge shows when it drops.','عدة دقائق رش ثم يضخ مرة ثانية. الساعة توضح متى ينزل الضغط.']],
  [['What does the gauge tell me?','الساعة وش فايدتها؟'],['Shows pressure so he does not over-pump. Keep the needle in the safe (green) zone if marked.','توضح الضغط عشان ما يضخ زيادة. خلّ المؤشر في المنطقة الآمنة (الخضراء) إذا كانت مكتوبة.']]],
 warn:[['Never over-pump past the safe mark.','لا تضخ أكثر من الحد الآمن.'],['Release pressure before opening.','فك الضغط قبل الفتح.']],
 with:['p31','p15'],
 mis:[]},

p12:{img:['mvkf08/166754a50e87b20f07f9c7b257b82c04.jpg'], n:['20 L manual backpack sprayer (KF-16B-H)','مرشة ظهر يدوية 20 لتر (KF-16B-H)'], need:'spray', suits:[M],
 kw:'backpack sprayer manual مرشة ظهر يدوي 20 لتر رشاش ظهر',
 use:['Carried on the back. One hand pumps the lever, the other holds the lance.','تُحمل على الظهر. يد تضخ بالذراع والثانية تمسك الرشاش.'],
 size:['20 litres. Good for a small farm and short trees.','20 لتر. مناسبة لمزرعة صغيرة وأشجار قصيرة.'],
 qa:[
  [['Is it tiring to pump?','متعبة في الضخ؟'],['Yes for long hours. If he sprays a lot, show him the battery model.','نعم للساعات الطويلة. إذا يرش كثير وريه الموديل بالبطارية.']],
  [['Does it reach the top of a palm?','توصل لرأس النخلة؟'],['Only short palms. For tall palms he needs the engine trolley sprayer.','النخل القصير فقط. للنخل العالي يحتاج مرشة العربة بالمحرك.']],
  [['Are spare parts available?','قطع الغيار متوفرة؟'],['Ask the shop before promising. Seals and nozzles are the parts that wear first.','اسأل المحل قبل ما توعده. الجلدات والفوهات أول قطع تتلف.']]],
 warn:[['Wear gloves and a mask when spraying pesticide.','البس قفاز وكمامة عند رش المبيد.'],['Do not spray against the wind.','لا ترش عكس الريح.']],
 with:['p31','p15'],
 mis:[['Promising it reaches tall palms.','الوعد بأنها توصل للنخل العالي.']]},

p13:{img:['mvkf03/dd734e4c252844bdb70c219aee4304e9.jpg'], n:['20 L battery backpack sprayer (KF-20C-10)','مرشة ظهر كهربائية 20 لتر (KF-20C-10)'], need:'spray', suits:[M],
 kw:'battery electric sprayer مرشة كهربائية بطارية شحن ظهر 20',
 use:['Backpack sprayer with a battery pump, so no hand pumping.','مرشة ظهر بمضخة بطارية، بدون ضخ باليد.'],
 size:['20 litres, like the manual one but much less effort.','20 لتر مثل اليدوية لكن تعب أقل بكثير.'],
 qa:[
  [['How many tanks per charge?','كم تنكة تكفي الشحنة؟'],['Depends on the battery and pressure setting. Check the box/manual and tell him the real number; do not guess.','يعتمد على البطارية ومستوى الضغط. شيّك على الكرتون أو الكتالوج وقول له الرقم الحقيقي؛ لا تخمن.']],
  [['Battery life in summer heat?','البطارية في حر الصيف؟'],['Heat shortens battery life. Charge and store it indoors in the shade, not in the car.','الحر يقصّر عمر البطارية. يشحنها ويخزنها داخل في الظل، مو في السيارة.']],
  [['Worth the extra price?','تستاهل فرق السعر؟'],['If he sprays often or for long hours, yes: less tiring and steadier spray.','إذا يرش كثير أو لساعات طويلة نعم: تعب أقل ورش أثبت.']]],
 warn:[['Empty and rinse the tank after use; pesticide left inside damages the pump.','فضّي واغسل التنك بعد الاستعمال؛ المبيد الباقي يخرب المضخة.']],
 with:['p31','p15'],
 mis:[]},

p14:{img:['mvkf07/98751b0a02ee2a999dd4acae5fb50243.jpg'], n:['100 L petrol trolley sprayer with hose reel','مرشة عربة بمحرك بنزين 100 لتر'], need:'spray', suits:[B],
 kw:'trolley engine sprayer petrol مرشة عربة ماطور بنزين 100 لتر هوز بكرة',
 use:['Engine pump on a trolley with a long hose. Sprays high, for many palms and tall trees.','مضخة بمحرك على عربة مع هوز طويل. ترش عالي، للنخل الكثير والأشجار العالية.'],
 size:['100 litre tank. For a bigger farm.','تنك 100 لتر. لمزرعة أكبر.'],
 qa:[
  [['How many palms per tank?','كم نخلة يكفي التنك؟'],['Depends on palm size and spray amount. Let him judge from his usual mix; do not promise a number.','يعتمد على حجم النخلة وكمية الرش. خلّه يقدّر من خلطته المعتادة؛ لا توعده برقم.']],
  [['How high does it spray?','كم ترش عالي؟'],['Much higher than backpack sprayers, enough for most palms. Height depends on nozzle and pressure.','أعلى بكثير من مرشات الظهر، تكفي أغلب النخل. الارتفاع يعتمد على الفوهة والضغط.']],
  [['Which fuel and oil?','أي بنزين وزيت؟'],['Check the engine plate/manual: if 4-stroke, plain petrol plus engine oil in the engine; if 2-stroke, petrol mixed with 2-stroke oil.','شيّك لوحة المحرك أو الكتالوج: إذا 4 شوط بنزين عادي وزيت محرك داخل المحرك؛ إذا 2 شوط بنزين مخلوط بزيت 2 شوط.']]],
 warn:[['Keep people and animals away while spraying.','أبعد الناس والحيوانات وقت الرش.'],['Full protective gear: gloves, mask, long sleeves.','لبس حماية كامل: قفاز، كمامة، أكمام طويلة.']],
 with:['p15','p31'],
 mis:[['Not explaining fuel and oil before he leaves; engine damage comes back to the shop.','عدم شرح البنزين والزيت قبل ما يمشي؛ خراب المحرك يرجع للمحل.']]},

p15:{img:['album/almvj8uu9wi0r/25b36108effe72b622f486ac710346bd.jpg'], n:['High-pressure spray hose 8.5 x 14 mm','هوز رش ضغط عالي 8.5 × 14 مم'], need:'spray', suits:[M,B],
 kw:'spray hose high pressure هوز رش ضغط عالي خرطوم مرشة',
 use:['Hose between an engine sprayer pump and the spray gun.','هوز بين مضخة المرشة والمسدس.'],
 size:['Inside 8.5 mm, outside 14 mm. Working pressure 4.0 MPa (40 bar). Match his pump outlet and gun.','داخلي 8.5 مم، خارجي 14 مم. ضغط التشغيل 4.0 ميجا باسكال (40 بار). طابق مع مخرج مضخته والمسدس.'],
 qa:[
  [['Does it fit my sprayer pump?','يركب على مضخة مرشتي؟'],['It fits pumps and guns made for 8.5 mm hose. Ask him to bring the old hose end if unsure.','يركب على المضخات والمسدسات المصنوعة لهوز 8.5 مم. اطلب منه يجيب طرف الهوز القديم إذا مو متأكد.']],
  [['Burst pressure?','كم يتحمل قبل ما ينفجر؟'],['Working pressure is 40 bar. Do not run the pump above that.','ضغط التشغيل 40 بار. لا تشغل المضخة فوقه.']],
  [['By metre or roll?','بالمتر ولا بالرول؟'],['Check the shop selling unit. Supplier sells it by weight (kg).','شيّك وحدة البيع في المحل. المورد يبيعه بالوزن (كغ).']]],
 warn:[['Replace if cracked; a burst hose sprays pesticide on the worker.','غيّره إذا تشقق؛ انفجار الهوز يرش المبيد على العامل.']],
 with:['p14'],
 mis:[]},

p16:{img:['hd-pruner-sk5-gold/1dc6efac620ead1e250317796bc1c968.jpg'], n:['Pruning shears, SK-5 gold blade','مقص تقليم شفرة SK-5 ذهبية'], need:'prune', suits:[S,M,B],
 kw:'pruning shears secateurs مقص تقليم مقص يد مقص زراعي',
 use:['One-hand scissors for thin branches, flowers and leaves.','مقص بيد واحدة للأغصان الرفيعة والورد والأوراق.'],
 size:['For branches up to about finger thickness. Thicker needs the lopper.','للأغصان حتى سماكة الإصبع تقريبًا. الأسمك يحتاج مقص اليدين.'],
 qa:[
  [['Max branch thickness?','أكبر سماكة غصن؟'],['About finger-thick, green wood. Forcing thicker branches bends the blade.','حوالي سماكة الإصبع، خشب أخضر. إجبار أغصان أسمك يعوّج الشفرة.']],
  [['Does it stay sharp? Can it be sharpened?','يظل حاد؟ ينسن؟'],['SK-5 is a good blade steel. Clean the sap after use, oil lightly, and sharpen with a small stone.','SK-5 حديد شفرات جيد. نظّف العصارة بعد الاستعمال، زيّته خفيف، وسنّه بحجر صغير.']]],
 warn:[['Keep the lock closed when not in use.','خلّ القفل مسكّر وقت عدم الاستعمال.']],
 with:['p17','p31'],
 mis:[['Selling it for thick branches; customer returns with a bent blade.','بيعه لأغصان سميكة؛ يرجع الزبون بشفرة معوجة.']]},

p17:{img:['album/almvhkphnbwye/6fcba9d26ba2fc0b2a2f5c3ccd75bd2b.jpg'], n:['Compound-gear lopper, steel handles','مقص تقليم بيدين بترس ويد حديد'], need:'prune', suits:[M,B],
 kw:'lopper مقص يدين مقص طويل مقص ترس',
 use:['Two-hand scissors with gears that multiply force, for thicker branches.','مقص بيدين بتروس تضاعف القوة، للأغصان الأسمك.'],
 size:['For branches from thumb to about wrist thickness.','للأغصان من سماكة الإبهام إلى المعصم تقريبًا.'],
 qa:[
  [['Thicker branches than shears?','يقص أسمك من المقص العادي؟'],['Yes, much thicker. Above wrist size use the saw.','نعم، أسمك بكثير. فوق سماكة المعصم استخدم المنشار.']],
  [['Easier on the hands?','أسهل على اليد؟'],['Yes, the gears make it need less force than a normal lopper.','نعم، التروس تخليه يحتاج قوة أقل من المقص العادي.']]],
 warn:[],
 with:['p18','p16'],
 mis:[]},

p18:{img:['imp085/f84bb9339ba299860c34a2f1d6ea83c5.jpg'], n:['Folding pruning saw','منشار يدوي قابل للطي'], need:'prune', suits:[S,M,B],
 kw:'folding saw hand saw منشار يدوي طي منشار تقليم',
 use:['Hand saw that folds into its handle, for branches too thick for scissors.','منشار يدوي ينطوي داخل مقبضه، للأغصان الأسمك من المقصات.'],
 size:['For branches roughly wrist to arm thick.','للأغصان تقريبًا من المعصم إلى الذراع.'],
 qa:[
  [['For which thickness?','لأي سماكة؟'],['Wrist to arm-thick branches. Bigger trunks need a chainsaw.','أغصان من المعصم إلى الذراع. الجذوع الأكبر تحتاج منشار سلسلة.']],
  [['Safe to carry up the palm?','آمن أحمله فوق النخلة؟'],['Folded, yes: the blade is hidden. Lock it open before cutting.','مطوي نعم: الشفرة مخفية. اقفله مفتوح قبل القص.']]],
 warn:[['Cut pulling toward you; keep the other hand away from the blade.','القص بالسحب للخلف؛ أبعد اليد الثانية عن الشفرة.']],
 with:['p17','p33'],
 mis:[]},

p19:{img:['album/almvgajrw7cco/e7c2989fef04b910e1aac56cf28666c4.jpg'], n:['Serrated sickle, long blade','منجل مسنن طويل'], need:'prune', suits:[S,M,B],
 kw:'sickle منجل محش مسنن قص سعف كرب',
 use:['Curved toothed blade for cutting palm fronds, thorns, grass and bunches.','شفرة مقوسة مسننة لقص السعف والشوك والعشب والعذوق.'],
 size:['Long blade for reach. Short version exists for tight spots.','شفرة طويلة لمدى أبعد. يوجد نوع قصير للأماكن الضيقة.'],
 qa:[
  [['Good for palm fronds and thorns?','يصلح للسعف والشوك؟'],['Yes, the teeth bite into fibrous fronds better than a smooth blade.','نعم، الأسنان تمسك في السعف الليفي أحسن من الشفرة الملساء.']],
  [['Replacement blade?','الشفرة تتغير؟'],['No, it is one piece. When worn he buys a new sickle.','لا، قطعة وحدة. إذا تلف يشتري منجل جديد.']]],
 warn:[['Always use with leather gloves near thorns.','دائمًا مع قفاز جلد قرب الشوك.']],
 with:['p33','p29'],
 mis:[]},

p20:{img:['hd-tree-pruner/e7b1e47104ca6b4187cd5f1f3f64f587.jpg'], n:['Pole tree pruner head with saw and pull rope','رأس مقص أشجار عالية مع منشار وحبل'], need:'prune', suits:[M,B],
 kw:'pole pruner tree pruner high branch مقص عالي مقص أشجار عصا حبل',
 use:['Fixed on top of a pole. Pull the rope to cut; the saw cuts thicker branches. No ladder needed.','يركب فوق عصا طويلة. اسحب الحبل للقص؛ والمنشار للأغصان الأسمك. بدون سلم.'],
 size:['Check if a pole is included or sold separately before selling.','تأكد هل العصا معه أو تنباع لحالها قبل البيع.'],
 qa:[
  [['Which pole fits?','أي عصا تركب؟'],['Check the head socket size and what the shop stocks. Tell him clearly if the pole is extra.','شيّك مقاس فتحة الرأس وايش موجود في المحل. قله بوضوح إذا العصا إضافية.']],
  [['Reach high branches without a ladder?','أوصل للأغصان العالية بدون سلم؟'],['Yes, that is its purpose. Height depends on pole length.','نعم، هذا الهدف. الارتفاع يعتمد على طول العصا.']]],
 warn:[['Never stand under the branch being cut.','لا توقف تحت الغصن اللي يتقص.'],['Keep away from electric wires.','ابتعد عن أسلاك الكهرباء.']],
 with:['p31'],
 mis:[['Customer thinks the pole is included when it is not.','الزبون يظن العصا معه وهي مو معه.']]},

p21:{img:['album/almvfrsnkn3dl/d20ed712bb67a4d711ada1f962ec7c31.jpg'], n:['Petrol chainsaw 20 inch','منشار سلسلة بنزين 20 بوصة'], need:'prune', suits:[B],
 kw:'chainsaw petrol منشار سلسلة بنزين منشار جذوع منشار ماطور',
 use:['Engine saw for trunks and very thick branches, including cutting down palms.','منشار بمحرك للجذوع والأغصان السميكة جدًا، ومنها قطع النخل.'],
 size:['20 inch bar: for big trunks. Heavy; for experienced users.','لوح 20 بوصة: للجذوع الكبيرة. ثقيل؛ لمستخدم متمرس.'],
 qa:[
  [['Strong enough for palm trunks?','يقوى على جذوع النخل؟'],['Yes, a 20 inch saw is the usual size for palm trunks.','نعم، 20 بوصة هو المقاس المعتاد لجذوع النخل.']],
  [['Fuel mix ratio?','نسبة خلط البنزين؟'],['2-stroke engine: petrol mixed with 2-stroke oil at the ratio in the manual (often 25:1 or 40:1). Never plain petrol. Chain oil goes in a separate tank.','محرك 2 شوط: بنزين مخلوط بزيت 2 شوط بالنسبة المكتوبة في الكتالوج (غالبًا 25:1 أو 40:1). أبدًا بنزين صافي. زيت السلسلة في خزان منفصل.']],
  [['Chain and spare parts?','السلسلة وقطع الغيار؟'],['We sell 16 inch chains; for 20 inch check stock before promising.','نبيع سلاسل 16 بوصة؛ للـ 20 بوصة شيّك المخزون قبل ما توعده.']]],
 warn:[['Safety glasses, gloves and boots.','نظارة وقفاز وجزمة سلامة.'],['Plain petrol destroys the engine in minutes.','البنزين الصافي يخرب المحرك بدقائق.']],
 with:['p33'],
 mis:[['Not explaining the fuel mix. Engine failures from plain petrol are the most common complaint.','عدم شرح خلطة البنزين. خراب المحرك من البنزين الصافي أكثر شكوى.']]},

p22:{img:['mvbz02/9fc6a65e846422e2b7312446aba3cdbc.jpg'], n:['2-stroke petrol brush cutter','قصاصة أعشاب بنزين 2 شوط'], need:'grass', suits:[S,M],
 kw:'brush cutter grass trimmer حشاشة قصاصة أعشاب مكينة حش 2 شوط',
 use:['Shoulder-carried engine cutter for grass and weeds.','مكينة حش على الكتف للعشب والحشائش.'],
 size:['Lighter and cheaper than 4-stroke. Good for occasional use.','أخف وأرخص من 4 شوط. مناسبة للاستعمال الأحيان.'],
 qa:[
  [['Is it lighter?','أخف؟'],['Yes, 2-stroke is lighter than 4-stroke.','نعم، 2 شوط أخف من 4 شوط.']],
  [['Fuel mix?','خلطة البنزين؟'],['Petrol mixed with 2-stroke oil at the ratio in the manual (often 25:1 or 40:1). Never plain petrol.','بنزين مخلوط بزيت 2 شوط بالنسبة المكتوبة في الكتالوج (غالبًا 25:1 أو 40:1). أبدًا بنزين صافي.']],
  [['Which blade for thick weeds?','أي سكين للحشائش القوية؟'],['The metal 3-teeth blade. Nylon line only for soft grass.','السكين الحديد 3 أسنان. خيط النايلون للعشب الطري فقط.']]],
 warn:[['Face shield or glasses: stones fly.','واقي وجه أو نظارة: الحصى يطير.'],['Keep people 15 m away.','أبعد الناس 15 متر.']],
 with:['p24','p31'],
 mis:[['Not explaining the fuel mix.','عدم شرح خلطة البنزين.']]},

p23:{img:['mvbz01/b0b0a59de4d729a7ab0b8e642f2e6689.jpg'], n:['4-stroke petrol brush cutter','قصاصة أعشاب بنزين 4 شوط'], need:'grass', suits:[M,B],
 kw:'brush cutter 4 stroke حشاشة قصاصة أعشاب 4 شوط مكينة حش',
 use:['Shoulder-carried engine cutter for grass and weeds, for heavier use.','مكينة حش على الكتف، للاستعمال الأثقل.'],
 size:['Heavier than 2-stroke but quieter and runs on plain petrol.','أثقل من 2 شوط لكن أهدى وتشتغل ببنزين صافي.'],
 qa:[
  [['Difference from 2-stroke?','وش الفرق عن 2 شوط؟'],['4-stroke: plain petrol, separate engine oil, quieter, less smoke, heavier. 2-stroke: mixed fuel, lighter, cheaper.','4 شوط: بنزين صافي وزيت محرك منفصل، أهدى، دخان أقل، أثقل. 2 شوط: بنزين مخلوط، أخف، أرخص.']],
  [['Plain petrol?','بنزين صافي؟'],['Yes, plain petrol. Engine oil goes in the engine separately; check the oil level before every start.','نعم بنزين صافي. زيت المحرك يحط في المحرك لحاله؛ شيّك مستوى الزيت قبل كل تشغيل.']],
  [['Quieter, longer life?','أهدى وعمرها أطول؟'],['Quieter yes. Life depends mostly on oil care and cleaning the air filter.','أهدى نعم. العمر يعتمد غالبًا على العناية بالزيت وتنظيف فلتر الهواء.']]],
 warn:[['Never mix oil into the petrol for a 4-stroke.','لا تخلط زيت في البنزين لمحرك 4 شوط.'],['Face shield; keep people 15 m away.','واقي وجه؛ أبعد الناس 15 متر.']],
 with:['p24','p31'],
 mis:[['Mixing up 2-stroke and 4-stroke fuel advice.','خلط نصيحة بنزين 2 شوط مع 4 شوط.']]},

p24:{img:['imp051/d8112f3b77e566a47b28e3f93e70dcc0.jpg'], n:['Brush cutter blade, 3 teeth','سكين ماكينة الحش 3 أسنان'], need:'grass', suits:[S,M,B],
 kw:'blade brush cutter سكين حشاشة شفرة 3 أسنان',
 use:['Metal blade for brush cutters, for thick weeds and small shrubs.','سكين حديد لمكائن الحش، للحشائش القوية والشجيرات الصغيرة.'],
 size:['Check the centre hole matches his machine shaft.','تأكد أن الفتحة الوسطى تناسب عمود مكينته.'],
 qa:[
  [['Does it fit my machine?','يركب على مكينتي؟'],['Most brush cutters use a standard hole, but compare with his old blade if possible.','أغلب المكائن فتحتها قياسية، لكن قارن مع سكينه القديم إذا أمكن.']],
  [['Grass or small shrubs?','للعشب ولا الشجيرات؟'],['Both: thick grass, weeds and thin shrubs. Not for wood thicker than a finger.','الاثنين: عشب كثيف وحشائش وشجيرات رفيعة. مو لخشب أسمك من الإصبع.']],
  [['Is it safe?','آمن؟'],['Safer with the guard fitted. It can throw stones and kick back on hard objects.','أأمن مع وجود الغطاء الواقي. ممكن يرمي حصى ويرتد عند الأشياء القاسية.']]],
 warn:[['Do not use near tree trunks or drip lines; it cuts them.','لا تستخدمه قرب جذوع الأشجار أو خطوط التنقيط؛ يقطعها.'],['Tighten the nut fully before starting.','اشد الصامولة كامل قبل التشغيل.']],
 with:['p22','p23'],
 mis:[]},

p25:{img:['album/almvhf164vw8f/eae12ab0a58b7730f81d5386ec4b62c5.jpg','album/almvgajrw7cco/21fd3d29de88ca438e969bcd11da6525.jpg'], n:['Forged eye hoe head + wooden handle','رأس مسحاة حديد + عصا خشب'], need:'soil', suits:[M,B],
 kw:'hoe mattock مسحاة محش فاس رأس عصا يد خشب',
 use:['Heavy hoe for digging, making water channels and breaking hard soil.','مسحاة ثقيلة للحفر وعمل السواقي وتكسير الأرض القاسية.'],
 size:['Head and handle are sold separately. Match the handle end to the head eye.','الرأس والعصا ينباعون منفصلين. طابق طرف العصا مع فتحة الرأس.'],
 qa:[
  [['Will the head come loose?','الرأس بيفلت؟'],['Fit the thick end of the handle tight into the eye. If it loosens with dry weather, soak the head end in water for a while.','دخّل الطرف السميك للعصا بإحكام في الفتحة. إذا ارتخى من الجفاف، انقع طرف الرأس في الماء فترة.']],
  [['Handle sold separately?','العصا تنباع لحالها؟'],['Yes. Always offer the handle with the head.','نعم. دائمًا اعرض العصا مع الرأس.']],
  [['Good for hard soil?','يصلح للأرض القاسية؟'],['Yes, forged heads are strong. Watering the ground the day before makes digging easier.','نعم، الرأس المطروق قوي. سقي الأرض قبلها بيوم يسهّل الحفر.']]],
 warn:[],
 with:['p27','p33'],
 mis:[['Selling the head without the handle; customer comes back.','بيع الرأس بدون العصا؛ يرجع الزبون.']]},

p26:{img:['album/almvg4ws9y9qz/51e8ab081ec8c58f6fcd22af3c27ac4f.jpg'], n:['2-in-1 hoe and 3-prong fork','معول 2 في 1 (فأس ومذراة)'], need:'soil', suits:[S],
 kw:'hand hoe fork cultivator معول صغير مذراة 2 في 1 حديقة',
 use:['Small tool: one side digs, the other side loosens soil around plants.','عدة صغيرة: جهة تحفر والجهة الثانية تفكك التربة حول النبات.'],
 size:['For garden beds and pots. Several handle types (steel, wood, fibreglass, stainless).','للأحواض والزرع الصغير. فيه أنواع يد (حديد، خشب، فايبر، ستانلس).'],
 qa:[
  [['For small beds or the farm?','للأحواض ولا المزرعة؟'],['Small beds and home gardens. For the farm, the big hoe.','الأحواض وحدائق البيت. للمزرعة المسحاة الكبيرة.']],
  [['Does it rust?','يصدّي؟'],['Normal steel can rust if left wet; stainless does not. Wipe dry after use.','الحديد العادي ممكن يصدّي إذا ترك مبلول؛ الستانلس لا. نشّفه بعد الاستعمال.']]],
 warn:[],
 with:['p31'],
 mis:[]},

p27:{img:['album/almvgajrw7cco/a272c766719a2e30ed0735d9261d1da5.jpg'], n:['Round-point shovel, all steel (S503L)','كريك رأس مدبب بيد حديد (S503L)'], need:'soil', suits:[M,B],
 kw:'shovel spade كريك مجرفة شيول رفش',
 use:['Shovel for digging and moving soil, sand and fertilizer.','كريك للحفر ونقل التربة والرمل والسماد.'],
 size:['All-steel handle, about 1.7 kg.','يد حديد كاملة، حوالي 1.7 كغ.'],
 qa:[
  [['Will it bend in hard ground?','بيعوج في الأرض القاسية؟'],['The steel handle is stronger than wood. Do not use it as a lever to lift rocks.','اليد الحديد أقوى من الخشب. لا يستخدمه كعتلة لرفع الحجر.']],
  [['Is it heavy?','ثقيل؟'],['About 1.7 kg. Strong but a bit heavier than wood-handle shovels.','حوالي 1.7 كغ. قوي لكن أثقل شوي من الكريك بيد خشب.']]],
 warn:[],
 with:['p25','p31'],
 mis:[]},

p28:{img:['macton-tiller-heavy/7833eb7a059cc54df37659b5ea183748.jpg'], n:['Petrol garden tiller / cultivator','حراثة أرض بنزين'], need:'soil', suits:[M,B],
 kw:'tiller cultivator rotavator حراثة عزاقة مكينة حرث بنزين',
 use:['Engine machine with rotating blades that loosen and mix soil.','مكينة بمحرك وشفرات دوارة تفكك وتقلّب التربة.'],
 size:['For areas too big to dig by hand.','للمساحات الكبيرة على الحفر اليدوي.'],
 qa:[
  [['How deep does it dig?','كم تحفر عمق؟'],['Depends on soil and blade setting; check the manual for the max depth.','يعتمد على التربة وضبط الشفرات؛ شيّك الكتالوج لأقصى عمق.']],
  [['Sandy or clay soil?','أرض رملية ولا طينية؟'],['Sandy is easy. Hard clay: water the day before and go in two passes.','الرملية سهلة. الطينية القاسية: يسقي قبلها بيوم ويحرث على مرتين.']],
  [['Service and parts?','الصيانة والقطع؟'],['Check oil before each use and clean the air filter. Ask the shop about spare parts before promising.','شيّك الزيت قبل كل استعمال ونظّف فلتر الهواء. اسأل المحل عن القطع قبل ما توعده.']]],
 warn:[['Keep feet away from the blades. Stop the engine before clearing blocked grass.','أبعد الرجول عن الشفرات. أطفئ المحرك قبل تنظيف العشب العالق.'],['Check the engine type for fuel (plain or mixed).','شيّك نوع المحرك للبنزين (صافي أو مخلوط).']],
 with:['p27'],
 mis:[]},

p29:{img:['mvan7lyj/c024fd48979cc08ea9648ae44e310690.jpg'], n:['Date bunch bags','أكياس عذوق'], need:'protect', suits:[S,M,B],
 kw:'date bags bunch cover أكياس عذوق أكياس تمر شبك عذق',
 use:['Mesh bag tied over a date bunch to protect from birds, insects and dust and to catch falling dates.','كيس شبك يربط على العذق لحمايته من الطيور والحشرات والغبار ويمسك التمر الساقط.'],
 size:['Several sizes. Ask how big his bunches are (variety and age of palm).','عدة مقاسات. اسأله كم حجم العذوق (الصنف وعمر النخلة).'],
 qa:[
  [['Protects from birds and insects?','يحمي من الطيور والحشرات؟'],['Birds yes. Insects partly; depends on how fine the mesh is.','الطيور نعم. الحشرات جزئيًا؛ حسب نعومة الشبك.']],
  [['Lets air in?','يدخل الهواء؟'],['Yes, mesh lets air through so dates do not rot.','نعم، الشبك يدخل الهواء عشان التمر ما يخرب.']],
  [['When to put it on?','متى أركبه؟'],['After the fruit has set and before it colours, when birds start coming. Let the farmer decide by his variety.','بعد عقد الثمر وقبل التلوين، لما تبدأ الطيور. خلّ المزارع يحدد حسب الصنف.']]],
 warn:[],
 with:['p19','p32','p33'],
 mis:[['Not asking how many palms; he usually needs a bundle, not a few.','عدم السؤال كم نخلة؛ عادة يحتاج ربطة مو كم كيس.']]},

p30:{img:['jinguan-shade-80-beige/ea9baf7dc76c18fe8b254d24edbb87a6.jpg'], n:['Shade net 80%, beige, with eyelets','شبك تظليل 80٪ بيج بحلقات'], need:'protect', suits:[S,M,B],
 kw:'shade net شبك تظليل شادة مظلة سواتر 80',
 use:['Net that blocks 80% of sunlight, with a sewn border and metal eyelets for tying.','شبك يحجب 80٪ من الشمس، بإطار مخيط وحلقات حديد للربط.'],
 size:['80% = strong shade (seedlings, parking, sitting areas). 220 g/m².','80٪ = تظليل قوي (شتلات، مواقف، جلسات). 220 جم/م².'],
 qa:[
  [['60% or 80% for my plants?','60٪ ولا 80٪ لنباتاتي؟'],['Many vegetables grow better under lighter shade; 80% suits seedlings, sensitive plants and people/car shade. Ask what he grows.','كثير من الخضار ينمو أحسن تحت تظليل أخف؛ 80٪ للشتلات والنباتات الحساسة وتظليل الناس والسيارات. اسأله وش يزرع.']],
  [['How many summers does it last?','كم صيف يعيش؟'],['Depends on quality and how tight it is tied. Loose nets flap and tear faster.','يعتمد على الجودة وشد الربط. الشبك المرتخي يرفرف وينشق أسرع.']]],
 warn:[['Tie through every eyelet; wind tears loose nets.','اربط من كل حلقة؛ الهواء يشق الشبك المرتخي.']],
 with:['p32'],
 mis:[['Selling 80% for vegetables without asking.','بيع 80٪ للخضار بدون سؤال.']]},

p31:{img:['album/almvg91yqjw1h/5aee8627cda2e00b92b92c6e8b399687.jpg'], n:['Latex-coated work gloves','قفازات عمل مطلية لاتكس'], need:'safety', suits:[S,M,B],
 kw:'gloves latex قفاز قفازات شغل لاتكس كفوف',
 use:['Knitted gloves with a rubber (latex) palm for good grip in general farm work.','قفاز قماش بكف مطاطي (لاتكس) لمسكة قوية في شغل المزرعة العام.'],
 size:['Ask his hand size if sizes are available.','اسأل عن مقاس يده إذا فيه مقاسات.'],
 qa:[
  [['Protects from palm thorns?','يحمي من شوك النخل؟'],['Only a little; thorns can pass. For thorns sell leather gloves.','شوي بس؛ الشوك ممكن يدخل. للشوك بيع قفاز الجلد.']],
  [['Good grip when wet?','مسكته قوية وهو مبلول؟'],['Yes, latex grips well wet or dry.','نعم، اللاتكس يمسك زين مبلول أو ناشف.']]],
 warn:[['Not for handling pesticide concentrate; use chemical (nitrile) gloves.','مو لمسك المبيد المركّز؛ استخدم قفاز كيماوي (نيتريل).'],['Some people are allergic to latex.','بعض الناس عندهم حساسية من اللاتكس.']],
 with:['p33'],
 mis:[['Selling them for pesticide spraying.','بيعها لرش المبيدات.']]},

p32:{img:['mvbvu49u/986ecc5d9ff12bb832ee0184d35a22cf.jpg'], n:['Anti-bird net','شبك طيور'], need:'protect', suits:[S,M,B],
 kw:'bird net شبك طيور شبك حماية',
 use:['Light net thrown over trees, bunches or vegetable beds to keep birds off.','شبك خفيف يغطى به الأشجار أو العذوق أو أحواض الخضار لإبعاد الطيور.'],
 size:['Comes in different sizes. Ask the area or the number of trees.','يأتي بمقاسات مختلفة. اسأل عن المساحة أو عدد الأشجار.'],
 qa:[
  [['Covers a whole palm or just bunches?','يغطي النخلة كلها ولا العذوق بس؟'],['Either, depending on the size bought. For individual bunches date bags are easier.','الاثنين حسب المقاس. للعذوق الفردية أكياس العذوق أسهل.']],
  [['Reusable?','يستخدم أكثر من مرة؟'],['Yes, if removed carefully and stored out of the sun.','نعم، إذا انشال بحذر وتخزن بعيد عن الشمس.']]],
 warn:[['Birds can get trapped in loose net; keep it tight.','الطيور ممكن تعلق في الشبك المرتخي؛ خلّه مشدود.']],
 with:['p29'],
 mis:[]},

p33:{img:['imp166/27717d0f661460bd9c27470627945691.jpg'], n:['Leather work gloves','قفازات جلد للعمل'], need:'safety', suits:[S,M,B],
 kw:'leather gloves قفاز جلد قفازات جلد شوك',
 use:['Strong leather gloves for thorns, wire, wood and rough work.','قفاز جلد قوي للشوك والسلك والخشب والشغل الخشن.'],
 size:['Ask his hand size if sizes are available.','اسأل عن مقاس يده إذا فيه مقاسات.'],
 qa:[
  [['Better than latex for thorns?','أحسن من اللاتكس للشوك؟'],['Yes, much better.','نعم، أحسن بكثير.']],
  [['Hot in summer?','حار في الصيف؟'],['Yes, warmer than knitted gloves. For light work the latex ones are cooler.','نعم، أحر من القفاز القماش. للشغل الخفيف قفاز اللاتكس أبرد.']]],
 warn:[['Not waterproof and not for chemicals.','مو ضد الماء ومو للكيماويات.']],
 with:['p19','p21'],
 mis:[]}
};
