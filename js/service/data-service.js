/*GET Request to list available ark files (in application directory)*/
let filterSub = "raw_";
function listRepos(){
    $.ajax({

        'url' : 'http://localhost:80/list_avail_reps',

        'type' : 'GET',

        /*'data' : {
            'paramater1' : 'value',
            'parameter2' : 'another value'
        },*/

        'success' : function(data) {
            console.log(data);

            if (data.status == "success") {
                for(d of data.avail_reps){
                    if (d.includes(filterSub)){
                        console.log("get filtered son");
                    }else{
                        console.log(escape(d));
                        $("#datasetBody").append("<a onclick=\"setCurrentRepo(&quot"+d+"&quot)\">" + d + "</a>" +"<br/>");
                    }
                }
            }
        }
    });
}
RegExp.escape = function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
/*AJAX Request to getVectors
* featFile needs to be a string to directory containing the file (can be found through listRepos())
* */

function returnDatas(datas){
    return datas;
}
function getVectors(featFile){
    const vectorUrl = "http://localhost:80/get_vectors";
    let bodyFormData = new FormData();
    bodyFormData.set('feat_file',featFile);
    const Data = {
        feat_file: featFile,
    };

    axios({
        method: 'post',
        url: vectorUrl,
        data : bodyFormData
    }).then(data => {redraw(data)});

    /*const oParam = {
        Body:{
            feat_file: featFile
        },
        method: "POST"
    };
    fetch(vectorUrl,oParam)
        .then(data =>{return data.json()})
        .then(res => {console.log(res)})
        .then(error => {console.log(error)});
*/

   /* $.ajax({

        'url' : 'http://localhost:80/get_vectors',

        'type' : 'POST',
        data : {
            feat_file: featFile
        },
        'success' : function(data) {
            tmpData = data;
        }
    }).then(data => data.json())
        .then(json => console.log(json));*/
}