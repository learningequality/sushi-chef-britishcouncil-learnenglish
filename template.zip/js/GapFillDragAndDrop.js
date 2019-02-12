var questionsArray = [];
var pages = [];

var sample = null; //[{"subquestions":[{"prefix":["Name:"],"answer":["Paul"],"suffix":[""],"userAnswer":"","leanerResponse":["Paul"],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Surname:"],"answer":["Bevan"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Family:"],"answer":["single"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Age:"],"answer":["29"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Phone number:"],"answer":["498 2315"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Email address:"],"answer":["paul.bevan@email.com"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Job:"],"answer":["teacher"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Country:"],"answer":["United Kingdom"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""},{"subquestions":[{"prefix":["Hobbies:"],"answer":["soccer, tennis"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"isCorrect":true}],"question_audio":""}];

var isUseSelectAndDrop = true;
var selectAndDropManager = null;

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
            answersArray.push($(subquestion).find('Answer').text().replace(/\<br \/\>/g, '').replace(/\[NL\]|\n/g, '<br />'));
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

    // make object pool list
    //$('#ajax-cont').empty();
    $('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div>');
    $('#ajax-cont').append('<div id="questions"></div>');


    debug.log(questionsArray);

    var $option_pool_panel = $('<div class="panel panel-default"></div>');
    var $option_pool_panel_body = $('<div class="panel-body"></div>');
    var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');

    var len = questionsArray.length;
    var shuffled_arr = generateShuffledIndexArray(len);

    $.each(questionsArray, function(pIndex, question) {

        var $question = $('<div class="question" id="' + pIndex + '"></div>');
        var $form = $('<form class="form-inline" role="form"></form>');
        var $row1 = $('<div class="row0"></row>');

        var q = (pIndex + 1) + '';


        var question_number = '';
        if (gameShowQuestionNo === "true" && questionsArray.length > 1) {
            question_number = (pIndex + 1) + '. ';
        }

        var question_audio_item = createSimpleAudioButton(question.question_audio);

        //
        $row1.append(question_number + question_audio_item);

        //var $group_panel = $('<div class="panel panel-default"></div>');
        //var $group_panel_body = $('<div class="panel-body"></div>');
        //var $group_list = $('<ul id="sortable2" class="list-group"></ul>');

        var sub_len = question.subquestions.length;
        var sub_shuffled_arr = generateShuffledIndexArray(sub_len);

        for (var i = 0; i < sub_len; i++) {
            //var shuffled_index = shuffled_arr[pIndex];
            //var sub_shuffled_index = sub_shuffled_arr[i];

            //$.each(question.subquestions, function (index, subquestion) {

            //var $row2 = $('<div class="row"></row>');

            //for (var i = 0; i < subquestion.prefix.length; i++) {

            var dummy_item = '<div class="inline-block model-wrapper hidden">';
            dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            dummy_item += '<span class="glyphicon pull-right"></span>' + question.subquestions[i].answer[0];
            dummy_item += '</li>';
            dummy_item += '</div>';

            var item = '';
            //item += dummy_item;

            item += '<div class="subquestion inline">'; // inline OR block ?????
            item += question.subquestions[i].prefix[0] + ' '; // add space
            //item += '</div>';

            item += dummy_item;


            var default_value = "";
            if(sample){

                //console.log(sample);
                //var sampleArray = JSON.parse( sample );
                //console.log(sampleArray);
                default_value = sample[pIndex].subquestions[i].leanerResponse;
                //default_index = sample[pIndex].subquestions[index].leanerResponseIndexes;
            }


            item += '<div class="panel panel-default form-group inline-block">';
            item += '<ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '" data-sub-question-index="' + i + '">'; //


            if(sample && sample[pIndex].subquestions[i].leanerResponse && sample[pIndex].subquestions[i].leanerResponse != "") {
                // since it is already used, do not add it to the pool

                var answer_audio_item = ''; //createSimpleAudioButton(questionsArray[questionIndex].answers_audio[answerIndex]);

                item += '<li tabindex="0" class="list-group-item btn btn-primary">'; // btn-success
                item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + sample[pIndex].subquestions[i].leanerResponse; // glyphicon-ok form-control-feedback
                item += '</li>';
            }
            else
            {
                
            }




            

            item += '</ul>';
            item += '</div>';

            //item += '<div class="form-group">';
            item += ' ' + question.subquestions[i].suffix[0] + ' '; // add space
            //item += '</div>';

            item += '</div>';

            /*
            				var answer_item = '';
            				//answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
            				answer_item += '<li class="list-group-item btn btn-primary">'; // btn-success
                			//answer_item += '<div class="row">';
                    		//answer_item += '<div class="col-ls-2">';
                        	//answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
                    		//answer_item += '</div>';
                    		//answer_item += '<div class="col-ls-10">';
                        	answer_item += '<span class="glyphicon pull-right"></span>' + questionsArray[shuffled_index].subquestions[sub_shuffled_index].answer[0]; // glyphicon-ok form-control-feedback
                    		//answer_item += '</div>';
                			//answer_item += '</div>';
              				answer_item += '</li>';
            				$option_pool_list.append(answer_item);*/

            //$row2.append(item);

            $row1.append(item);
            //}

            //$row1.append($row2);
            //});
        }



        //
        $form.append($row1);
        $question.append($form);


        //$question.append($row1);
        $('#questions').append($question);


        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);
    });


    //
    var tmpArr = [];
    for (var i = 0; i < questionsArray.length; i++) {
        for (var k = 0; k < questionsArray[i].subquestions.length; k++) {
            if(sample && sample[i].subquestions[k].leanerResponse && sample[i].subquestions[k].leanerResponse != "") {
                // since it is already used, do not add it to the pool
            }
            else
            {
                tmpArr.push({
                    "questionIndex": i,
                    "subquestionIndex": k
                });
            }
        }
    }

    var len = tmpArr.length;
    var shuffled_arr = generateShuffledIndexArray(len);

    for (var i = 0; i < len; i++) {
        //var shuffled_index = shuffled_arr[i];
        var shuffled_index = shuffled_arr[i];

        var questionIndex = tmpArr[shuffled_index].questionIndex;
        var subquestionIndex = tmpArr[shuffled_index].subquestionIndex;

        var answer_audio_item = ''; //createSimpleAudioButton(questionsArray[questionIndex].answers_audio[answerIndex]);

        var answer_item = '';
        //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
        answer_item += '<li tabindex="0" class="list-group-item btn btn-primary">'; // btn-success
        answer_item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + questionsArray[questionIndex].subquestions[subquestionIndex].answer[0]; // glyphicon-ok form-control-feedback
        answer_item += '</li>';
        $option_pool_list.append(answer_item);

    }



    $option_pool_panel_body.append($option_pool_list);
    $option_pool_panel.append($option_pool_panel_body);

    $('#cardPile0').append($option_pool_panel);
	
//	addDragAndDropSupport();
//	limitDragAndDropToOneItem();

	if (isUseSelectAndDrop)
	{
		selectAndDropManager = addSelectAndDropSupport();
		selectAndDropManager.limitDropToOneItem();
	}
	else
	{
		addDragAndDropSupport();
		limitDragAndDropToOneItem();
	}

    $('[name=gapfield]').on('input', function(event) {

        $('[name=gapfield]').each(function(index, input) {

            // clear all styles
            var div = $(this).parent();
            var span = $(this).siblings(".glyphicon");

            $(this).removeClass("btn-danger btn-warning btn-success");
            div.removeClass("has-feedback has-error has-warning has-success");
            span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
        });

    })


    updateRemainingQuestions();

    addAudioSupport();
	
	if (isUseSelectAndDrop)
	{
		return ;
	}

    $('.ui-sortable li').focus(function() {
       $(this).addClass("ui-selecting");
    }); 
    $('.ui-sortable li').focusout(function() {
       $(this).removeClass("ui-selecting");
    }); 

    $(".ui-sortable li").bind('keydown', function(e) {

        if(e.which == 38) // move down
        {
            e.preventDefault();
            
            return false;
        }
        else if(e.which == 40) // move up
        {
            e.preventDefault();
            
            return false;
        }
    });
}

function onShowAnswers(show) {
    debug.log('onShowAnswers')


    $('.question .subquestion').each(function(index, input) {
        var strDiv1Cont = $(this).find('.model-wrapper li').wrap('<p/>').parent().html();
        var strDiv2Cont = $(this).find('.gapfield-list li').wrap('<p/>').parent().html();

        $(this).find('.model-wrapper li').unwrap();
        $(this).find('.gapfield-list li').unwrap();


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

    debug.log('onCheckPageAnswer')
    var unanwsered_questions = 0;

    $('[name=gapfield-list]') /*.not('.disabled')*/ .each(function(index, input) {

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

        var list_item = $(this).find("li").eq(0);

        var val = getObjectText(list_item);
        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');
        var model_answers = questionsArray[question_index].subquestions[sub_question_index].answer[0];


        var model_val = model_answers.split("|");
        for (var i = 0; i < model_val.length; i++) {
            model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
        }

        val = val.replace(/[”“]/g, "\"").replace(/[‘’]/g, "'");


        var vals = [];

        debug.log('val : "' + val + '"')
        debug.log('model_val :', model_val)
            /*
                	var contenteditable = $(this).prop('contenteditable');
            		if (typeof contenteditable === 'undefined' || contenteditable == false) {
            		    // ...
            		    return;
            		}

                	$(this).removeAttr('contenteditable');
             */

        var div = $(this).parent();
        var span = list_item.children(".glyphicon"); //$(this).siblings( ".glyphicon" );

        list_item.removeClass("btn-danger btn-warning btn-success btn-info");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok glyphicon-hand-down");

        var div_classes = "has-feedback ";
        var span_classes = "";
        var this_classes = "";
		var span_sr_only_text = '';

        if (val == "" || $(list_item).data('dummy-item') == true) {
            div_classes += "has-warning";
            span_classes += "glyphicon-warning-sign";
            this_classes += "btn-warning";

            unanwsered_questions++;
        } else {
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
        }

        vals.push(val);

        //
        questionsArray[question_index].subquestions[sub_question_index].leanerResponse = vals;
        questionsArray[question_index].subquestions[sub_question_index].isCorrect = true;


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

        if (showFeedback == true) {
            list_item.addClass(this_classes);
            div.addClass(div_classes);
            span.addClass(span_classes);
			span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
        }


    });

    //if instant feedback
    if (gameMode == "learn_mode") {
        setTimeout(
            function() {
//				$('.btn-danger').parent().sortable("enable");
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


            for (var i = 0; i < subquestion.answer.length; i++) {

                subquestion.answer[i] = $.trim(subquestion.answer[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
                subquestion.leanerResponse[i] = $.trim(subquestion.leanerResponse[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));

                if (subquestion.answer[i] == subquestion.leanerResponse[i] || gameNoCorrectAnswers) {
                    //
                    qPoints++;
                }

                qTotal++;
            }


            if (isCorrect) {
                //qPoints ++;
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