    Vue.component("item-tree",{
        template: "#text-book",
        data: function(){
            return {
                open: false,
                chooseId: ''
            }
        },
        props: ['model','closestat'],
        computed: {
            isFolder: function(){
                return this.model.children && this.model.children.length;
            },
            isRoot: function () {
                if(this.model.deep == 0){
                    return true;
                }else{
                    return false;
                }
            }
        },
        watch: {
            closestat: function (val) {    // 关闭当前树，重新打开另一棵树时，将上一颗树折叠起来
                this.open = false;
            }
        },
        methods: {
            toggle: function () {
                if(this.isFolder){
                    this.open = !this.open;
                }
            },
            chooseitem: function(model,event){
                // var e = event? event : window.event;
                // if(e.stopPropagation){
                //     e.stopPropagation();
                // }else{
                //     e.cancelBubble = true;
                // }
                $(".knowledge-tree span").removeClass('color-active');
                this.chooseId = model.id;
                this.$emit("chooseitem",model);
            },
            
        }
    });
    var operate_vm = new Vue({
        el: "#container",
        data: {
            paramsArr: [],
            urlList: {},
            phaseName : null,
            subjectName : null,
            phaseId : null,
            subjectId : null,
            myDataInit: {},
            myPhase : {},
            mySubject: {},
            remDataList: [],
            prepDataList: [],
            phaseList:  [],
            subjectList: [],
            showTab: 0,     // 0 我的备课 1 推荐资源
            phaseDisplay: false,
            subjectDisplay: false,
            treeData: {
                name: 'My Tree',
                deep: 0,
                children: []
            },
            treeNav: [],
            cur: 1,
            all: 1,
            totalCount: 0,
            page_size: 10,
            catCode: '',
            prepStat: 1,
            remStat: 1,
            tabSelected: 0,
            renewDays: 31,       // 控制推荐资源的更新天数
            displayAd: false,
            appendItems: "",
            selectDeep: 0,
            trigger: false // tab切换触发
            // chooseItems: ['','','','','','','','']
        },
        components:{
            'vue-nav': Vnav
        },
        methods: {
            listens:function(data){
                this.cur=data;
                if(this.tabSelected == 0){
                    this.refreshPrepList();
                }else if(this.tabSelected == 1){
                    this.refreshRemList();
                }
            },
            truncate:function (myContent) {
                var contentStr="";
                if(myContent.length>50){
                    contentStr=myContent.substring(0,50).concat(" ...");
                }
                else{
                    contentStr=myContent
                }
                return contentStr;
            },
            retime:function (t) {
                var arrTime=t.split("/");
                var strTime=arrTime[0]+"·"+arrTime[1]+"·"+arrTime[2];
                return strTime;
            },
            bytesToSize:function(bytes) {
                if (bytes === 0) return '0 B';
                var k = 1024;
                sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

                i = Math.floor(Math.log(bytes) / Math.log(k));
                var num=parseInt(bytes / Math.pow(k, i));
                return num+sizes[i];
            },
            showPhase: function () {
                if(this.phaseDisplay){
                    this.phaseDisplay = false;
                }else{
                    this.phaseDisplay = true;
                    this.subjectDisplay = false;
                }
            },
            showSubject: function () {
                if(this.subjectDisplay){
                    this.subjectDisplay = false;
                }else{
                    this.subjectDisplay = true;
                    this.phaseDisplay = false;
                }
            },
            choosePhase: function (id,name) {
                this.phaseId = id;
                this.phaseName = name;
                // this.modifyNav(name,'','','','','','','');
                // this.chooseitem[0] = id;
                this.getSubjectInfo(this.phaseId);
                this.initTree();
                this.toggleTabs(this.showTab);
                if(!this.trigger){
                    this.trigger = true;
                }else{
                    this.trigger = false;
                }
            },
            chooseSubject: function (id,name) {
                this.subjectId = id;
                this.subjectName = name;
                // this.chooseitem[1] = id;
                // this.modifyNav('Y',name,'','','','','','');
                this.initTree();
                this.toggleTabs(this.showTab);
                if(!this.trigger){
                    this.trigger = true;
                }else{
                    this.trigger = false;
                }
            },
            initSubjectInfo: function (id) {
                var subjectData={
                    phase: id
                };
                this.mySubject=this.requestData(this.urlList.subjectUrl,subjectData,"post");
                this.subjectList = JSON.stringify(this.mySubject)!="{}"? this.mySubject.data : [];
            },
            getSubjectInfo: function (id) {
                var subjectData={
                    phase: id
                };
                this.mySubject=this.requestData(this.urlList.subjectUrl,subjectData,"post");
                this.subjectList = JSON.stringify(this.mySubject)!="{}"? this.mySubject.data : [];

                if(this.subjectList && this.subjectList.length > 0){
                    this.subjectId=this.subjectList[0].code;
                    this.subjectName=this.subjectList[0].name;
                }else{
                    this.subjectId = "";
                    this.subjectName = "";
                }
                // this.chooseitem[1] = this.subjectId;
            },
            initTree: function () {
                var categoriesData={
                    phase:this.phaseId,
                    subject:this.subjectId
                };
                var mycategories=this.requestData(this.urlList.getCategoriesByPSUrl,categoriesData,"post");
                this.treeData.children = mycategories.data;

            },
            refreshRemList: function (stat) {
                if(stat && stat == 'otherTab'){
                    this.cur = 1;
                }
                var params={
                    pageNo:this.cur,
                    pageSize:this.page_size,
                    phase:this.phaseId,
                    subject:this.subjectId,
                    // resourceClass:'',
                    // resourceFormat:'',
                    // sort:'pageview',
                    // isFree:'',
                    // resourceLevel:'',
                    // knowledgeCode:'',
                    categoresCode:this.catCode
                };
                this.myDataInit=this.requestData(this.urlList.remResUrl,params,"post");
                // else{
                //     this.cur = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.currentPageNo : 1;
                // }
                this.all = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.totalPageCount : 0;
                this.remDataList = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.result : [];
                this.remStat = this.remDataList.length>0? 0 : 1;
                this.totalCount = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.totalCount : 0;
                return this.totalCount;
            },
            refreshPrepList: function (stat) {
                if(stat && stat == 'otherTab'){
                    this.cur = 1;
                }
                $(".fenye").show();
                var params={
                    pageNo:this.cur,
                    pageSize:this.page_size,
                    phase:this.phaseId,
                    subject:this.subjectId,
                    // resourceClass:'',
                    // resourceFormat:'',
                    // sort:'pageview',
                    // isFree:'',
                    // resourceLevel:'',
                    // knowledgeCode:'',
                    categoresCode:this.catCode
                };
                this.myDataInit=this.requestData(this.urlList.prepClassUrl,params,"post");
                // else{
                //     this.cur = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.currentPageNo : 1;
                // }
                this.all = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.totalPageCount : 0;
                if(this.myDataInit.data=="没有登录"){
                    $(".fenye").hide();
                    return;
                }
                this.prepDataList = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.result : [];
                this.prepStat = this.prepDataList.length>0? 0 : 1;
                this.totalCount = JSON.stringify(this.myDataInit)!="{}"? this.myDataInit.data.totalCount : 0;
                return this.totalCount;
            },
            getHasRems: function () {
                var params={
                    pageNo:1,
                    pageSize:this.page_size,
                    phase:this.phaseId,
                    subject:this.subjectId,
                    // resourceClass:'',
                    // resourceFormat:'',
                    // sort:'pageview',
                    // isFree:'',
                    // resourceLevel:'',
                    // knowledgeCode:'',
                    categoresCode:this.catCode
                };
                this.myDataInit=this.requestData(this.urlList.remResUrl,params,"post");
                var hasRemRes = this.myDataInit.data.totalCount>0? true : false;
                return hasRemRes;
            },
            init: function () {
                this.myPhase = this.requestData(this.urlList.phaseUrl,"","post");
                this.phaseList = JSON.stringify(this.myPhase)!="{}"? this.myPhase.data : [];
                this.phaseName = JSON.stringify(this.paramsArr[1])!="{}"? unescape(this.paramsArr[1]) : "";
                this.subjectName = JSON.stringify(this.paramsArr[3])!="{}"? unescape(this.paramsArr[3]) : "";
                this.phaseId = JSON.stringify(this.paramsArr[0])!="{}"? unescape(this.paramsArr[0]) : "";
                this.subjectId = JSON.stringify(this.paramsArr[2])!="{}"? unescape(this.paramsArr[2]) : "";
                if(!this.phaseId || this.phaseId==""){
                    this.phaseId=this.myPhase.data[0].code;
                    this.phaseName=this.myPhase.data[0].name;
                }
                // 从上个页面传过来的学科名称
                if(!this.subjectId || this.subjectId==""){
                    this.getSubjectInfo(this.phaseId);
                }else{
                    this.initSubjectInfo(this.phaseId);
                }
                this.initTree();
                this.judgeNewRes();
                this.refreshPrepList();
            },
            requestData: function (myUrl,myjson,type) {
                var mydata = {};
                $.ajax({
                    url:myUrl,
                    data:myjson,
                    type: type,
                    dataType:'json',
                    async:false
                }).done(function (data) {
                    if(data.status == "0" ){
                        mydata=data;
                    }
                });
                return mydata;
            },
            chooseitem: function (model) {
                if(model.deep == 4){
                    this.catCode = model.iid;
                }else{
                    this.catCode = model.id;
                }
                var params = {
                    id: this.catCode,
                    deep: model.deep
                };
                this.selectDeep = model.deep;
                this.treeNav = this.requestData(this.urlList.getParentCategores,params,"post");
                this.joinNav(this.treeNav.data,model.deep,model.name);
                this.toggleTabs(this.showTab);
            },
            joinNav: function (list,deep,name) {
                this.appendItems = "";
                var str = "";
                var minDeep = 3;
                var deep = Number(deep);
                for(var j = minDeep;j < deep; j++){
                    for(var i=0; i<list.length; i++){
                        if(j == list[i].deep){
                            str += '<li class="bc-li"><span>·</span>'+list[i].name+'</li>';
                        }
                    }
                }
                str += '<li class="bc-li"><span>·</span>'+name+'</li>';
                this.appendItems = str;
            },
            addOneLesson: function (id,rid) {
                var vm = this;
                var url = this.urlList.addMineUrl,
                    params = {
                        tResourceId: id,
                        tBkRecommendId: rid
                    };
                $.ajax({
                    url:url,
                    data:params,
                    type: 'post',
                    dataType:'json',
                    async:false
                }).done(function (data) {
                    if(data.message == "success" ){
                        $(".alertTopBar").fadeIn().html("成功加入我的备课");
                        setTimeout(function () {
                            $(".alertTopBar").fadeOut();
                            vm.refreshRemList();
                        }, 2000);
                    }else if(data.message == "nologin"){
                        window.location.href="../login.html";
                    }
                });
            },
            addAllLessons: function (ids) {
                var vm = this;
                var url = this.urlList.addMineAllUrl,
                    params = {
                        categoresCode: this.catCode,
                        phase:this.phaseId,
                        subject:this.subjectId
                    };
                $.ajax({
                    url:url,
                    data:params,
                    type: 'post',
                    dataType:'json',
                    async:false
                }).done(function (data) {
                    if(data.message == "success" ){
                        $(".alertTopBar").fadeIn().html("成功加入我的备课");
                        setTimeout(function () {
                            $(".alertTopBar").fadeOut();
                            vm.refreshPrepList();
                        }, 2000);
                    }else if(data.message == "nologin"){
                        window.location.href="../login.html";
                    }
                });
            },
            removeLesson: function (id) {
                var vm = this;
                var url = this.urlList.removeMineUrl,
                    params = {
                        id: id
                    };
                $.ajax({
                    url:url,
                    data:params,
                    type: 'post',
                    dataType:'json',
                    async:false
                }).done(function (data) {
                    if(data.message == "success" ){
                        $(".alertTopBar").fadeIn().html("成功删除我的备课");
                        setTimeout(function () {
                            $(".alertTopBar").fadeOut();
                            vm.refreshPrepList();
                        }, 2000);
                    }
                });
            },
            toggleTabs: function (id) {
                this.showTab = id;
                this.tabSelected = id;
                if(id == 0){
                    var hasStat = this.getHasRems();  // 不改变分页
                    var prepCount = this.refreshPrepList('otherTab');
                    if(prepCount > 0){
                        this.prepStat = 0;
                    }else if(prepCount == 0 && hasStat){
                        this.prepStat = 1;
                    }else if(prepCount == 0 && !hasStat){
                        this.prepStat = 2;
                    }

                }else{
                    var remCount = this.refreshRemList('otherTab');
                    this.judgeNewRes();
                    if(remCount > 0){
                        this.remStat = 0;
                    }else{
                        this.remStat = 1;
                    }
                }
            },
            judgeIsNew: function (start) {
                if(this.betweenDays(start) <= this.renewDays){
                    return true;
                }else{
                    return false;
                }
            },
            judgeNewRes: function () {
                var lastTime = '';
                var vm = this;
                var params = {
                    categoresCode: vm.catCode,
                    phase:this.phaseId,
                    subject:this.subjectId
                };
                $.ajax({
                    url:this.urlList.getLastTimeUrl,
                    data: params,
                    type: 'post',
                    dataType:'json',
                    async:false
                }).done(function (data) {
                    if(data.status == 0 ){
                        lastTime = data.data;
                        if(vm.betweenDays(lastTime) <= vm.renewDays){
                            vm.displayAd = true;
                        }else{
                            vm.displayAd = false;
                        }
                    }
                });
            },
            betweenDays: function (start) {
                if(!start || start==""){
                    return 10000;
                };
                var startDate = new Date(start.split(' ')[0]),
                    endDate = new Date();
                var days = parseInt(Math.abs(endDate-startDate)/1000/60/60/24);
                if(days < 0){
                    return -1;
                }
                return days;
            },
            navClick: function (e) {
                var arr = [
                    this.phaseId,
                    escape(this.phaseName),
                    this.subjectId,
                    escape(this.subjectName),
                    'fromBkzs',
                    escape(this.catCode),
                    escape(this.selectDeep)
                ];
                var params = arr.toString();
                window.open(e+'?'+params);
            }
        },
        created: function () {
            this.paramsArr = window.location.search.substring(1).split(",");
            //我的备课分页查询 /rs/list
            this.urlList.prepClassUrl="/bk/selectMineListForPage";
            // 推荐资源分页查询
            this.urlList.remResUrl = "/bk/selectRecommendForPage";
            //获取学段信息 /rs/getPhase
            this.urlList.phaseUrl="/rs/getPhase";
            //获取学科信息 /rs/getSubject
            this.urlList.subjectUrl="/rs/getSubject";
//	    获取学段、学科下的目录信息/rs/getCategoriesByPS
            this.urlList.getCategoriesByPSUrl="/rs/getCategoriesByPS";
            //加入我的备课  单条
            this.urlList.addMineUrl = "/bk/addMine";
            //加入我的备课  批量
            this.urlList.addMineAllUrl = "/bk/addMineAll";
            //删除我的备课
            this.urlList.removeMineUrl = "/bk/deleteMine";
            //获得时间
            this.urlList.getLastTimeUrl = "/bk/getLastTime";
            //查找父级目录
            this.urlList.getParentCategores = "/bk/getParentCategores";
        },
        mounted: function () {
            this.init();
        }
       
    });


