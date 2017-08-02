/**
 * Created by taoyi-third on 2017/3/14.
 */
$(function(){
    jQuery.ajaxSettings.traditional = false;
    //全局ajax处理
    $(document).ajaxComplete(function( event, xhr, settings ) {
        $( ".log" ).text( "Triggered ajaxComplete handler." );
    });
});


var goUrl = function(postUrl, data, redirectUrl){
    $.post(postUrl, data, function(res){
        console.log(postUrl);
        if(res.code < 0){
            //失败
            return alert(res.msg);
        }
        //成功跳转的URL
        location.href = redirectUrl;
    })
}

var postUrl = function(postUrl, data){
    var that = this;
    $.post(postUrl, data, function(res){
        console.log(postUrl);
        if(res.code < 0){
            //失败
            return alert(res.msg);
        }
        //成功返回自定义信息
        that.successWithData();
    })
}
var ellipsis = function(){
    $('.ellipsis').each(function(i, item){
        $(item).attr('title', $(item).text());
    })
}

$(function(){
    if(!_.isUndefined(window.tab)){
        $('.nav-sidebar li').each(function(i, item){
            if($(item).find('a').attr('href') == tab){
                $(this).addClass('active');
            }
        })
    }
    ellipsis();
})

function getQueryStringByName(name){
    var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
    if(result == null || result.length < 1){
        return "";
    }
    return result[1];
}
//根据状态转换中文
function  getOrderStatusText(status) {
    var str;
    switch (status){
        case 1 : str="待揽件";
            break;
        case 2 : str = "承运中";
            break;
        case 3 : str = "已到达";
            break;
        case 4 : str = "已完成";
            break;
        case 5 : str = "已关闭";
            break;
        case 5 : str = "订单异常";
            break;
    }
    return str;
}