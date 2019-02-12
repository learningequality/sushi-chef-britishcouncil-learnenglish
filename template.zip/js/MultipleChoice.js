var questionsArray = [];
var pages = [];

var sample = null; //[{"question":"British people usually have their holidays _____ summer.","question_audio":"","options":["in","on","at"],"answers":1,"correct":1,"leanerResponse":["1"],"isCorrect":true},{"question":"School children are _____ holiday from approximately the end of July.","question_audio":"","options":["in","on","at"],"answers":2,"correct":2,"leanerResponse":["2"],"isCorrect":true},{"question":"_____ winter some people go skiing.","question_audio":"","options":["In","On","At"],"answers":1,"correct":1,"leanerResponse":[],"isCorrect":true},{"question":"You can sign up to try a new roller coaster ride _____ their website.","question_audio":"","options":["on","in","at"],"answers":1,"correct":1,"leanerResponse":[],"isCorrect":true},{"question":"As well as plants you can also see top bands play _____ the Eden Project.","question_audio":"","options":["in","on","at"],"answers":3,"correct":3,"leanerResponse":[],"isCorrect":true},{"question":"Newquay is _____ the south coast of England.","question_audio":"","options":["in","on","at"],"answers":2,"correct":2,"leanerResponse":[],"isCorrect":true},{"question":"A 7-day July summer holiday _____ Butlin’s costs about 130 pounds per person.","question_audio":"","options":["in","on","at"],"answers":3,"correct":3,"leanerResponse":[],"isCorrect":true},{"question":"A British teenager spends a week or two _____ a foreign country.","question_audio":"","options":["in","on","at"],"answers":1,"correct":1,"leanerResponse":[],"isCorrect":true}];

var isUseRadioButton = true;
var isRadioButtonCustom = true;

var isCheckCurrentInputAnswerOnly = true;
var $currentInputAnswer = null;

$(document).ready(function() {
    entryPoint();
});

//Game-specific initialization
function init() {
    //
    questionsArray = [];

    var defaultOptions = [];

    $(gameXMLDOM).find('GlobalOptions > Option').each(function(index, Element) {
        /*
		defaultOptions +=
			'<a class="options" href="javascript:void(0)" value='+$(this).attr('value')+' onclick="answerQuestion(this)">' +
				'<span>' + $(this).text() + '</span>' +
			'</a>';
		*/

        defaultOptions.push($(this).text());
    });

    $(gameXMLDOM).find('MultipleChoiceQuestionItem').each(function(index, Element) {
        $options = $(this).find('Option');
        $feedbacks = $(this).find('Feedback');

        var options = [];

        if ($options.length !== 0) {
            $options.each(function(oIndex, option) {
                /*
				options +=
					'<a class="options" href="javascript:void(0)" value="' + $(option).attr('value') + '" onclick="answerQuestion(this)">' + 
						'<span>' + $(option).text() + '</span>' +
					'</a>';
				*/
                options.push($(option).text());

            });
        } else {
            options = defaultOptions;
        }

        ///////////////////////

        var feedbacks = [];
        
        if ($feedbacks.length !== 0) {
            $feedbacks.each(function(oIndex, feedback) {
                /*
                options +=
                    '<a class="options" href="javascript:void(0)" value="' + $(option).attr('value') + '" onclick="answerQuestion(this)">' + 
                        '<span>' + $(option).text() + '</span>' +
                    '</a>';
                */
                feedbacks.push($(feedback).text());

            });
        } else {
            feedbacks = null;
        }


        var correct_option = 1;

        if(gameNoCorrectAnswers == 0) //@@ correct anwsers
        {
            correct_option = $(this).find('Answer').text();
            //
            correct_option = parseInt(correct_option);
            correct_option = correct_option; // - 1;

            if (correct_option > options.length) {
                alert("Error: invalid option for question " + index);
            }
        }

        questionsArray.push({
            'question': $(this).find('Question').text(),
            'question_audio': $(this).find('Audio > URL').text(),
            'options': options,
            'feedbacks': feedbacks,
            'answers': correct_option,
            'correct': correct_option
        });
    });

    /*
    	$(gameXMLDOM).find('Question').each(function (index, item) {
    		questionsArray.push({ text: $(item).text(), audio: $(item).siblings().find('Audio > URL').text(), correct: index });
    		// console.log($(item).siblings().find('Audio > URL').text());
    	});
    	
    	$(gameXMLDOM).find('Answer').each(function (index, item) {
    		answersArray.push({ text: $(item).text(), audio: $(item).attr('url'), correct: index });
    	});
    */

}



//Game-specific reset procedure
function reset() {

    // make object pool list
    //$('#ajax-cont').empty();
    //$('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div>');
    $('#ajax-cont').append('<div id="questions"></div>');


    //console.log(questionsArray);

    //var $option_pool_panel = $('<div class="panel panel-default"></div>');
    //var $option_pool_panel_body = $('<div class="panel-body"></div>');
    //var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');

	var radioButtonNo = 0;

    $.each(questionsArray, function(pIndex, question) {

        var $question = $('<div class="question show-grid0" id="' + pIndex + '"></div>');
        //var $form = $('<form class="form" role="form"></form>');
        //var $row1 = $('<div class="row form-inline"></row>');
        var $row1 = $('<div class="row0"></div>');
        var $col1 = $('<div class="col-xs-12 col-sm-9 col-md-9 col-lg-9"></div');
        var $col2 = $('<div class="col-xs-12 col-sm-3 col-md-3 col-lg-3"></div');

        var q = (pIndex + 1) + '';

        //http://gamedata.monilab.net/sites/default/files/attachment/elem1_1.2.4f_2.mp3
        //var audio_item = '<a class="btn-sm btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';

        //var audio = 'http://authtool2.monilab.net/exact-lcms/ExactLCMS/LO13/81930CD0CB399201B8BE5833B07/elem1_5.1.2c.mp3'; //getAudio();
        //var audio_item = '';
        //if (audio !== undefined && audio !== '' ) {
        // 	audio_item = getAudioCode(audio, false);
        //}

        var question_audio_item = createSimpleAudioButton(question.question_audio);

        //$col1.append(audio_item);

        //var $group_panel = $('<div class="panel panel-default"></div>');
        //var $group_panel_body = $('<div class="panel-body"></div>');
        //var $group_list = $('<ul id="sortable2" class="list-group"></ul>');

		var question_number = '';

		if (gameShowQuestionNo === "true" && questionsArray.length > 1)
		{
			question_number = q + '. ';
		}

        var item = '';

        item += '<div class="form-group">';
        item += question_number + question_audio_item + '<span class="text-question">' + question.question + '</span>';
        item += '</div>';


        var dummy_item = '';

        // if have feedback
        if(question.feedbacks && question.feedbacks.length == question.options.length)
        {
            dummy_item += '<div class="row">';
            dummy_item += '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">';
        }
        //

        dummy_item += '<div name="gapfield-list0" class="form-group btn-group0 btn-group-justified0 model-wrapper hidden">';

        for (var i = 0; i < question.options.length; i++) {
            //item2 += '<label class="btn btn-default">';
            //item2 += '<input type="radio" name="gapfield" value="' + (i+1) + '" data-question-index="' + pIndex + '"> ' + question.options[i];
            //item2 += '</label>';


            if (question.correct == i + 1) {

				if (isUseRadioButton)
				{
					dummy_item += '<div class="radio btn-info"><input id="radio' + radioButtonNo + '" type="radio" class="form-group btn btn-default block" checked="checked" /><label for="radio' + radioButtonNo + '"><span></span>' + question.options[i] + '</label></div>';
				}
				else
				{
					dummy_item += '<a class="btn btn-info block" name="gapfield0"><span class="hidden glyphicon"></span> ' + question.options[i] + '</a>';
				}
			} else {

				if (isUseRadioButton)
				{
					dummy_item += '<div class="radio"><input id="radio' + radioButtonNo + '" type="radio" class="form-group btn btn-default block disabled" disabled="disabled" /><label for="radio' + radioButtonNo + '"><span></span>' + question.options[i] + '</label></div>';
				}
				else
				{
					dummy_item += '<a class="btn btn-default block" name="gapfield0"><span class="hidden glyphicon"></span> ' + question.options[i] + '</a>';
				}
			}

			if (isUseRadioButton)
			{
				radioButtonNo++;
			}
        }
        dummy_item += '</div>';

        // if have feedback
        if(question.feedbacks && question.feedbacks.length == question.options.length)
        {
            dummy_item += '</div>'; // end first column

            dummy_item += '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">';

            dummy_item += '<div class="panel panel-info model-feedback-panel hidden">';
            dummy_item += '  <div class="panel-heading">Feedback</div>';
            dummy_item += '  <div class="panel-body">';
            dummy_item += question.feedbacks[question.correct-1];
            dummy_item += '  </div>';
            dummy_item += '</div>';

            dummy_item += '</div>';

            dummy_item += '</div>'; // end row
        }
        //


        var default_value = "";
        var default_index = "";
        if(sample){

            //console.log(sample);
            //var sampleArray = JSON.parse( sample );
            //console.log(sampleArray);
            //default_value = sample[pIndex].subquestions[i].leanerResponse;
            default_index = sample[pIndex].leanerResponse; //leanerResponseIndexes;
        }


        var item2 = '';

        item2 += dummy_item;

        // if have feedback
        if(question.feedbacks && question.feedbacks.length == question.options.length)
        {
            item2 += '<div class="row">';
            item2 += '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">';
        }
        //

		if (isUseRadioButton)
		{
			item2 += '<form>';
		}

        item2 += '<div name="gapfield-list" class="form-group btn-group0 btn-group-justified0 toggle-game-options" ';

		if (!isUseRadioButton)
		{
			item2 += 'data-toggle="buttons0" ';
		}
		
		item2 += 'data-question-index="' + pIndex + '">';
		
		for (var i = 0; i < question.options.length; i++) {
            //item2 += '<label class="btn btn-default">';
            //item2 += '<input type="radio" name="gapfield" value="' + (i+1) + '" data-question-index="' + pIndex + '"> ' + question.options[i];
            //item2 += '</label>';

            var classes = "";
			var optionChecked = (default_index == (i + 1));

            if (optionChecked)
            {
                classes += " active";
            }
			
			if (isUseRadioButton)
			{
				item2 += '<div class="radio' + classes + '" tabindex="0"><input type="radio" id="radio' + radioButtonNo + '" class="form-group btn btn-default block" name="gapfield" value="' + (i + 1) + '"' + ((optionChecked)? ' checked="checked"' : '') + ' /><label for="radio' + radioButtonNo + '"><span class="hidden glyphicon pull-right"></span>' + question.options[i] + '</label></div>';
				radioButtonNo++;
			}
			else
			{
				item2 += '<a class="form-group btn btn-default block' + classes + '" data-toggle="button" name="gapfield" value="' + (i + 1) + '"><span class="glyphicon pull-right hidden"></span>' + question.options[i] + '</a>';
			}   
		}
		
        item2 += '</div>';

		if (isUseRadioButton)
		{
			item2 += '</form>';
		}

        // if have feedback
        if(question.feedbacks && question.feedbacks.length == question.options.length)
        {
            item2 += '</div>'; // end first column

            item2 += '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-6">';

            item2 += '<div class="panel panel-default feedback-panel hidden">';
            item2 += '  <div class="panel-heading">Feedback</div>';
            item2 += '  <div class="panel-body">';
            item2 += '    You have not selected any answer';
            item2 += '  </div>';
            item2 += '</div>';

            item2 += '</div>';

            item2 += '</div>'; // end row
        }
        //

        $row1.append(item);
        $row1.append(item2);


        //
        //$form.append($row1);
        //$question.append($form);
        $question.append($row1);
        $('#questions').append($question);

        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);
    });

    //$option_pool_panel_body.append($option_pool_list);
    //$option_pool_panel.append($option_pool_panel_body);

    //$('#cardPile0').append($option_pool_panel);

	
	
	if (isUseRadioButton)
	{
		updateRemainingQuestions();
		addAudioSupport();

		$('input[name="gapfield"]:radio').change(function()
		{
			$thisDiv = $(this).closest('div.radio');

			$thisDiv.addClass('active');
			$thisDiv.siblings().removeClass('active');

			if (gameMode == "learn_mode")
			{
				if (isCheckCurrentInputAnswerOnly)
				{
					$currentInputAnswer = $(this);
				}

                onCheckPageAnswer();
            }

            updateRemainingQuestions();
		});
		
		if (isRadioButtonCustom)
		{
			var $gapfieldList = $('div[name=gapfield-list]');

			$gapfieldList.find('label').click(function(e)
			{
				if ($(this).siblings('input:radio').hasClass('disabled'))
				{
					return false;
				}
			});

			$gapfieldList.find('div').keydown(function(e)
			{
				var key = e.which;

				if (key == 13 || key == 32)
				{
					$('label', this).click();
					return false;
				}
			});

			$gapfieldList.length = 0;
			$gapfieldList = null;
		}

		return ;
	}	

    $('[name=gapfield-list] .btn').click(function() {
        if ($(this).parent().hasClass('ui-state-disabled') == false) {
            $(this).parent().children().removeClass('active');
            $(this).addClass('active');

            if (gameMode == "learn_mode") {
                onCheckPageAnswer();
            }

            //
            updateRemainingQuestions();
        }

    });


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

    //
    updateRemainingQuestions();

    addAudioSupport();
    //processPlayer($('#question .audio'), true);
}


function onShowAnswers(show) {
    debug.log('onShowAnswers')

    $('[name=gapfield-list]').not('.gapfield-list-locked'). /*parent().*/ toggleClass('hidden');
    $('.model-wrapper').toggleClass('hidden');
    
    //
    $('.model-feedback-panel').toggleClass('hidden');
    $('.feedback-panel').toggleClass('hidden');

    //$('[name=gapfield-list]').not('.gapfield-list-locked').parent().addClass('hidden');
    //$('.model-wrapper').removeClass('hidden');

    //$('[name=gapfield-list]').not('.gapfield-list-locked').parent().removeClass('hidden');
    //$('.model-wrapper').addClass('hidden');

    return;
}

//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {
    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    //console.log('onCheckPageAnswer')
    var unanwsered_questions = 0;

	var $gapfieldList;

	if (isCheckCurrentInputAnswerOnly && gameMode == 'learn_mode' && $currentInputAnswer != null)
	{
		$gapfieldList = $currentInputAnswer.parents('div[name=gapfield-list]');
	}
	else
	{
		$gapfieldList = $('[name=gapfield-list]');
	}

    $gapfieldList.each(function(index, input) {

        var vals = [];

        var selected = $(this).children('.active');

        var val = ''; //
        var question_index = $(this).data('question-index');
        //var sub_question_index = $(this).data('sub-question-index');
        var model_val = questionsArray[question_index].answers; // is array


        var div = $(this);
        var span = $(this).children('.active').find(".glyphicon"); //$(this).children( ".glyphicon" ); //$(this).siblings( ".glyphicon" );

        $(this).children('[name=gapfield]').removeClass("btn-danger btn-warning btn-success btn-info");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");


        //var div_classes = "has-feedback ";
        //var span_classes = "";
        //var this_classes = "";

        //console.log('val : "' + val + '"')
        //console.log('model_val :', model_val)

        //if($(this).is(':checked') == false)


        $(this).children('[name=gapfield]').not('.active').children(".glyphicon").addClass('hidden');


        if (selected.length == 0) {
            unanwsered_questions++;
        } else {
            //
            for (var i = 0; i < selected.length; i++) {
                var div_classes = "has-feedback ";
                var span_classes = "";
                var this_classes = "";
				var span_sr_only_text = "";
                var val;

				if (isUseRadioButton)
				{
					val = $('input:radio:checked', this).val();
				}
				else
				{
					val = $(selected[i]).attr('value');
				}


                span = $(selected[i]).find('.glyphicon');

                if (val == model_val || gameNoCorrectAnswers)
                //if($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) 
                {
                    div_classes += "has-success ui-state-disabled";
                    span_classes += "glyphicon-ok";
                    this_classes += "btn-success";
					span_sr_only_text = "Correct";

                    if (gameMode == "learn_instant_feedback" || gameMode == "learn_check_answers") // or finished
                    {
                        // lock this question
                    }

                    $(this).closest('.question').find('.feedback-panel').removeClass('panel-default panel-success panel-danger hidden').addClass('panel-success');

                } else {
                    //div_classes += "has-error";
                    span_classes += "glyphicon-remove";
                    this_classes += "btn-danger"; //disabled ??
					span_sr_only_text = "Incorrect";

                    $(this).closest('.question').find('.feedback-panel').removeClass('panel-default panel-success panel-danger hidden').addClass('panel-danger');

                    if (gameMode == "learn_instant_feedback" || gameMode == "learn_check_answers") // or finished
                    {
                        // lock this button
                    }

                }

            
                if (showFeedback == true) {
                    $(selected[i]).addClass(this_classes);
                    div.addClass(div_classes);
                    span.addClass(span_classes);
					span.html('<span class="sr-only">' + span_sr_only_text + "</span>");

                    if(questionsArray[question_index].feedbacks && questionsArray[question_index].feedbacks.length > val - 1)
                    {
                        var feedback = questionsArray[question_index].feedbacks[val - 1];
                        $(this).closest('.question').find('.feedback-panel .panel-body').html(feedback);
                    }
                }

                vals.push(val);
            }

        }

        //

        questionsArray[question_index].leanerResponse = vals;
        questionsArray[question_index].isCorrect = true;

        $('#remainingItemsText').html(unanwsered_questions);

        //$(this).children('.active').addClass(this_classes);
        //div.addClass(div_classes);
        //span.addClass(span_classes);
    });

	$gapfieldList.length = 0;
	$currentInputAnswer = null;

    //if instant feedback
    if (gameMode == "learn_mode") {

        var question_index = 0;
        var timeout = (questionsArray[question_index].feedbacks) ? 2000 : 1000;
		
		if (isUseRadioButton)
		{
			$('.btn-success').siblings().find('input:radio').addClass('disabled').attr('disabled', true);
			$('input:radio', '.btn-danger').addClass('disabled');//.attr('disabled', true);
		}

        setTimeout(
            function() {
                $('.btn-danger').removeClass('btn-danger').addClass('disabled');
                $('.glyphicon-remove').removeClass('glyphicon-remove').addClass('hidden').html('');

                $('.panel-danger').removeClass('panel-default panel-success panel-danger').addClass('panel-default');
            }

            , timeout);
        
    } else if (gameMode == "test_mode") {
        //destroy
        $('[name=gapfield-list]').addClass('ui-state-disabled');
        //$( ".option-pool-list, .gapfield-list" ).sortable( "destroy" );
		
		if (isUseRadioButton)
		{
			$('input:radio', 'div[name=gapfield-list]').not(':checked').attr('disabled', true).addClass('disabled');
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

    $.each(questionsArray, function(pIndex, question) {

        //questions.push('');
        var qPoints = 0;
        var qTotal = 0;
        var text = "";
        var leanerResponse = [];
        var correctAnswer = [];
        var isCorrect = false;


        text = question.question;
        leanerResponse = question.leanerResponse;
        //correctAnswer = question.answers; //[0];
        correctAnswer.push(question.answers); //[0];
        isCorrect = question.isCorrect;

        qPoints = 0;
        qTotal = 0;


        if (question.answers == question.leanerResponse[0] || gameNoCorrectAnswers) {
            //
            qPoints++;
        }
        qTotal++;

        questions.push(text);
        answers.push(leanerResponse);
        corrects.push(correctAnswer);

        points.push(qPoints);
        totals.push(qTotal);

        gamePoints += qPoints;
        gameTotal += qTotal;

    });
    //destroy
    /*$('[name=gapfield-list]').each(function(index, input) {

        //$(this).attr('disabled', 'disabled');
        $(this).sortable("disable");

    });*/

    //
    $('.feedback-panel').removeClass('hidden');

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