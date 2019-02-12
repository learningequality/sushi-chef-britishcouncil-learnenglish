var questionsArray = [];
var pages = [];
var sample = null; //[{"question":"\"I like music but I don't like all that modern music and dancing.\"   Sam","question_audio":"","answers":["The Beatles Story"],"answers_audio":[null],"leanerResponse":["The Beatles Story"],"leanerResponseIndexes":[1]},{"question":"\"Well, we don't have much money.\"   George and Doris","question_audio":"","answers":["Liverpool Musuem"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"My sister and I love buying shoes.\"   Yuka","question_audio":"","answers":["Liverpool ONE"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"I love all forms of exercise especially team sports.\"   Luka","question_audio":"","answers":["Liverpool FC"],"answers_audio":[null],"leanerResponse":["Liverpool FC"],"leanerResponseIndexes":[4]}];

var gameManager =
{
	questionBank: {},
	answerBank: {},
	selectedItemIndex: [],
	gameInProgress: false,
	gameStopped: false,
    playAudioFlip: false,
	showAnswersInPairs: true,
	nextFocusItemIndex: -1,
	timerTotal: 0
};

$(document).ready(function() {
	entryPoint();
});

//Game-specific initialization
function init()
{
	setIsKidsGame(true);
	addKidsGameClassToBody();
	questionsArray.length = 0;

	var _arrayElement, _str, _$obj;

	$(gameXMLDOM).find('FindThePairQuestionItem').each(function (qIndex, question)
	{
		question = $(question);
		_$obj = question.find('Answer1');

		_arrayElement = {
			leanerResponse: [],
			text: _$obj.text().trim(),
			question: {
				audio: '',
				image: {
					url: '',
					alt: ''
				}
			},
			answers: [{
				audio: '',
				image: {
					url: '',
					alt: ''
				}
			}]
		};

		_str = _$obj.find('Audio').attr('url');

		if (_str) {
			_arrayElement.question.audio = _str;
		}

		_$obj = _$obj.find('Image');
		_str = _$obj.attr('url');

		if (_str) {
			_arrayElement.question.image.url = _str;

			_str = _$obj.attr('altText');

			if (_str) {
				_arrayElement.question.image.alt = _str;
			}
		}

		_$obj = question.find('Answer2');
		_str = _$obj.find('Audio').attr('url');

		if (_str) {
			_arrayElement.answers[0].audio = _str;
		}

		_$obj = _$obj.find('Image');
		_str = _$obj.attr('url');

		if (_str) {
			_arrayElement.answers[0].image.url = _str;

			_str = _$obj.attr('altText');

			if (_str) {
				_arrayElement.answers[0].image.alt = _str;
			}
		}

		questionsArray.push(_arrayElement);
	});

	if (gameXML_timer)
	{
		gameManager.timerTotal = gameXML_timer;
	}

	if (sample)
	{

	}
	else
	{
		showBlankLandingPage();
		hideLandingPageContents();

		var _imageSrc = $(gameXMLDOM).find('LandingPage').find('Image').find('src').text();
		var _imageAlt;

		if (_imageSrc != '')
		{
			_imageAlt = $(gameXMLDOM).find('LandingPage').find('Image').find('alt').text();
		}
		else
		{
			_imageSrc = 'images/landing-page/FindThePairs.png';
			_imageAlt = '';
		}

		setLandingPageHTML('<div id="landing-page-image-container"><img id="landing-page-image" src="' + _imageSrc + '" alt="' + _imageAlt + '" /></div><div><button id="button-start" class="button button-start" type="button">Start</button></div>');
		fadeInLandingPageContents();
        focusStartButton();

		$('#button-start').click(function(e)
		{
			fadeOutLandingPageInSequence(function(e)
			{
				startGame();
			});
		});
	}

	moveItemRemainingUnderPager();
	addKidsGameHeader();
	setUseDefaultFeedback(false);
	$('#finishButton, #ajax-pages').remove();
}

//Game-specific reset procedure
function reset()
{
	$('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div><div id="questions"></div>');

	debug.log(questionsArray);

	var _pairItem = [];
	var _html, $row1, $col1, _audio;
	var _itemIndex = 0;
	var _$obj;

	$row1 = $('<div class="row"></div>');
	$col1 = $('<div class="col-xs-12"></div');

	$.each(questionsArray, function(pIndex, question)
	{
		gameManager.questionBank[pIndex] =
		{
			answer_correct: false
		}

		for (var i=0; i<2; i++)
		{
			if (i == 0) {
				_$obj = question.question.image;
				_audio = question.question.audio;
			}
			else {
				_$obj = question.answers[0].image;
				_audio = question.answers[0].audio;
			}

			_html = '<button type="button" class="pair-item pair-item-';

			if (_$obj.url != '') {
				_html += 'image';
			}
			else {
				_html += 'text';
			}

			_html += '" data-side="face" data-item-index="' + _itemIndex + '"><div class="pair-item-face-side">&nbsp;</div><div class="pair-item-back-side">';

			if (_$obj.url != '') {
				_html += '<img src="' + _$obj.url + '" alt="' + _$obj.alt + '"/>';
			}
			else {
				_html += question.text;
			}

			_html += '</div><div class="pair-item-audio hidden">' + createSimpleAudioButton(_audio) + '</div><span class="sr-only"></span></button>';

			_pairItem.push(_html);

			gameManager.answerBank[_itemIndex] =
			{
				question_index: pIndex
			};

			_itemIndex++;
		}
	});

	$col1.append(function()
	{
		var _html, _pairAnswerItem;

		if (gameManager.showAnswersInPairs) {
			_pairAnswerItem = _pairItem.slice(0);
			shuffle(_pairItem);
		}
		else {
			shuffle(_pairItem);
			_pairAnswerItem = _pairItem;
		}

		_html = _pairItem.join('');

		for (var i=0; i<_pairAnswerItem.length; i++) {
			_html += $(_pairAnswerItem[i]).addClass('dummy hidden').attr('data-side', 'back').removeAttr('data-item-index').wrap('<p/>').parent().html();
		}

		for (var i=0; i<questionsArray.length; i++)
		{
			_html += '<span class="hidden btn-info"></span>';
		}

		return _html;
	});

	$row1.append($col1);
	$('#questions').append($row1);

    if (gameManager.playAudioFlip) {
        $('body').append(
            '<audio id="audio-flip" class="hidden independent"><source src="audio/findthepairs/flip.mp3" type="audio/mpeg"></audio>'
        );
    }

	updateRemainingQuestions();
	addAudioSupport();

    $('button.pair-item.dummy').click(function(e) {
        if (!$(e.target).is('a')) {
            $(this).find('a').click();
        }
    });

	if (!sample)
	{
		$('button.pair-item').not('button.dummy').click(onClickPairItem);

		if (gameManager.timerTotal > 0)
		{
			timer.init(gameManager.timerTotal);
			timer.setDisplayElement($('#value-timer'));
			timer.setOnTimeIsUpCallback(onTimeIsUpCallback);
		}
	}
	else
	{
		if (!Array.isArray(sample))
		{
			sample = [sample];
		}

		for (var i=0; i<sample.length; i++)
		{
			for (var j=0; j<sample[i].leanerResponse.length; j++)
			{
				gameManager.selectedItemIndex.push(sample[i].leanerResponse[j]);
			}
		}

		if (gameManager.timerTotal > 0)
		{
			$('#value-timer').text(gameManager.timerTotal);
		}
	}

	showKidsGameHeaderComponent(true, false, false, (gameManager.timerTotal > 0));
}

function onTimeIsUpCallback(displayElement)
{
	onConfirmedFinish();
}

function startGame()
{
	if (gameManager.timerTotal > 0)
	{
		timer.start();
	}

	gameManager.gameInProgress = true;
	$('#questions').find('button.pair-item').first().focus();
}

function stopGame()
{
	if (gameManager.gameStopped) {
		return false;
	}

	gameManager.gameStopped = true;

	timer.stop();

	gameManager.gameInProgress = false;

	disableAllPairItem();

	if (isTestMode()) {
		if (gameModeOptions.showTryAgain) {
			$('#resetButton').removeClass('disabled hidden');
		}

		if (gameModeOptions.showSeeAllAnswerOption) {
			$('#showAnwsersButton').removeClass('disabled hidden');
		}

		if (gameModeOptions.showScore) {
			$('#scoreButton').removeClass('disabled hidden');
		}
	}
	else {
		$('#resetButton, #showAnwsersButton, #scoreButton').removeClass('disabled hidden');
	}

	$('#scoreButton').attr('onclick', 'showFeedbackDialog()');

	if (sample) {

	}
	else {
		showFeedbackDialog();
	}
}

function showFeedbackDialog() {
	closeAllBootstrapDialogs();

	if (isTestMode() && !gameModeOptions.showScore) {
		return true;
	}

	var _details = getScoringDetails();
	var _buttons = [];

	if (!(isTestMode() && !gameModeOptions.showTryAgain)) {
		_buttons.push({
			label: 'Try again',
			action: function(dialogRef){
				onTryAgain();
			}
		});
	}

	_buttons.push({
		label: 'Close',
		action: function(dialogRef){
			dialogRef.close();
		}
	});

	BootstrapDialog.show({
		title: '',
		message: '<div class="title">' + getKidsGameScoringMsg(_details.percent) + '</div><div class="content">You scored ' + _details.correctCount + ' out of ' + _details.totalCount + ' (' + _details.percent + '%)</div>',
		closable: false,
		buttons: _buttons,
		onshown: function(dialogRef) {
			$('div.bootstrap-dialog-footer-buttons').find('button').first().focus();
		},
		onhidden: focusToFirstAnsweredItem
	});
}

function onClickPairItem(e)
{
	if (gameManager.gameInProgress && !$(this).prop('disabled'))
	{
		$(this).prop('disabled', true).addClass('selected');

		flipPairItem($(this));
		stopAllSound();

        if (gameManager.playAudioFlip) {
            $('#audio-flip').get(0).pause();
            $('#audio-flip').get(0).currentTime = 0;
            $('#audio-flip').get(0).play();
        }

        $(this).find('a').click(); // play audio

		gameManager.selectedItemIndex.push($(this).attr('data-item-index'));

		if (gameManager.selectedItemIndex.length == 2)
		{
			onCheckPageAnswer();

			if (isTestMode() && getRemainingQuestionsCount() == 0) {
				onConfirmedFinish();
			}
		}
		else {
			focusNextButton($(this));
		}
	}
}

function focusNextButton($button) {
	var _$button = $button.nextAll('button:not(.dummy, .correct)').first();

	if (_$button.length) {
		_$button.focus();
	}
	else {
		_$button = $button.prevAll('button:not(.dummy, .correct)').first();

		if (_$button.length) {
			_$button.focus();
		}
	}
}

function flipPairItem($pairItem)
{
	if ($pairItem.attr('data-side') == 'face')
	{
		$pairItem.attr('data-side', 'back');
	}
	else
	{
		$pairItem.attr('data-side', 'face');
	}
}

function disableAllPairItem()
{
	$('button.pair-item').not('.dummy').prop('disabled', true);
}

function onShowAnswers()
{
	debug.log('onShowAnswers');

	var _$hide = $('button.pair-item');
	var _$show = _$hide.filter('button.hidden');

	_$hide.addClass('hidden');
	_$show.removeClass('hidden');
}

function getScoringDetails() {
	var _details = {
		correctCount: 0
	};

	$.each(gameManager.questionBank, function(key, value) {
		if (value.answer_correct) {
			_details.correctCount++;
		}
	});

	_details.totalCount = getTotalOfQuestion();
	_details.percent = Math.round(_details.correctCount / _details.totalCount * 100);

	return _details;
}

function onCheckPageAnswer()
{
	debug.log('onCheckPageAnswer');

	var _index;
	var _haveIncorrectAnswer = false;

	var _selectedItemCorrect = [];
	var _selectedItemQuestionIndex = [];

	for (var i=0; i<gameManager.selectedItemIndex.length; i++)
	{
		_selectedItemCorrect.push(false);
		_selectedItemQuestionIndex.push(gameManager.answerBank[gameManager.selectedItemIndex[i]].question_index);
	}

	$('button.pair-item').removeClass('selected');

	for (var i=0; i<_selectedItemCorrect.length; i++)
	{
		if (!_selectedItemCorrect[i])
		{
			_index = _selectedItemQuestionIndex.lastIndexOf(_selectedItemQuestionIndex[i]);

			if (_index == -1 || _index == i)
			{
				_haveIncorrectAnswer = true;

				$('button[data-item-index="' + gameManager.selectedItemIndex[i] + '"]').addClass('incorrect').prop('disabled', true);
			}
			else
			{
				_selectedItemCorrect[i] = true;
				_selectedItemCorrect[_index] = true;

				$('button[data-item-index="' + gameManager.selectedItemIndex[i] + '"], button[data-item-index="' + gameManager.selectedItemIndex[_index] + '"]').addClass('correct').prop('disabled', true).find('span.sr-only').text('correct');
				$('#questions').append('<span class="btn-success hidden"></span>');

				gameManager.questionBank[_selectedItemQuestionIndex[i]].answer_correct = true;

				questionsArray[_selectedItemQuestionIndex[i]].leanerResponse = [gameManager.selectedItemIndex[i], gameManager.selectedItemIndex[_index]];
			}
		}
	}

	gameManager.nextFocusItemIndex = -1;

	if (gameManager.selectedItemIndex.length == 2) {
		if (_haveIncorrectAnswer) {
			gameManager.nextFocusItemIndex = gameManager.selectedItemIndex[1];
		}
		else {
			focusNextButton($('button.pair-item[data-item-index="' + gameManager.selectedItemIndex[1] + '"]'));
		}
	}

	gameManager.selectedItemIndex.length = 0;

	updateRemainingQuestions();

	$('#value-score').text(getScoringDetails().percent);

	if (sample)
	{
		flipPairItem($('button.correct'));
	}
	else if (_haveIncorrectAnswer)
	{
		disableAllPairItem();
		$('button[data-side="face"]').addClass('disabled');

		setTimeout(function()
		{
			var _$incorrectItems = $('button.incorrect');

			_$incorrectItems.removeClass('incorrect');

			flipPairItem(_$incorrectItems);

			if (gameManager.gameInProgress)
			{
				$('button[data-side="face"]').removeClass('disabled').prop('disabled', false);

				if (gameManager.nextFocusItemIndex != -1) {
					$('button.pair-item[data-item-index="' + gameManager.nextFocusItemIndex + '"]').focus();
				}
			}
			else
			{
				$('button[data-side="face"]').removeClass('disabled');
			}

		}, 2000);
	}
}

//The score values to be displayed after the game finish
//returns: {percentage: , points: , total: }
function getScore()
{
	stopGame();

	var questions = [];
	var answers = [];
	var corrects = [];
	var points = [];
	var totals = [];
	var gamePoints = 0;
	var gameTotal = 0;
	var qPoints, qTotal;

	$.each(questionsArray, function(pIndex, question)
	{
		qPoints = 0;
		qTotal = 0;

		if (gameManager.questionBank[pIndex].answer_correct)
		{
			qPoints++;
		}

		qTotal ++;

		questions.push(question.question);
		answers.push(question.leanerResponse);
		corrects.push(question.answers);

		points.push(qPoints);
		totals.push(qTotal);

		gamePoints += qPoints;
		gameTotal += qTotal;
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
		'learnerResponse': questionsArray
	};
}
