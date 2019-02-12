var questionsArray = [];
var pages = [];

var sample = null; //[{"question":"Arrive at the airport.Go to the checking-in desk.Go through immigration.Wait at the boarding gate.Board the plane.The plane takes off.","question_audio":"","answers":["Go to the checking-in desk.","Go through immigration.","Wait at the boarding gate.","Board the plane.","The plane takes off."],"firstItem":"Arrive at the airport.","leanerResponse":["Board the plane.","Go through immigration.","Wait at the boarding gate.","Go to the checking-in desk.","The plane takes off."],"isCorrect":true}]; 

var isUseSelectAndExchange = true;
var $selectedOption = null;

var isOptionChanged = false;

$(document).ready(function() {
    entryPoint();
});

//Game-specific initialization
function init() {
    //
    questionsArray = [];

    $(gameXMLDOM).find('OrderedQuestionItems').each(function(qIndex, question) {

        var lock_first_item = $(question).attr("LockFirstItem");
        if(lock_first_item == "Yes") {
            lock_first_item = true;
        }
        else {
            lock_first_item = false;
        }

        if (use_dummy_media) {
            lock_first_item = true;
        }

        var answers = [];

        $(question).find('OrderedQuestionItem').each(function(aIndex, item) {
            answers.push($(item).text());
        });

        var first_item = null;

        if(lock_first_item) {
            first_item = answers.splice(0, 1)[0];
        }

        questionsArray.push({
            'question': $(question).find('OrderedQuestionItem').text(),
            'question_audio': $(question).find('Audio').find('URL').text(),
            'answers': answers,
            'firstItem': first_item
        });
    });
}



//Game-specific reset procedure
function reset() {

    // make object pool list
    //$('#ajax-cont').empty();
    $('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div>');
    $('#ajax-cont').append('<div id="questions"></div>');


    //console.log(questionsArray);

    //var $option_pool_panel = $('<div class="panel panel-default"></div>');
    //var $option_pool_panel_body = $('<div class="panel-body"></div>');
    //var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');

    $.each(questionsArray, function(pIndex, question) {

        var $option_pool_panel = $('<div class="panel panel-default"></div>');
        var $option_pool_panel_body = $('<div class="panel-body"></div>');
        var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');

        var $question = $('<div class="question" id="' + pIndex + '"></div>');
        var $form = $('<form class="form" role="form"></form>');
        //var $row1 = $('<div class="row form-inline"></row>');

        var q = (pIndex + 1) + '';

        /*
        		var audio_item = '<div class="form-group">';
        		audio_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
        		audio_item += '</div>';
        		$form.append(audio_item);
        */

        //var $group_panel = $('<div class="panel panel-default"></div>');
        //var $group_panel_body = $('<div class="panel-body"></div>');
        //var $group_list = $('<ul id="sortable2" class="list-group"></ul>');

        var question_audio_item = createSimpleAudioButton(question.question_audio);

		var question_number = '';

		if (gameShowQuestionNo === "true" && questionsArray.length > 1)
		{
			question_number = q + '. ';
		}

        var item = '';

        //item += '<div class="form-group">';
        //item += question.question;
        //item += '</div>';

        item += question_number + question_audio_item;

        //item += '<div class="panel panel-default form-group">'; // remove this

        //if(question.answers.length > 0)
        //{

        if(question.firstItem && question.firstItem != "")
        {
            item += '<ul name="gapfield-list-locked" class="gapfield-list-locked list-group" data-question-index="' + pIndex + '">';
            item += '<li class="list-group-item btn btn-default disabled">'; // btn-success
            item += '<span class="glyphicon glyphicon-lock"></span><span class="sr-only">Item Locked</span>' + question.firstItem; // glyphicon-ok form-control-feedback
            item += '</li>';
            item += '</ul>';
        }
        //}


        //var dummy_item = '<div class="panel panel-default inline-block model-wrapper hidden0">'; // remove this
        var dummy_item = '<ul name="gapfield-list0" class="gapfield-list0 list-group gapfield-list-locked model-wrapper hidden" data-question-index="' + pIndex + '">'; //list-group for vertical, list-inline for horizontal




        item += '<ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '">'; //list-group for vertical, list-inline for horizontal

        //item += '<li class="list-group-item btn btn-warning">';
        //item += '<span class="glyphicon glyphicon-ok form-control-feedback"></span> awd awd awd awd awrfa fawf afawf awf'; // glyphicon-ok form-control-feedback
        //item += '</li>';

        // shuffle
        var len = question.answers.length;
        var shuffled_arr = generateShuffledIndexArray(len);
        for (var i = 0; i < len; i++) {

            /*
					if(i == 0)
					{
						item += '<li class="list-group-item btn btn-default disabled">'; // btn-success
						item += '<span class="glyphicon glyphicon-lock"></span> ' + question.answers[i]; // glyphicon-ok form-control-feedback
						item += '</li>';
					}
					else
					{
					*/


            dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            dummy_item += '<span class="glyphicon pull-right"></span>' + question.answers[i];
            dummy_item += '</li>';




            var shuffled_index = shuffled_arr[i];

            if(sample && sample[pIndex].leanerResponse != "") {
                //skip_arr.push(sample[i].leanerResponse[0]);
                //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
                item += '<li tabindex="0" class="list-group-item btn btn-default">'; // btn-success
                //answer_item += '<div class="row">';
                //answer_item += '<div class="col-ls-2">';
                //answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
                //answer_item += '</div>';
                //answer_item += '<div class="col-ls-10">';
                item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + sample[pIndex].leanerResponse[i]; // glyphicon-ok form-control-feedback
                //answer_item += '</div>';
                //answer_item += '</div>';
                item += '</li>';
                //$option_pool_list.append(answer_item);
            }
            else
            {
                //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
                item += '<li tabindex="0" class="list-group-item btn btn-default">'; // btn-success
                //answer_item += '<div class="row">';
                //answer_item += '<div class="col-ls-2">';
                //answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
                //answer_item += '</div>';
                //answer_item += '<div class="col-ls-10">';
                item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + question.answers[shuffled_index]; // glyphicon-ok form-control-feedback
                //answer_item += '</div>';
                //answer_item += '</div>';
                item += '</li>';
                //$option_pool_list.append(answer_item);
                
            }


            

            /*
					}
					*/

        }


        dummy_item += '</ul>';
        //dummy_item += '</div>'; // remove this

        item += '</ul>';
        //item += '</div>'; // remove this

        item += dummy_item;
        /*
				item += '<div class="form-group">';
				item += "footer";
				item += '</div>';
				*/


        //$row2.append(item);

        $form.append(item);




        /*

        		for (var i = 0; i < subquestion.prefix.length; i++) {

        				var item  = '';

        				item += '<div class="form-group">';
        				item += subquestion.prefix[i];
        				item += '</div>';

        				item += '<div class="form-group">';
        				item += '<ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">'; //
        				
        				//item += '<li class="list-group-item btn btn-warning">';
        				//item += '<span class="glyphicon glyphicon-ok form-control-feedback"></span> awd awd awd awd awrfa fawf afawf awf'; // glyphicon-ok form-control-feedback
        				//item += '</li>';

        				item += '</ul>';
        				item += '</div>';

        				item += '<div class="form-group">';
        				item += subquestion.suffix[i];
        				item += '</div>';

        				

        				//$row2.append(item);

        				$row1.append(item);
        			}

        */


        /*
        		$option_pool_panel_body.append($option_pool_list);
        		$option_pool_panel.append($option_pool_panel_body);

        		$question.append($option_pool_panel);
        */

        //
        //$form.append($row1);
        $question.append($form);
        $('#questions').append($question);


        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);

    });

	if (isUseSelectAndExchange)
	{
		$('ul.gapfield-list').addClass('ui-select-and-exchange');

		$('li', 'ul.gapfield-list').click(function()
		{
			if ($(this).hasClass('ui-state-disabled'))
			{
				return ;
			}

			var setThisAsSelectedOption = false;

			if ($selectedOption == null)
			{
				setThisAsSelectedOption = true;
			}
			else
			{
				if (!$selectedOption.is($(this)))
				{
					if ($(this).parent().is($selectedOption.parent()))
					{
						var a = $(this); b = $selectedOption;
						var tmp = $('<span>').hide();

						a.before(tmp);
						b.before(a);
						tmp.replaceWith(b);

						b.focus();
					}
					else
					{
						setThisAsSelectedOption = true;
					}
				}

				RemoveSelectedOption();
			}

			if (setThisAsSelectedOption)
			{
				$selectedOption = $(this);
				$selectedOption.addClass('btn-selected');
				$selectedOption.siblings().not('.ui-state-disabled').addClass('btn-exchangeable');
			}

			$('#checkAnswerButton').removeClass('disabled');
			isOptionChanged = true;

		}).keydown(function(e)
		{
			var key = e.which;

			if (key == 13 && $(this).is(e.target))
			{
				$(this).click();
			}
		});

		updateRemainingQuestions();
		addAudioSupport();

		return ;
	}

    $(".option-pool-list, .gapfield-list").sortable({
        connectWith: ".ui-sortable",
        cancel: ".ui-state-disabled",
        tolerance: 'pointer',
        items: ':not(.btn-success)',
        start: function(event, ui) {
            $('.gapfield-list .list-group-item').removeClass("btn-danger btn-warning btn-success0 btn-info");
            //div.removeClass("has-feedback has-error has-warning has-success");
            $('.gapfield-list .glyphicon').removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok0");


            $('.btn-success', this).each(function() {
                var $this = $(this);
                $this.data('pos', $this.index());
            });


            //
            //list_item.removeClass("btn-danger btn-warning btn-success btn-info");
            //div.removeClass("has-feedback has-error has-warning has-success");
            //span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
        },
        change: function() {
            $sortable = $(this);
            $statics = $('.btn-success', this).detach();
            $helper = $('<li></li>').prependTo(this);
            $statics.each(function() {
                var $this = $(this);
                var target = $this.data('pos');

                $this.insertAfter($('li', $sortable).eq(target));
            });
            $helper.remove();

            $('#checkAnswerButton').removeClass('disabled');
            //$('#showAnwsersButton').addClass('disabled');
        },
        stop: function(event, ui) {

            // if instant feedback
            if (gameMode == "learn_mode") {
                //onCheckPageAnswer(); // this game doesn't support this
            }

            //
            //updateRemainingQuestions();
        }
    });

    /*
    	$option_pool_panel_body.append($option_pool_list);
    	$option_pool_panel.append($option_pool_panel_body);

    	$('#cardPile0').append($option_pool_panel);


    	$( ".option-pool-list, .gapfield-list" ).sortable({
            connectWith: ".ui-sortable",
            tolerance: 'pointer'
          });
    */

    /*
    	$('.ui-sortable li').mousedown(function() {
    	    $('.ui-sortable').not($(this).parent()).each(function() {
    	        if ($(this).find('li').length >= 1) {
    	            if ($(this).attr('id') != "main_list" ) {
    	                $(this).sortable('disable');
    	            }
    	        }
    	    });
    	});

    	$('.ui-sortable li').mouseup(function() {
    	    $('.ui-sortable').each(function() {
    	        $(this).sortable('enable');
    	    });
    	});
    */


    //
    updateRemainingQuestions();

    addAudioSupport();
}

function RemoveSelectedOption()
{
	if ($selectedOption != null)
	{
		$selectedOption.siblings().removeClass('btn-exchangeable');

		$selectedOption.removeClass('btn-selected');
		$selectedOption = null;
	}
}

function onShowAnswers(show) {
    //console.log('onShowAnswers');

    $('[name=gapfield-list]').not('.gapfield-list-locked') /*.parent()*/ .toggleClass('hidden');
    $('.model-wrapper').toggleClass('hidden');

    return;
}


//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {

	if (sample == null && isUseSelectAndExchange && gameMode == 'learn_mode' && !isOptionChanged)
	{
		return ;
	}

    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    //console.log('onCheckPageAnswer')
    var unanwsered_questions = 0;

	var $gapfieldList;

	if (gameMode == "learn_mode")
	{
		$gapfieldList = $('[name=gapfield-list]:visible');
	}
	else
	{
		$gapfieldList = $('[name=gapfield-list]');
	}

    $gapfieldList.each(function(index, input) {

        //$(this).attr('disabled', 'disabled');
        //$(this).sortable( "disable" );

        // check # of li in list
        var list_item_count = $(this).children('li').length;
        var list_item_correct = 0;


        var list_items = $(this).children('li');
        //console.log(list_items[0]);


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

            //console.log('val : "' + val + '"')
            //console.log('model_val :', model_val[i])

            var div = $(this).parent();
            var span = $(list_items[i]).children(".glyphicon"); //$(this).siblings( ".glyphicon" );

            $(list_items[i]).removeClass("btn-danger btn-warning btn-success btn-info");
            div.removeClass("has-feedback has-error has-warning has-success");
            span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok glyphicon-hand-down");

            var div_classes = "has-feedback ";
            var span_classes = "";
            var this_classes = "";
			var span_sr_only_text = "";
            if ($.trim(val) == $.trim(model_val[i]) || gameNoCorrectAnswers) {
                div_classes += "has-success";
                span_classes += "glyphicon-ok";
                this_classes += "btn-success ui-state-disabled";
				span_sr_only_text = 'Correct';

                list_item_correct++;
            } else {
                div_classes += "has-error";
                span_classes += "glyphicon-remove";
                this_classes += "btn-danger";
				span_sr_only_text = 'Incorrect';
            }

            if (list_item_correct == list_item_count) {
                div_classes += " ui-state-disabled";
            }

            //
            vals.push(val);

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

    //
    $('#checkAnswerButton').addClass('disabled');

	if (isUseSelectAndExchange)
	{
		isOptionChanged = false;
	}

    if( $('.btn-danger').length > 0 )
    {
         //
        $('#showAnwsersButton').removeClass('disabled');
    }
    else
    {
        $('#showAnwsersButton').addClass('disabled');
    }

    if (gameMode == "learn_mode") {
        setTimeout(
            function() {
                $('.gapfield-list .list-group-item').removeClass("btn-danger btn-warning btn-success0 btn-info");
                $('.gapfield-list .glyphicon').not('.glyphicon-ok').removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok0").addClass('glyphicon-hand-down').html('');
            }, 1000);

		if (isUseSelectAndExchange)
		{
			RemoveSelectedOption();

			$('li.ui-state-disabled', 'ul.gapfield-list').removeAttr('tabindex');
		}

    } else if (gameMode == "test_mode") {
        //destroy
		if (isUseSelectAndExchange)
		{
			$('li', 'ul.gapfield-list').off();
			RemoveSelectedOption();
		}
		else
		{
			$(".option-pool-list, .gapfield-list").sortable("disable");
		}
        //$( ".option-pool-list, .gapfield-list" ).sortable( "destroy" );
    }


    //
    updateRemainingQuestions();
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
            if (question.answers[i] == question.leanerResponse[i] || gameNoCorrectAnswers) {
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