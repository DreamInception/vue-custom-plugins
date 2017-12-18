(function(){

var tm = '<div class="page-bar" v-if="all!=0">'+
            '<ul>'+
            '<li v-if="cur!=1"><a class="prevBg" v-on:click="btnclick(cur-1)">&nbsp;</a></li>'+
            '<li v-for="index in indexs"  v-bind:class="{ active: cur == index}">'+
                '<a v-on:click="btnclick(index)">{{index}}</a>'+
            '</li>'+
			'<li v-if="cur+2<all && indexs[indexs.length-1] < all"><a>...</a></li>'+
                '<li  v-if="cur+3<all && indexs[indexs.length-1]+1 < all">'+
                '<a v-on:click="btnclick(all-1)">{{ all-1 }}</a>'+
                '</li>'+
                '<li  v-if="cur+2<all && indexs[indexs.length-1] < all" >'+
                '<a v-on:click="btnclick(all)">{{ all }}</a>'+
                '</li>'+
                '<li v-if="cur!=all && all!=0"><a class="nextBg" v-on:click="btnclick(cur+1)">&nbsp;</a></li>'+
                '<li ><input type="text" class="pageIpt"  @keyup.enter="btnclick2()" >{{curShow}}</li>'+
                '<li><a>共<i>{{all}}</i>页</a></li>'+
            '</ul>'+
        '</div>';


    var navBar = Vue.extend({
        template: tm,
        props: ['cur', 'all'],
        data: function(){},
        computed: {
            indexs: function(){
            	var currentPage=parseInt(this.cur);
              var left = 1;
              var right = this.all;
              var ar = [] ;
              if(this.all>= 5){
                if(currentPage > 3 && currentPage < this.all-2){
                        left = currentPage - 3;
                        right = currentPage + 2;
                }else{
                    if(currentPage<=3){
                        left = 1;
                        right = 5;
                    }else{
                        right = this.all;
                        left = this.all -4;
                    }
                }
             }
            while (left <= right){
                ar.push(left);
                left ++
            }
            return ar
           },
	        curShow:function () {
		        if(!isNaN(this.cur)) {
			        if (this.cur > this.all) {
				        this.cur = this.all;
			        }
			        else if (this.cur == 0) {
				        this.cur = 1;
			        }
		        }
		        else{
			        this.cur=1;
		        }
	        }
        },
        methods: {
            btnclick: function(data){
                if(data != this.cur){
                    this.cur = data;
	                this.$emit('btnclick',data);
                    $(".pageIpt").val(data);
                }
            },
	        btnclick2: function(){
            	var goPage=$(".pageIpt").val();
			        this.$emit('btnclick',this.cur);
		        if(goPage != this.cur){
                    if(goPage > this.all){
                        this.cur = this.all;
                        this.$emit('btnclick',this.cur);
                        $(".pageIpt").val(this.all);
                    }else{
                        this.cur = goPage;
                        this.$emit('btnclick',goPage);
                    }
		        }
	        }
        }
    });
    window.Vnav = navBar
})();