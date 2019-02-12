var questionsArray = [];
var pages = [];

var sample = null; //[{"subquestions":[{"prefix":["Of course I realise the book was overwhelmingly popular. Nevertheless, I don’t believe this film does the book justice."],"answer":["1"],"options":["Therefore","Yet","Because"],"suffix":[""],"userAnswer":"","leanerResponse":["Therefore"],"leanerResponseIndexes":[1]}],"question_audio":""},{"subquestions":[{"prefix":["it won’t do well at the box-office.  Contrary to popular belief, people won’t be flocking to the cinemas. In spite of the hype, this film will go directly to TV or worse, DVD! Other critics are"],"answer":["1"],"options":["certain","doubtful","surprised"],"suffix":[""],"userAnswer":"","leanerResponse":["certain"],"leanerResponseIndexes":[1]}],"question_audio":""},{"subquestions":[{"prefix":["it will do exceptionally well. However, I’d suggest that they’re amateurish, and far from dependable. Look at how"],"answer":["1"],"options":["accurate","hopeful","obvious"],"suffix":[""],"userAnswer":"","leanerResponse":[""],"leanerResponseIndexes":[""]}],"question_audio":""}];


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

    $(gameXMLDOM).find('GapFillAssembledQuestionItem').each(function(qIndex, question) {

        var sub_questionsArray = [];

        $(question).find('GapFillQuestionItem').each(function(index, subquestion) {

            var prefixesArray = [];
            var answersArray = [];
            var suffixesArray = [];
            var optionsArray = [];

            var $options = $(this).find('Option');
            if ($options.length !== 0) {
                $options.each(function(oIndex, option) {

                    optionsArray.push($(option).text()); //.attr('value'));
                });
            } else {
                optionsArray = defaultOptions;
            }


            prefixesArray.push($(subquestion).find('Prefix').text().replace(/\<br \/\>/g, '').replace(/\[NL\]|\n/g, '<br />'));
            
            var correct_option = 1;

            if(gameNoCorrectAnswers == 0) //@@ correct anwsers
            {
                correct_option = $(subquestion).find('Answer').text();
            }

            answersArray.push(correct_option);
            
            suffixesArray.push($(subquestion).find('Suffix').text().replace(/\<br \/\>/g, '').replace(/\[NL\]|\n/g, '<br />'));

            sub_questionsArray.push({
                'prefix': prefixesArray,
                'answer': answersArray,
                'options': optionsArray,
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

        /*
        		$.each(question.subquestions, function (index, subquestion) {

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

        				item += '<div class="inline-block gapfield-wrapper">'; //has-error has-feedback
        				item += '<div class="form-group form-control0 inline-block">'; //has-error has-feedback
        				item += '<p contenteditable name="gapfield" placeholder=" " class="form-control gapfield" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '"></p>';
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
        */


        $.each(question.subquestions, function(index, subquestion) {

            //var $row2 = $('<div class="row"></row>');

            //for (var i = 0; i < subquestion.prefix.length; i++) {

            var dummy_item = '<div class="inline-block model-wrapper hidden">';
            dummy_item += '<div class="form-group form-control0 inline-block">';
            //dummy_item += '<li class="list-group-item btn btn-info ui-state-disabled dummy" data-dummy-item="true">';
            //dummy_item += '<span class="glyphicon"></span> ' + subquestion.answer;
            //dummy_item += '</li>';
            dummy_item += '<p contenteditable0 name="gapfield0" placeholder=" " class="btn btn-info form-control dummy" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">' + subquestion.options[subquestion.answer - 1] + '</p>';
            dummy_item += '<span class="glyphicon color-white form-control-feedback hidden"></span>'; //glyphicon-remove
            dummy_item += '</div>';
            dummy_item += '</div>';


            var item = '';

            item += '<div class="subquestion inline">'; // inline OR block ?????
            //item += '<div class="form-group">';
            item += subquestion.prefix[0] + ' '; // add space;
            //item += '</div>';

            item += dummy_item;

            //item += '<div class="form-group">'; //has-error has-feedback
            //item += '<p contenteditable name="gapfield" placeholder=" " class="form-control" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '"></p>';
            //item += '<span class="glyphicon form-control-feedback hidden"></span>'; //glyphicon-remove
            //item += '</div>';

            var default_value = "";
            var default_index = "";
            if(sample){

                //console.log(sample);
                //var sampleArray = JSON.parse( sample );
                //console.log(sampleArray);
                default_value = sample[pIndex].subquestions[index].leanerResponse;
                default_index = sample[pIndex].subquestions[index].leanerResponseIndexes;
            }


            item += '<div class="inline-block gapfield-wrapper">'; //has-error has-feedback

            item += '<div class="btn-group dropdown-menu-wrapper">';
            item += '<a name="gapfield" type="button" class="btn btn-default dropdown-toggle gapfield" data-toggle="dropdown" data-question-index="' + pIndex + '" data-sub-question-index="' + index + '">';
            item += '<span class="label" data-bind="label" data-option-index="' + default_index + '"> ' + default_value + '</span>&nbsp;<span class="glyphicon"></span>';
            item += '</a>';
            item += '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">';
            item += '<span class="caret"></span>';
            item += '<span class="sr-only">Toggle Dropdown</span>';
            item += '</button>';

            item += '<ul class="list-group dropdown-menu" role="menu">';

            //for (var i = 0; i < subquestion.answer.length; i++) {
            for (var i = 0; i < subquestion.options.length; i++) {
                item += '<li class="list-group-item btn btn-default" tabindex="0" data-option-index="' + i + '" >'; // btn-success
                item += '<span class="glyphicon pull-right form-control-feedback0"></span> ' + subquestion.options[i]; // glyphicon-ok
                item += '</li>';
            }

            //item += '<li class="list-group-item btn btn-default">'; // btn-success
            //item += '<span class="glyphicon pull-right form-control-feedback0"></span> ' + 'wrong'; // glyphicon-ok
            //item += '</li>';

            item += '</ul>';
            item += '</div>';

            item += '</div>';


            //item += '<div class="form-group">';
            item += ' ' + subquestion.suffix[0] + ' '; // add space
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



    $('.dropdown-menu, .dropdown-menu .btn').click(function(e) {
        //e.stopPropagation(); // if instant feedback

        //$('.dropdown').removeClass('open');
    });


    $('.dropdown-menu-wrapper').on('shown.bs.dropdown', function() {
        //e.stopPropagation(); // if instant feedback
        var elm = $(this).find('ul'); //$('ul:first', this);
        var off = elm.offset();
        if (off) {
            var l = off.left;
            var w = elm.width();
            var docW = $("#questions").width();

            var isWEntirelyVisible = (l + w <= docW);

            if (!isWEntirelyVisible) {
                elm.addClass('pull-right');
            } else {
                elm.removeClass('pull-right');
            }
        }

        //elmP.removeClass('dropup');

        var elmP = $(this); //$('ul:first', this);
        off = elmP.offset();
        if (off) {
            var t = off.top;
            var h1 = elmP.height();
            var h2 = elm.height();
            var docH = $("#questions").height();
			var docHTop = $("#questions").offset().top;

            var isHEntirelyVisible = (t + h1 + h2 <= docH + docHTop);

            if (!isHEntirelyVisible) {
                elmP.addClass('dropup');

				if (elm.offset().top < docHTop)
				{
					elmP.addClass('dropcenter');
					elmP.removeClass('dropup');
				}

                /*// check if to revert the change
		        off = elmP.offset();
		        if(off)
			    {
			    	var t = off.bottom;
			    	var h1 = elmP.height();
				    var h2 = elm.height();
				    var docH = $("#questions").height();

				    var isHEntirelyVisible = (t+ h1 + h2 <= docH);

				    if ( ! isHEntirelyVisible ) {
				    	elmP.removeClass('dropup');
				    }
				}*/

            } else {
                elmP.removeClass('dropup');
            }
        }

        //$('#questions').scrollTo(elm);

		$('li', elm).first().focus();
    });

    $('.dropdown-menu-wrapper').on('hide.bs.dropdown', function() {
        //e.stopPropagation(); // if instant feedback
        var elmP = $(this);
        var elm = $(this).find('ul'); //$('ul:first', this);
        elm.removeClass('pull-right');
        elmP.removeClass('dropup');
    });




    $('.dropdown-menu li').click(function(event) {
        //$('.dropdown-menu').on('hidden.bs.dropdown', function () {	

		$(this).parent().siblings('button.dropdown-toggle').focus();

        //event.stopPropagation(); // if instant feedback
        var $target = $(event.currentTarget);

        //$target.addClass("disabled"); // if instant feedback

        $target.closest('.btn-group').find('[data-bind="label"]').text($target.text());
        $target.closest('.btn-group').find('[data-bind="label"]').attr('data-option-index', $(this).data('option-index'));
        //.end()
        //.children( '.dropdown-toggle' ).dropdown( 'toggle' );

        //return false;

        // if instant feedback
        if (gameMode == "learn_mode") {
            onCheckPageAnswer();
        }

        updateRemainingQuestions();
    }).keypress(function(event)
	{
		var key = event.which;

		if (key == 13)
		{
			$(this).click();
		}
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
        var span = $(this).find(".glyphicon");

        $(this).removeClass("btn-danger btn-warning btn-success");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

    })

    $('[name=gapfield]').focusout(function() {
        //focus++;
        //$( "#focus-count" ).text( "focusout fired: " + focus + "x" );
        //onCheckPageAnswer();
    })


    ///////////////
    //
    updateRemainingQuestions();

    addAudioSupport();
}



function onShowAnswers(show) {
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

    $('[name=gapfield]').each(function(index, input) {

        if ($(this).hasClass('locked')) {
            return;
        }

        //$(this).attr('disabled', 'disabled');

        var val = $.trim($(this).find('.label').text()); //.val();
        var index_val = $(this).find('.label').attr('data-option-index');

        if (!isNaN(parseFloat(index_val)) && isFinite(index_val)) {
            index_val = +index_val + 1; // increment by 1
        } else {
            index_val = "";
        }

        // if(val == "") 
        // {
        // 	return;
        // }

        var question_index = $(this).data('question-index');
        var sub_question_index = $(this).data('sub-question-index');
        var model_answers = questionsArray[question_index].subquestions[sub_question_index].options[questionsArray[question_index].subquestions[sub_question_index].answer - 1];

        var model_val = model_answers.split("|");
        for (var i = 0; i < model_val.length; i++) {
            model_val[i] = $.trim(model_val[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
        }

        val = val.replace(/[”“]/g, "\"").replace(/[‘’]/g, "'");


        var vals = [];
        var index_vals = [];

        debug.log('val :', val)
        debug.log('model_val :', model_val)



        var div = $(this).parent();
        var span = $(this).find(".glyphicon");

        $(this).removeClass("btn-danger btn-warning btn-success btn-info");
        div.removeClass("has-feedback has-error has-warning has-success");
        span.removeClass("hidden glyphicon-remove glyphicon-warning-sign glyphicon-ok");

        var div_classes = "has-feedback0 ";
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
                div_classes += "has-success";
                span_classes += "glyphicon-ok";
                this_classes += "btn-success locked disabled0";
				span_sr_only_text = 'Correct';


                $(this).removeClass('dropdown-toggle');
                $(this).siblings('.dropdown-menu').remove();
                // if instant feedback
                //$(this).attr('data-toggle', 'locked');

                //$(this).removeAttr('data-toggle');

                //$(this).dropdown('toggle');
                $(this).removeAttr('data-toggle');
            } else {
                div_classes += "has-error0";
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
        index_vals.push(index_val);

        //
        questionsArray[question_index].subquestions[sub_question_index].leanerResponse = vals;
        questionsArray[question_index].subquestions[sub_question_index].leanerResponseIndexes = index_vals;


        if (showFeedback == true) {
            $(this).addClass(this_classes);
            span.addClass(span_classes);
            div.addClass(div_classes);
			span.html('<span class="sr-only">' + span_sr_only_text + '</span>');
        }


        // disable ALL if test mode
        if (gameMode == "test_mode") {
            //destroy
            //$( ".option-pool-list, .gapfield-list" ).sortable( "disable" );

            $(this).removeClass('dropdown-toggle');
            $(this).siblings('.dropdown-menu').remove();
            $(this).removeAttr('data-toggle');
        }

    });

    //if instant feedback
    if (gameMode == "learn_mode") {
        setTimeout(
            function() {
                $('.btn-danger .label').each(function() {
                    // 
                    $(this).text('');
                    $(this).removeAttr('data-option-index'); //.attr('data-option-index');
                });

                $('.btn-danger').removeClass('btn-danger'); //.addClass('disabled');
                $('.glyphicon-remove').removeClass('glyphicon-remove').addClass('hidden').html('');
            }, 1000);
    } else if (gameMode == "test_mode") {
        //destroy
        //$('[name=gapfield]').removeClass('dropdown-toggle');
        //$('[name=gapfield]').siblings('.dropdown-menu').remove();
        //$('[name=gapfield]').removeAttr('data-toggle');
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
            //leanerResponse.push(subquestion.leanerResponse);
            //correctAnswer.push(subquestion.options[subquestion.answer[0]-1]);

            if (getMode() == "placement_test") {
                leanerResponse.push(subquestion.leanerResponseIndexes);
                correctAnswer.push(subquestion.answer[0]);
            } else {
                leanerResponse.push(subquestion.leanerResponse);
                correctAnswer.push(subquestion.options[subquestion.answer[0] - 1]);
                //leanerResponse.push(subquestion.leanerResponseIndexes);
                //correctAnswer.push(subquestion.answer[0]);
            }



            for (var i = 0; i < subquestion.answer.length; i++) {
                subquestion.options[subquestion.answer[i] - 1] = $.trim(subquestion.options[subquestion.answer[i] - 1].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));
                subquestion.leanerResponse[i] = $.trim(subquestion.leanerResponse[i].replace(/[”“]/g, "\"").replace(/[‘’]/g, "'"));

                //if(subquestion.answer[i] == subquestion.leanerResponse[i])
                if (subquestion.options[subquestion.answer[i] - 1] == subquestion.leanerResponse[i] || gameNoCorrectAnswers) {
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
    /*$('[name=gapfield-list]').each(function(index, input) {

        //$(this).attr('disabled', 'disabled');
        $(this).sortable("disable");

    });*/

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