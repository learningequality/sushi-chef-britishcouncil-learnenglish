var questionsArray = [];
var pages = [];

var sample = null; //[{"question":"12345","question_audio":"","answers":["2","3","4","5"],"firstItem":"1","leanerResponse":["2","3","5","4"],"isCorrect":true},{"question":"abcde","question_audio":"","answers":["b","c","d","e"],"firstItem":"a","leanerResponse":["","","",""],"isCorrect":true},{"question":"MondayTuesdayWednesdayThursdayFridaySaturdaySunday","question_audio":"","answers":["Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],"firstItem":"Monday","leanerResponse":["","","","","",""],"isCorrect":true}];

var isUseSelectAndDrop = true;
var selectAndDropManager = null;

var countQuestionAsItem = true;

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
        var $option_pool_list = $('<ul id="main_list_' + pIndex + '" name="option-pool-list" class="option-pool-list list-inline"></ul>');

        var $question = $('<div class="question show-grid0 block" id="' + pIndex + '"></div>');
        //var $form = $('<form class="form-inline" role="form"></form>');
        var $row1 = $('<div class="block"></div>'); //col-xs-12 col-sm-12 col-md-12 col-lg-12

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

        var first_item = '';

        if(question.firstItem && question.firstItem != "")
        {
            first_item += '<div class="panel panel-default inline-block" style="vertical-align:middle;margin-bottom:20px;">';
            first_item += '<ul name="gapfield-list-locked" id="sub_list_' + pIndex + '" class="gapfield-list0 gapfield-list-locked list-group ui-state-disabled" data-question-index="' + pIndex + '">';
            first_item += '<li class="list-group-item btn btn-default disabled">'; // btn-success
            first_item += '<span class="glyphicon glyphicon-lock"></span><span class="sr-only">Item Locked</span>' + question.firstItem; // glyphicon-ok form-control-feedback
            first_item += '</li>';
            first_item += '</ul>';
            first_item += '</div>';
        } 
        

        $row1.append(question_number + question_audio_item);
//        $row1.append(first_item);

        var item = '<div name="main-gapfield-list" class="inline-block" data-question-index="' + pIndex + '">';

		item += first_item;


        var len = question.answers.length; //questionsArray.length;
        var skip_arr = [];
        for (var i = 0; i < len; i++) {
            if(sample && sample[pIndex].leanerResponse[0] != "") {
                //skip_arr.push(sample[i].leanerResponse[0]);
                skip_arr = skip_arr.concat(sample[pIndex].leanerResponse);
            }
            else
            {
                
            }
        }


        var len = question.answers.length;
        var shuffled_arr = generateShuffledIndexArray(len);
        for (var i = 0; i < len; i++) {
            var shuffled_index = shuffled_arr[i];

            var dummy_item = '<div class="panel panel-default inline-block model-wrapper hidden" style="vertical-align:middle;margin-bottom:20px;">';
            dummy_item += '<ul name="gapfield-list0" id="sub_list_' + pIndex + '" class="gapfield-list0 list-group gapfield-list-locked" data-question-index="' + pIndex + '" data-question-item-index="' + i + '">'; //list-group for vertical, list-inline for horizontal
            dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            dummy_item += '<span class="glyphicon pull-right"></span>' + question.answers[i];
            dummy_item += '</li>';
            dummy_item += '</ul>';
            dummy_item += '</div>';


            item += dummy_item;
            item += '<div class="panel panel-default inline-block" style="vertical-align:middle;margin-bottom:20px;">';
            //item += '<ul name="gapfield-list" class="gapfield-list list-inline" data-question-index="' + pIndex + '" data-question-item-index="' + i + '" style="display:inline-block;">'; //list-group for vertical, list-inline for horizontal



            item += '<ul name="gapfield-list" id="sub_list_' + pIndex + '" class="gapfield-list list-group" data-question-index="' + pIndex + '" data-question-item-index="' + i + '">'; //list-group for vertical, list-inline for horizontal

            if(sample) {
                if(sample[pIndex].leanerResponse && sample[pIndex].leanerResponse[i] != "") {
                // since it is already used, do not add it to the pool
                    item += '<li tabindex="0" class="list-group-item btn btn-default" data-parent-option-pool-list="#main_list_' + pIndex + '">'; // btn-success
                    item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + sample[pIndex].leanerResponse[i]; // glyphicon-ok form-control-feedback
                    item += '</li>';
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

            //$form.append(item);
            //$row1.append(item);

            if($.inArray($.trim(question.answers[shuffled_index]), skip_arr) > -1) {
            // since it is already used, do not add it to the pool
        
            }
            else
            {
                var answer_item = '';
                //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
                answer_item += '<li tabindex="0" class="list-group-item btn btn-default" data-parent-option-pool-list="#main_list_' + pIndex + '">'; // btn-success
                answer_item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + question.answers[shuffled_index]; // glyphicon-ok form-control-feedback
                answer_item += '</li>';
                $option_pool_list.append(answer_item);
            }
        }

        item += "</div>";

        $row1.append(item);


        $option_pool_panel_body.append($option_pool_list);
        $option_pool_panel.append($option_pool_panel_body);

        $question.append($option_pool_panel);


        $question.append($row1);
        //$question.append($form);
        $('#questions').append($question);


        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append(s);




    });

    /*
    	$option_pool_panel_body.append($option_pool_list);
    	$option_pool_panel.append($option_pool_panel_body);

    	$('#cardPile0').append($option_pool_panel);

    */

	
	
	if (isUseSelectAndDrop)
	{
		selectAndDropManager = addSelectAndDropSupport(false);
		selectAndDropManager.limitDropToOneItem();
		selectAndDropManager.setOnCheckPageAnswer(false);
		selectAndDropManager.setDropBackToOptionList(true);
	
		selectAndDropManager.setEnableInputCallback(function()
		{
			if (gameMode == "learn_mode")
			{			
				var $selectedLi = $("li", "ul.gapfield-list").not('li.ui-state-disabled');
							
				if ($selectedLi.length > 0)
				{
					$('#checkAnswerButton').removeClass('disabled');
				}
				else
				{
					$('#checkAnswerButton').addClass('disabled');
				}
			}
		});
		
		selectAndDropManager.setCanDropToGapFieldFunc(function($gapField, $option)
		{
			if ($gapField == null || $option == null || $gapField.length == 0 || $option.length == 0)
			{
				return false;
			}
			
			var optionListId = $option.attr('data-parent-option-pool-list');
			var gapFieldQuestionIndex = $gapField.attr('data-question-index');
			
			if (optionListId != null && gapFieldQuestionIndex != null)
			{
				optionListId = optionListId.split("#main_list_");
				
				if (optionListId.length == 2)
				{
					return (optionListId[1] == gapFieldQuestionIndex);
				}
			}
			
			return true;
		});
			
		setGetPageCallback(function()
		{
			selectAndDropManager.removeSelectedOption();
			selectAndDropManager.enableInput();
		});
		
		selectAndDropManager.setCustomGapFieldHintFilter(function($selectedOption, $gapField)
		{
			var $selectedOptionQuestion = $selectedOption.parents('div.question');
			var $gapFieldQuestion = $gapField.parents('div.question');

			if ($selectedOptionQuestion.length == 1 && $gapFieldQuestion.length == 1)
			{
				return ($selectedOptionQuestion.is($gapFieldQuestion));
			}
			else
			{
				return true;
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
        start: function(event, ui) {
            //console.log('start drag');
            //
            //list_item.removeClass("btn-danger btn-warning btn-success btn-info");
            //div.removeClass("has-feedback has-error has-warning has-success");
            //span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");
        },
        stop: function(event, ui) {
            // if instant feedback
            if (gameMode == "learn_mode") {
                //onCheckPageAnswer(); // this game doesn't support this
            }

            ui.item.removeAttr('style');

            $('#checkAnswerButton').removeClass('disabled');
            //$('#showAnwsersButton').addClass('disabled');

            //
            updateRemainingQuestions();

            //console.log('stop drag');

            if (finished == false) {
                $('.ui-sortable').each(function() {
                    $(this).sortable('enable');
                    //console.log('enable : ' + $(this));
                });
            }
        },
        //stack: '.list-group-item',
        appendTo: document.body,
        //containment: 'window',
        scroll: false,
        //cursor: 'move',
        //revert: true,
        //cancel: '.audio',
        //opacity: 0.7,
        //zIndex: 1000,
        helper: "clone" //disabled to let answers drag back to original pool
    });


    //

    $('.ui-sortable li').mousedown(function() {
        $('.ui-sortable').not($(this).parent()).each(function(index) {

            if ($(this).find('li').length >= 1) {
                if ($(this).attr('id').indexOf("main_list") != 0) // if id is not "main_list" and has at least 1 item , disable drop 
                {

                    //console.log($(this).attr('id'));


                    /*
	                if($(this).find('li').length == 1 && $(this).find('li.dummy').length != 0)
		        	{
		        		
		        	}
		        	else
		        	{
		        		$(this).sortable('disable');
		        	}
		        	*/

                    $(this).sortable('disable');
                    //console.log('disable : ' + $(this));
                }
            }
        });

        $(this).parent().sortable('enable');
    });

    $('.ui-sortable li').mouseup(function() {
        if (finished == false) {
            $('.ui-sortable').each(function() {
                $(this).sortable('enable');
                //console.log('enable : ' + $(this));
            });
        }
    });


    //
    updateRemainingQuestions();

    addAudioSupport();
}



function onShowAnswers(show) {
    debug.log('onShowAnswers')

    $('[name=gapfield-list]').not('.gapfield-list-locked').parent().toggleClass('hidden');
    $('.model-wrapper').toggleClass('hidden');

    //$('[name=gapfield-list]').not('.gapfield-list-locked').parent().addClass('hidden');
    //$('.model-wrapper').removeClass('hidden');

    //$('[name=gapfield-list]').not('.gapfield-list-locked').parent().removeClass('hidden');
    //$('.model-wrapper').addClass('hidden');

    return;

    /*
    	$('.question').each(function (index, input) {
    		var strDiv1Cont = $(this).find('.model-wrapper li').wrap('<p/>').parent().html();
    		var strDiv2Cont = $(this).find('.gapfield-list li').wrap('<p/>').parent().html();

    		$(this).find('.model-wrapper li').unwrap();
    		$(this).find('.gapfield-list li').unwrap();


    		//console.log(strDiv1Cont);
    		//console.log(strDiv2Cont);
    		//console.log(".................");

    		if(!strDiv1Cont)
    		{
    			strDiv1Cont = '';
    		}

    		if(!strDiv2Cont)
    		{
    			strDiv2Cont = '';
    		}

    		//var class1 = $(this).find('.dummy').attr('class');
    		//var class2 = $(this).find('ul>li').attr('class');

    		$(this).find('.model-wrapper').html(strDiv2Cont);
    		//$(this).find('.model-wrapper').removeClass().addClass(class2);
    		$(this).find('.gapfield-list').html(strDiv1Cont);
    		//$(this).find('ul>li').removeClass().addClass(class1);
    	});

    	return;
    */
}



function myFunction(that) {
    //alert(that.text());
    setTimeout(
        function() {
//            $('.btn-danger').parent().sortable("enable");
            var parent = $(that).data('parent-option-pool-list');
            //parent = "#main_list";
            $(parent).append($(that)); // add all wrong items back to the main_list
            $(parent).children('li').removeClass('btn-danger btn-warning btn-success btn-info disabled ui-state-disabled');
            $(parent).children('li').children('span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok').addClass('glyphicon-hand-down').html('');

//            $(that).parent().removeClass('ui-sortable-disabled');
			
			if (!isUseSelectAndDrop)
			{
				$('.btn-danger').parent().sortable("enable");
				$(that).parent().removeClass('ui-sortable-disabled');
			}
			else
			{
				selectAndDropManager.enableInput();	
			}
        }, 1000);
}




//When Check Answers button is pressed
function onCheckPageAnswer(showFeedback) {
    showFeedback = typeof showFeedback !== 'undefined' ? showFeedback : true;

    //console.log('onCheckPageAnswer')

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

	if (isUseSelectAndDrop)
	{
		selectAndDropManager.disableInput();
	}
    
    var unanwsered_questions = 0;

    $('[name=main-gapfield-list]').each(function(index, input) {

        var vals = [];

        var selected = $(this).children('.panel').not('.model-wrapper').children('[name=gapfield-list]'); //.children('li');

        //alert(selected.length);

        var val = ''; //
        var question_index = $(this).data('question-index');
        //var sub_question_index = $(this).data('sub-question-index');
        //var model_val = questionsArray[question_index].answers; // is array
        var model_val = questionsArray[question_index].answers;


        var div = $(this);
        var span = $(this).children('.panel').not('.model-wrapper').children('[name=gapfield-list]').children('li').children(".glyphicon"); //$(this).children( ".glyphicon" ); //$(this).siblings( ".glyphicon" );

        $(this).children('.panel').not('.model-wrapper').children('[name=gapfield-list]').children('li').removeClass("btn-danger btn-warning btn-success btn-info");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok glyphicon-hand-down");


        //var div_classes = "has-feedback ";
        //var span_classes = "";
        //var this_classes = "";

        //console.log('val : "' + val + '"')
        //console.log('model_val :', model_val)

        //if($(this).is(':checked') == false)


        //$(this).children('[name=gapfield-list]').not('.active').children( ".glyphicon" ).addClass('hidden');


        if (selected.length == 0) {
            unanwsered_questions++;
        } else {
            //
            for (var i = 0; i < selected.length; i++) {
                var div_classes = "has-feedback ";
                var span_classes = "";
                var this_classes = "";
				var span_sr_only_text = '';

                var question_item_index = i;

                var val = getObjectText($(selected[i]).children('li'));
                //var val = $.trim( $(selected[i]).text() ); //questionsArray[question_index].answers[$(selected[i]).data('question-item-index')];//$(selected[i]).attr('value');
                span = $(selected[i]).children('li').children('.glyphicon');

                //alert(val + "  " + model_val[question_item_index]);

                if ($(selected[i]).children('li').length > 0) {
                    if (val == model_val[question_item_index] || gameNoCorrectAnswers)
                    //if($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) 
                    {
                        div_classes += "has-success";
                        span_classes += "glyphicon-ok";
                        this_classes += "btn-success ui-state-disabled";
						span_sr_only_text = 'Correct';

                        if (gameMode == "learn_instant_feedback" || gameMode == "learn_check_answers") // or finished
                        {
                            // lock this question
                        }
                    } else {
                        //div_classes += "has-error";
                        span_classes += "glyphicon-remove";
                        this_classes += "btn-danger ui-state-disabled"; //disabled ??
						span_sr_only_text = 'Incorrect';

                        if (gameMode == "learn_mode") {
                            var that = $(selected[i]).find("li").eq(0);
                            //alert("dawda");
                            myFunction(that);
                            /*setTimeout(
								function()
								{
									myFunction(that);
								}
							,1000);*/
                        }

                    }

                    if (showFeedback == true) {
                        $(selected[i]).children('li').addClass(this_classes);
                        div.addClass(div_classes);
                        span.addClass(span_classes);
						span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
                    }
                }

                vals.push(val);
            }

        }

        //

        questionsArray[question_index].leanerResponse = vals;
        questionsArray[question_index].isCorrect = true;

        //$('#remainingItemsText').html(unanwsered_questions);

        //$(this).children('.active').addClass(this_classes);
        //div.addClass(div_classes);
        //span.addClass(span_classes);
    });

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
		
		if (isUseSelectAndDrop && (gameDisplayOptions == 1 || getPageRemainingQuestionsCount() > 0))
		{
			selectAndDropManager.enableInput();
		}
    }

    //if instant feedback
    if (gameMode == "learn_mode") {
        /*
		setTimeout(
			function()
			{
				$('.btn-danger').parent().sortable( "enable" );
				//$('#main_list').append($('.btn-danger')); // add all wrong items back to the main_list
				$('.gapfield-list li').not('.btn-success').removeClass('btn-danger btn-warning btn-success0 btn-info disabled ui-state-disabled');
				$('.gapfield-list li span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok0');
			}
		,1000);
		*/
    } else if (gameMode == "test_mode") {
        //destroy
//        $('[name=gapfield-list]').addClass('ui-state-disabled');
        //$( ".option-pool-list, .gapfield-list" ).sortable( "destroy" );
		
		if (!isUseSelectAndDrop)
		{
			$('[name=gapfield-list]').addClass('ui-state-disabled');
		}
		else
		{
			selectAndDropManager.setDisabled(true);
		}
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
            if (question.answers[i] == question.leanerResponse[i] || gameNoCorrectAnswers)
            //if ($.inArray(question.answers[i], question.leanerResponse) > -1 || gameNoCorrectAnswers)
            {
                //
                qPoints++;
            }
        }

		if (countQuestionAsItem)
		{
			qTotal++;

			if (qPoints == question.answers.length)
			{
				qPoints = 1;
			}
			else
			{
				qPoints = 0;
			}
		}
		else
		{
			qTotal += question.answers.length;
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