function loadData() {
    $.ajax({
        url: "http://localhost:5000/list_avail_reps"})
        .done(function( data ) {
            if ( console && console.log ) {
                console.log( "Sample of data:", data.slice( 0, 100 ) );
            }
        });
}