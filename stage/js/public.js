var globalUserInfo, ajaxUserInfo;
$(function () {
    //var resourceCountUrl = getContextPath() + "stage/json/selectResourceCount.json";//1.1.1每个页面头部的数字查询
    var resourceCountUrl = "/resource/selectResourceCount";//1.1.1每个页面头部的数字查询
    // var selectUserFrontUrl = getContextPath() + "stage/json/selectUserFront.json"; //2.1.1查询个人信息
    var selectUserFrontUrl = "/userFront/selectUserFront"; //2.1.1查询个人信息
    //var logoutUrl = getContextPath() + "stage/json/logout.json"; // 3.1.2登出
    var logoutUrl = "/userFront/logout"; // 3.1.2登出

    var header_tem = '<div class="headBar">' +
        '<div class="headCont clearfix">' +
        '<template v-if="isIndex==1">'+
        '<div class="logo"><a href="' + getContextPath() + 'stage/main.html"><span class="logo-image"></span></a>' +
        '<span v-show="!hasNum">{{title}}</span></div> ' +
        '<div class="title" v-bind:class="{\'no-margin\': hasNum}">专业教学资源共建共享平台</div> ' +
        '<div v-show="hasNum" class="num">{{resCount}}份</div>' +
        '</template>'+
        '<template v-else>'+
        '<div class="logo"><a href="' + getContextPath() + 'stage/main.html"><span class="logo-image"></span></a></div>' +
        '<div class="hsearch">' +
        '<span></span> <span></span> <span><input type="text" placeholder="请输入关键字" class="searchInp"></span><span id="enterClick">搜索</span>'+
        '</div>'+
        '</template>'+
        '<div class="login"> ' +
        '<ul>' +
        '<li><div class="user"><img class="headpic" v-bind:src="headPicPath" title="headpic"></div></li> ' +
        '<li> ' +
        '<div class="list"> ' +
        '<ul v-if="!isLogin"> ' +
        // '<li><div class="libar">未登录</div></li> ' +
        '<li><a href="' + getContextPath() + 'stage/login.html"><div class="libar">登录</div></a></li> ' +
        '<li><a href="' + getContextPath() + 'stage/loginAndRegister/mailRegister.html"><div class="libar">注册</div></a></li> ' +
        '</ul>' +
        '<ul v-else> ' +
        '<li><div class="libar">{{userInfo.username}}</div></li> ' +
        '<li><a href="' + getContextPath() + 'stage/myOrder/buyAll.html"><div class="libar">我的订单</div></a></li> ' +
        '<li><a href="' + getContextPath() + 'stage/myOrder/myCollected.html"><div class="libar">我的收藏</div></a></li> ' +
        '<li><a href="' + getContextPath() + 'stage/myOrder/myComments.html"><div class="libar">我的评论</div></a></li> ' +
        '<li><a href="' + getContextPath() + 'stage/myOrder/infoChange.html"><div class="libar">资料修改</div></a></li> ' +
        '<li><a href="#" v-on:click="logout()"><div class="libar">退出登录</div></a></li> ' +
        '</ul>' +
        '</div></li></ul></div></div></div>';

    var search_tem = '<div class="searchBar" v-cloak=""> ' +
        '<div class="searchBg"> ' +
        '<form action="' + getContextPath() + 'stage/search.html" class="search"> ' +
        '<input type="hidden" name="q" class="inputVal"><input type="text" class="inputCss" placeholder="输入关键字" autocomplete="off"> ' +
        '<button class="btn" v-on:click="searchValidate"></button>' +
        '</form></div></div>';

    var orderbg_tem = '<div class="orderbg"> ' +
        '<div class="orderuser"> ' +
        '<div class="orderpoto"> ' +
        '<img v-bind:src="headPicPath" alt=""> ' +
        '</div> ' +
        '<p>{{userInfo.username}}</p> ' +
        '<div class="test">{{userInfo.profile}}</div> ' +
        '</div></div>';

    var footer_tem = '<div class="footBar clearfix"> ' +
        '<div class="pWrap">' +    
        '<p>版权所有 &nbsp; 北京京师讯飞教育科技有限公司 &nbsp; 网站备案编号：京ICP备16045443号-3</p> ' +
        '<p>地址：北京市西城区裕民东路3号京版信息港大厦5层 &nbsp; 总机：010-58573001</p> ' +
        '</div>' +    
        '<div class="footList">' +
        '<ul>' +
        '<li><a href="' + getContextPath() + 'stage/guardianship.html">家长监护工程</a></li>' +
        '<li>|</li>' +
        '<li><a href="' + getContextPath() + 'stage/about.html">关于我们</a></li>' +
        '<li>|</li>' +
        '<li><a href="' + getContextPath() + 'stage/callMe.html">联系我们</a></li>' +
        '</ul></div></div>';

    globalUserInfo = {
        'hasNum':false,
        'isLogin':false,
        'resCount':"--",
        'headPicPath':getContextPath() + "stage/images/icons/login-x.png",
        'userInfo':{
            "id" : "",
            "username" : "",
            "email" : "",
            "mobile" : "",
            "phaseId" : "",
            "phase" : "",
            "subjectId" : "",
            "subject" : "",
            "birthday" : "",
            "teachAge" : "",
            "sex" : "",
            "level" : "",
            "state" : "",
            "createTime" : "",
            "updateTime" : "",
            "headPicPath" : "",
            "profile" : ""
        }
    };

    ajaxUserInfo = function(){
	    $.ajaxSettings.async = false;
        $.getJSON(resourceCountUrl, function(data){
            if(data.status == "0") {
                globalUserInfo.resCount = data.data.count;
            }else{
                globalUserInfo.resCount = 0;
            }
        });
        return $.getJSON(selectUserFrontUrl, function(data){
            if(data.status == "0") {
                globalUserInfo.isLogin = true;
                if(data.data.headPicPath != null && data.data.headPicPath !="" && data.data.headPicPath != "null") {
                    globalUserInfo.headPicPath = getContextPath() + "stage/" + data.data.headPicPath;
                }
                globalUserInfo.userInfo = data.data;
                // globalUserInfo.loginUser = data.data.username;
                // globalUserInfo.userProfile = data.data.profile;
            }else{
                globalUserInfo.isLogin = false;
            }
        });
    };

    // 顶部栏
    Vue.component('vheader', {
        props: {
            hasNum: {
              default: false,
              required: false
            },
            title: {
                type: String,
                default: "资源中心",
                required: false
            },
            isIndex: {
                type: [String,Number],
                required: false,
                default: 1
            }
        },
        data: function(){
            return globalUserInfo;
        },
        template: header_tem,
        mounted: function(){
            var vm = this;
            ajaxUserInfo();
        },
        methods: {
            logout: function(){
                $.ajax({
                    url : logoutUrl,
                    type : "post",
                    dataType : 'json'
                }).done(function(data){
                    if(data.status == "0"){
                        // location.href.split("stage/")[1].split("/")[0] === "myOrder"
                        // ? window.location.href = getContextPath() + 'stage/main.html'
                        // : location.reload();
                        window.location.href = getContextPath() + 'stage/main.html';
                    }
                }).error(function(){
                    alert("出错了");
                });
            }
        }
    });
    // orderbg
    Vue.component('vorderbg', {
        template: orderbg_tem,
        data: function(){
            return globalUserInfo;
        }
    });
    // 搜索栏
    Vue.component('vsearch', {
        template: search_tem,
        methods: {
            searchValidate: function(event){
                var val = $(".inputCss").val();
                if(val.trim() == "") {
                    event.preventDefault();
                    $(".alertTopBar").html("请输入搜索内容").fadeIn();
                    setTimeout(function () {
                        $(".alertTopBar").fadeOut();
                    }, 2000);
                }
                $(".inputVal").val(encodeURIComponent(val.trim()));
            }
        }
    });
    // 页底部
    Vue.component('vfooter', {
        template: footer_tem
    });
    var loginHover = function(){
        var elLogin = $(".login");
        elLogin.mouseenter(function () {
            $(this).find(".list").show();
        });
        elLogin.mouseleave(function () {
            $(this).find(".list").hide();
        });

    };
    // for normal usage
    // loginHover();

    var head = new Vue({
        el: "#vhead",
        mounted: function(){
            // vue usage
            loginHover();
        }
    });

    var foot = new Vue({
       el: "#footer"
    });

    function getContextPath() {
        return window.location.href.substring(0, window.location.href.lastIndexOf("stage"));
    }
});

//获取url参数
function GetRequest() {
    var url = location.search;
    var theRequest = {};
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.trim().split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}