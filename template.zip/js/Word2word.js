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
	gameSoundOn: true,
	muteButtonVisible: true,
	restoreShowAllSentences: true,
	stopGameShowAllSentences: false,
	showAnswersButtonVisible: true,
	showPagerOnlyIfAllCorrect: false,
	livesTotal: 5,
	nextFocusWordIndex: -1,
	timerTotal: 20
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

	var _item, _itemText;

	$(gameXMLDOM).find('OrderedQuestionItems').each(function (qIndex, question)
	{
		_item = new Array();

		$(question).find('OrderedQuestionItem').each(function (index, item)
		{
			_itemText = $(item).text().trim();

			if (_itemText != '')
			{
				_item.push(_itemText);
			}
		});

		questionsArray.push({
			'question': _item
		});
	});

	if (gameXML_timer)
	{
		gameManager.timerTotal = gameXML_timer;
	}

	if (gameXML_lives)
	{
		gameManager.livesTotal = gameXML_lives;
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
			_imageSrc = 'images/landing-page/Word2Word.png';
			_imageAlt = '';
		}

		setLandingPageHTML('<div id="landing-page-image-container"><img id="landing-page-image" src="' + _imageSrc + '" alt="' + _imageAlt + '" /></div><div><button id="button-start" class="button button-start" type="button">Start</button></div>');
		fadeInLandingPageContents();
        focusStartButton();

		$('#button-start').click(function(e)
		{
			$('#audio-ticking').get(0).muted = true;
			$('#audio-ticking').get(0).play(); // iOS Safari requires user (click) event to play audio

			fadeOutLandingPageInSequence(function(e)
			{
				startGame();
			});
		});
	}

	moveItemRemainingUnderPager();
	addKidsGameHeader();
	setUseDefaultFeedback(false);
	$('#finishButton').remove();
}

//Game-specific reset procedure
function reset()
{
	$('#ajax-cont').append('<div id="cardPile0"></div><div id="cardSlots0"></div><div id="questions"></div>');

	debug.log(questionsArray);

	var _question, _sequenceIndex, _shuffledIndex;
	var _html = '';
	var _answerIndex = 0;

	for (var i=0; i<questionsArray.length; i++)
	{
		_question = questionsArray[i].question.slice();
		_sequenceIndex = new Array();

		_html += '<div class="question show-grid0" id="' + i + '"><div class="row"><div class="col-xs-12 word-container">';

		for (var j=0; j<_question.length; j++)
		{
			gameManager.answerBank[_answerIndex] =
			{
				questionIndex: i,
				text: _question[j]
			};

			_sequenceIndex.push(_answerIndex);
			_answerIndex++;
		}

		_shuffledIndex = generateShuffledIndexArray(_question.length);
		_question.length = 0;

		_question = gameManager.questionBank[i] =
		{
			sequence_index: _sequenceIndex,
			answered: false,
			answer_correct: false
		};

		for (var j=0; j<_shuffledIndex.length; j++)
		{
			_html += '<button type="button" class="word word-style-' + j + '" data-index="' + _question.sequence_index[_shuffledIndex[j]] + '">' + gameManager.answerBank[_question.sequence_index[_shuffledIndex[j]]].text + '<span class="sr-only"></span></button>';
		}

		_html += '</div><div class="col-xs-12 sentence-container"></div><div class="col-xs-12 answer-container hidden">' + questionsArray[i].question.join(' ') + '</div><span class="btn-info hidden"></span></div></div>';
	}

	$('#questions').append(_html);
	$('button.word').click(onClickWord);
	$('body').append(
		'<div id="audio-correct" class="hidden">' + createSimpleAudioButton('audio/word2word/correct.mp3') + '</div>' +
		'<div id="audio-incorrect" class="hidden">' + createSimpleAudioButton('audio/word2word/incorrect.mp3') + '</div>' +
		'<audio id="audio-ticking" class="hidden independent" loop><source src="audio/word2word/ticking.mp3" type="audio/mpeg"></audio>'
	);

	if (gameManager.muteButtonVisible) {
		$('#muteButton').removeClass('hidden disabled');
		refreshMuteButton();
	}

	updateRemainingQuestions();
	addAudioSupport();

	if (gameManager.timerTotal > 0) {
		timer.setDecimalPlace(2);
		timer.init(gameManager.timerTotal);
		timer.setDisplayElement($('#value-timer'));
	}

	if (!sample)
	{
		if (gameManager.livesTotal > 0)
		{
			lives.init(gameManager.livesTotal);
			lives.setDisplayElement($('#value-lives'));
			lives.setOnChangeCallback(onLivesChange);
		}

		if (gameManager.timerTotal > 0)
		{
			timer.setOnStartCallback(onStartCallback);
			timer.setOnTimeIsUpCallback(onTimeIsUpCallback);
			timer.setOnStopCallback(onStopCallback);
		}
	}
	else
	{
		if (!Array.isArray(sample))
		{
			sample = [sample];
		}

		for (var i=0; i<sample.length; i++) {
			gameManager.questionBank[i].answer_correct = sample[i].answer_correct;
			gameManager.questionBank[i].answered = sample[i].answered;
			gameManager.questionBank[i].unansweredTotal = sample[i].unansweredTotal;
		}

		if (gameManager.livesTotal > 0)
		{
			$('#value-lives').text(gameManager.livesTotal)
		}
	}

	showKidsGameHeaderComponent(true, false, (gameManager.livesTotal > 0), (gameManager.timerTotal > 0));
}

function getPageCallback(pageIndex)
{
	if (pageIndex > 0 && gameManager.gameInProgress)
	{
        hidePager();
		timer.reset();
		timer.start();
		lives.reset();
		focusFirstVisibleWord();
	}
}

function onLivesChange(livesRemaining, livesTotal, displayElement)
{
	if (livesRemaining <= 0)
	{
		endCurrentQuestion();
	}
}

function onStartCallback(timeRemaining, timeTotal, displayElement) {
	$('#container-timer').addClass('spinning');
    $('#audio-ticking').get(0).currentTime = 0;
	$('#audio-ticking').get(0).play();

	refreshTickingAudio();
}

function onStopCallback(timeRemaining, timeTotal, displayElement) {
	$('#container-timer').removeClass('spinning');
	$('#audio-ticking').get(0).pause();
}

function onTimeIsUpCallback(displayElement)
{
	endCurrentQuestion();
}

function enableCurrentQuestionWords()
{
	if (gameManager.gameInProgress) {
		$('button.word:visible').prop('disabled', false);
	}
}

function disableCurrentQuestionWords()
{
	$('button.word:visible').prop('disabled', true);
}

function startGame()
{
	if (gameManager.timerTotal > 0)
	{
		timer.start();
	}

	gameManager.gameInProgress = true;
    hidePagerPrevious();
	focusFirstVisibleWord();
}

function stopGame()
{
	if (gameManager.gameStopped) {
		return false;
	}

	gameManager.gameStopped = true;

	timer.stop();

	gameManager.gameInProgress = false;

	disableAllWord();

    showPagerPrevious();

	if (isTestMode()) {
		if (gameModeOptions.showTryAgain) {
			$('#resetButton').removeClass('disabled hidden');
		}

		if (gameManager.showAnswersButtonVisible && gameModeOptions.showSeeAllAnswerOption) {
			$('#showAnwsersButton').removeClass('disabled hidden');
		}

		if (gameModeOptions.showScore) {
			$('#scoreButton').removeClass('disabled hidden');
		}
	}
	else {
		$('#resetButton, #scoreButton').removeClass('disabled hidden');

		if (gameManager.showAnswersButtonVisible) {
			$('#showAnwsersButton').removeClass('disabled hidden');
		}
	}

	$('#scoreButton').attr('onclick', 'showFeedbackDialog()');

	var _showQuestionAnswer;
	var _numCorrect = 0;

	$.each(gameManager.questionBank, function(questionId, question) {
		if (sample) {
			_showQuestionAnswer = gameManager.restoreShowAllSentences || question.answered;
		}
		else {
			_showQuestionAnswer = gameManager.stopGameShowAllSentences && !question.answered;
		}

		if (_showQuestionAnswer) {
			var _highlight;

			for (var i=0; i<question.sequence_index.length; i++) {
				_highlight = (sample && i >= question.sequence_index.length - question.unansweredTotal);

				addWordToSentenceContainer(questionId, gameManager.answerBank[question.sequence_index[i]].text, _highlight);
			}

			$('button.word', '#' + questionId).hide();

			if (sample) {
				$('#' + questionId).find('span.btn-info').addClass('btn-success');

				if (question.answer_correct) {
					$('#' + questionId).find('div.sentence-container').addClass('correct').append('<span class="sr-only">correct</span>');
				}
			}
		}

		if (question.answer_correct) {
			_numCorrect++;
		}
	});

	if (gameManager.showPagerOnlyIfAllCorrect && _numCorrect < questionsArray.length) {
		hidePager();
	}

	if (sample) {
		updateRemainingQuestions();
		$('#value-score').text(getScoringDetails().percent);
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

function endCurrentQuestion()
{
	gameManager.gameInProgress = false;
	timer.stop();
	disableCurrentQuestionWords();
	$('#finishButton').addClass('disabled');
	closeAllBootstrapDialogs();
	$('#' + getCurrentQuestionId()).find('span.btn-info').addClass('btn-success');
	showAnswerAnimation();
}

function onClickWord(e)
{
	if (gameManager.gameInProgress && !$(this).prop('disabled'))
	{
		$(this).prop('disabled', true);

		var _index = $(this).attr('data-index');

		if (_index)
		{
			gameManager.selectedItemIndex.length = 0;
			gameManager.selectedItemIndex.push(_index);

			onCheckPageAnswer();
		}
	}
}

function disableAllWord()
{
	$('button.pair-item').prop('disabled', true);
}

function focusFirstVisibleWord() {
	$('button.word:visible').first().focus();
}

function focusNextWord() {
	if (gameManager.nextFocusWordIndex != -1) {
		$('button[data-index="' + gameManager.nextFocusWordIndex + '"]').focus();
	}
}

function onShowAnswers(show)
{
	debug.log('onShowAnswers');

	var _$answerContainer = $('div.answer-container');
	var _$sentenceContainer = $('div.sentence-container');

	if (_$answerContainer.hasClass('hidden')) {
		_$answerContainer.removeClass('hidden');
		_$sentenceContainer.addClass('hidden');
	}
	else {
		_$sentenceContainer.removeClass('hidden');
		_$answerContainer.addClass('hidden');
	}
}

function toggleMute() {
	gameManager.gameSoundOn = !gameManager.gameSoundOn;
	refreshTickingAudio();
	refreshMuteButton();
}

function refreshTickingAudio() {
	$('#audio-ticking').get(0).muted = !gameManager.gameSoundOn;
}

function addWordToSentenceContainer(questionId, word, highlight)
{
	highlight = highlight || false;

	var _html;

	if (highlight) {
		_html = '<span class="word-highlighted">' + word + ' </span>';
	}
	else {
		_html = word + ' ';
	}

	$('#' + questionId).find('div.sentence-container').html($('#' + questionId).find('div.sentence-container').html() + _html);
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

	if (sample)
	{

	}
	else if (gameManager.selectedItemIndex.length == 1)
	{
		var _wordIndex = gameManager.selectedItemIndex[0];
		var _questionIndex = gameManager.answerBank[_wordIndex].questionIndex;
		var _question = gameManager.questionBank[_questionIndex];

		if (!_question.answer_correct && _question.sequence_index.length > 0)
		{
			_question.answered = true;

			if (_wordIndex == _question.sequence_index[0])
			{
				if (gameManager.gameSoundOn) {
					$('#audio-correct').find('a').click();
				}

				addWordToSentenceContainer(_questionIndex, gameManager.answerBank[_wordIndex].text);
				$('button[data-index="' + _wordIndex + '"]').addClass('burst').fadeOut(500);

				_question.sequence_index.shift();

				if (_question.sequence_index.length == 0)
				{
					_question.answer_correct = true;
					$('#' + _questionIndex).find('div.sentence-container').addClass('correct').append('<span class="sr-only">correct</span>');
					endCurrentQuestion();
				}
				else {
					var _$button = $('button.word[data-index="' + _wordIndex + '"]').nextAll('button.word:visible').first();

					if (_$button.length) {
						gameManager.nextFocusWordIndex = _$button.attr('data-index');
					}
					else {
						_$button = $('button.word[data-index="' + _wordIndex + '"]').prevAll('button.word:visible').first();

						if (_$button.length) {
							gameManager.nextFocusWordIndex = _$button.attr('data-index');
						}
						else {
							gameManager.nextFocusWordIndex = -1;
						}
					}

					focusNextWord();
				}
			}
			else
			{
				if (gameManager.gameSoundOn) {
					$('#audio-incorrect').find('a').click();
				}

				lives.decrement();

				if (lives.remaining > 0 || gameManager.livesTotal == 0)
				{
					gameManager.nextFocusWordIndex = _wordIndex;
					$('button.word[data-index="' + _wordIndex + '"]').addClass('incorrect').find('span.sr-only').text('incorrect');
					incorrectWordAnimation();
				}
			}
		}

		gameManager.selectedItemIndex.length = 0;
		$('#value-score').text(getScoringDetails().percent);
	}
}

function incorrectWordAnimation()
{
	disableCurrentQuestionWords();

	$('button.word:visible').css('opacity', '0.5');

	setTimeout(function()
	{
		$('button.word:visible').css('opacity', '1').removeClass('incorrect').find('span.sr-only').text('');
		enableCurrentQuestionWords();
		focusNextWord();
	}, 2000);
}

function showAnswerAnimation()
{
	var _id = getCurrentQuestionId();

	if (_id && gameManager.questionBank[_id])
	{
		var _question = gameManager.questionBank[_id];

		if (_question.sequence_index.length) {
			$('#' + _id).find('div.sentence-container').addClass('sentence-answer');

			setTimeout(answerAnimationCallback, _question.sequence_index.length * 2000);

			for (var i=0; i<_question.sequence_index.length; i++)
			{
				$('button[data-index="' + _question.sequence_index[i] + '"]').delay(i * 2000).fadeOut(1000, function()
				{
					var _index = $(this).attr('data-index');

					if (_index && gameManager.answerBank[_index])
					{
						addWordToSentenceContainer(getCurrentQuestionId(), gameManager.answerBank[_index].text, true);
					}
				});
			}
		}
		else {
			answerAnimationCallback();
		}
	}
}

function answerAnimationCallback() {
	$('#finishButton').removeClass('disabled');

	var _id = getCurrentQuestionId();

	if (_id) {
		if (_id >= (questionsArray.length-1)) {
			onConfirmedFinish();
		}
		else {
            showPager();
            focusPagerNext();
			gameManager.gameInProgress = true;
		}

		updateRemainingQuestions();
	}
}

function getCurrentQuestionId()
{
	return $('#questions').find('div.question:visible').first().attr('id');
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

		question.answer_correct = false;
		question.answered = false;

		if (gameManager.questionBank[pIndex].answer_correct)
		{
			qPoints++;
			question.answer_correct = true;
		}

		question.answered = gameManager.questionBank[pIndex].answered;
		question.unansweredTotal = gameManager.questionBank[pIndex].sequence_index.length;

		qTotal ++;

		questions.push(question.question);
		answers.push(question.question);
		corrects.push(question.question);

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
