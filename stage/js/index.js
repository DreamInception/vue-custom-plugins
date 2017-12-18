var paramsArr = window.location.search.substring(1).split(",");
$(function () {
	Vue.component("item-tree",{
		template: "#know-tree",
		data: function(){
			return {
				open: this.model.selected || false,
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
			closestat: function (val) {
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
				$(".knowledge-tree span").removeClass('color-active');
				this.chooseId = model.id;
				this.$emit("chooseitem",model);
			}

		}
	});
	var loginData,userid,phaseIdINT,phaseINT,subjectIdINT,subjectINT;

	/**希翕姐写的代码*/
	// ajaxUserInfo().done(function(){
	// 	loginData=globalUserInfo.isLogin;
	// 	userid=globalUserInfo.userInfo.id;
	// 	phaseIdINT=globalUserInfo.userInfo.phaseId;
	// 	phaseINT=globalUserInfo.userInfo.phase;
	// 	subjectIdINT=globalUserInfo.userInfo.subjectId;
	// 	subjectINT=globalUserInfo.userInfo.subject;
	// });
	 globalUserInfo.userInfo.phase = unescape(paramsArr[1]);
	 globalUserInfo.userInfo.phaseId = paramsArr[0];
	 globalUserInfo.userInfo.subject = unescape(paramsArr[3]);
	 globalUserInfo.userInfo.subjectId = paramsArr[2];

	/**张建红修改，4月7日*/
	loginData=globalUserInfo.isLogin;
	userid=globalUserInfo.userInfo.id;
	phaseIdINT=globalUserInfo.userInfo.phaseId;
	phaseINT=globalUserInfo.userInfo.phase;
	subjectIdINT=globalUserInfo.userInfo.subjectId;
	subjectINT=globalUserInfo.userInfo.subject;

	/** 郭翔的代码 **/
	var fromUrl = paramsArr[4]? paramsArr[4] : "";
	var selectCate = paramsArr[5]? unescape(paramsArr[5]) : "";
	var selectDeep = paramsArr[6]? unescape(paramsArr[6]) : "";

	var myphase=initData(phaseUrl,"","");
	var sPhase,
		phaseName,
		sSubject,
		subjectName;
	if(phaseIdINT && phaseIdINT!=""){
		sPhase=phaseIdINT;
		phaseName=phaseINT;
	}else{
		sPhase=myphase.data[0].code;
		phaseName=myphase.data[0].name;
	}
	var subjectData={
		phase:sPhase
	};
	var mysubject=initData(subjectUrl,subjectData,"");
	if(subjectIdINT && subjectIdINT!=""){
		sSubject=subjectIdINT;
		subjectName=subjectINT;
	}else{
		sSubject=mysubject.data[0].code;
		subjectName=mysubject.data[0].name;
	}
	// var categoriesData={
	// 	phase:sPhase,
	// 	subject:sSubject
	// };
	// var mycategories=initData(getCategoriesByPSUrl,categoriesData,"");
	// var cate={
	// 	firstDeep:1,
	// 	children:mycategories.data
	// };
	var myResourceClass=initData(resourceclassUrl,"","");
	var myResourceFormat=initData(resourceFormatUrl,"","");

	var mypublisherJson = {
		phase:sPhase,
		phaseAndsubject:sPhase + "-" + sSubject
	}
	var mypublisher=initData(publisherUrl,mypublisherJson,"");
	var myDataInit=initData(ajaxUrl,"","init");
	var myright=[];
	var myrightSub={
		pId:0,
		subject:sSubject,
		phase:sPhase
	};
	myright.push(initData(rightKnowledgeUrl,myrightSub,"").data);
	var mystorageUrl=initData(storageUrl,"","").data;
	
	var vm = new Vue({
		el: '#app',
		data:{
			cur:myDataInit.data.currentPageNo,
			all:myDataInit.data.totalPageCount,
			page_size:myDataInit.data.pageSize,
			total_count:myDataInit.data.totalCount,
			dataList:myDataInit.data.result,
			initPhase:myphase.data,
			initSubject:mysubject.data,
			initResourceClass:myResourceClass.data,
			initresourceFormat:myResourceFormat.data,
			initPublisher:mypublisher.data,
			initRightKnowlege:myright,
			selectphase:phaseName,
			phase:sPhase,
			selectsubject:subjectName,
			subject:sSubject,
			resourceClass:"",
			resourceFormat:"",
			rightCate:null,
			rightKnowlege:null,
			categoryCode:null,
			knowledgeCode:'',
			sort:"pageview",
			isFree:"",
			resourceLevel:"",
			hovers:1,
			bookTreeData:{
				name: 'Book Tree',
				deep: 0,
				children: []
			},
			knowTreeData:{
				name: 'knowledge Tree',
				deep: 0,
				children: []
			},
			hrVt:1,
			// initItem: false,
			loginData:loginData,
			user_id:userid,
			slctType: null,
			storageUrl:mystorageUrl.host,
			trigger: false
		},
		components:{
			'vue-nav': Vnav
		},
		methods:{
			chooseitem: function (model) {
				var dataList = [];
				if(this.hovers == 1){
					if(model.deep == 4){
						this.categoryCode = model.iid;
					}else{
						this.categoryCode = model.id;
					}
				}else if(this.hovers == 2){
					this.knowledgeCode=model.id;
				}
				this.refreshData();
			},
			addFlags: function (origin,now) {
				for(var i=0;i<origin.length;i++) {
					if(!now[0]){
						break;
					};
					if(origin[i].deep == now[0].deep){
						for (var j = 0; j < now.length; j++) {
							var nId = now[j].id;
							if(now[j].deep=="4"){
								nId = now[j].iid;
							}
							if (origin[i].id == nId) {
								now[j]['selected'] = true;
								console.log('deep=='+origin[i].deep+'id==='+nId+"&"+now[j]);
								this.addFlags(origin,now[j].children);
							}
						}
					}
				}

			},
			listens:function(data){
				this.cur=data;
				this.refreshData();
			},
			refreshData: function () {
				var mydata2={
					pageNo:this.cur,
					pageSize:this.page_size,
					resourceClass:this.resourceClass,
					resourceFormat:this.resourceFormat,
					phase:this.phase,
					subject:this.subject,
					sort:this.sort,
					isFree:this.isFree,
					resourceLevel:this.resourceLevel,
					knowledgeCode:this.knowledgeCode,
					categoryCode:this.categoryCode
			};

				var myobject=initData(ajaxUrl,mydata2,"init").data;
				this.dataList=myobject.result;
				this.page_size=myobject.pageSize;
				this.all=myobject.totalPageCount;
				this.total_count=myobject.totalCount;
			},
			reSubject:function () {
				var subjects={
					phase:this.phase
				};
				var myobject=initData(subjectUrl,subjects,"");
				this.initSubject=myobject.data;
				this.selectsubject=myobject.data[0].name;
				this.subject=myobject.data[0].code;
			},
			reCategories:function () {
				var myUrl="";
				var categoriesData={
					phase:this.phase,
					subject:this.subject
				};
				if(this.hovers==1){
					var mycategories=initData(getCategoriesByPSUrl,categoriesData,"");
					this.bookTreeData.children = mycategories.data;
				}else if(this.hovers==2){
					var mycategories=initData(getKnowledgesByPSUrl,categoriesData,"");
					this.knowTreeData.children = mycategories.data;
				};
				// var myobject={
				// 	firstDeep:1,
				// 	children:mycategories.data
				// };
				// this.bookTreeData=myobject;
			},
			reKnowledge:function () {
				myright = [];
				myrightSub={
					pId:0,
					subject:this.subject,
					phase:this.phase
				};
				myright.push(initData(rightKnowledgeUrl,myrightSub,"").data);
				this.initRightKnowlege = myright;
			},
			rePublisher:function () {
				mypublisherJson = {
					phase:this.phase,
					phaseAndsubject:this.phase + "-" + this.subject
				}
				mypublisher=initData(publisherUrl,mypublisherJson,"");
				this.initPublisher = mypublisher.data;
			},
			bytesToSize:function(bytes) {
				if (bytes === 0) return '0 B';
				var k = 1024;
				sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

				i = Math.floor(Math.log(bytes) / Math.log(k));
				var num=parseInt(bytes / Math.pow(k, i));
				return num+sizes[i];
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
			contactImg:function (e,t) {
				var strImg="";
				if(e=="" || e==null || e=="null"){
					strImg="images/indexImg/"+t+".png";
				}
				else if(e!=""){
					strImg=this.storageUrl+e;
				}
				return strImg;
			},
			retime:function (t) {
				var arrTime=t.split("/");
				var strTime=arrTime[0]+"·"+arrTime[1]+"·"+arrTime[2];
				return strTime;
			},
			getCopyrightName: function(name){
				if(name == "forever"){
					return "永久";
				}else{
					return name;
				}
			}
},
		mounted: function () {
			this.reCategories();
			if(fromUrl == 'fromBkzs'){
				var params = {
					id: selectCate,
					deep: selectDeep
				};
				var result = initData(getParentCategoresUrl,params,"");
				var parentList = JSON.stringify(result)!="{}"? result.data: [];
				parentList.push(params);
				// this.operateTree(parentList);
				this.addFlags(parentList,this.bookTreeData.children);
			}
		// 	else{
		// 		allList = [
		// 			{
		// 				"deep": 3,
		// 				"name": "北师大版（三年级起点）",
		// 				"id": "xiaoxue-yuwen-beishidaban"
		// 			},
		// 			{
		// 				"deep": 4,
		// 				"name": "四年级下册",
		// 				"id": "120170112151918001011",
		// 				"iid": "xiaoxue-yuwen-beishidaban-sinianjixiace"
		// 			},
		// 			{
		// 				"deep": 5,
		// 				"name": "1话语",
		// 				"id": "120170112151918001044"
        //
		// 			}
		// 		]
		// 		this.operateTree(allList);
		// 	}
		}
	});
	$(".selectRht").find("span").click(function (){
		vm.hrVt=parseInt($(this).attr("data-code"));
	});
	
	$(document).click(function (evt) {
		evt  =  evt  ||  window.event;
		var target =  evt.target || evt.srcElement;
		if(!($(target).hasClass("school"))){
			$(".pList").fadeOut();
		}
	});
	$(".school").find("dl").click(function (e){
		$(this).find(".pList").fadeIn();
		e.stopPropagation();
	});
	$(".phase").on("click","li",function (e){
		e.stopPropagation();
		var str=$(this).parent().attr("class");
		vm[str]=$(this).attr("data-code");
		vm['select'+str]=$(this).html();
		$(this).parents(".pList").fadeOut();
			vm.reSubject();
		vm.reCategories();
		vm.refreshData();
		vm.reKnowledge();
		vm.rePublisher();
		if(!vm.trigger){
			vm.trigger = true;
		}else{
			vm.trigger = false;
		};
	});
	$(".subject").on("click","li",function (e){
		e.stopPropagation();
		var str=$(this).parent().attr("class");
		vm[str]=$(this).attr("data-code");
		vm['select'+str]=$(this).html();
		$(this).parents(".pList").fadeOut();
		vm.reCategories();
		vm.refreshData();
		vm.reKnowledge();
		vm.rePublisher();
		if(!vm.trigger){
			vm.trigger = true;
		}else{
			vm.trigger = false;
		};
	});
	$(".tabs").find("li").click(function (){
		vm.hovers=parseInt($(this).attr("data-code"));
		if(vm.hovers==1){
			// vm.initItem = true;
			vm.knowledgeCode='';
		}else if(vm.hovers==2){
			// vm.initItem = true;
			vm.categoryCode=null;
		};
		// Vue.nextTick(function(){
		// 	vm.initItem = false;
		// });
		$(".nameBrdr").each(function () {
			$(this).removeClass("hovers");
			$(this).find(".hovers").removeClass("hovers");
		});
		vm.reCategories();
		vm.refreshData();
	});
//	$(".tabs").find("li:eq(0)").trigger("click");
// 	$(".tree").on("click",".nameBrdr em",function (){
// 		$(".nameBrdr").each(function () {
// 			$(this).removeClass("hovers");
// 		});
// 		$(this).parent().addClass("hovers");
// 		var id=$(this).attr("data-id");
// 		var iid=$(this).attr("data-iid");
// 		if(vm.hovers==1){
// 			vm.categoryCode=id;
// 			if($(this).attr("data-deep")==4){
// 				vm.categoryCode=iid;
// 			}
// 		}else if(vm.hovers==2){
// 			vm.knowledgeCode=id;
// 		}
// 		if($(this).attr("data-open")){
// 			vm.refreshData();
// 		}
//
// 	});
	$(".slct").each(function () {
		$(this).height("auto");
		if($(this).height()<=34){
			$(this).next().hide();
		}else{
			$(this).next().show();
			$(this).height("34");
		}
	});
	$(".dd").height("auto");
	if($(".dd").height()<=34){
		$(".dd").next().hide();
	}else{
		$(".dd").next().show();
		$(".dd").height("34");
	}
	$('.arrow').click(function(){
		if($(this).hasClass("arrowD")){
			$(this).removeClass("arrowD")
		}
		else{
			$(this).addClass("arrowD")
		}
		if($(this).prev().height()>34){
			$(this).prev().height("34");
		}else{
			$(this).prev().height("auto");
		}
	});
	$(document).on("click",".collect",function () {
		if(vm.loginData){
			var fType=$(this).find("span").attr("class"),frtUrl,sClass;
			var str="";
			if(fType=='favorite'){
				frtUrl=rUrl;
				str="收藏成功";
				sClass='favoriteF';
			}
			if(fType=='favoriteF'){
				frtUrl=fUrl;
				str="取消收藏成功";
				sClass='favorite';
			}
			var obj=$(this);
			$.ajax({
				url:frtUrl,
				data:{
					resourceInfoId:$(this).find("span").attr("data-id")
				},
				type: "post",
				dataType:'json',
				async:false
			}).done(function (data) {
				if(data.result == "0" ){
					obj.find("span").removeClass(fType).addClass(sClass);
					$(".alertTopBar").html(str).fadeIn();
					setTimeout(function () {
						$(".alertTopBar").fadeOut();
					}, 2000);
//					vm.refreshData();
				}
			});
		}
		else{
			window.location.href="login.html"
		}
	});
	$(document).on("click",".addToLesson",function () {
		if(vm.loginData){
			var fType=$(this).find("span").attr("class"),frtUrl,sClass;
			var str="";
			var params = {};
			if(fType=='unadded'){
				frtUrl=addBkUrl;
				str="成功加入我的备课";
				sClass='added';
				params = {
					tResourceId:$(this).find("span").attr("data-id")
				};
			}
			if(fType=='added'){
				frtUrl=removeBkUrl;
				str="删除成功";
				sClass='unadded';
				params = {
					id:$(this).find("span").attr("data-mid")
				};
			}
			var obj=$(this);
			$.ajax({
				url:frtUrl,
				data:params,
				type: "post",
				dataType:'json',
				async:false
			}).done(function (data) {
				if(data.message == "success" ){
					obj.find("span").removeClass(fType).addClass(sClass);
					$(".alertTopBar").html(str).fadeIn();
					setTimeout(function () {
						$(".alertTopBar").fadeOut();
					}, 2000);
//					vm.refreshData();
				}
			});
		}
		else{
			window.location.href="login.html"
		}
	});
	$(".conrht,.vtDown").find("a").click(function () {
		var obj=$(this);
//		if(vm.loginData && obj.attr("data-free")=="0"){
		if(vm.loginData){
			if(obj.attr("data-free")=="1"){
				obj.attr({"href":obj.attr("data-href"),"target":"_blank"});
			}
			else {
				$.ajax({
					url:numUrl,
					data:{
						"resource_id":obj.attr("data-id"),
						"user_id":vm.user_id
					},
					type: "post",
					dataType:'json',
					async:false
				}).done(function (data) {
					if(data.status == "0" ){
						obj.attr({"href":obj.attr("data-href"),"target":"_blank"});
					}
					if(data.status == "1" ){
						$(".alertTopBar").html(data.message).fadeIn();
						setTimeout(function () {
							$(".alertTopBar").fadeOut();
						}, 2000);
					}
				});
			}

		}
		else{
			window.location.href="login.html";
		}
	});
	$(".slct,.selectLft").find("span").click(function (){
		var slctType=$(this).parent().attr("data-type");
		var strs= $(this).attr("data-code");
		vm[slctType]=strs;
		vm.refreshData();
	});
	$(".choseSlct").on("click","span",function () {
		$("#rightKnow").find(".arrow").addClass("arrowD");
		$("#rightKnow").find(".arrow").prev().height("auto");
		vm.knowledgeCode=$(this).attr("data-id");
		var deep=$(this).attr("data-deep"),
			id=$(this).attr("data-id"),
			pid=$(this).attr("data-pid");
		clearRight(deep);
		$(".choseBrdr").append("<span data-deep='"+deep+"' data-id='"+id+"' data-pid='"+pid+"'>"+$(this).html()+"<em></em></span>");
		var myjson={
			pId:id,
			subject:vm.subject,
			phase:vm.phase
		};
		var myArr=initData(rightKnowledgeUrl,myjson,"").data;
		if(myArr!=""){
			vm.initRightKnowlege.splice(0,1,myArr);
		}
		vm.refreshData();
	});
	$(".choseBrdr").on("click","span",function () {
		var deep=$(this).attr("data-deep"),
			pid=$(this).attr("data-pid");
		clearRight(deep);
		var sid;
			sid=$(".choseBrdr").find("span[data-id="+pid+"]").attr("data-pid");
		if(sid == undefined){
			sid=0;
		}
		var myjsons={
			pId:sid,
			subject:vm.subject,
			phase:vm.phase
		};
		vm.knowledgeCode=pid;
		var myArr=initData(rightKnowledgeUrl,myjsons,"").data;
		if(myArr!=""){
			vm.initRightKnowlege.splice(0,1,myArr);
		}
		vm.refreshData();
	});
//选中项大于deep清除
	function clearRight(deep) {
		$(".choseBrdr").find("span").each(function () {
			var thisDeep=$(this).attr("data-deep");
			if(thisDeep >= deep){
				$(this).remove();
			}
		});
	}
//数据初始化

function initData(myUrl,myjson,type) {
	var mydata;
	if(myjson=="" && type=="init"){
		myjson={
			pageNo:1,
			pageSize:15,
			phase:sPhase,
			subject:sSubject,
			resourceClass:"",
			resourceFormat:"",
			sort:"pageview",
			isFree:"",
			resourceLevel:"",
			knowledgeCode:"",
			categoryCode:selectCate
		}
	}
	$.ajax({
		url:myUrl,
		data:myjson,
		type: "post",
		dataType:'json',
		async:false
	}).done(function (data) {
		if(data.status == "0" ){
			mydata=data;
		}
	});
	return mydata;
}
});