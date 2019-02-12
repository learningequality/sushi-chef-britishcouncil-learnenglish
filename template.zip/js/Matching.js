var questionsArray = [];
var pages = [];

var sample = null; //[{"question":"\"I like music but I don't like all that modern music and dancing.\"   Sam","question_audio":"","answers":["The Beatles Story"],"answers_audio":[null],"leanerResponse":["The Beatles Story"],"leanerResponseIndexes":[1]},{"question":"\"Well, we don't have much money.\"   George and Doris","question_audio":"","answers":["Liverpool Musuem"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"My sister and I love buying shoes.\"   Yuka","question_audio":"","answers":["Liverpool ONE"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"I love all forms of exercise especially team sports.\"   Luka","question_audio":"","answers":["Liverpool FC"],"answers_audio":[null],"leanerResponse":["Liverpool FC"],"leanerResponseIndexes":[4]}];


var display_question_first = true;

var arrangementOrder = null;

gameDisplayOptions = 1;

var isUseSelectAndDrop = true;
var selectAndDropManager = null;

$(document).ready(function() {
	entryPoint();
});

//Game-specific initialization
function init(){
	//
	questionsArray = [];

	var order = $(gameXMLDOM).find('ArrangementOrder').text(); // should change to attr

	if(order && order != "")
	{
		order = order.replace(/ /g,'');
		var arr = order.split(',');

		if(isValidArrangementOrder(arr))
		{
			arrangementOrder = arr;
			for(var i=0; i<arrangementOrder.length; i++) { arrangementOrder[i] = (+arrangementOrder[i])-1; }
		}
	}
	
	display_question_first = $(gameXMLDOM).find('SimpleQuestionItems').attr("DisplayQuestionFirst");

	if(display_question_first == "No") {
		display_question_first = false;
	}
	else {
		display_question_first = true;
	}


	$(gameXMLDOM).find('SimpleQuestionItem').each(function (qIndex, question) {
		
		var answers = [];
		var answers_audio = [];

		$(question).find('Answer').each(function(aIndex, answer) {
			answers.push($(answer).text());
			answers_audio.push($(answer).attr('url'));

		});


		questionsArray.push({
			'question': $(question).find('Question').text(),
			'question_audio': $(question).find('Audio').find('URL').text(),
			'answers': answers,
			'answers_audio': answers_audio
		});


	});


	//
	if(arrangementOrder && arrangementOrder.length == questionsArray.length)
	{
		// check validity
	}


/*
	$(gameXMLDOM).find('Question').each(function (index, item) {
		questionsArray.push({ text: $(item).text(), audio: $(item).siblings().find('Audio > URL').text(), correct: index });
		// debug.log($(item).siblings().find('Audio > URL').text());
	});
	
	$(gameXMLDOM).find('Answer').each(function (index, item) {
		answersArray.push({ text: $(item).text(), audio: $(item).attr('url'), correct: index });
	});
*/
	
}


function isValidArrangementOrder(arr) {
    var i = arr.length, j, val;

    while (i--) {
    	val = arr[i];
    	j = i;
    	while (j--) {
    		if (arr[j] === val || arr[j] < 0 || arr[j] > arr.length) {
    			return false;
    		}
    	}
    }

    return true;
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
	var shuffled_arr = [];

	if(arrangementOrder)
	{
		shuffled_arr = arrangementOrder;
	}
	else
	{
		shuffled_arr = generateShuffledIndexArray(len);
	}

	//console.log(shuffled_arr);

	var len = questionsArray.length;
    var skip_arr = [];
    for (var i = 0; i < len; i++) {
        if(sample && sample[i].leanerResponse[0] && sample[i].leanerResponse[0] != "") {
            skip_arr.push(sample[i].leanerResponse[0]);
        }
        else
        {
            
        }
    }


	$.each(questionsArray, function(pIndex, question) {

		var $question = $('<div class="question show-grid0" id="' + pIndex + '"></div>');
		//var $form = $('<form class="form" role="form"></form>');
		var $row1 = $('<div class="row"></div>'); //remove this class if you require a box per row
		var $col1 = $('<div class="col-xs-12 col-sm-7 col-md-6"></div');
		var $col2 = $('<div class="col-xs-12 col-sm-5 col-md-6"></div');
			
		var q = (pIndex+1) +'';


		//var audio_item = '<div class="form-group">';
		//audio_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
		//audio_item += '</div>';
		//$col1.append(audio_item);

		var question_audio_item = createSimpleAudioButton(question.question_audio);
		var answer_audio_item = createSimpleAudioButton(question.answers_audio[0]);

		var question_number = '';

		if (gameShowQuestionNo === "true" && questionsArray.length > 1)
		{
			question_number = q + '. ';
		}

		var $row0 = $('<div class="row"><div class="col-xs-12">' + question_number + '</div></div>');

		//var $group_panel = $('<div class="panel panel-default"></div>');
		//var $group_panel_body = $('<div class="panel-body"></div>');
		//var $group_list = $('<ul id="sortable2" class="list-group"></ul>');

		var item  = '';

				item += '<div class="form-group">';
				item += question_audio_item + '<span class="text-question">' + question.question + '</span>';
				item += '</div>';

				var dummy_item = '<div class="model-wrapper hidden">';
	    		dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
				dummy_item += '<span class="glyphicon pull-right"></span>' + answer_audio_item + question.answers[0];
				dummy_item += '</li>';
				dummy_item += '</div>';



				var item2 = '';
				item2 += dummy_item;	
				item2 += '<div class="panel panel-default form-group btn-block">';
				item2 += '<ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '">'; //

				if(sample) {
		            if(sample[pIndex].leanerResponse && sample[pIndex].leanerResponse != "") {
		                // since it is already used, do not add it to the pool

		                var answer_audio_item = createSimpleAudioButton(questionsArray[pIndex].answers_audio[0]);

		                item2 += '<li tabindex="0" class="list-group-item btn btn-default" data-question-index="' + pIndex + '">'; // btn-success
		                item2 += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + sample[pIndex].leanerResponse; // glyphicon-ok form-control-feedback
		                item2 += '</li>';
		            }
		            else
		            {
		                
		            }
		        }


				item2 += '</ul>';
				item2 += '</div>';
				/*
				item += '<div class="form-group">';
				item += "footer";
				item += '</div>';
				*/
				

				//$row2.append(item);

				$col1.append(item);
				$col2.append(item2);

				if(display_question_first) {
					$row1.append($col1);
					$row1.append($col2);
				}
				else {
					$row1.append($col2);
					$row1.append($col1);
				}

			//$row1.append($col1);
			//$row1.append($col2);

		var shuffled_index = shuffled_arr[pIndex];

		if($.inArray($.trim(questionsArray[shuffled_index].answers[0]), skip_arr) > -1) {
            // since it is already used, do not add it to the pool
        
        }
        else
        {
			answer_audio_item = createSimpleAudioButton(questionsArray[shuffled_index].answers_audio[0]);


			var answer_item = '';
			//answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
			answer_item += '<li tabindex="0" class="list-group-item btn btn-default" data-question-index="' + shuffled_index + '">'; // btn-success
			//answer_item += '<div class="row">';
			//answer_item += '<div class="col-ls-2">';
	    	//answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
			//answer_item += '</div>';
			//answer_item += '<div class="col-ls-10">';
	    	answer_item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + questionsArray[shuffled_index].answers[0]; // glyphicon-ok form-control-feedback
			//answer_item += '</div>';
			//answer_item += '</div>';
			answer_item += '</li>';
			$option_pool_list.append(answer_item);
		}


		//
		//$form.append($row1);
		//$question.append($form);

		$question.append($row0);
		$question.append($row1);
		$('#questions').append($question);


		//var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
		//$('#questions').append(s);
	});


	$option_pool_panel_body.append($option_pool_list);
	$option_pool_panel.append($option_pool_panel_body);

	$('#cardPile0').append($option_pool_panel);


	//
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
		
		$(".list-group-item").mousedown(function(){
			$("#myNavmenuCanvas").width($("#myNavmenuCanvas").width());
		}).mouseup(function(){
			$("#myNavmenuCanvas").width('auto');
		});
	}

	//
	updateRemainingQuestions();

	addAudioSupport();
}




function onShowAnswers(show) 
{
	debug.log('onShowAnswers')


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

	$('[name=gapfield-list]')/*.not('.disabled')*/.each(function (index, input) {

		//$(this).attr('disabled', 'disabled');
		//$(this).sortable( "disable" );

		// check # of li in list
		var list_item_count = $(this).children('li').length;
		if(list_item_count < 1)
		{
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
    	var index_val = list_item.data('question-index');

    	if(!isNaN(parseFloat(index_val)) && isFinite(index_val))
    	{
    		index_val = +index_val + 1; // increment by 1
    	}
    	else
    	{
    		index_val = "";
    	}



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
    	var index_vals = [];

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

    	var div = $(this);//.parent();
    	var span = list_item.children( ".glyphicon" ); //$(this).siblings( ".glyphicon" );

    	list_item.removeClass("btn-danger btn-warning btn-success btn-info");
    	div.removeClass("has-feedback has-error has-warning has-success");
    	span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok glyphicon-hand-down");

    	var div_classes = "has-feedback ";
    	var span_classes = "";
    	var this_classes = "";
		var span_sr_only_text = "";

    	if(val == "" || $(list_item).data('dummy-item') == true)
    	{
    		div_classes += "has-warning";
    		span_classes += "glyphicon-warning-sign";
    		this_classes += "btn-warning";

    		unanwsered_questions++;
    	}
    	else
    	{
    		if ($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) 
    		{
    			div_classes += "has-success disabled";
    			span_classes += "glyphicon-ok";
    			this_classes += "btn-success ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Correct';
			} 
			else 
			{
				div_classes += "has-error";
    			span_classes += "glyphicon-remove";
    			this_classes += "btn-danger ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Incorrect';
			}
    	}

    	vals.push(val);
    	index_vals.push(index_val);

    	//
    	questionsArray[question_index].leanerResponse = vals;
    	questionsArray[question_index].leanerResponseIndexes = index_vals;

    	if(showFeedback == true)
		{
	    	list_item.addClass(this_classes);
	    	div.addClass(div_classes);
	    	span.addClass(span_classes);
			span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
	    }
  	});

	//if instant feedback
	if(gameMode == "learn_mode")
	{
		setTimeout(
			function()
			{
				$('#main_list').append($('.btn-danger')); // add all wrong items back to the main_list
				$('#main_list li').removeClass('btn-danger btn-warning btn-success btn-info disabled ui-state-disabled');
				$('#main_list li span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok').html('');//.addClass('glyphicon-hand-down');
				$('#main_list li .pull-right').addClass('glyphicon-hand-down');
				
				if (isUseSelectAndDrop)
				{
					selectAndDropManager.enableInput();	
				}
			}
		,1000);
		
		if (isUseSelectAndDrop)
		{
			if ($('.btn-danger').length == 0)
			{
				selectAndDropManager.enableInput();
			}
		}
	}
	else if(gameMode == "test_mode")
	{
		//destroy
//		$( ".option-pool-list, .gapfield-list" ).sortable( "disable" );
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

	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	if(getMode() == "placement_test")
	{
		return getScoreForPlacementTest();
	}
	else
	{
		//return getScoreForPlacementTest();
	}

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
		var leanerResponse = []; //"";
		var correctAnswer = []; //"";
		var isCorrect = false;

		
		text = question.question;

		if(getMode() == "placement_test")
		{
			leanerResponse = question.leanerResponseIndexes;
			correctAnswer = pIndex + 1;
		}
		else
		{
			leanerResponse = question.leanerResponse;
			correctAnswer = question.answers;
			//leanerResponse = question.leanerResponseIndexes;
			//correctAnswer = pIndex + 1;
		}

		//leanerResponse = question.leanerResponse;
		//leanerResponseIndexes = question.leanerResponseIndexes;
		//correctAnswer = question.answers; //[0];
		//isCorrect = question.isCorrect;

		qPoints = 0;
		qTotal = 0;

		for (var i = 0; i < question.answers.length; i++) 
		{
			if(question.answers[i] == question.leanerResponse[i] || gameNoCorrectAnswers)
			{
				//
				qPoints ++;
			}
		}

		if(isCorrect)
		{
			//qPoints ++;
		}
		qTotal ++;

		questions.push(text);
		answers.push(leanerResponse);
		corrects.push(correctAnswer);

		points.push(qPoints);
		totals.push(qTotal);


		gamePoints += qPoints;
		gameTotal += qTotal;

	});
	//destroy
	$('[name=gapfield-list]').each(function (index, input) {

		//$(this).attr('disabled', 'disabled');
		$(this).sortable( "disable" );

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


//The score values to be displayed after the game finish
//returns: {percentage: , points: , total: }
function getScoreForPlacementTest() {
	var questions = [];
	var answers = [];
	var corrects = [];
	var points = [];
	var totals = [];
	var gamePoints = 0;
	var gameTotal = 0;

	var qPoints = 0;
	var qTotal = 0;
	var text = [];
	var leanerResponse = []; //"";
	var correctAnswer = []; //"";
	var isCorrect = false;

	$.each(questionsArray, function(pIndex, question) {

		//questions.push('');
		
		text.push(question.question);
		//leanerResponse.push(question.leanerResponse);
		//correctAnswer.push(question.answers); 
		leanerResponse.push(question.leanerResponseIndexes);
		correctAnswer.push(pIndex + 1);

		//qPoints = 0;
		//qTotal = 0;

		for (var i = 0; i < question.answers.length; i++) 
		{
			if(question.answers[i] == question.leanerResponse[i] || gameNoCorrectAnswers)
			{
				//
				qPoints ++;
			}
		}

		if(isCorrect)
		{
			//qPoints ++;
		}
		qTotal ++;

	});

	questions.push(text);
	answers.push(leanerResponse);
	corrects.push(correctAnswer);

	if(qPoints == qTotal)
	{
		qPoints = 1;
	}
	else
	{
		qPoints = 0;
	}

	qTotal = 1;

	points.push(qPoints);
	totals.push(qTotal);


	gamePoints += qPoints;
	gameTotal += qTotal;


	//destroy
	$('[name=gapfield-list]').each(function (index, input) {

		//$(this).attr('disabled', 'disabled');
		$(this).sortable( "disable" );

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