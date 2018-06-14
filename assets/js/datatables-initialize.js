//JS to initialize both of the datatables instances
function datatableInitialize(tagPage) {
    var tagFilter = "tag:theme";
    if (typeof(tagPage) !== "undefined") {
        tagFilter = "tag:" + tagPage;
    }
    var indexDatatable = $('#indexTable').on('xhr.dt', function(e, settings, json, xhr) {
        //transform data before being put into datatables
        for (i = 0; i < json.posts.length; i++) {
            //Grab the html content content and turn into a jQuery object
            var descContent = $(json.posts[i].html);
            //Split into array by dashes
            var descSplit = descContent.text().split(" - ", 10);
            var descSlice = "";

            //For each object in array, don't include first two dashes to strip beginning of content
            for (var k = 0; k < descSplit.length; k++) {
                if (k >= 2) {
                    descSlice = descSlice + descSplit[k];
                }
            };
            //Save new data as the html variable
            json.posts[i].html = descSlice;
            //encode url into hidden div that then gets replaced on the init below
            json.posts[i].image = "<a href='" + json.posts[i].url + "'><img alt='Theme demo image' src='" + encodeURI(json.posts[i].feature_image) + "' /></a>";
        }
    }).on('init.dt', function() {
        loadAllImages(indexDatatable);
        promotePosts(indexDatatable);
    }).dataTable({
        ajax: {
            url: ghost.url.api('posts', {
                limit: "all",
                filter: tagFilter,
                include: 'tags,author'
            }),
            dataSrc: "posts"
        },
        paging: false,
        responsive: true,
        columns: [{
            "data": null,
            "render": function(data) {
                return "<a href='" + data.url + "'>" + data.title + "</a>"
            },
            "class": "tableTitle"
        }, {
            "data": "image",
            "class": "tableImage"
        }, {
            "data": null,
            "render": function(data) {
                var tags_array = [];
                for (i = 0; i < data.tags.length; i++) {
                    tags_array.push(data.tags[i].name);
                }
                tags_array.sort();
                return tags_array[0];
            },
            "class": "tdCenter"
        }, {
            "data": "html"
        }, {
            "data": null,
            "render": function(data) {
                var tags_array = [];
                for (i = 0; i < data.tags.length; i++) {
                    tags_array.push(data.tags[i].name);
                }
                tags_array.sort();
                return String(tags_array[1]);
                // return "1";
            },
            "class": "tdCenter"
        }],
        dom: 'Tl<"datatables-flex"i<"search-input"f>><"clear">rtp',
        orderCellsTop: true,
        oLanguage: {
            "sInfo": "Number of Themes = _TOTAL_",
            "sInfoEmpty": "Number of Themes = _TOTAL_",
            "sInfoFiltered": " (filtered from _MAX_)"
        }
    });

    $("tbody tr").each(function() {
        var tags = $(this).find("input[name='tags']").val();
        if (typeof(tags) !== "undefined") {
            tags = tags.replace(/[A-Za-z-]/g, "");
            var tags_array = tags.split(",");
            tags_array = tags_array.filter(String);
            tags_array.sort();

            $(this).find(".price").html(tags_array[0]);
            $(this).find(".columns").html(tags_array[1]);
        }
    });
}

jQuery.extend(jQuery.fn.dataTableExt.oSort, {
    "currency-pre": function(a) {
        a = (a === "-") ? 0 : a.replace(/[^\d\-\.]/g, "");
        return parseFloat(a);
    },

    "currency-asc": function(a, b) {
        return a - b;
    },

    "currency-desc": function(a, b) {
        return b - a;
    }
});

//Loads images and then initializes Datatables

function loadAllImages(table) {
    table.api().rows().every(function(rowIdx, tableLoop, rowLoop) {
        var data = this.data();
        for (i; i < data.length; i++) {
            console.log($('.tableImage')[i].innerHTML)
            $('.tableImage')[i].innerHTML = data.feature_image;
        }

    });
}

function promotePosts(table) {

    $.get(ghost.url.api('posts', { limit: "all", filter: "tag:promoted-theme-list" })).done(function(data) {
        for (i = 0; i < data.posts.length; i++) {
            // Get the index of matching row.  Assumes only one match
            var indexes = table.api().rows().eq(0).filter(function(rowIdx) { //check column 0 of each row for tradeMsg.message.coin
                return table.api().cell(rowIdx, 0).data().title === data.posts[i].title ? true : false;
            });

            // grab the data from the row
            var rowData = table.api().row(indexes).data();

            // console.log(data)

            if (typeof(rowData) !== "undefined") {
                console.log(rowData.title)
                var header = $('.table-header').clone().appendTo('thead')
                $(header).addClass('promoted').removeClass('table-header')
                $(header).find('th').eq(0).html("<a href='" + rowData.custom_excerpt + "''>" + rowData.title + "</a>");
                $(header).find('th').eq(1).html("<a href='" + rowData.custom_excerpt + "''><img src='" + rowData.feature_image + "' /></a>");
                $(header).find('th').eq(2).html(function() {
                    var tags_array = [];
                    for (j = 0; j < rowData.tags.length; j++) {
                        tags_array.push(rowData.tags[j].name);
                    }
                    tags_array.sort();
                    return tags_array[0];
                });

                console.log(rowData.html)
                $(header).find('th').eq(3).html(rowData.html);
                $(header).find('th').eq(4).html(function() {
                    var tags_array = [];
                    for (j = 0; j < rowData.tags.length; j++) {
                        tags_array.push(rowData.tags[j].name);
                    }
                    tags_array.sort();
                    return String(tags_array[1]);
                });

                $('.promoted').show();
            }
        }
    }).fail(function(err) {
        console.log(err);
    });
}