
yq = {
    http:{
        get:function (url,data,fn,sync) {
            var params = jQuery.param(data);
            var _url = url + '?' + params;
            var _sync = (sync == 'undefined')?true: sync;
            $.ajax({
                url: _url,
                type: 'get',
                async: _sync,
                success: function (res) {
                    fn(res);
                },
                complete: function (res) {

                },
                error: function () {
                    console.log('网络错误')
                }
            })
        },
        post:function(url,data,fn){
            $.ajax({
                url: url,
                type: 'post',
                data:JSON.stringify(data),
                async:true,
                dataType: 'json',
                contentType:'applicaiton/json',
                success: function (res) {
                    console.log('success: ',res);
                    if(typeof fn == 'function'){
                        fn(res);
                    }
                },
                complete: function (res) {

                },
                error: function () {
                    alert('网络错误');
                }
            })
        }
    }
}
