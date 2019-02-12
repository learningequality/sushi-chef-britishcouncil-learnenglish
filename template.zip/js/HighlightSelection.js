var questionsArray = [];
var pages = [];

var sample = null; //[{"subquestions":[{"prefix":["Yesterday I"],"answer":["went"],"suffix":[""],"userAnswer":"","leanerResponseRangeArray":[],"leanerResponseRangeJSON":"","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","went","1",13,4]]},{"prefix":["to the bank and I"],"answer":["withdrew"],"suffix":[""],"userAnswer":"","leanerResponseRangeArray":[],"leanerResponseRangeJSON":"","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","withdrew","1",19,8]]},{"prefix":["some money. I then"],"answer":["took"],"suffix":[""],"userAnswer":"","leanerResponseRangeArray":[["<span class=\"highlighted\"></span>","money","1",6,5]],"leanerResponseRangeJSON":"[[\"<span class=\\\"highlighted\\\"></span>\",\"money\",\"1\",6,5]]","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","took","1",20,4]],"leanerResponse":["money"],"isCorrect":true},{"prefix":["a taxi to town. I"],"answer":["ate"],"suffix":[""],"userAnswer":"","leanerResponseRangeArray":[],"leanerResponseRangeJSON":"","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","ate","1",19,3]]},{"prefix":["a big lunch in a fancy restaurant and then"],"answer":["met"],"suffix":[""],"userAnswer":"","leanerResponseRangeArray":[["<span class=\"highlighted\"></span>","restaurant","1",24,11]],"leanerResponseRangeJSON":"[[\"<span class=\\\"highlighted\\\"></span>\",\"restaurant \",\"1\",24,11]]","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","met","1",44,3]],"leanerResponse":["restaurant"],"isCorrect":true},{"prefix":["a friend and we"],"answer":["went"],"suffix":["to the cinema."],"userAnswer":"","leanerResponseRangeArray":[["<span class=\"highlighted\"></span>","cinema","1",29,6]],"leanerResponseRangeJSON":"[[\"<span class=\\\"highlighted\\\"></span>\",\"cinema\",\"1\",29,6]]","answersRangeArray":[["<div class=\"gapfield-wrapper highlighted inline0\"></div>","went","1",17,4]],"leanerResponse":["cinema"],"isCorrect":true}],"question_audio":""}];

var answersRangeArray = [];

$(document).ready(function() {
    var scripts = ['libs/json2.min.js' /*,'libs/rangy-core.js'*/ , 'libs/jquery.textHighlighter.js'];
    //var scripts = ['libs/json2.js','libs/jquery.textHighlighter.js'];
    $.getScript(scripts, function(data, textStatus) {
        //all scripts have loaded
        entryPoint();
    });
    //entryPoint();
});

//Game-specific initialization
function init() {
    //
    questionsArray = [];

    $(gameXMLDOM).find('GapFillAssembledQuestionItem').each(function(qIndex, question) {

        var sub_questionsArray = [];

        $(question).find('GapFillQuestionItem').each(function(index, subquestion) {

            var prefixesArray = [];
            var answersArray = [];
            var suffixesArray = [];

            prefixesArray.push($.trim($(subquestion).find('Prefix').text().replace(/\[NL\]/g, '<br />')));
            answersArray.push($.trim($(subquestion).find('Answer').text()));
            //answersArray.push("");
            suffixesArray.push($.trim($(subquestion).find('Suffix').text().replace(/\[NL\]/g, '<br />')));

            sub_questionsArray.push({
                'prefix': prefixesArray,
                'answer': answersArray,
                'suffix': suffixesArray,
                'userAnswer': '',
                'leanerResponseRangeArray': [],
                'leanerResponseRangeJSON': '',
                'answersRangeArray': []
            });
        });

        questionsArray.push({
            'subquestions': sub_questionsArray,
            'question_audio': $(question).find('Audio > URL').text()
        });

        //pages.push(questionsArray);
    });
}



//Game-specific reset procedure
function reset() {

    //$('#ajax-cont').empty();
    $('#ajax-cont').append('<div id="questions" class="container0"></div>');

    debug.log(questionsArray);


    answersRangeArray = []; // !!!!!!!!!!!!!!!!!!!

    $.each(questionsArray, function(pIndex, question) {

        var $question = $('<div class="question" id="' + pIndex + '"></div>'); //contenteditable="true"
        var $form = $('<form class="form-inline" role="form"></form>');
        var $row1 = $('<span class="row0"></span>');

        var q = (pIndex + 1) + '';


        var question_number = '';
        if (gameShowQuestionNo === "true" && questionsArray.length > 1) {
            question_number = (pIndex + 1) + '. ';
        }

        var question_audio_item = createSimpleAudioButton(question.question_audio);

        //
        $row1.append(question_number + question_audio_item);


        $.each(question.subquestions, function(index, subquestion) {

            //var $row2 = $('<div class="row"></row>');

            //for (var i = 0; i < subquestion.prefix.length; i++) {

            var dummy_item = '<div class="model-wrapper inline hidden">';
            /*
            				dummy_item += '<div class="form-group form-control0 inline-block">';
            	    		//dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            				//dummy_item += '<span class="glyphicon"></span> ' + subquestion.answer;
            				//dummy_item += '</li>';
            				dummy_item += '<p contenteditable0 name="gapfield0" placeholder=" " class="btn btn-info form-control dummy" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">' + subquestion.answer + '</p>';
            				dummy_item += '<span class="glyphicon color-white form-control-feedback hidden"></span>'; //glyphicon-remove
            				dummy_item += '</div>';
            */
            dummy_item += subquestion.prefix[0] + ' '; // add space
            dummy_item += '<b class="highlighted0 bg-info btn-sm btn-info">' + subquestion.answer + '</b>';
            dummy_item += ' ' + subquestion.suffix[0]; // + ' '; // add space

            dummy_item += '</div>';

            var item = '';

            item += '<div class="subquestion inline">'; // inline OR block ?????

            item += dummy_item;

            item += '<div class="highlightable inline" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">'; // inline OR block ?????

            //item += '<p>';
            //item += '<div class="form-group">';
            item += ' ' + subquestion.prefix[0] + ' '; // add space
            //item += '</div>';

            item += '<div class="gapfield-wrapper highlighted inline0">' + subquestion.answer[0] + '</div>';

            /*
				item += '<div class="inline-block gapfield-wrapper">'; //has-error has-feedback
				item += '<div class="form-group form-control0 inline-block">'; //has-error has-feedback
				item += '<p contenteditable name="gapfield" placeholder=" " class="form-control gapfield" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '"></p>';
				item += '<span class="glyphicon color-white form-control-feedback hidden"></span>'; //glyphicon-remove
				item += '</div>';
				item += '</div>';
				*/

            //item += '<div class="form-group">';
            item += ' ' + subquestion.suffix[0]; // add space
            //item += ' ';
            //item += '</div>';

            //item += '</p>';

            item += '</div>';

            item += '</div>';

            //$row2.append(item);

            $row1.append(item);
            //}

            //$row1.append($row2);
        });


        //
        //$form.append($row1);
        //$question.append($form);

        $question.append($row1);
        $('#questions').append($question);

        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);
    });


    $('[name=gapfield]').on('input', function(event) {

        /*$('[name=gapfield]').each(function (index, input) {
	    	
			// clear all styles
	    	var div = $(this).parent();
	    	var span = $(this).siblings( ".glyphicon" );

	    	$(this).removeClass("btn-danger btn-warning btn-success");
	    	div.removeClass("has-feedback has-error has-warning has-success");
	    	span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
	  	});
		*/


        var div = $(this).parent();
        var span = $(this).siblings(".glyphicon");

        $(this).removeClass("btn-danger btn-warning btn-success");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

    })

    $('[name=gapfield]').focusout(function() {
        //focus++;
        //$( "#focus-count" ).text( "focusout fired: " + focus + "x" );
        onCheckPageAnswer();
    })


    ///////////////





    /////




    $.textHighlighter.createWrapper = function(options) {

        //return $('<b class="bg-warning btn-sm btn-warning"></b>').addClass(options.highlightedClass);
        //.css('color', options.color)


        // .css('background-color', options.color)
        // //.css('textDecoration', 'line-through')
        // .css({"border-color": options.color, 
        //      "border-width":"1px", 
        //      "border-style":"solid"});


        return $('<span></span>')
            //.css('backgroundColor', options.color)
            .addClass('highlighted bg-warning btn-sm btn-warning');

    };


    $('.highlightable').textHighlighter({ // 
        //color: "#6666FF"
        //highlightedClass: 'highlighted btn-sm btn-warning',
        onRemoveHighlight: function(highlight) {


            if ($(highlight).hasClass('btn-success')) {
                return false;
            }

            $(highlight).find('.glyphicon').remove();
            //$(highlight).removeHighlights(this);
            //$('.highlightable').getHighlighter().removeHighlights(/*$(highlight), true*/);
            //
            updateRemainingQuestions();

            return true;
            /*
				BootstrapDialog.show({
				    title: 'Remove selection',
				    message: 'Do you want unselect: "' + $(highlight).text() + '"?',
				    data: {'highlight' : highlight},
				    buttons: [{
				        id: 'btn-cancel',   
				        //icon: 'glyphicon glyphicon-check',       
				        label: 'Cancel',
				        cssClass: 'btn-default', 
				        //autospin: false,
				        action: function(dialogRef){    
				            dialogRef.close();
				        }
				    },
				    {
				        id: 'btn-ok',   
				        //icon: 'glyphicon glyphicon-check',       
				        label: 'OK',
				        cssClass: 'btn-primary', 
				        //autospin: false,
				        action: function(dialogRef){    
				        	var highlight = dialogRef.getData('highlight');
				        	$(highlight).find('.glyphicon').remove();
				        	//$(highlight).removeHighlights(this);
				        	$('.highlightable').getHighlighter().removeHighlights($(highlight), true);
				        	//
    						updateRemainingQuestions();
    						//
				            dialogRef.close();
				        }
				    }]
				});

				return false;
				*/
        },
        onBeforeHighlight: function(range) {
            //return confirm('Do you really want to highlight this text: "' + range + '"?');

            //console.log(range);

            //range = $.trim(range);

            return true;
            /*
				var itemsCurrentlySelected = $(range.commonAncestorContainer).children('.highlighted').size();

			    var question_index = $(range.commonAncestorContainer).data('question-index');

			    var question_index = $(range.commonAncestorContainer).data('question-index');
    			var sub_question_index = $(range.commonAncestorContainer).data('sub-question-index');
    			var allowed_len = questionsArray[question_index].subquestions.length; //[sub_question_index].answer[0];


			    if(itemsCurrentlySelected >= allowed_len)
			    {
			    	//alert("max items selected");
			    	BootstrapDialog.alert("You can only select " + allowed_len + " items for this question", function(){
				    	//       
					});

					return false;
			    }

			    return true;
			*/
        },
        onAfterHighlight: function(highlight) {

            if(highlight.length == 0) return;
            //alert('You have selected ' + range);

            //console.log(highlight);
            //range = $.trim(range);

            var itemsCurrentlySelected = $(highlight).closest('.question').find('.highlighted').length;

            //alert(itemsCurrentlySelected);

            //var question_index = $(highlights).parent().data('question-index');

            var question_index = $(highlight).parent().data('question-index');
            var sub_question_index = $(highlight).parent().data('sub-question-index');
            var allowed_len = questionsArray[question_index].subquestions.length; //[sub_question_index].answer[0];


            if (gameNoCorrectAnswers === 0 && (itemsCurrentlySelected > allowed_len)) {
                $('.highlightable').getHighlighter().removeHighlights($(highlight), true);

                //alert("max items selected");
                BootstrapDialog.alert("You can only select " + allowed_len + " items for this question", function() {
                    //       
                });

                //return false;
            } else {
                // if instant feedback
                if (gameMode == "learn_mode") {
                    onCheckPageAnswer();
                } else if (gameMode == "test_mode") {
                    //$(highlights).addClass('btn-sm btn-warning');
                }

                //
                updateRemainingQuestions();
            }


            //
            /*
			  	$( '.highlightable' ).each(function() {
					//var jsonStr = $(this).getHighlighter().serializeHighlights();
			  		//$(this).getHighlighter().removeHighlights();

			  		//console.log(jsonStr);
				});
				*/
            //
            //$(highlights).removeAttr('style').addClass('btn-sm btn-warning');



        }
    });



    $('.highlighted').live('click touch', function() {
        $('.highlightable').getHighlighter().removeHighlights(this);
    });

    //var jsonStr = $('.highlightable').getHighlighter().serializeHighlights();
    //console.log(jsonStr);
    //$('.highlightable').getHighlighter().removeHighlights();

    $('.highlightable').each(function() {
        //
        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');
        questionsArray[question_index].subquestions[sub_question_index].answersRangeArray = [];

        var jsonStr = $(this).getHighlighter().serializeHighlights();

        debug.log(jsonStr);

        var json = JSON.parse(jsonStr);
        questionsArray[question_index].subquestions[sub_question_index].answersRangeArray = json;
        //

        $(this).getHighlighter().removeHighlights(this, true);


        //
        //console.log(jsonStr);
        //console.log(json);
    });


    $('.highlightable').each(function() {
        //
        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');

        if(sample && sample[question_index].subquestions[sub_question_index].leanerResponseRangeJSON != "")
        {
            //console.log(question_index, sub_question_index);

            var serialized = sample[question_index].subquestions[sub_question_index].leanerResponseRangeJSON;
            $(this).getHighlighter().deserializeHighlights(serialized);
        }
    });

    ////////////

    //
    updateRemainingQuestions();

    addAudioSupport();


    $(".question").keydown(function (e) {

        if(e.keyCode == 13)
        {
            e.preventDefault();
            //$(this).find('.highlightable').getHighlighter().doHighlight(true);

            $('.highlightable').each(function(index) {
                //
                $(this).trigger( "mouseup" ); //.getHighlighter().doHighlight(true);

                //console.log($(this));
            });
            return false;
        }
        else if (e.keyCode == 27 || // escape
            e.keyCode == 9  ||  // tab
            e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39 // arrow keys
            ) 
        {
            
        }
        else
        {
            e.preventDefault();
            return false;
        }
    });

    //key up handles all keypresse events. Backspace wont fire for simple keypress event in jquery
    $(".question").keyup(function (e) {

        if(e.keyCode == 13)
        {
            e.preventDefault();
            //$(this).find('.highlightable').getHighlighter().doHighlight(true);

            $('.highlightable').each(function() {
                //
                $(this).trigger( "click" ); //.getHighlighter().doHighlight(true);
            });



            return false;
        }
        else if (e.keyCode == 27 || // escape
            e.keyCode == 9  ||  // tab
            e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39 // arrow keys
            ) 
        {
            
        }
        else
        {
            e.preventDefault();
            return false;
        }
    });


}

function onShowAnswers(show) {
    debug.log('onShowAnswers')

    $('.highlightable').toggleClass('hidden');
    $('.model-wrapper').toggleClass('hidden');

    return;


    $('.question .subquestion').each(function(index, input) {
        var strDiv1Cont = $(this).find('.model-wrapper').wrap('<p/>') /*.parent()*/ .html();
        var strDiv2Cont = $(this).find('.gapfield-wrapper').wrap('<p/>') /*.parent()*/ .html();

        $(this).find('.model-wrapper').unwrap();
        $(this).find('.gapfield-wrapper').unwrap();


        //console.log(strDiv1Cont);
        //console.log(strDiv2Cont);
        //console.log(".................");

        if (!strDiv1Cont) {
            strDiv1Cont = '';
        }

        if (!strDiv2Cont) {
            strDiv2Cont = '';
        }

        //var class1 = $(this).find('.dummy').attr('class');
        //var class2 = $(this).find('ul>li').attr('class');

        $(this).find('.model-wrapper').html(strDiv2Cont);
        //$(this).find('.model-wrapper').removeClass().addClass(class2);
        $(this).find('.gapfield-wrapper').html(strDiv1Cont);
        //$(this).find('ul>li').removeClass().addClass(class1);
    });


    /*
    	$('.question').each(function () {
    		var strDiv1Cont = $(this).find('li').first().clone();
    		var strDiv2Cont = $(this).find('ul>li').clone();

    			$(this).find('li').remove();
    			$(this).find('ul').empty().prepend(strDiv1Cont);
    			$(this).find('.here').prepend(strDiv2Cont);
    			//$(this).find('ul').prepend(strDiv1Cont);
    	});
    */

    return;

    /*
    	$('[name=gapfield]').each(function (index, input) {

    		//$(this).attr('disabled', 'disabled');

        	var question_index = $(this).data('question-index');
        	var sub_question_index = $(this).data('sub-question-index');
        	var model_answers = questionsArray[question_index].subquestions[sub_question_index].answer[0];

        	var model_val = model_answers.split("|");
    		for (var i = 0; i < model_val.length; i++) {
    			model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
    		}

        	debug.log('model_val :', model_val)

        	var div = $(this).parent();
        	var span = $(this).siblings( ".glyphicon" );

        	$(this).removeClass("btn-danger btn-warning btn-success btn-info");
        	div.removeClass("has-feedback has-error has-warning has-success");
        	span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

        	if(show)
        	{
        		// lock field !!!!!!!!!!!!!!

        		//save input value first
        		questionsArray[question_index].subquestions[sub_question_index].userAnswer = $(this).val();

        		//update input value
        		$(this).val(model_val[0]);

        		var div_classes = "";
        		var span_classes = "";
        		var this_classes = "";

        		div_classes += "";
        		span_classes += "";
        		this_classes += "btn-info";
        	}
        	else
        	{
        		// unlock field !!!!!!!!!!!!!!

        		//restore input value
        		$(this).val(questionsArray[question_index].subquestions[sub_question_index].userAnswer);
        	}

        	$(this).addClass(this_classes);
        	div.addClass(div_classes);
        	span.addClass(span_classes);

        	if(show == false)
        	{
        		onCheckPageAnswer();
        	}

        });
    */

}


//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {

    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    debug.log('onCheckPageAnswer')


    $('.highlighted').removeClass('bg-warning bg-success bg-danger correct wrong btn-sm btn-warning btn-success btn-danger');

    $('.highlightable .highlighted .glyphicon').remove();

    if (window.getSelection) {
        if (window.getSelection().empty) { // Chrome
            window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) { // Firefox
            window.getSelection().removeAllRanges();
        }
    } else if (document.selection) { // IE?
        document.selection.empty();
    }

    $('#questions').focus();
    $('#questions').addClass('disable-selection');


    $('.highlightable').each(function(index) {

        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');

        var answersRangeArray = questionsArray[question_index].subquestions[sub_question_index].answersRangeArray;

        var jsonStr = $(this).getHighlighter().serializeHighlights();
        var json = JSON.parse(jsonStr);

        var vals = [];


        //console.log(index);

        //console.log("------------------------------" + index + "------------------------------");
        //console.log(json.length);

        var offset = 0;

        //for (var i = 0; i < json.length; i++) {
        for (var i = 0; i < json.length; i++) {

            offset += json[i][3]; // combine the range
            if (i > 0) {
                offset += json[i - 1][4]; // combine the length of prev.
            }


            if(gameNoCorrectAnswers && showFeedback == true) {
                $(this).find(':nth-child(' + (i + 1) + ')').addClass('bg-success correct btn-sm btn-success locked');
                $(this).find(':nth-child(' + (i + 1) + ')').append('<span class="glyphicon glyphicon-ok"></span>');
            }
            else
            {
                for (var j = 0; j < answersRangeArray.length; j++) {
                    //
                    //console.log(json[i][1] + ", == " + answersRangeArray[j][1]  + ", && " + offset  + " == " +  answersRangeArray[j][3]  + ", && " +  json[i][4]  + " == " +  answersRangeArray[j][4]);

                    if (showFeedback == true) {
                        if (json[i][1].substr(json[i][1].length - 1) == " ") {
                            json[i][1] = json[i][1].substring(0, json[i][1].length - 1);
                        }


                        if ((json[i][1] == answersRangeArray[j][1] &&
                                offset == answersRangeArray[j][3] /*&& json[i][4] == answersRangeArray[j][4]*/ ) || gameNoCorrectAnswers) {
                            //console.log(json[i][1] + " - correct");
                            $(this).find(':nth-child(' + (i + 1) + ')').addClass('bg-success correct btn-sm btn-success locked'); //.addClass('correct');
                            //$(this).find(':nth-child(' + (i+1) + ')').text(json[i][1]);
                            //console.log($(this).find(':nth-child(' + (i+1) + ')').next());
                            $(this).find(':nth-child(' + (i + 1) + ')').append('<span class="glyphicon glyphicon-ok"></span>');

                            /*var selection = document.getSelection();
                            if(selection)
                            {
                                selection.removeAllRanges();
                            }*/
                            //alert("correct");

                        } else {
                            //console.log(json[i][1] + " - wrong");
                            $(this).find(':nth-child(' + (i + 1) + ')').addClass('bg-danger wrong btn-sm btn-danger locked'); //.addClass('wrong');
                            //$(this).find(':nth-child(' + (i+1) + ')').text(json[i][1]);
                            //debug.log($(this).find(':nth-child(' + (i+1) + ')').nextSibling());
                            $(this).find(':nth-child(' + (i + 1) + ')').append('<span class="glyphicon glyphicon-remove"></span>');

                            //alert("wrong");
                        }
                    }
                }
            }

            var val = json[i][1];

            vals.push(val);
            //
            questionsArray[question_index].subquestions[sub_question_index].leanerResponseRangeJSON = jsonStr;
            questionsArray[question_index].subquestions[sub_question_index].leanerResponseRangeArray = json;
            questionsArray[question_index].subquestions[sub_question_index].leanerResponse = vals;
            questionsArray[question_index].subquestions[sub_question_index].isCorrect = true;

            /*
            			console.log(json[i][1] + " == " + answersRangeArray[index][0][1]  + " && " + 
            				offset  + " == " +  answersRangeArray[index][0][3]  + " && " +  json[i][4]  + " == " +  answersRangeArray[index][0][4]);

            			if( json[i][1] == answersRangeArray[index][0][1] &&
            				offset == answersRangeArray[index][0][3] && json[i][4] == answersRangeArray[index][0][4])
            			{
            				//console.log(json[i][1] + " - correct");
            				$(this).find(':nth-child(' + (i+1) + ')').addClass('bg-success correct btn-sm btn-success locked'); //.addClass('correct');
            				$(this).find(':nth-child(' + (i+1) + ')').append('<span class="glyphicon glyphicon-ok"></span>');
            			}
            			else
            			{
            				//console.log(json[i][1] + " - wrong");
            				$(this).find(':nth-child(' + (i+1) + ')').addClass('bg-danger wrong btn-sm btn-danger locked'); //.addClass('wrong');
            				$(this).find(':nth-child(' + (i+1) + ')').append('<span class="glyphicon glyphicon-remove"></span>');
            			}
            */
        }


        //
        //questionsArray[question_index].subquestions[sub_question_index].leanerResponse = val;
        //questionsArray[question_index].subquestions[sub_question_index].isCorrect = true;

        //$(this).getHighlighter().removeHighlights();

        //console.log(json);
    });

    $('#questions').removeClass('disable-selection');

    if( $('.btn-danger').length > 0 )
    {
         //
        $('#showAnwsersButton').removeClass('disabled');
    }
    else
    {
        $('#showAnwsersButton').addClass('disabled');
    }

    //if instant feedback
    if (gameMode == "learn_mode") {
        setTimeout(
            function() {
                //$('.highlightable').getHighlighter().removeHighlights(this, false);

                $('.highlightable').each(function(index) {
                    $(this).getHighlighter().removeHighlights(this, false);
                });

                $('.glyphicon-remove').removeClass('glyphicon-remove');
                //$('#main_list').append($('.btn-danger')); // add all wrong items back to the main_list
                //$('#main_list li').removeClass('btn-danger btn-warning btn-success btn-info disabled ui-state-disabled');
                //$('#main_list li span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok');
            }, 1000);
    } else if (gameMode == "test_mode") {
        //destroy
        /*$( '.highlightable' ).each(function() {
			$(this).getHighlighter().destroy();
		});*/
    }


    return;
}


//The score values to be displayed after the game finish
//returns: {percentage: , points: , total: }
function getScore() {
    var questions = [];
    var answers = [];
    var corrects = [];
    var points = [];
    var totals = [];
    var gamePoints = 0;
    var gameTotal = 0;

    var qPoints = 0;
    var qTotal = 0;
    var text = "";
    var leanerResponse = [];
    var correctAnswer = [];
    var isCorrect = false;

    $.each(questionsArray, function(pIndex, question) {

        //questions.push('');
        /*var qPoints = 0;
		var qTotal = 0;
		var text = "";
		var leanerResponse = [];
		var correctAnswer = [];
		var isCorrect = false;*/

        text = "";
        leanerResponse = [];
        correctAnswer = [];
        isCorrect = false;

        qPoints = 0;
        qTotal = 0;


        //var $subquestion = $('#questions .question:nth-child(' + (pIndex + 1) + ')');

        //$.each(question.prefixes, function (index, prefix) {
        $.each(question.subquestions, function(index, subquestion) {

            //text = subquestion.prefix[0] + " ____ " + subquestion.suffix[0];
            //leanerResponse = subquestion.leanerResponse;
            //correctAnswer = subquestion.answer; //[0];
            //isCorrect = subquestion.isCorrect;

            text += subquestion.prefix[0] + " ____ " + subquestion.suffix[0];
            leanerResponse.push(subquestion.leanerResponse);
            correctAnswer.push(subquestion.answer); //[0];
            isCorrect = subquestion.isCorrect;

            var json = subquestion.leanerResponseRangeArray;
            var answersRangeArray = subquestion.answersRangeArray;
            var offset = 0;

            for (var i = 0; i < json.length; i++) {
                offset += json[i][3]; // combine the range
                if (i > 0) {
                    offset += json[i - 1][4]; // combine the length of prev.
                }

                //console.log(">>>>>>>>>>>>>>>>>>> " + subquestion.answersRangeArray);
                //alert(subquestion.answersRangeArray.length);

                if(gameNoCorrectAnswers) {
                    qPoints++;
                }
                else
                {
                    for (var j = 0; j < answersRangeArray.length; j++) {
                        if ((json[i][1] == answersRangeArray[j][1] &&
                                offset == answersRangeArray[j][3] /*&& json[i][4] == answersRangeArray[j][4]*/ ) || gameNoCorrectAnswers) {
                            qPoints++;
                        } else {
                            //
                        }
                    }   
                }

                
            }

            qTotal++;


            /*questions.push(text);
			answers.push(leanerResponse);
			corrects.push(correctAnswer);*/
            //points.push(qPoints);
            //totals.push(qTotal);
        });

        questions.push(text);
        answers.push(leanerResponse);
        corrects.push(correctAnswer);

        points.push(qPoints);
        totals.push(qTotal);

        gamePoints += qPoints;
        gameTotal += qTotal;

    });


    //destroy
    $('.highlightable').each(function() {
        $(this).getHighlighter().destroy();
    });

    $('.highlighted').die('click touch');



    return {
        'questions': questions,
        'answers': answers,
        'corrects': corrects,
        'points': points,
        'totals': totals,
        'gamePoints': gamePoints,
        'gameTotal': gameTotal,
        'message': 'There are no correct answers for this exercise. You get a score for answering each question and completing the activity.',
        'learnerResponse': questionsArray //JSON.stringify(questionsArray)
    };
}