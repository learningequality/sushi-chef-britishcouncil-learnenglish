var questionsArray = [];
var pages = [];

var sample = null; //[{"question":"Shop assistant","question_audio":"","answers":["Can I help you?","What size do you want?","Is it OK?","Would you like to pay with credit card or with cash?"],"answers_audio":[null,null,null,null],"leanerResponse":["Would you like to pay with credit card or with cash?","Is it OK?"],"isCorrect":true},{"question":"Customer","question_audio":"","answers":["Yes, have you got this T-Shirt in other colours?","And in purple?","Can I try it on?"],"answers_audio":[null,null,null],"leanerResponse":["Yes, have you got this T-Shirt in other colours?"],"isCorrect":true}];

gameDisplayOptions = 1;

var isUseSelectAndDrop = true;
var selectAndDropManager = null;

$(document).ready(function() {
    entryPoint();
});

//Game-specific initialization
function init() {
    //
    questionsArray = [];


    $(gameXMLDOM).find('MultipleAnswerQuestionItem').each(function(qIndex, question) {
        var answers = [];
        var answers_audio = [];

        $(question).find('Answer').each(function(aIndex, answer) {
            answers.push($.trim($(answer).text()));
            answers_audio.push($(answer).attr('url'));

        });
        questionsArray.push({
            'question': $.trim($(question).find('Question').text()),
            'question_audio': $(question).find('Audio').find('URL').text(),
            'answers': answers,
            'answers_audio': answers_audio
        });
    });

}



//Game-specific reset procedure
function reset() {

    // make object pool list
    //$('#ajax-cont').empty();
    $('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div>');
    $('#ajax-cont').append('<div id="questions" class="row show-grid0"></div>');


    //debug.log(questionsArray);

    var $option_pool_panel = $('<div class="panel panel-default"></div>');
    var $option_pool_panel_body = $('<div class="panel-body"></div>');
    var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');


    var len = questionsArray.length;
    var shuffled_arr = generateShuffledIndexArray(len);

    $.each(questionsArray, function(pIndex, question) {

        var $question = $('<div class="question" id="' + pIndex + '"></div>'); //col-xs-12 col-sm-6 col-md-4 col-lg-3

        var $row1 = $('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>'); // var $row1 = $('<div class="col-sm-6 col-md-4"></div>');
        var $row2 = $('<div class="panel panel-default main-group-container"></div>');

        //var $question = $('<div class="panel panel-default"></div>');
        //var $form = $('<form class="form" role="form"></form>');
        //var $row1 = $('<div class="row form-inline"></row>');

        var q = (pIndex + 1) + '';

        //var audio_item = '<div class="form-group">';
        var question_audio_item = createSimpleAudioButton(question.question_audio);
        var answer_audio_item = '';

		var question_number = '';

		if (gameShowQuestionNo === "true" && questionsArray.length > 1)
		{
			question_number = q + '. ';
		}

        //audio_item += '</div>';
        /*
        		var audio = 'http://authtool2.monilab.net/exact-lcms/ExactLCMS/LO13/81930CD0CB399201B8BE5833B07/elem1_5.1.2c.mp3'; //getAudio();
        		var audio_item = '';
        		if (audio !== undefined && audio !== '' ) {
        		 	audio_item = getAudioCode(audio, true);
        		}
        */

        //$form.append(audio_item);

        //var $group_panel = $('<div class="panel panel-default"></div>');
        //var $group_panel_body = $('<div class="panel-body"></div>');
        //var $group_list = $('<ul id="sortable2" class="list-group"></ul>');


        var dummy_item = '<div class="model-wrapper hidden">';


        for (var i = 0; i < question.answers.length; i++) {
            //dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            //dummy_item += '<span class="glyphicon pull-right"></span>' + answer_audio_item + question.answers[0];
            //dummy_item += '</li>';

            answer_audio_item = createSimpleAudioButton(question.answers_audio[i]);

            dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            dummy_item += '<span class="glyphicon pull-right"></span>' + answer_audio_item + question.answers[i];
            dummy_item += '</li>';
        }




        dummy_item += '</div>';

        var item = '';

        item += dummy_item;

        item += '<div class="panel-heading form-group gapfield-list-container-heading">';
        item += question_number + question_audio_item + '<span class="text-question">' + question.question + '</span>';
        item += '</div>';

        item += '<div class="panel-body form-group gapfield-list-container-body">';
        item += '<ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '">'; //

        //item += '<li class="list-group-item btn btn-warning">';
        //item += '<span class="glyphicon glyphicon-ok form-control-feedback"></span> awd awd awd awd awrfa fawf afawf awf'; // glyphicon-ok form-control-feedback
        //item += '</li>';

        /*if(sample) {
            if(sample[pIndex].leanerResponse && sample[pIndex].leanerResponse != "") {
                // since it is already used, do not add it to the pool

                var answer_audio_item = createSimpleAudioButton(questionsArray[pIndex].answers_audio[0]);

                item += '<li class="list-group-item btn btn-default" data-question-index="' + pIndex + '">'; // btn-success
                item += '<span class="glyphicon pull-right"></span>' + answer_audio_item + sample[pIndex].leanerResponse; // glyphicon-ok form-control-feedback
                item += '</li>';
            }
            else
            {
                
            }
        }*/

        if(sample) {
            if(sample[pIndex].leanerResponse && sample[pIndex].leanerResponse != "") {
                // since it is already used, do not add it to the pool

                
                for (var k = 0; k < sample[pIndex].leanerResponse.length; k++) {
                    //sample[pIndex].leanerResponse[k]

                    var answer_audio_item = createSimpleAudioButton(questionsArray[pIndex].answers_audio[k]);

                    item += '<li tabindex="0" class="list-group-item btn btn-default" data-question-index="' + pIndex + '">'; // btn-success
                    item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + sample[pIndex].leanerResponse[k]; // glyphicon-ok form-control-feedback
                    item += '</li>';
                }
                
            }
            else
            {
                
            }
        }


        item += '</ul>';
        item += '</div>';
        /*
				item += '<div class="form-group">';
				item += "footer";
				item += '</div>';
				*/


        //$row2.append(item);

        $row1.append($row2);
        $row2.append(item);



        //
        //$form.append($row1);
        //$question_wrapper.append($question);
        //$('#questions').append($question_wrapper);

        $question.append($row1);
        $('#questions').append($question);

        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);
    });


    //var len = question.answers.length;
    //var shuffled_arr = generateShuffledIndexArray(len);


    var tmpArr = [];
    for (var i = 0; i < questionsArray.length; i++) {
        //var shuffled_index = shuffled_arr[i];

        //var sub_len = questionsArray[shuffled_index].answers.length;
        //var sub_shuffled_arr = generateShuffledIndexArray(sub_len);

        for (var k = 0; k < questionsArray[i].answers.length; k++) {
            //var sub_shuffled_index = sub_shuffled_arr[k];

            //questionsArray[i].answers[k];


            tmpArr.push({
                "questionIndex": i,
                "answerIndex": k
            });
        }

        //console.log(tmpArr);
    }

    var len = questionsArray.length;
    var skip_arr = [];
    for (var i = 0; i < len; i++) {
        if(sample && sample[i].leanerResponse[0] && sample[i].leanerResponse[0] != "") {
            //skip_arr.push(sample[i].leanerResponse[0]);
            skip_arr = skip_arr.concat(sample[i].leanerResponse);
        }
        else
        {
            
        }
    }

    var len = tmpArr.length;
    var shuffled_arr = generateShuffledIndexArray(len);

    for (var i = 0; i < len; i++) {
        //var shuffled_index = shuffled_arr[i];
        var shuffled_index = shuffled_arr[i];

        var questionIndex = tmpArr[shuffled_index].questionIndex;
        var answerIndex = tmpArr[shuffled_index].answerIndex;

        if($.inArray($.trim(questionsArray[questionIndex].answers[answerIndex]), skip_arr) > -1) {
            // since it is already used, do not add it to the pool
        }
        else
        {
            var answer_audio_item = createSimpleAudioButton(questionsArray[questionIndex].answers_audio[answerIndex]);

            var answer_item = '';
            //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
            answer_item += '<li tabindex="0" class="list-group-item btn btn-default" data-question-index="' + questionIndex + '">'; // btn-success
            //answer_item += '<div class="row">';
            //answer_item += '<div class="col-ls-2">';
            //answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
            //answer_item += '</div>';
            //answer_item += '<div class="col-ls-10">';
            answer_item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + questionsArray[questionIndex].answers[answerIndex]; //question.answers[shuffled_index]; // glyphicon-ok form-control-feedback
            //answer_item += '</div>';
            //answer_item += '</div>';
            answer_item += '</li>';
            $option_pool_list.append(answer_item);
        }
    }




    $option_pool_panel_body.append($option_pool_list);
    $option_pool_panel.append($option_pool_panel_body);

    $('#cardPile0').append($option_pool_panel);


    //
	
	if (isUseSelectAndDrop)
	{
		selectAndDropManager = addSelectAndDropSupport();
		selectAndDropManager.addDroppable("div.main-group-container");
		selectAndDropManager.setExtraGapFieldHintSelector('div.gapfield-list-container-heading');
		selectAndDropManager.setCustomGapFieldHintClass('gapfield-hint-grouping');
	}
	else
	{
		addDragAndDropSupport();
		//limitDragAndDropToOneItem();
		//allow to drop on parent
		$('.main-group-container').droppable({
			accept: '.ui-sortable li',
			drop: function(event, ui) {
				ui.draggable.clone().attr("style", "").appendTo($(this).find("ul"));
				ui.draggable.remove();
			}
		});
	}

    updateRemainingQuestions();

    addAudioSupport();
}




function onShowAnswers(show) {
    debug.log('onShowAnswers')


    $('.question').each(function(index, input) {
        var strDiv1Cont = $(this).find('.model-wrapper').wrap('<p/>') /*.parent()*/ .html();
        var strDiv2Cont = $(this).find('.gapfield-list').wrap('<p/>') /*.parent()*/ .html();

        $(this).find('.model-wrapper').unwrap();
        $(this).find('.gapfield-list').unwrap();


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
        $(this).find('.gapfield-list').html(strDiv1Cont);
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
}


//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {

    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    //debug.log('onCheckPageAnswer')
    var unanwsered_questions = 0;

    $('[name=gapfield-list]').each(function(index, input) {

        //$(this).attr('disabled', 'disabled');
        //$(this).sortable( "disable" );

        // check # of li in list
        var list_item_count = $(this).children('li').length;
        if (list_item_count < 1) {
            // create a new list item here !!!!!
            var dummy_item = '';
            dummy_item += '<li class="list-group-item btn btn-default" data-dummy-item="true">';
            dummy_item += '<span class="glyphicon pull-left"></span> &nbsp;'; // glyphicon-ok form-control-feedback
            dummy_item += '</li>';

            // append to the list
            //$(this).append(dummy_item);
        }

        var list_items = $(this).children('li');
        //debug.log(list_items[0]);

        //var val =  list_item.text(); //$(this).val();
        var question_index = $(this).data('question-index');
        //var sub_question_index = $(this).data('sub-question-index');
        var model_val = questionsArray[question_index].answers; // is array

        /*
            	var model_val = model_answers.split("|");
        		for (var i = 0; i < model_val.length; i++) {
        			model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
        		}

        		val = val.replace(/[”“]/g, "\"").replace(/[‘’]/g, "'");
        */
        var vals = [];


        for (var i = 0; i < list_item_count; i++) {

            var val = getObjectText($(list_items[i]));

            //debug.log('val : "' + val + '"')
            //debug.log('model_val :', model_val)

            var div = $(this).parent();
            var span = $(list_items[i]).children(".glyphicon"); //$(this).siblings( ".glyphicon" );

            $(list_items[i]).removeClass("btn-danger btn-warning btn-success btn-info");
            div.removeClass("has-feedback has-error has-warning has-success");
            span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok glyphicon-hand-down");

            var div_classes = "has-feedback ";
            var span_classes = "";
            var this_classes = "";
			var span_sr_only_text = "";

            //if($.trim(val) == $.trim(model_val[i]) || gameNoCorrectAnswers)
            if ($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) {
                div_classes += "has-success";
                span_classes += "glyphicon-ok";
                this_classes += "btn-success ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Correct';
            } else {
                div_classes += "has-error";
                span_classes += "glyphicon-remove";
                this_classes += "btn-danger ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Incorrect';
            }

            //
            vals.push(val);
            //corrects.push()

            if (showFeedback == true) {
                $(list_items[i]).addClass(this_classes);
                div.addClass(div_classes);
                span.addClass(span_classes);
				span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
            }
        }

        questionsArray[question_index].leanerResponse = vals;
        questionsArray[question_index].isCorrect = true;


    });

    //if instant feedback
    if (gameMode == "learn_mode") {
        setTimeout(
            function() {
//                $('.btn-danger').parent().sortable("enable");
                $('#main_list').append($('.btn-danger')); // add all wrong items back to the main_list
                $('#main_list li').removeClass('btn-danger btn-warning btn-success btn-info disabled ui-state-disabled');
                $('#main_list li span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok').html('');//.addClass('glyphicon-hand-down');
                $('#main_list li .pull-right').addClass('glyphicon-hand-down');
				
				if (!isUseSelectAndDrop)
				{
					$('.btn-danger').parent().sortable("enable");
				}
				else
				{
					selectAndDropManager.enableInput();	
				}
				
            }, 1000);
			
		if (isUseSelectAndDrop)
		{
			if ($('.btn-danger').length == 0)
			{
				selectAndDropManager.enableInput();
			}
		}

    } else if (gameMode == "test_mode") {
        //destroy
//        $(".option-pool-list, .gapfield-list").sortable("disable");
        //$( ".option-pool-list, .gapfield-list" ).sortable( "destroy" );
		
		if (!isUseSelectAndDrop)
		{
			$(".option-pool-list, .gapfield-list").sortable("disable");
		}
		else
		{
			selectAndDropManager.setDisabled(true);
		}
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
        text = question.question;
        leanerResponse = question.leanerResponse;
        correctAnswer = question.answers;
        isCorrect = question.isCorrect;

        qPoints = 0;
        qTotal = 0;


        for (var i = 0; i < question.answers.length; i++) {
            //if(question.answers[i] == question.leanerResponse[i])
            if ($.inArray(question.answers[i], question.leanerResponse) > -1 || gameNoCorrectAnswers) {
                //
                qPoints++;
            }

            qTotal++;
        }

        questions.push(text);
        answers.push(leanerResponse);
        corrects.push(correctAnswer);

        points.push(qPoints);
        totals.push(qTotal);

        gamePoints += qPoints;
        gameTotal += qTotal;

    });
    //destroy
    $('[name=gapfield-list]').each(function(index, input) {

        //$(this).attr('disabled', 'disabled');
        $(this).sortable("disable");

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