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
        that.successWithData("");
        location.href = redirectUrl;
    })
}