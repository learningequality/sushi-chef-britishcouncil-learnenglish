var questionsArray = [];
var pages = [];
var sample = null; //[{"question":"\"I like music but I don't like all that modern music and dancing.\"   Sam","question_audio":"","answers":["The Beatles Story"],"answers_audio":[null],"leanerResponse":["The Beatles Story"],"leanerResponseIndexes":[1]},{"question":"\"Well, we don't have much money.\"   George and Doris","question_audio":"","answers":["Liverpool Musuem"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"My sister and I love buying shoes.\"   Yuka","question_audio":"","answers":["Liverpool ONE"],"answers_audio":[null],"leanerResponse":[""],"leanerResponseIndexes":[""]},{"question":"\"I love all forms of exercise especially team sports.\"   Luka","question_audio":"","answers":["Liverpool FC"],"answers_audio":[null],"leanerResponse":["Liverpool FC"],"leanerResponseIndexes":[4]}];

var gameManager =
{
	questionBank: {},
	selectedChar: null,
	gameInProgress: false,
	gameStopped: false,
    gameSoundOn: true,
    muteButtonVisible: true,
	showAnswersButtonVisible: true,
	livesTotal: 0,
	timerTotal: 0,
	balloonLaunchHeadway: 1000,
	balloonFlyTime: 4950,
	balloonQueue: [],
	balloonPerQuestion: 5,
	balloonPositionCounter: -1,
	balloonPositionTotal: 6,
	balloonStyleTotal: 5,
	balloonLaunchInterval: null,
	shootingChar: null,
	shootingCharAppearHeadway: new Array(3, 4, 5).sort(),
	nextCharCounter: 0,
	currentPageIndex: null,
	startLaunchingBalloon: function()
	{
		this.stopLaunchingBalloon();
		this.nextCharCounter = 0;
		this.launchBalloon();
		this.balloonLaunchInterval = setInterval(function()
		{
			gameManager.launchBalloon();
		}, this.balloonLaunchHeadway);
	},
	stopLaunchingBalloon: function()
	{
		if (this.balloonLaunchInterval)
		{
			clearInterval(this.balloonLaunchInterval);
		}
	},
	pushBalloonToQueue: function(balloon)
	{
		if (balloon)
		{
			this.balloonQueue.push(balloon);
		}
	},
	getNextBalloonPosition: function()
	{
		this.balloonPositionCounter++;

		if (this.balloonPositionCounter >= this.balloonPositionTotal)
		{
			this.balloonPositionCounter = 0;
		}

		return this.balloonPositionCounter;
	},
	launchBalloon: function()
	{
		if (this.balloonQueue.length > 0)
		{
			var _balloon = this.balloonQueue.shift();

			_balloon.reset();
			_balloon.randomizeStyle();
			_balloon.setPosition(this.getNextBalloonPosition());
			_balloon.setChar(this.getNextBalloonChar());
            _balloon.setCorrect(false);
			_balloon.fly();
		}
	},
	getNextBalloonChar: function()
	{
		var _char;

		if (this.nextCharCounter >= this.shootingCharAppearHeadway[this.shootingCharAppearHeadway.length-1]
		|| (this.shootingCharAppearHeadway.indexOf(this.nextCharCounter) != -1 && Math.floor(Math.random() * 2)))
		{
			_char = this.shootingChar;
			this.nextCharCounter = 0;
		}
		else
		{
			_char = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
			this.nextCharCounter++;
		}

		return _char;
	},
    getShootingChar: function() {
        return this.shootingChar;
    },
	updateShootingChar: function()
	{
		var _question = this.questionBank[this.currentPageIndex];

		this.shootingChar = _question.answer_breakdown[_question.answer_shootingCharIndex];
	},
	setCurrentPageIndex: function(int)
	{
		this.currentPageIndex = int;
	},
	setupBalloonQueue: function()
	{
		this.balloonQueue.length = 0;

		var _balloon = this.questionBank[this.currentPageIndex].balloon;

		for (var i=0; i<_balloon.length; i++)
		{
			_balloon[i].reset();
			this.pushBalloonToQueue(_balloon[i]);
		}
	}
};

function Balloon($dom, $dom_button, $container)
{
	this.$dom = $dom;
	this.$dom_button = $dom_button;
	this.$container = $container;

	$container.append(this.$dom);
	this.$dom.data('instance', this);
	this.$dom_button.data('instance', this);
	this.$dom_button.click(this.burst);
}

Balloon.prototype.char = null;
Balloon.prototype.flyTime = gameManager.balloonFlyTime;

Balloon.prototype.setChar = function(char)
{
	this.char = char;
	this.$dom_button.text(char);
};

Balloon.prototype.setDisabled = function(bool)
{
	this.$dom_button.prop('disabled', bool);
};

Balloon.prototype.disable = function()
{
	this.setDisabled(true);
};

Balloon.prototype.burst = function()
{
	var _instance = $(this).data('instance');

	_instance.disable();
    _instance.setCorrect(_instance.char == gameManager.getShootingChar());
	_instance.$dom.addClass('burst').animate({opacity: 0}, {duration: 1000, queue: false});

	gameManager.selectedChar = _instance.char;
	onCheckPageAnswer();
};

Balloon.prototype.fly = function()
{
	this.$dom.animate({top: '-35%'}, {duration: this.flyTime, easing: 'linear', queue: 'fly', complete: function()
	{
		gameManager.pushBalloonToQueue($(this).data('instance'));
	}}).dequeue('fly');
};

Balloon.prototype.stopFlying = function()
{
	this.disable();
	this.$dom.stop('fly', true);
};

Balloon.prototype.randomizeStyle = function()
{
	this.$dom.attr('data-style', Math.floor(Math.random() * gameManager.balloonStyleTotal));
};

Balloon.prototype.setPosition = function(int)
{
	this.$dom.attr('data-position', int);
};

Balloon.prototype.reset = function()
{
	this.$dom.removeClass('burst').css({'top': '100%', 'opacity': '1'});
	this.setDisabled(false);
};

Balloon.prototype.setCorrect = function(bool) {
    this.$dom.attr('data-correct', bool);
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

	$(gameXMLDOM).find('SimpleQuestionItem').each(function (qIndex, question)
	{
		questionsArray.push({
			'question': $(question).find('Question').text(),
			'answers': [$(question).find('Answer').text().toUpperCase().trim()],
			'answers_audio': [$(question).find('Audio').find('URL').text()],
			'answers_image': [{url: $(question).find('Image').find('URL').text()}],
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
			_imageSrc = 'images/landing-page/BalloonBurst.jpg';
			_imageAlt = '';
		}

		setLandingPageHTML('<div id="landing-page-image-container"><img id="landing-page-image" src="' + _imageSrc + '" alt="' + _imageAlt + '" /></div><div id="landing-page-title">Balloon Burst</div><div><button id="button-start" class="button button-start" type="button">Start</button></div>');
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
	$('#finishButton').remove();
}

//Game-specific reset procedure
function reset()
{
	$('#ajax-cont').append('<div id="cardSlots0"></div><div id="questions"></div>');

	debug.log(questionsArray);

	var $option_pool_panel = $('<div class="panel panel-default"></div>');
	var $option_pool_panel_body = $('<div class="panel-body"></div>');
	var $option_pool_list = $('<div id="main_list" name="option-pool-list" class="option-pool-list list-inline"></div>');

	var _html;
	var _answer_extra_item, _balloon, _$balloon, _shooting_area;

	for (var i=0; i<questionsArray.length; i++)
	{
		_html = '<div class="question show-grid0" id="' + i + '"><div class="row"><div class="col-xs-12"><div class="row shooting-area"></div><div class="row question-info-container">'

		+ '<div class="col-xs-12 hint-container">';

		_answer_extra_item = createSimpleAudioButton(questionsArray[i].answers_audio[0]);

		if (_answer_extra_item && _answer_extra_item != '')
		{
			_html += '<div class="hint-audio">' + _answer_extra_item + '</div>';
		}

		_answer_extra_item = questionsArray[i].answers_image[0].url;

		if (_answer_extra_item && _answer_extra_item != '')
		{
			_html += '<img class="hint-image" src="' + _answer_extra_item + '" />';
		}

		_html += '</div><div class="col-xs-12 word-container"></div><div class="col-xs-12 answer-container hidden"></div></div></div><span class="btn-info hidden"></span></div></div>';

		$('#questions').append(_html);

		_$shooting_area = $('#' + i).find('div.shooting-area');

		gameManager.questionBank[i] =
		{
			id: i,
			answer: questionsArray[i].answers[0],
			answer_breakdown: questionsArray[i].answers[0].split(''),
			answer_correct: false,
			answer_shootingCharIndex: 0,
			balloon: [],
		};

		for (var j=0; j<gameManager.balloonPerQuestion; j++)
		{
			_$balloon = $('<div class="balloon"><button type="button" class="balloon-hit-area"></button></div>');

			_balloon = new Balloon(_$balloon, _$balloon.find('button'), _$shooting_area);

			gameManager.questionBank[i].balloon.push(_balloon);
		}
	}

	$option_pool_panel_body.append($option_pool_list);
	$option_pool_panel.append($option_pool_panel_body);

    $('body').append(
        '<div id="audio-correct" class="hidden">' + createSimpleAudioButton('audio/balloonburst/correct.mp3', true) + '</div>' +
        '<div id="audio-incorrect" class="hidden">' + createSimpleAudioButton('audio/balloonburst/incorrect.mp3', true) + '</div>'
    );

    if (gameManager.muteButtonVisible) {
        $('#muteButton').removeClass('hidden disabled');
        refreshMuteButton();
    }

	updateRemainingQuestions();
	addAudioSupport();

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

		for (var i=0; i<sample.length; i++) {
			gameManager.questionBank[i].answer_correct = sample[i].answer_correct;
			gameManager.questionBank[i].answered = sample[i].answered;
			gameManager.questionBank[i].answer_shootingCharIndex = sample[i].answer_shootingCharIndex;
		}

		if (gameManager.livesTotal > 0)
		{
			$('#value-lives').text(gameManager.livesTotal)
		}

		if (gameManager.timerTotal > 0)
		{
			$('#value-timer').text(gameManager.timerTotal);
		}
	}

	showKidsGameHeaderComponent(true, false, (gameManager.livesTotal > 0), (gameManager.timerTotal > 0));

	for (var i=0; i<questionsArray.length; i++) {
		updateWordContainer(i, true);
	}
}

function updateWordContainer(pageIndex, isAnswerContainer, highlightUnfilledChar)
{
	isAnswerContainer = isAnswerContainer || false;
	highlightUnfilledChar = highlightUnfilledChar || false;

	var _char;
	var _question = gameManager.questionBank[pageIndex];
	var _html = '';

	for (var i=0; i<_question.answer_breakdown.length; i++)
	{
		_char = _question.answer_breakdown[i];
		_html += '<div class="user-char';

		if (_char == '-') {
			_html += ' user-char-prefilled">-';
		}
		else if (_char == ' ') {
			_html += ' user-char-prefilled">&nbsp;';
		}
		else if (isAnswerContainer || i < _question.answer_shootingCharIndex)
		{
			_html += '">' + _char;
		}
		else if (highlightUnfilledChar) {
			_html += ' user-char-highlighted">' + _char;
		}
		else
		{
			_html += '">&nbsp;';
		}

		_html += '</div>';
	}

	$('#' + pageIndex).find(isAnswerContainer? 'div.answer-container': 'div.word-container').html(_html);
}

function getPageCallback(pageIndex)
{
	if (pageIndex > 0 && gameManager.gameInProgress)
	{
        hidePager();
		startCurrentQuestion();
	}
}

function onLivesChange(livesRemaining, livesTotal, displayElement)
{
	if (livesRemaining <= 0)
	{
		endCurrentQuestion();
	}
}

function onTimeIsUpCallback(displayElement)
{
	endCurrentQuestion();
}

function startGame()
{
	gameManager.gameInProgress = true;
    hidePagerPrevious();
	startCurrentQuestion();
}

function stopGame()
{
	if (gameManager.gameStopped) {
		return false;
	}

	gameManager.gameStopped = true;

	timer.stop();

	gameManager.gameInProgress = false;

	stopBalloon();

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
			_showQuestionAnswer = true;
		}
		else {
			_showQuestionAnswer = false;
		}

		if (_showQuestionAnswer) {
			updateWordContainer(questionId, false, true);

			if (sample) {
				$('#' + questionId).find('span.btn-info').addClass('btn-success');

				if (question.answer_correct) {
					$('#' + questionId).find('div.word-container').addClass('correct').append('<span class="sr-only">correct</span>');
				}
			}
		}

		if (question.answer_correct) {
			_numCorrect++;
		}
	});

	if (sample) {
		updateRemainingQuestions();
		$('#value-score').text(getScoringDetails().percent);
	}
	else {
		showFeedbackDialog();
	}
}

function startCurrentQuestion()
{
	var _pageIndex = getCurrentPageIndex();

	gameManager.setCurrentPageIndex(_pageIndex);
	gameManager.setupBalloonQueue();
	gameManager.updateShootingChar();
	gameManager.startLaunchingBalloon();

	updateWordContainer(_pageIndex);
	timer.reset();
	lives.reset();

	if (gameManager.timerTotal > 0) {
		timer.start();
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

function stopBalloon() {
	var _balloon = gameManager.questionBank[getCurrentPageIndex()].balloon;

	for (var i=0; i<_balloon.length; i++)
	{
		_balloon[i].stopFlying();
	}

	gameManager.stopLaunchingBalloon();
}

function endCurrentQuestion() {
	gameManager.gameInProgress = false;
	timer.stop();
	stopBalloon();
	$('#finishButton').addClass('disabled');
	closeAllBootstrapDialogs();
	$('#' + gameManager.currentPageIndex).find('span.btn-info').addClass('btn-success');
	showAnswerAnimation();
}

function onShowAnswers(show)
{
	debug.log('onShowAnswers');

	var _$answerContainer = $('div.answer-container');
	var _$wordContainer = $('div.word-container');

	if (_$answerContainer.hasClass('hidden')) {
		_$answerContainer.removeClass('hidden');
		_$wordContainer.addClass('hidden');
	}
	else {
		_$wordContainer.removeClass('hidden');
		_$answerContainer.addClass('hidden');
	}
}

function toggleMute() {
    gameManager.gameSoundOn = !gameManager.gameSoundOn;
    refreshMuteButton();
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
	else if (gameManager.selectedChar)
	{
		if (gameManager.selectedChar == gameManager.shootingChar)
		{
            if (gameManager.gameSoundOn) {
                $('#audio-correct').find('a').click();
            }

			gameManager.selectedChar = null; // put here by purpose to avoid stack overflow of this function

			var _pageIndex = gameManager.currentPageIndex;
			var _question = gameManager.questionBank[_pageIndex];

			_question.answer_shootingCharIndex++;

			while (_question.answer_shootingCharIndex < _question.answer.length && (_question.answer[_question.answer_shootingCharIndex] == '-' || _question.answer[_question.answer_shootingCharIndex] == ' ')) {
				_question.answer_shootingCharIndex++;
			}

			updateWordContainer(_pageIndex);

			if (_question.answer_shootingCharIndex >= _question.answer.length)
			{
				_question.answer_correct = true;
				endCurrentQuestion();
			}
			else
			{
				gameManager.updateShootingChar();
			}
		}
		else
		{
            if (gameManager.gameSoundOn) {
                $('#audio-incorrect').find('a').click();
            }

			gameManager.selectedChar = null;
			lives.decrement();
		}

		$('#value-score').text(getScoringDetails().percent);
	}
}

function showAnswerAnimation() {
	var _question = gameManager.questionBank[gameManager.currentPageIndex];

	if (_question.answer_correct) {
		$('#' + _question.id).find('div.word-container').addClass('correct').append('<span class="sr-only">correct</span>');
	}
	else {
		updateWordContainer(_question.id, false, true);
	}

	answerAnimationCallback();
}

function answerAnimationCallback() {
	$('#finishButton').removeClass('disabled');

	if (gameManager.currentPageIndex >= (questionsArray.length-1)) {
		onConfirmedFinish();
	}
	else {
        showPager();
        focusPagerNext();
		gameManager.gameInProgress = true;
	}

	updateRemainingQuestions();
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
		question.answer_shootingCharIndex = gameManager.questionBank[pIndex].answer_shootingCharIndex;

		if (gameManager.questionBank[pIndex].answer_correct)
		{
			qPoints++;
			question.answer_correct = true;
		}

		qTotal ++;

		questions.push(question.question);
		answers.push(question.answers);
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
