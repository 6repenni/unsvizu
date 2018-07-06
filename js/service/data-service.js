
$('.myButton').click(function() {

    $.ajax({

        'url' : 'http://localhost:5000/list_avail_reps',

        'type' : 'GET',

        /*'data' : {
            'paramater1' : 'value',
            'parameter2' : 'another value'
        },*/

        'success' : function(data) {
            console.log(data);

            if (data == "success") {
                alert('request sent!');
            }
        }
    });
});