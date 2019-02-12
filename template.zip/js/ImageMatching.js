var questionsArray = [];
var pages = [];

var sample = null; //[{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000001601275XSmall.jpg","question_audio":"","answers":["surfing"],"answers_audio":[null],"leanerResponse":["surfing"],"isCorrect":true},{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000003242136XSmall.jpg","question_audio":"","answers":["kayaking"],"answers_audio":[null],"leanerResponse":["coasteering"],"isCorrect":true},{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000020705968XSmall.jpg","question_audio":"","answers":["coasteering"],"answers_audio":[null],"leanerResponse":[""],"isCorrect":true},{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000006909808XSmall.jpg","question_audio":"","answers":["water-skiing"],"answers_audio":[null],"leanerResponse":[""],"isCorrect":true},{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000004799782XSmall.jpg","question_audio":"","answers":["horse riding"],"answers_audio":[null],"leanerResponse":[""],"isCorrect":true},{"image":"http://gamedata.monilab.net/sites/default/files/attachment/iStock_000016285201XSmall.jpg","question_audio":"","answers":["swimming"],"answers_audio":[null],"leanerResponse":[""],"isCorrect":true}];

var cardsArray = [];

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

    $(gameXMLDOM).find('SimpleQuestionItem').each(function(qIndex, question) {

        var answers = [];
        var answers_audio = [];

        $(question).find('Answer').each(function(aIndex, answer) {
            answers.push($(answer).text());
            answers_audio.push($(answer).attr('url'));

            cardsArray.push({
                text: $(answer).text(),
                audio: $(answer).attr('url')
            });
        });

        questionsArray.push({
            'image_alt': $(question).find('Image').attr('altText'), // require read param for alt_tag
            'image': $(question).find('Image > URL').text(),
            'question_audio': $(question).find('Audio > URL').text(),
            'answers': answers,
            'answers_audio': answers_audio
        });
        cardsArray.push({
            'text': $(question).find('Answer').text(),
            'audio': $(question).find('Answer').attr('url'),
            'correct': qIndex
        });
    });

}



//Game-specific reset procedure
function reset() {

    // make object pool list
    //$('#ajax-cont').empty();
    $('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div>');
    $('#ajax-cont').append('<div id="questions" class="row0 show-grid0"></div>');


    //console.log(questionsArray);

    var $option_pool_panel = $('<div class="panel panel-default"></div>');
    var $option_pool_panel_body = $('<div class="panel-body"></div>');
    var $option_pool_list = $('<ul id="main_list" name="option-pool-list" id="sortable1" class="option-pool-list list-inline"></ul>');

    //var $row = $('<div class="row"></div>');

    var $questions_wrapper = $('<div class="question-wrapper"></div>');


    $.each(questionsArray, function(pIndex, question) {

        // $question_wrapper = $('<div class="question col-sm-4 col-md-4" id="' + pIndex + '"></div>');

        //col-xs-6 col-sm-4 col-md-3 col-lg-3

        //col-xs-6 col-sm-4 col-md-3 col-lg-3

        var $question = $('<div class="question" id="' + pIndex + '"></div>');
        //var $form = $('<form class="form" role="form"></form>');
        //var $row1 = $('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-3"></div>'); // var $row1 = $('<div class="col-sm-6 col-md-4"></div>');
        var $row1 = $('<div class=""></div>'); // var $row1 = $('<div class="col-sm-6 col-md-4"></div>');
        var $row2 = $('<div class="thumbnail"></div>');
        //var $col1 = $('<div class="col-md-6"></div');
        //var $col2 = $('<div class="col-md-6"></div');

        var q = (pIndex + 1) + '';


        //var audio_item = '<div class="form-group">';
        var question_audio_item = createSimpleAudioButton(question.question_audio); //'<a class="btn-sm btn-primary mini-audio question-audio" data-href="http://authtool2.monilab.net/exact-lcms/ExactLCMS/LO13/81930CD0CB399201B8BE5833B07/elem1_5.1.2c.mp3"><span class="glyphicon glyphicon-play form-control-feedback0"></span></a>';
        var answer_audio_item = createSimpleAudioButton(question.answers_audio[0]); //'<a class="btn-sm btn-primary mini-audio answer-audio" data-href="http://authtool2.monilab.net/exact-lcms/ExactLCMS/LO13/81930CD0CB399201B8BE5833B07/elem1_5.1.2c.mp3"><span class="glyphicon glyphicon-play form-control-feedback0"></span></a>';

		var question_number = '';

		if (gameShowQuestionNo === "true" && questionsArray.length > 1)
		{
			question_number = q + '. ';
		}

        //audio_item += '</div>';

        //$row2.append(audio_item);

        //var $group_panel = $('<div class="panel panel-default"></div>');
        //var $group_panel_body = $('<div class="panel-body"></div>');
        //var $group_list = $('<ul id="sortable2" class="list-group"></ul>');

        var item = question_number;

        //item += '<div class="form-group">';

        if (question.image != "") {

            var alt_tag = question.image_alt;

            if(alt_tag && alt_tag != "")
            {
                var ext = alt_tag.substr(alt_tag.lastIndexOf('.')+1);

                if(alt_tag == "Image" || alt_tag == "undefined" || ext == 'jpg' || ext == 'png') {
                    alt_tag = "";
                }
                else
                {
                    //
                }
            }
            else 
            {
                alt_tag = "";
            }

            item += '<img src="' + question.image + '" class="img-responsive img-rounded" alt="' + alt_tag + '" />';
        } else {
            item += '<div class="question-audio-only">' + question_audio_item + '</div>'; //'<a class="btn-sm btn-primary mini-audio0 answer-audio img-responsive" data-href="http://authtool2.monilab.net/exact-lcms/ExactLCMS/LO13/81930CD0CB399201B8BE5833B07/elem1_5.1.2c.mp3"><span class="glyphicon glyphicon-play form-control-feedback0"></span></a>'; //question.question;
            question_audio_item = ''; // set this to empty
        }
        //item += '</div>';

        var dummy_item = '<div class="model-wrapper hidden">';
        dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
        dummy_item += '<span class="glyphicon pull-right"></span>' + answer_audio_item + question.answers[0];
        dummy_item += '</li>';
        dummy_item += '</div>';


        var default_value = "";
        if(sample){

            //console.log(sample);
            //var sampleArray = JSON.parse( sample );
            //console.log(sampleArray);
            default_value = sample[pIndex].leanerResponse;
            //default_index = sample[pIndex].leanerResponse; //leanerResponseIndexes;
        }

        var item2 = '';
        item2 += dummy_item;
        item2 += '<div class="caption">';
        item2 += question_audio_item;
        item2 += '<div class="panel panel-default form-group"><ul name="gapfield-list" class="gapfield-list list-group" data-question-index="' + pIndex + '">'; //

        //item += '<li class="list-group-item btn btn-warning">';
        //item += '<span class="glyphicon glyphicon-ok form-control-feedback"></span> awd awd awd awd awrfa fawf afawf awf'; // glyphicon-ok form-control-feedback
        //item += '</li>';

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



        item2 += '</ul></div>';
        item2 += '</div>';
        /*
				item += '<div class="form-group">';
				item += "footer";
				item += '</div>';
				*/


        //$row2.append(item);

        //$row1.append($row2);
        $row2.append(item);
        $row2.append(item2);

        //$row1.append($col1);
        //$row1.append($col2);


        //
        $question.append($row2);
        //$question.append($row2);
        //$question.append($row);
        //$row.append($question);

        $questions_wrapper.append($question);


        //var s = '<div class="onoffswitch switch-square tick"><input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="myonoffswitch-tick-square" checked=""><label class="onoffswitch-label" for="myonoffswitch-tick-square">span class="onoffswitch-inner"></span><span class="onoffswitch-switch tickswitch-switch"></span></label></div>';
        //$('#questions').append($questions_wrapper);
    });

    $('#questions').append($questions_wrapper);

    //$('#questions').append($row);

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




    var len = questionsArray.length; //question.answers.length;
    var shuffled_arr = generateShuffledIndexArray(len);
    for (var i = 0; i < len; i++) {
        var shuffled_index = shuffled_arr[i];


        //if(sample && sample[shuffled_index].leanerResponse[0] && sample[shuffled_index].leanerResponse[0] != "") {
        if($.inArray($.trim(questionsArray[shuffled_index].answers[0]), skip_arr) > -1) {
            // since it is already used, do not add it to the pool
        
        }
        else
        {
            var answer_audio_item = createSimpleAudioButton(questionsArray[shuffled_index].answers_audio[0]);
            var answer_item = '';
            //answer_item += '<li class="list-group-item btn btn-default">' + subquestion.answer[0] + '</li>';
            answer_item += '<li tabindex="0" class="list-group-item btn btn-default" data-question-index="' + shuffled_index + '">'; // btn-success
            //answer_item += '<div class="row">';
            //answer_item += '<div class="col-ls-2">';
            //answer_item += '<a class="btn btn-info" href="#"><span class="glyphicon glyphicon-play form-control-feedback"></span></a>';
            //answer_item += '</div>';
            //answer_item += '<div class="col-ls-10">';
            answer_item += '<span class="glyphicon pull-right glyphicon-hand-down"></span>' + answer_audio_item + questionsArray[shuffled_index].answers[0]; /*question.answers[shuffled_index]*/ ; // glyphicon-ok form-control-feedback
            //answer_item += '</div>';
            //answer_item += '</div>';
            answer_item += '</li>';
            $option_pool_list.append(answer_item);
        }
    }



    $option_pool_panel_body.append($option_pool_list);
    $option_pool_panel.append($option_pool_panel_body);

    $('#cardPile0').append($option_pool_panel);

	if (isUseSelectAndDrop)
	{
		selectAndDropManager = addSelectAndDropSupport();
		selectAndDropManager.limitDropToOneItem();
		selectAndDropManager.addDroppable('div.thumbnail');
		selectAndDropManager.setExtraGapFieldHintSelector('div.thumbnail');
		selectAndDropManager.setCustomGapFieldHintClass('gapfield-hint-image-matching');
	}
	else
	{
		addDragAndDropSupport();
		limitDragAndDropToOneItem();
		//allow to drop on parent
		$('.thumbnail').droppable({
			accept: '.ui-sortable li',
			drop: function(event, ui) {
				var ul = $(this).find("ul");

				if ($(ul).children().length) {
					//
					//console.log($(ul).children().length);
				} else {
					ui.draggable.clone().attr("style", "").appendTo($(this).find("ul"));
					ui.draggable.remove();
				}
			}
		});
	}
	
    updateRemainingQuestions();

    addAudioSupport();

    //$('.question').responsiveEqualHeightGrid();
}



function onShowAnswers(show) {
    debug.log('onShowAnswers')


    $('.question').each(function(index, input) {
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

    //console.log('onCheckPageAnswer')
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


        var list_item = $(this).find("li").eq(0);

        var val = getObjectText(list_item);
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

        //console.log('val : "' + val + '"')
        //console.log('model_val :', model_val)
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
		var span_sr_only_text = "";

        if (val == "" || $(list_item).data('dummy-item') == true) {
            div_classes += "has-warning";
            span_classes += "glyphicon-warning-sign";
            this_classes += "btn-warning";

            unanwsered_questions++;
        } else {
            if ($.inArray($.trim(val), model_val) > -1 || gameNoCorrectAnswers) {
                div_classes += "has-success ui-state-disabled";
                span_classes += "glyphicon-ok";
                this_classes += "btn-success ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Correct';

                div.removeClass('ui-sortable');
            } else {
                div_classes += "has-error";
                span_classes += "glyphicon-remove";
                this_classes += "btn-danger ui-state-disabled"; // if instant feedback
				span_sr_only_text = 'Incorrect';
            }
        }

        vals.push(val);

        //
        questionsArray[question_index].leanerResponse = vals;
        questionsArray[question_index].isCorrect = true;

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
//                $('.btn-danger').parent().sortable("enable");
                $('#main_list').append($('.btn-danger')); // add all wrong items back to the main_list
                $('#main_list li').removeClass('btn-danger btn-warning btn-success btn-info disabled ui-state-disabled');
                $('#main_list li span').removeClass('glyphicon-remove glyphicon-warning-sign glyphicon-ok').html('');//.not('.glyphicon-play').addClass('glyphicon-hand-down');
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

    $.each(questionsArray, function(pIndex, question) {

        //questions.push('');
        var qPoints = 0;
        var qTotal = 0;
        var text = "";
        var leanerResponse = [];
        var correctAnswer = [];
        var isCorrect = false;


        text = question.image; //question.question;
        leanerResponse = question.leanerResponse;
        correctAnswer = question.answers; //[0];
        isCorrect = question.isCorrect;

        qPoints = 0;
        qTotal = 0;

        for (var i = 0; i < question.answers.length; i++) {
            if (question.answers[i] == question.leanerResponse[i] || gameNoCorrectAnswers) {
                //
                qPoints++;
            }
        }

        if (isCorrect) {
            //qPoints ++;
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