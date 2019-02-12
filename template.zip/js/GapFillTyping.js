var questionsArray = [];
var pages = [];


var sample = [{"subquestions":[{"prefix":["Welcome to the weather forecast. Now, let's see what the weather is"],"answer":["like"],"suffix":["today."],"userAnswer":"","leanerResponse":["dadawd"],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["In the north of the country it's very windy and cold. There is a"],"answer":["chance"],"suffix":["of some rain too, so don't leave home without your umbrella!"],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["The temperature is around 10"],"answer":["degrees"],"suffix":["centigrade."],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["In the east its rainy all day today, I'm afraid. There may be a thunderstorm in the afternoon. The "],"answer":["temperature"],"suffix":["is a bit higher, at around 13 degrees."],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["In the west and middle of the country the weather is dry"],"answer":["but"],"suffix":["cloudy."],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["The south of the country has the"],"answer":["best"],"suffix":["weather today. It's cloudy most of the time but sunny this afternoon."],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""}];


$(document).ready(function() {
    entryPoint();
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

            prefixesArray.push($(subquestion).find('Prefix').text().replace(/\<br \/\>/g, '').replace(/\[NL\]|\n/g, '<br />'));
            answersArray.push($(subquestion).find('Answer').text());
            suffixesArray.push($(subquestion).find('Suffix').text().replace(/\<br \/\>/g, '').replace(/\[NL\]|\n/g, '<br />'));

            sub_questionsArray.push({
                'prefix': prefixesArray,
                'answer': answersArray,
                'suffix': suffixesArray,
                'userAnswer': ''
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
    $('#ajax-cont').append('<div id="questions"></div>');

    debug.log(questionsArray);

    $.each(questionsArray, function(pIndex, question) {

        var $question = $('<div class="question" id="' + pIndex + '"></div>');
        var $form = $('<div class="form-inline" role="form"></div>');
        var $row1 = $('<div class="row0"></row>');

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

            var dummy_item = '<div class="inline-block model-wrapper hidden">';
            dummy_item += '<div class="form-group form-control0 inline-block">';
            //dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            //dummy_item += '<span class="glyphicon"></span> ' + subquestion.answer;
            //dummy_item += '</li>';
            dummy_item += '<p contenteditable0 name="gapfield0" placeholder=" " class="btn btn-info form-control dummy" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">' + subquestion.answer + '</p>';
            dummy_item += '<span class="glyphicon color-white form-control-feedback hidden"></span>'; //glyphicon-remove
            dummy_item += '</div>';
            dummy_item += '</div>';

            var item = '';
            //item += dummy_item;

            item += '<div class="subquestion inline">'; // inline OR block ?????
            //item += '<div class="form-group">';
            item += subquestion.prefix[0] + ' '; // add space
            //item += '</div>';

            item += dummy_item;


            var default_value = "";
            if(sample){

                //console.log(sample);
                //var sampleArray = JSON.parse( sample );
                //console.log(sampleArray);
                default_value = sample[pIndex].subquestions[index].leanerResponse;
            }

            item += '<div class="inline-block gapfield-wrapper">'; //has-error has-feedback
            item += '<div class="form-group form-control0 inline-block">'; //has-error has-feedback
            item += '<input type="text" contenteditable0 name="gapfield" placeholder=" " class="form-control gapfield single-line" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '" value="' + default_value + '"></input>';
            //item += '<p contenteditable name="gapfield" placeholder=" " class="form-control gapfield single-line" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '"></p>';
            item += '<span class="glyphicon color-white form-control-feedback hidden"></span>'; //glyphicon-remove
            item += '</div>';
            item += '</div>';

            //item += '<div class="form-group">';
            item += ' ' + subquestion.suffix[0] + ' '; // add space
            item += ' ';
            //item += '</div>';

            item += '</div>';

            //$row2.append(item);

            $row1.append(item);
            //}

            //$row1.append($row2);
        });


        //
        $form.append($row1);
        $question.append($form);
        $('#questions').append($question);

        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);
    });

    /*
    	$('[name=gapfield]').on('input', function(event) {
        	
    		// $('[name=gapfield]').each(function (index, input) {
    	    	
    		// 	// clear all styles
    	 //    	var div = $(this).parent();
    	 //    	var span = $(this).siblings( ".glyphicon" );

    	 //    	$(this).removeClass("btn-danger btn-warning btn-success");
    	 //    	div.removeClass("has-feedback has-error has-warning has-success");
    	 //    	span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
    	 //  	});
    		

    		var div = $(this).parent();
        	var span = $(this).siblings( ".glyphicon" );

        	$(this).removeClass("btn-danger btn-warning btn-success");
        	div.removeClass("has-feedback has-error has-warning has-success");
        	span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
      	})
    */

	//Initialize AutoSizeInput Plugin and default width of input field
    $('input[type="text"]').autosizeInput().each(function(index)
	{
		var tmp = this.value;

		$(this).val('.').change().val(tmp).change();
	});

    $("[name=gapfield]").keypress(function(e) { //keypress

        if (gameMode == "test_mode") {
            updateRemainingQuestions();
        } else {
            if (e.keyCode == 13) {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (gameMode == "learn_mode") {
                    onCheckPageAnswer();
                }
                return false;
            }
        }


        $('#checkAnswerButton').removeClass('disabled');
        //$('#showAnwsersButton').addClass('disabled');
    });


    $("[name=gapfield]").keyup(function(e) { //keypress

        if (gameMode == "test_mode") {
            updateRemainingQuestions();
        } else {
            if (e.keyCode == 13) {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (gameMode == "learn_mode") {
                    onCheckPageAnswer();
                }
                return false;
            }
        }


        $('#checkAnswerButton').removeClass('disabled');
        //$('#showAnwsersButton').addClass('disabled');
    });

    $('[name=gapfield]').focus(function() {
        //focus++;
        //$( "#focus-count" ).text( "focusout fired: " + focus + "x" );
        var div = $(this).parent();
        var span = $(this).siblings(".glyphicon");

        $(this).removeClass("btn-danger btn-warning btn-success");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

    });

    $('[name=gapfield]').focusout(function() {
        //focus++;
        //$( "#focus-count" ).text( "focusout fired: " + focus + "x" );
        //onCheckPageAnswer();

        if (gameMode == "test_mode") {
            updateRemainingQuestions();
        }
    })


    ///////////////
    //
    updateRemainingQuestions();

    addAudioSupport();
}



function onShowAnswers(show) {

	var $showAnwsersButton = $('#showAnwsersButton:visible');

	if ($showAnwsersButton.length == 1 && $showAnwsersButton.hasClass('disabled'))
	{
		return ;
	}

    debug.log('onShowAnswers')

    $('.gapfield-wrapper').toggleClass('hidden');
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


    return;
}


//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {

    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    debug.log('onCheckPageAnswer');


    /*if(getMode() == "learn_mode") {
        var total = getTotalQuestionsCount();
        var remaining = getRemainingQuestionsCount();
        var answered = total - remaining;

        if(answered == 0) {
            BootstrapDialog.show({
                title: '',
                closable: true,
                message: 'You must attempt the questions before you can check your answers',
                cssClass: 'check-answers-warning-dialog'
            });
        }
    }*/


    var unanwsered_questions = 0;

    $('[name=gapfield]').each(function(index, input) {

        if ($(this).hasClass('locked')) {
            return;
        }

        //$(this).attr('disabled', 'disabled');

        var val = $(this).val();
        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');
        var model_answers = questionsArray[question_index].subquestions[sub_question_index].answer[0];

        var model_val = model_answers.split("|");
        for (var i = 0; i < model_val.length; i++) {
            model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
        }

        val = val.replace(/[”“]/g, "\"").replace(/[‘’]/g, "'");

        var vals = [];

        debug.log('val :', val)
        debug.log('model_val :', model_val)



        var div = $(this).parent();
        var span = $(this).siblings(".glyphicon");

        $(this).removeClass("btn-danger btn-warning btn-success btn-info");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

        var div_classes = "";
        var span_classes = "";
        var this_classes = "";
		var span_sr_only_text = '';

        //console.log(val);

        if (val == "") {
            //div_classes += "has-warning";
            span_classes += "hidden";
            //this_classes += "btn-warning";

            unanwsered_questions++;
        } else {
            if ($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) {
                div_classes += "has-feedback has-success";
                span_classes += "glyphicon-ok";
                this_classes += "btn-success locked";
				span_sr_only_text = 'Correct';

                // if instant feedback
                $(this).attr('disabled', 'disabled');
                $(this).removeAttr('contenteditable');
            } else {
                div_classes += "has-feedback has-error";
                span_classes += "glyphicon-remove";
                this_classes += "btn-danger";
				span_sr_only_text = 'Incorrect';
            }
        }
        /*
    	else if(val == model_val)
    	{
    		div_classes += "has-success";
    		span_classes += "glyphicon-ok";
    		this_classes += "btn-success";
    	}
    	else
    	{
    		div_classes += "has-error";
    		span_classes += "glyphicon-remove";
    		this_classes += "btn-danger";
    	}
    	*/


        vals.push(val);

        //
        questionsArray[question_index].subquestions[sub_question_index].leanerResponse = vals;
        questionsArray[question_index].subquestions[sub_question_index].isCorrect = true;

        if (showFeedback == true) {
            $(this).addClass(this_classes);
            div.addClass(div_classes);
            span.addClass(span_classes);
			span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
        }

    });

    debug.log("unanwsered_questions = " + unanwsered_questions)

    //
    updateRemainingQuestions();

    //
    $('#checkAnswerButton').addClass('disabled');
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
                $('.has-error').removeClass('has-feedback has-error');
                $('.btn-danger').removeClass('btn-danger'); //.addClass('disabled');
                $('.glyphicon-remove').removeClass('glyphicon-remove').addClass('hidden').html('');
            }

            , 1000);
    } else if (gameMode == "test_mode") {
        //destroy
        //$('[name=gapfield-list]').addClass('ui-state-disabled');
        //$( ".option-pool-list, .gapfield-list" ).sortable( "destroy" );
    }

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

            var val = subquestion.leanerResponse[0];
            var model_answers = subquestion.answer[0];

            var model_val = model_answers.split("|");
            for (var i = 0; i < model_val.length; i++) {
                model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
            }

            //val = val.replace(/[”“]/g, "\"").replace(/[‘’]/g, "'");


            text += subquestion.prefix[0] + " ____ " + subquestion.suffix[0];
            leanerResponse.push(subquestion.leanerResponse);
            correctAnswer.push(subquestion.answer); //[0];
            isCorrect = subquestion.isCorrect;

            for (var i = 0; i < subquestion.answer.length; i++) {
                subquestion.answer[i] = $.trim(subquestion.answer[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
                subquestion.leanerResponse[i] = $.trim(subquestion.leanerResponse[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));

                //if(subquestion.answer[i] == subquestion.leanerResponse[i] || gameNoCorrectAnswers)
                if ($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) {
                    //
                    qPoints++;
                }

                qTotal++;
            }



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
    /*
	$('[name=gapfield-list]').each(function (index, input) {

		//$(this).attr('disabled', 'disabled');
		$(this).sortable( "disable" );

	});
	*/

    //destroy
    $('[name=gapfield]').each(function(index, input) {
        var contenteditable = $(this).prop('contenteditable');
        if (typeof contenteditable === 'undefined' || contenteditable == false) {
            // ...
            return;
        }

        $(this).attr('disabled', 'disabled');
        $(this).removeAttr('contenteditable');
    });

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


(function($) {

    $.fn.autoGrowInput = function(o) {

        o = $.extend({
            maxWidth: 1000,
            minWidth: 0,
            comfortZone: 70
        }, o);

        this.filter('input:text').each(function() {

            var minWidth = o.minWidth || $(this).width(),
                val = '',
                input = $(this),
                testSubject = $('<tester/>').css({
                    position: 'absolute',
                    top: -9999,
                    left: -9999,
                    width: 'auto',
                    fontSize: input.css('fontSize'),
                    fontFamily: input.css('fontFamily'),
                    fontWeight: input.css('fontWeight'),
                    letterSpacing: input.css('letterSpacing'),
                    whiteSpace: 'nowrap'
                }),
                check = function() {

                    if (val === (val = input.val())) {
                        return;
                    }

                    // Enter new content into testSubject
                    var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, ' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    testSubject.html(escaped);

                    // Calculate new width + whether to change
                    var testerWidth = testSubject.width(),
                        newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                        currentWidth = input.width(),
                        isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth) || (newWidth > minWidth && newWidth < o.maxWidth);

                    // Animate width
                    if (isValidWidthChange) {
                        input.width(newWidth);
                    }

                };

            testSubject.insertAfter(input);

            $(this).bind('keyup keydown blur update', check);

        });

        return this;

    };

})(jQuery);