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
                    $("#datasetBody").append(d + "<br/>");
                }
            }
        }
    });
}