/**
 * Core functions
 * 
 * To create a new game, copy the contents of GameTemplate.js and fill in the functions
 */
var initialized = false;
var finished = false;

var gameXML = '';
var gameType = '';
var gameTitle = '';
var gameDescription = '';
var gameOverview = {};
var gameClues = '';
var gameFeedback = '';
var gameInstructions = '';
var gameTestMin = "";
var gameXMLDOM;
var gameShowQuestionNo = "true";
var gameQuestionNoAlphabetical = false;
var gameDisplayOptions = 0;
var gameNoCorrectAnswers = 0;
var gameDoAllQuestions;
var gameTitlePrefixPageNo = false;

var miniaudioSrc = '';

var gameScore = {};
//var fn;
var playerId = 0;

var use_dummy_media = false;
var use_dummy_learner_response = false;

//@
var gameMode = "test_mode"; // default | learn_mode | test_mode | placement_test
var gameModeOptions = {
    showSeeAllAnswerOption: true,
    showAnswerFeedbackIcons: true,
    showScore: true,
    showTryAgain: true
};
var gameScoreToPass = null;
var getPageCallback = null;



var use_floating_button_row = false;
var isGameInAdvanceSlide = (parent != null && parent.advanceSlideID != null);

var SURVEY_MODE = 'survey_mode';
var isIosSafari = /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent);

if (isIosSafari) {
	jQuery.fn.focus = function(){};
	$.fn.modal.Constructor.prototype.show = overrideBootstrapModalShow;
}

var isKidsGame = false;
var useDefaultFeedback = true;

var gameXML_timer;
var gameXML_lives;

var timer = {
	total: 0,
	remaining: 0,
	onChangeCallback: null,
	onStartCallback: null,
	onStopCallback: null,
	onTimeIsUpCallback: null,
	displayElement: null,
	interval: null,
	decimalPlace: 0,
	startTimestamp: 0,
	animationFrame: 0,
	animationFrameFunc: function() {
		timer.remaining = timer.total - (new Date().getTime() - timer.startTimestamp) / 1000;

		if (timer.remaining < 0) {
			timer.remaining = 0;
			timer.stop();
			timer.onTimeIsUp();
		}
		else if (timer.animationFrame) {
			timer.animationFrame = requestAnimationFrame(timer.animationFrameFunc);
		}

		timer.onChange();
	},
	init: function(seconds)
	{
		this.total = parseInt(seconds);
		this.reset();
	},
	start: function()
	{
		if (this.total > 0)
		{
			if (this.decimalPlace && this.displayElement) {
				this.startTimestamp = new Date().getTime();
				this.animationFrame = requestAnimationFrame(this.animationFrameFunc);
			}
			else {
				if (this.interval)
				{
					clearInterval(this.interval);
				}

				this.interval = setInterval(function()
				{
					if (--timer.remaining <= 0)
					{
						timer.stop();
						timer.onTimeIsUp();
					}

					timer.onChange();

				}, 1000);
			}

			if (this.onStartCallback) {
				this.onStartCallback(this.remaining, this.total, this.displayElement);
			}
		}
	},
	stop: function()
	{
		if (this.total > 0)
		{
			if (this.interval)
			{
				clearInterval(this.interval);
			}
			else if (this.animationFrame) {
				cancelAnimationFrame(this.animationFrame);
				this.animationFrame = 0;
			}

			this.onStop();
		}
	},
	reset: function()
	{
		if (this.total > 0)
		{
			this.stop();
			this.remaining = this.total;
			this.onChange();
		}
	},
	setOnChangeCallback: function(func)
	{
		if (func)
		{
			this.onChangeCallback = func;
		}
	},
	setOnStartCallback: function(func) {
		if (func) {
			this.onStartCallback = func;
		}
	},
	setOnStopCallback: function(func)
	{
		if (func)
		{
			this.onStopCallback = func;
		}
	},
	setOnTimeIsUpCallback: function(func)
	{
		if (func)
		{
			this.onTimeIsUpCallback = func;
		}
	},
	setDisplayElement: function(element)
	{
		if (element)
		{
			this.displayElement = $(element);
			this.updateDisplayElement();
		}
	},
	setDecimalPlace: function(int) {
		if (window.requestAnimationFrame) {
			this.decimalPlace = int;
		}
	},
	updateDisplayElement: function()
	{
		if (this.displayElement)
		{
			this.displayElement.text(this.remaining.toFixed(this.decimalPlace));
		}
	},
	onChange: function()
	{
		this.updateDisplayElement();

		if (this.onChangeCallback)
		{
			this.onChangeCallback(this.remaining, this.total, this.displayElement);
		}
	},
	onStop: function()
	{
		this.updateDisplayElement();

		if (this.onStopCallback)
		{
			this.onStopCallback(this.remaining, this.total, this.displayElement);
		}
	},
	onTimeIsUp: function()
	{
		this.updateDisplayElement();

		if (this.onTimeIsUpCallback)
		{
			this.onTimeIsUpCallback(this.displayElement);
		}
	}
};

var lives = {
	total: 0,
	remaining: 0,
	onChangeCallback: null,
	displayElement: null,
	init: function(int)
	{
		if (int)
		{
			this.total = int;
			this.reset();
		}
	},
	reset: function()
	{
		if (this.total > 0)
		{
			this.remaining = this.total;
			this.onChange();
		}
	},
	setOnChangeCallback: function(func)
	{
		if (func)
		{
			this.onChangeCallback = func;
		}
	},
	decrement: function()
	{
		if (this.total > 0)
		{
			this.remaining = Math.max(0, this.remaining-1);
			this.onChange();
		}
	},
	setDisplayElement: function(element)
	{
		if (element)
		{
			this.displayElement = $(element);
			this.updateDisplayElement();
		}
	},
	updateDisplayElement: function()
	{
		if (this.displayElement)
		{
			this.displayElement.text(this.remaining);
		}
	},
	onChange: function()
	{
		this.updateDisplayElement();

		if (this.onChangeCallback)
		{
			this.onChangeCallback(this.remaining, this.total, this.displayElement);
		}
	}
};

var pageNumberControl = {
    enabled: false,
    $displayElement: null,
    currentPageNo: 0,
    totalPage: 0,
    init: function() {
        this.enabled = true;
        this.totalPage = getPagesCount();
    },
    setDisplayElement: function($dom) {
        this.$displayElement = $dom;
    },
    setCurrentPage: function(int) {
        this.currentPageNo = int;
    },
    update: function() {
        if (this.enabled && this.$displayElement) {
            this.$displayElement.html(pad(this.currentPageNo, 2) + '/' + pad(this.totalPage, 2));
        }
    }
};

/*
$(".modal").each(function(i) {
        $(this).draggable({
            handle: ".modal-header"  
        });
    });
*/


(function ($) {
   $.fn.dynamicDraggable = function (opts) {
      this.live("mouseover", function() {
         if (!$(this).data("init")) {
            $(this).data("init", true).draggable(opts);
         }
      });
      return this;
   };
}(jQuery));




$(function() {
    //FastClick.attach(document.body);

    
/*    $(window).resize(function() {
        adjustExerciseHeight();
    });

    window.onresize = function(){
     adjustExerciseHeight();
    }

    $(window).trigger('resize');
*/
    //setExerciseMode();


    $(".modal").dynamicDraggable({
         handle: ".modal-header"  
    });

});


var getScript = jQuery.getScript;
jQuery.getScript = function(resources, callback) {

    var // reference declaration &amp; localization
        length = resources.length,
        handler = function() {
            counter++;
        },
        deferreds = [],
        counter = 0,
        idx = 0;

    for (; idx < length; idx++) {
        deferreds.push(
            getScript(resources[idx], handler)
        );
    }

    jQuery.when.apply(null, deferreds).then(function() {
        callback && callback();
    });
};



function gameModesSupportedForGame() {
    return true;
}



function adjustExerciseHeight() {

    var viewportHeight = $(window).height();

    var viewportWidth = $(window).width();

    if(viewportWidth <=800)
    {
       viewportHeight = viewportHeight;// - 140;
       //viewportHeight = viewportHeight - 350 - 15;

    }
    else
    {
        viewportHeight = viewportHeight;// - 140;
    }

    var $wrapper = $('#myNavmenuCanvas');
    var extraHeight = 0;
    //extraHeight += $('#cardPile0').outerHeight() || 0;
    extraHeight += (($wrapper.outerHeight() - $wrapper.innerHeight()) + ($wrapper.innerHeight() - $wrapper.height()) + ($wrapper.outerHeight(true) - $wrapper.outerHeight())) || 0;
    extraHeight += $('#ajax-options').outerHeight() || 0;
    extraHeight += 10;

    $('#myNavmenuCanvas').height(viewportHeight - extraHeight);

    var $wrapper = $('#myNavmenuCanvas');
    var extraHeight = 0;

    extraHeight += $('#cardPile0').outerHeight() || 0;
    extraHeight += $('#ajax-options').outerHeight() || 0;
    extraHeight += $('#headerPanel').outerHeight() || 0;
    extraHeight += $('#instructionsPanel').outerHeight() || 0;
    extraHeight += (($wrapper.outerHeight() - $wrapper.innerHeight()) + ($wrapper.innerHeight() - $wrapper.height()) + ($wrapper.outerHeight(true) - $wrapper.outerHeight())) || 0;
    //extraHeight += 70; // padding at the bottom
    extraHeight += 10;

    //extraHeight += 140;

    var h = viewportHeight - extraHeight;

    //$('#questions .scroll-wrapper').height(h);
    $('#questions').parent('.scroll-wrapper').height(h - 25); //85 or 140

    var drag_pool_size = $('#cardPile0').outerHeight() || 0;

    if(drag_pool_size > 0)
    {
        drag_pool_size -= 10;
    }

    $('#ajax-cont').height(h + drag_pool_size);


    //debug.log(viewportHeight, extraHeight, h);
}


function onNextExercise(obj) {

	if ($(obj).hasClass('disabled'))
	{
		return ;
	}

    //alert("Jump to next exercise");
    //onConfirmedFinish();

    // check if unit exists and have next page/chapter
    if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
        /*
        var hasNext = parent.doesChapterHaveNextPage() || parent.doesUnitHaveNextChapter();

        if(hasNext)
        {
        	parent.goNext();
        }*/

        parent.goNext();
    }
}

function onNextPage(obj)
{
	if (!$(obj).hasClass('disabled'))
	{
		$(obj).addClass('disabled');
		onNextPageClick();
	}
}

function setExerciseMode() {

    //
    $('#checkAnswerButton').addClass('disabled');
    $('#showAnwsersButton, #nextExerciseButton').addClass('disabled hidden');
    $('#scoreButton').addClass('hidden');

    // check if next button should exist or not
    if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
        /*var hasNext = parent.doesChapterHaveNextPage() || parent.doesUnitHaveNextChapter();

        if(hasNext)
        {
        	// do nth
        }
        else
        {
        	$('#nextExerciseButton').remove();
        }*/
    } else {
        $('#nextExerciseButton').remove();
    }



    if (getMode() == "placement_test") {
        //$("#generalOptions").hide();
        //$("#placementTestOptions").show();

        // set Finish to Next
        $('#finishButton').html('Next <span class="glyphicon glyphicon-chevron-right"></span>')
        .removeClass('hidden')
        .removeClass('disabled');

        $('#footerPanel').addClass('hidden');

        //$('#helpButton').addClass('hidden');
        $('#checkAnswerButton').addClass('hidden');
        //$('#finishButton').text("Next");
        $('#resetButton').addClass('hidden');
        //$("#generalOptions").show();
    } else if (gameMode == 'test_mode') // on finish show see answers, show see score
    {
        // hide check answers
        $('#checkAnswerButton').addClass('hidden');

        $('.pager').removeClass('hidden');

        // show submit
        $('#finishButton').removeClass('hidden');
        // hide show answers
        //$('#checkAnswerButton').addClass('hidden');

        //@UAT - always shown but disabled until complete
        if (gameModeOptions.showTryAgain == false || gameModeOptions.showTryAgain == "false") // this check ONLY required for test_mode not for learn_mode
        {
            // dont show reset button
            $('#resetButton').addClass('disabled hidden');
        } else {
            // show reset button but disable it
            $('#resetButton').addClass('disabled').removeClass('hidden');
        }

        $('#footerPanel').removeClass('hidden');

        $('#nextExerciseButton').addClass('disabled').removeClass('hidden'); //('hidden');

    } else if (gameMode == 'learn_mode') {
        // hide check answers
        $('#checkAnswerButton').addClass('hidden');

        $('.pager').addClass('hidden');

        //@UAT - always shown but disabled until complete
        $('#resetButton').addClass('disabled').removeClass('hidden');
        $('#nextExerciseButton').addClass('disabled').removeClass('hidden'); //('hidden');


        if (gametype == "GapFillTyping" || gametype == "HighlightSelection" || gametype == "HighlightDeletion") {

            if(gameNoCorrectAnswers) //@@ correct anwsers ONLY IF NO CORRECT ANSWERS
            {
                $('#showAnwsersButton').addClass('hidden');
            }
            else
            {
                $('#showAnwsersButton').removeClass('hidden');
            }
        }

        // show submit
        $('#finishButton').addClass('hidden');
        // hide show answers
        //$('#checkAnswerButton').addClass('hidden');

        if (supportInstantFeedback() == false) {
            //$('#checkAnswerButton').removeClass('hidden');
            if(gameNoCorrectAnswers) //@@ correct anwsers ONLY IF NO CORRECT ANSWERS
            {
                $('#checkAnswerButton').removeClass('hidden');
            }

            $('#checkAnswerButton').removeClass('hidden');
        }

        $('#footerPanel').removeClass('hidden');
    }
	else if (gameMode == SURVEY_MODE)
	{
		// set Finish to Next
		$('#finishButton').html('<span class="glyphicon"></span>Next screen');

		$('#checkAnswerButton').addClass('hidden');

		$('#resetButton').addClass('hidden');
	}

    if (gametype == "Roleplay") {
        // show submit
        $('#finishButton').removeClass('hidden');
    }




    $('body').removeClass('mode-normal mode-default mode-placement_test mode-learn_mode mode-test_mode mode-survey_mode')
    .addClass('mode-' + gameMode).addClass('type-' + gametype); //.addClass('skin-' + gameskin);


    /*
	if(isMobile())
	{
		$('body').addClass('mobile-platform');
	}
	*/

    if (isMobile.any()) {
        $('body').addClass('mobile-platform');
    }

    if (isMobile.Android()) {
        $('body').addClass('mobile-platform-android');
    }


    if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
        var hasNext = parent.doesChapterHaveNextPage() || parent.doesUnitHaveNextChapter();

        if (hasNext) {
            //
            //$('#nextExerciseButton .label').text("Next Exercise");
        } else {
            // rename text to say "Results" #11417
            $('#nextExerciseButton .label').text("Results");
        }
    }

    /*
    	else if(gameMode == 'learn_mode_instant_feedback')
    	{
    		// hide check answers
    		$('#checkAnswerButton').addClass('hidden');
    		// show submit
    		$('#finishButton').addClass('hidden');
    		// hide show answers
    		//$('#checkAnswerButton').addClass('hidden');
    	}
    	else if(gameMode == 'learn_check_answers')
    	{
    		// hide check answers
    		$('#checkAnswerButton').removeClass('hidden');
    		// show submit
    		$('#finishButton').addClass('hidden');
    		// hide show answers
    		//$('#checkAnswerButton').addClass('hidden');
    	}
    */

}


function setQuestionDisplay() {
    var pagesCount = getPagesCount();
    $('#ajax-pages').empty();

    var $pagination_list_wrapper = $('<div class="progress-indicator"></div>');
    var $pagination_list = $('<ul class="carousel-indicators bg-info0 carousel-indicators-inverse inline-block0"></ul>');
    var page_item = '';

    if (pagesCount > 1) {

        if (gameMode == "learn_mode" || ['Word2word', 'BalloonBurst', 'DuoQuiz'].indexOf(gametype) != -1) {
            var classes = "hidden";
        }

        var $pager_list = $('<ul class="pager inline-block ' + classes + '"></ul>');
        $pager_list.append('<li class="previous"><a id="btn-prev" href="javascript:;" onclick="onPrevPageClick(this)"><span class="glyphicon glyphicon-chevron-left"></span><label class="sr-only">Previous Question</label></a></li>');
        $pager_list.append('<li class="next"><a id="btn-next" href="javascript:;" onclick="onNextPageClick(this)"><span class="glyphicon glyphicon-chevron-right"></span><label class="sr-only">Next Question</label></a></li>');
        //$('#ajax-pages').append($pager_list);

        /*
        		page_item += '<li><a id="btn-prev" onclick="onPrevPageClick()">Previous</a></li>';

        		for (var i = 1; i <= pagesCount; i++) {
        			//$('#ajax-pages').append('<a id="' + i + '" class="pageButton" onclick="onPageClick(this.id)">' + i + '</a>');
        			page_item += '<li id="' + i + '" class="hidden-xs"><a onclick="onPageClick(' + i + ')">' + i + '</a></li>';
        		}

        		page_item += '<li><a id="btn-next" onclick="onNextPageClick()">Next</a></li>';
        */

        //page_item += '<li><a id="btn-prev" onclick="onPrevPageClick()"><span class="glyphicon glyphicon-chevron-left"></span></a></li>';

        for (var i = 1; i <= pagesCount; i++) {
            //$('#ajax-pages').append('<a id="' + i + '" class="pageButton" onclick="onPageClick(this.id)">' + i + '</a>');
            page_item += '<li id="' + i + '"></li>';
        }

        //page_item += '<li><a id="btn-next" onclick="onNextPageClick()"><span class="glyphicon glyphicon-chevron-right"></span></a></li>';



//		var $pagination_list_row = $('<div class="col-xs-12 col-sm-10"></div>');
//		var $pager_list_row = $('<div class="col-xs-12 col-sm-2"></div>');

        $pagination_list.append(page_item);
//		$pagination_list_row.append($pagination_list);

//		$pager_list_row.append($pager_list);

        $pagination_list_wrapper.append($pagination_list);
		$pagination_list_wrapper.append($pager_list);
        $('#ajax-pages').append($pagination_list_wrapper);

        /*
		var $pager_list = $('<ul class="pager inline-block"></ul>');
		//$pager_list.append('<li class="previous"><a id="btn-prev" onclick="onPrevPageClick()">Previous</a></li>');
		$pager_list.append('<li class="next"><a id="btn-next" onclick="onNextPageClick()">Next</a></li>');
		$('#ajax-pages').append($pager_list);
		*/
    }

    onPageClick(1);
}

function onPrevPageClick(obj) {

	if ($(obj).hasClass('disabled') || $(obj).parent().hasClass('disabled'))
	{
		return ;
	}

    if (pageIndex > 0) {
        var index = pageIndex;
        onPageClick(index);
    }
}

function onNextPageClick(obj) {

	if ($(obj).hasClass('disabled') || $(obj).parent().hasClass('disabled'))
	{
		return ;
	}

    if (pageIndex < questionsArray.length - 1) {
        var index = pageIndex + 1;
        onPageClick(index + 1);
    } else {
        // finish
        //onFinish();
    }
}


function onPageClick(id) {
    $('#answers').remove();
    $('#ajax-pages li').removeClass('active');
    $('#ajax-pages li[id="' + id + '"]').addClass('active');
    //getPage(parseInt(id, 10) - 1);
    getPage(id - 1);

    // $('.control .audio').remove();
    // var audio = getAudio();
    // if (audio !== undefined && audio !== '' ) {
    // 	var audioStr = getAudioCode(audio);
    // 	$('.control').append($(audioStr));
    // 	processPlayer($('.control .audio'));
    // }

    /*
    	$('#qAudio .audio').remove();
    	var audio = getAudio();
    	if (audio !== undefined && audio !== '' ) {
    		var audioStr = getAudioCode(audio);
    		$('#qAudio').append($(audioStr));
    		processPlayer($('#qAudio .audio'));
    	}
    */
}

//Should return the number of pages
function getPagesCount() {

    if (gameDisplayOptions === 0) {
        return questionsArray.length;
    }

    return 1;
}

//If there are several pages, page loading handler
function getPage(pageNumber) {
    //
    pageIndex = pageNumber;

    if (gameDisplayOptions === 0) {
        $('#questions .question').hide();
        $('#questions .question:nth-child(' + (pageNumber + 1) + ')').show();
        $('#questions .question:nth-of-type(' + (pageNumber + 1) + ')').show();

        //
        //$('#btn-prev').text('Previous');
        if (pageNumber === 0) {
            $('#btn-prev').parent().addClass("disabled");
        } else {
            $('#btn-prev').parent().removeClass("disabled");
        }

        if (pageNumber === questionsArray.length - 1) // -1
        {
            //$('#btn-next').text('Finish');
            $('#btn-next').parent().addClass("disabled");
        } else {
            //$('#btn-next').text('Next');
            $('#btn-next').parent().removeClass("disabled");
        }
    } else {
        $('#questions .question').show();
    }
	
	if (getPageCallback != null)
	{
		getPageCallback(pageIndex);
	}

	if (pageNumberControl.enabled)
	{
		pageNumberControl.setCurrentPage(pageIndex + 1);
		pageNumberControl.update();
	}
}

function setGetPageCallback(callback)
{
	if (getPageCallback == null)
	{
		getPageCallback = callback;
	}
}

function getAudio() {
    return questionsArray[pageIndex].audio;
}

function getGlobalAudio() {
    var audio = '';
    $(gameXMLDOM).find('Introduction').siblings().each(function(qIndex, question) {
        if ((this).tagName == 'Audio') {
            audio = $(this).find('URL').text();
        }
    });

    if (use_dummy_media) {
        audio = "audio/empty.mp3";
    }

    return audio;
}




function supportInstantFeedback() {
    var notSupported = ["GapFillTyping", "ReorderingHorizontal", "ReorderingVertical"];

    if ($.inArray($.trim(gametype), notSupported) > -1) {
        return false;
    }

    return true;
}




$(function() {

    //$('body').addClass('platform-' + GetBrowser());
    /*
    	var ost = 0;
        $(window).scroll(function() {
          var cOst = $(this).scrollTop();

          if(cOst > 10 && cOst > ost) {
             $('body').addClass('hide-ui');
          }
          else {
             $('body').removeClass('hide-ui');
          }

          ost = cOst;
        });*/

    /*var ost = 0;

	  $(window).scroll(function() {
	    var cOst = $(this).scrollTop();

	    if(cOst > ost) {
	       $('body').addClass('fixed').removeClass('default');
	    }
	    else {
	       $('body').addClass('default').removeClass('fixed');
	    }

	    ost = cOst;
	  });
*/



    $('#showAnwsersButton').click(function() {
        //$(this).parent().children().removeClass('active');

		var $this = $(this);

		if ($this.hasClass('disabled'))
		{
			return ;
		}

        $this.toggleClass('active');

        if ($this.hasClass('active')) {
            $this.find('span.text').text(' Hide answers');
			$this.find('span.glyphicon').addClass('glyphicon-eye-close').removeClass('glyphicon-th-list');
        } else {
            $this.find('span.text').text(' Show answers');
			$this.find('span.glyphicon').removeClass('glyphicon-eye-close').addClass('glyphicon-th-list');
        }


        //onShowAnswers();

        /*
				    var val = $(this).find('input:radio').val();

				    if(val == "yes")
				    {
				    	onShowAnswers(true);
				    }
				    else if(val == "no")
				    {
				    	onShowAnswers(false);
				    }
				   */
    });



    if (use_dummy_media) {
        BootstrapDialog.show({
            title: 'Select Settings',
            message: $('#settings'),
            closable: false,
            buttons: [{
                label: 'OK',
                action: function(dialogRef) {
                    //$('body').append($textAndPic);
                    dialogRef.close();
                }
            }],
            onshown: function() {

                $('#toggle-mode-group .btn').click(function() {
                    $(this).parent().children().removeClass('active');
                    $(this).addClass('active');

                    var val = $(this).find('input:radio').val();

                    if (val == "learn_mode") {
                        gameMode = val;
                    } else if (val == "test_mode") {
                        gameMode = val;
                    }

                    setExerciseMode();
                });

                //gameMode = "learn_mode";
                //setExerciseMode();

                $('#toggle-display-group .btn').click(function() {
                    $(this).parent().children().removeClass('active');
                    $(this).addClass('active');

                    var val = $(this).find('input:radio').val();

                    if (val == "one") {
                        gameDisplayOptions = 0;
                    } else if (val == "all") {
                        gameDisplayOptions = 1;
                    }

                    setQuestionDisplay();
                });

                //setQuestionDisplay();

                $('#toggle-no-correct-group .btn').click(function() {
                    $(this).parent().children().removeClass('active');
                    $(this).addClass('active');

                    var val = $(this).find('input:radio').val();

                    if (val == "yes") {
                        gameNoCorrectAnswers = 1;
                        //disableCheckPageAnswer();
                    } else if (val == "no") {
                        gameNoCorrectAnswers = 0;
                        //disableCheckPageAnswer();
                    }

                    updateRemainingQuestions();
                });
            }
        });
    }




    // $('body').on('click', '#gameExternalIntroduction a.btn', function(event) {
    // 	$('#gameExternalIntroduction').fadeOut("fast");
    // });

    //$('body').on('click', '#overviewCloseTab', function(event) {
    /*
        $( "#overviewCloseTab" ).click(function() {	
        	closeOverviewPanel();
        });
    */



});




function pauseAllMedia() {
    /*
	var videos = $('video').mediaelementplayer();
 	for (var i = 0; i < videos.length; i++) {
 		videos[i].pause();
 	}
 	*/

    var mediaElementPlayers = [];
    $('video').each(function() {
        mediaElementPlayers.push(new MediaElementPlayer(this));
    });

    for (var i = 0; i < mediaElementPlayers.length; i++) {
        mediaElementPlayers[i].pause(); // pause
    }


    //$('video').each(function(){this.player.pause()}) // Safe.
    //$('audio').each(function(){this.player.pause()}) // Safe.


}


/**
 * Load XML Data and parsing
 *
 * @param xmlurl
 *   URL of the XML file.
 * @param gametype
 *   Root XML element name of the XML.
 * @param callbackFunc
 *   A callback function.
 */
function entryPoint() {




    //alert("entryPoint")

    /*
    	init();

    	var pagesCount = getPagesCount();
    	if (pagesCount > 1) {
    		for (var i = 1; i <= pagesCount; i++) {
    			$('#ajax-pages').append('<a id="' + i + '" class="pageButton" onclick="onPageClick(this.id)">' + i + '</a>');
    		}
    	}
    	else
    	{
    		$('#ajax-pages').remove();
    	}

    	//onReset();

    	initialized = true;
    	*/

    /*
    	// console.log('Game init()');
    	closeGameAlertPopup();
    	//@change - no longer required
    	//closeGameInstructionsPopup();
    	closeGameCluesPopup();
    	closeGameFinishPopup();
    	closeGameScorePopup();
    	*/
    jQuery('#jparse-meta').html('<img alt="Content Loading" src="images/ajax-loader.gif" />');

    //
    gameType = getGameType(xmlData);

    $.ajax({
        type: "GET",
        url: xmlData,
        dataType: "xml",
        success: function(data) {

            gameXMLDOM = data;

            /*if (typeof restoreLearnerResponse != 'undefined') {
              sample = restoreLearnerResponse();

              alert('got sample = ' + sample);
            }*/


            if(use_dummy_learner_response == false)
            {
                if(typeof parent.GetLearnerResponse == 'function') 
                { 
                  // window.frameElement Gets IFrame element which document inside
                var chapter_index = window.frameElement.getAttribute("data-chapter-index");
                var page_index = window.frameElement.getAttribute("data-page-index");

                  sample = parent.GetLearnerResponse(chapter_index, page_index);
                  debug.log('got sample = ' + sample);
                }
                else
                {
                    sample = null;
                    debug.log('setting sample to null');
                }

                if(sample && sample == "")
                {
                  sample = null;
                }
            }
            
            //
            parseGameXMLParameters(data);
            init();

            setExerciseMode();
            setQuestionDisplay();

            /*
			var pagesCount = getPagesCount();
			if (pagesCount > 1) {
				for (var i = 1; i <= pagesCount; i++) {
					$('#ajax-pages').append('<a id="' + i + '" class="pageButton" onclick="onPageClick(this.id)">' + i + '</a>');
				}
			}
			else
			{
				$('#ajax-pages').remove();
			}
			*/

            addGlobalAudio();

            if ($('#cardSlots').length > 0) {
                $('<div id="qAudio"></div>').insertBefore('#cardSlots');
            } else if ($('#questions').length > 0) {
                $('<div id="qAudio"></div>').insertBefore('#questions');
            } else {
                $('#ajax-cont').append('<div id="qAudio"></div>');
            }

            onReset();

            $('.bs-example0').removeClass('hidden');
        }
    });


    //@change - no longer required
    //$('body').on('click', '#instructionsButton', onInstructions);
    //$('body').on('click', '#checkAnswerButton:not(.disabled)', onCheckPageAnswer);



    //$('body').on('click', '#finishButton', onFinish);


    $('body').on('click', '.play-btn', function(event) {
        if ($(this).hasClass('playing')) {
            $(this).removeClass('playing');
            document.getElementById($(event.target).siblings('.html-audio').attr('id')).pause();
        } else {
            $(this).addClass('playing');
            document.getElementById($(event.target).siblings('.html-audio').attr('id')).play();
        }
    });



    /*
    	$("input[type=checkbox]").switchButton({
    		on_label: 'yes',
    		off_label: 'no',
    		checked: false
    	});
    */

	if (use_floating_button_row)
	{
		$(window).scroll(floatButtonRow);

		$.fn.isOnScreenVertical = function()
		{
			var viewport = {};
			viewport.top = $(window).scrollTop();
			viewport.bottom = viewport.top + $(window).height();
			var bounds = {};
			bounds.top = this.offset().top;
			bounds.bottom = bounds.top + this.outerHeight();
			return ((bounds.top <= viewport.bottom) && (bounds.bottom >= viewport.top));
		};
	}
}



function parseGameXMLParameters(xml) {
    // console.log('Parsing xml for general game data - ' + xml);
    gameXMLDOM = xml;

    // title
    gameTitle = $(xml).find('GameTitle').text();
	gameTitlePrefixPageNo = ($(xml).find('GameTitlePrefixPageNo').text() === 'true');

	if (gameTitlePrefixPageNo)
	{
		var lvFrameElement;

		if (isGameInAdvanceSlide)
		{
			lvFrameElement = parent.window.frameElement;
		}
		else
		{
			lvFrameElement = window.frameElement;
		}

		var _pageIndex = parseInt(lvFrameElement.getAttribute("data-page-index"));

		if (!isNaN(_pageIndex))
		{
			_pageIndex += 1;
			gameTitle = pad(_pageIndex, 2) + '. ' + gameTitle;
		}
	}

    $('#gameTitleText').html(gameTitle).addClass($(xml).find('GameTitle').attr('direction'));

    // clues
    gameClues = $(xml).find('Clues').text().replace(/\r?\n|\r/g, '').replace(/\[NL\]/g, '<br/>');

    if (gameClues != '') {
        $('#gameCluesText').html(gameClues).addClass($(xml).find('Clues').attr('direction'));
        $('#helpButton, .global-audio').removeClass('hidden');
    } else {
        //@
        $('#helpButton').addClass('hidden');
    }

    // instructions
    gameInstructions = $(xml).find('Instructions').text().replace(/\[NL\]/g, '<br/>');

    if (gameInstructions != '') {
        $('#gameInstructionsText').html(gameInstructions).addClass($(xml).find('Instructions').attr('direction'));
        //$('#gameInstructionsText2').html(gameInstructions);

/*		$('#gameInstructionsText').readmore({
			collapsedHeight: 80,
			moreLink: '<a href="javascript:;" class="readmoreBtn"><span class="readmoreBtn glyphicon glyphicon-chevron-down"></span><span class="sr-only">Expand Text</span></a>',
			lessLink: '<a href="javascript:;" class="readmoreBtn"><span class="readmoreBtn glyphicon glyphicon-chevron-up"></span><span class="sr-only">Collapse Text</span></a>',
			afterToggle: function()
			{
				$('span.readmoreBtn:visible').parent().focus();
			}
		});*/

    } else {
        $('#gameInstructionsText').addClass('hidden')//.remove();
    }

    gameFeedback = $(xml).find('Feedback').eq(0).text(); //$(xml).find('*>Feedback').text();

    /*
    	if ($(gameXMLDOM).find('GradeOptions').length) {
    		$('.game-container').addClass('exam');	
    		$('#gameExternalIntroduction .content').html($(xml).find('ExternalIntroduction').text());
    		$('#gameExternalIntroduction, #gameExternalIntroduction .btns').show();

    		$( "#gameExternalIntroduction .btn" ).click(function() {	
        		$('#gameExternalIntroduction').fadeOut("fast");
        	});

    		$('.game-container').before('<div class="exam-logo"></div>').after('<div class="exam-footer">This test is designed for personal use to give you an approximate indication of your English level. Contact your local British Council office if you would like to take a formal test of English.<br> \
    		<br> \
    		© 2014 British Council <br> \
    		The United Kingdom\'s international organisation for cultural relations and educational opportunities. <br> \
    		A registered charity: 209131 (England and Wales) SC037733 (Scotland).</div>');		
    	} else {
    		$('.game-content .control, .game-content .panel').show();
    	}
    */


	gameOverview.text = $(xml).find('Overview > Text');
	gameOverview.image = $(xml).find('Overview > Image');
	$.merge(gameOverview.image, $(xml).find('Overview > ImageWithDescriptions'));
    gameOverview.video = $(xml).find('Overview > Video').text();
    gameOverview.videoTranscript = $(xml).find('Overview > VideoTranscript').text();
    gameOverview.videoCaptions = $(xml).find('Overview > VideoCaptions').text();
    gameOverview.tutor = {};
    gameOverview.tutor.video = $(xml).find('Overview > Tutor > Video').text();
    gameOverview.tutor.transcript = $(xml).find('Overview > Tutor > Transcript').text();


    if (use_dummy_media) {

		var dummy_xml = '<Overview><Image altText="">http://gamedata.monilab.net/sites/all/modules/lep25loader/sample/image/dummy.jpg</Image><Text>http://gamedata.monilab.net/sites/all/modules/lep25loader/sample/html/dummy.html</Text></Overview>';
		dummy_xml = $.parseXML(dummy_xml);

		gameOverview.text = $(dummy_xml).find('Text');
		gameOverview.image = $(dummy_xml).find('Image');

        gameOverview.video = "http://gamedata.monilab.net/sites/all/modules/lep25loader/sample/video/dummy.mp4"; //$(xml).find('Overview > Video > URL').text();
        gameOverview.videoTranscript = "Some sample text here ....... ..... ... .. ........ ....."
		gameOverview.videoCaptions = "http://gamedata.monilab.net/sites/all/modules/lep25loader/sample/videoCaptions/dummy.srt";
    }

    var requireTabs = false;

		if (gameOverview && (
			(gameOverview.text != null && gameOverview.text.length > 0) ||
            (gameOverview.image != null && gameOverview.image.length > 0) ||
            (gameOverview.video != null && gameOverview.video != "") ||
            (gameOverview.tutor != null && gameOverview.tutor.video != null && gameOverview.tutor.video != ""))) {
        requireTabs = true;
    }

    /*
    	if ($(gameXMLDOM).find('Overview').length > 0){
    		requireTabs = true;
    	}
    */

    if (getMode() != "placement_test" && gameOverview && requireTabs) {
        $('.game-container').addClass('with-tabs');

        var showOverview = false;

        if (gameOverview.tutor && gameOverview.tutor.video && gameOverview.tutor.video.length > 0) {
            var $element_wrapper = $('<div class="tab-panel-inner-content"></div>');
            var element = '<video width="660" height="371" controls="controls" preload="none" class="embed-responsive-item">';

            if (endsWith(gameOverview.tutor.video, ".ogg")) {
                element += '<source src="' + gameOverview.tutor.video + '" type="video/ogg">';
            } else //if(endsWith(gameOverview.video, ".mp4"))
            {
                element += '<source src="' + gameOverview.tutor.video + '" type="video/mp4">';
            }

            element += 'Your browser does not support video.</video>';


            if (gameOverview.tutor.transcript && gameOverview.tutor.transcript.length > 0) {
                var direction = $(xml).find('Overview > Tutor > Transcript').attr('direction');
                element += '<div class="tutor-text' + ' ' + direction + '">' + gameOverview.tutor.transcript + '</div>';
            }

            $element_wrapper.append(element);
            $('#overviewTutorPanel').html($element_wrapper);

            //$('#overviewVideoTab').addClass("selected");
            //$('#overviewVideoPanel').addClass("selected");

            // var options = {iPadUseNativeControls: true, iPhoneUseNativeControls: true, pauseOtherPlayers: true};
            // if(isMSIE())
            // {
            // 	options.mode = 'shim';
            // }
            // $('video').mediaelementplayer(options);
        } else {
            $('#overviewTutorTab').remove();
            $('#overviewTutorPanel').remove();
        }

        if (gameOverview.text && gameOverview.text.length > 0) {
			for (var i=0; i<gameOverview.text.length; i++)
			{

            var $element_wrapper = $('<div id="overviewTextPanelContent' + i + '" class="tab-panel-inner-content"></div>');
            //var element = '<iframe scrolling="auto" frameborder="0"  src="'+ gameOverview.text +'" style="width:100%;height:100%;"></iframe>';
            //var expand_button = '<a class="asset-text-expand-button" href="' + gameOverview.text + '">Expand Text</a>';
            var expand_button = '<a href="javascript:;" class="asset-text-expand-button">Expand Text</a>';
            //var element = expand_button + '<iframe scrolling="auto" frameborder="0"  src="'+ gameOverview.text +'" class="iframe embed-responsive-item"></iframe>';
            var element = '<div id="ajaxhtmlplaceholder' + i + '" class="iframe ajaxhtmlplaceholder embed-responsive-item"></div>' + expand_button;


            //gameOverview.text = gameOverview.text.replace(/\n/g, '<br/>');
            $element_wrapper.append(element);
            $('#overviewTextPanel').append($element_wrapper);

            $('#ajaxhtmlplaceholder' + i).html('<img src="images/ajax-loader.gif">');
            // run ajax request

			if ($(gameOverview.text[i]).text().length > 0)
			{

			$.ajax({
                type: "GET",
                //dataType: "json",
                url: $(gameOverview.text[i]).text(),
				context: $('#ajaxhtmlplaceholder' + i),
                success: function(d) {
                    // replace div's content with returned data
                    $(this).html(d);
                }
            });

			}
			}


            //$('#overviewTextTab').addClass("selected");
            //$('#overviewTextPanel').addClass("selected");
        } else {
            $('#overviewTextTab').remove();
            $('#overviewTextPanel').remove();
        }

        //
        if (gameOverview.image && gameOverview.image.length > 0) {
            //var expand_button = '<a class="asset-image-expand-button" href="' + gameOverview.image + '">Expand Image</a>';
			for (var i=0; i<gameOverview.image.length; i++)
			{

            var $element_wrapper = $('<div id="overviewImagePanelContent' + i + '" class="tab-panel-inner-content"></div>');
            var expand_button = '<a href="javascript:;" class="asset-image-expand-button">Expand Image</a>';

			var $imageArrayNode = $(gameOverview.image[i]);
			var imageWithDescriptions = ($imageArrayNode.find('Image').length == 1);
			var actualImageNode = null;

			if (imageWithDescriptions)
			{
				actualImageNode = $imageArrayNode.find('Image').first();
			}
			else
			{
				actualImageNode = $imageArrayNode;
			}

            var alt_tag = actualImageNode.attr('altText');

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

			var _title = actualImageNode.attr('title');

			if (_title)
			{

			}
			else
			{
				_title = '';
			}

            var element = '<img src="' + actualImageNode.text() + '" class="center-block img-responsive" alt="' + alt_tag + '" title="' + _title + '" />' + expand_button;

            $element_wrapper.append(element);
            $('#overviewImagePanel').append($element_wrapper);

			if (imageWithDescriptions)
			{
				var imageDescriptionsId = 'imageDescriptions' + i;

				element = '<div class="imageDescriptionsPanel panel-group"><div class="panel panel-default"><div class="panel-heading">'
				+ '<h4 class="panel-title">'
				+ '<a href="javascript:;" data-toggle="collapse" data-target="#' + imageDescriptionsId + '" class="collapsed">'
				+ 'Image description</a></h4></div>'
				+ '<div id="' + imageDescriptionsId + '" class="panel-collapse collapse in0">'
				+ '<div class="panel-body overview-image-descriptions-html">'
				+ '</div></div></div></div>';

				$('#overviewImagePanel').append(element);

				$('#' + imageDescriptionsId).find('div.overview-image-descriptions-html').html('<img src="images/ajax-loader.gif" />');

				var imageDescriptionsUrl = $imageArrayNode.find('ImageDescriptions').text();

				if (imageDescriptionsUrl != "")
				{
					$.ajax({
						type: "GET",
						url: imageDescriptionsUrl,
						context: $('#' + imageDescriptionsId).find('div.overview-image-descriptions-html'),
						success: function(data)
						{
							$(this).html(data);
						}
					});
				}
			}
			}

            //$('#overviewImageTab').addClass("selected");
            //$('#overviewImagePanel').addClass("selected");
        } else {
            $('#overviewImageTab').remove();
            $('#overviewImagePanel').remove();
        }

        //
        if (gameOverview.video && gameOverview.video.length > 0) {

            var $element_wrapper = $('<div id="overviewVideoPanelContent" class="tab-panel-inner-content"></div>');
            //var element = '<video width="480" height="270" controls="controls" preload="none" class="embed-responsive-item">';

            var expand_button = '<a class="asset-video-expand-button hidden">Expand Video</a>';
            var element = expand_button + '<video width="311" height="175" controls="controls" preload="none" class="embed-responsive-item">';

            if (endsWith(gameOverview.video, ".ogg")) {
                element += '<source src="' + gameOverview.video + '" type="video/ogg"/>';
            } else //if(endsWith(gameOverview.video, ".mp4"))
            {
                element += '<source src="' + gameOverview.video + '" type="video/mp4"/>';
            }

			if (gameOverview.videoCaptions && gameOverview.videoCaptions.length > 0)
			{
				element += '<track kind="subtitles" src="' + gameOverview.videoCaptions + '" srclang="en"/>';
			}

            element += 'Your browser does not support video.</video>';

            $element_wrapper.append(element);
            $('#overviewVideoPanel').html($element_wrapper);

            //$('#overviewVideoTab').addClass("selected");
            //$('#overviewVideoPanel').addClass("selected");

            //$('video').mediaelementplayer({iPadUseNativeControls: true, iPhoneUseNativeControls: true, pauseOtherPlayers: true});
            // var options = {iPadUseNativeControls: true, iPhoneUseNativeControls: true, pauseOtherPlayers: true};
            // if(isMSIE())
            // {
            // 	options.mode = 'shim';
            // }
            // $('video').mediaelementplayer(options);
        } else {
            $('#overviewVideoTab').remove();
            $('#overviewVideoPanel').remove();
        }

        if (gameOverview.videoTranscript && gameOverview.videoTranscript.length > 0) {
            $('#overviewVideoTranscriptPanel .overview-video-transcript-text').html(gameOverview.videoTranscript);
        } else {
            $('#overviewVideoTranscriptTab').remove();
            $('#overviewVideoTranscriptPanel').remove();
        }

//        $('#overviewPanel').show();
        $("#overviewPanel a").removeClass('selected');
        $("#overviewPanel div").removeClass('selected');
        $('#overviewCloseTab').addClass("selected");


        showOverview = true;

        $('body').addClass('with-assets');

		var assetRatio = 0;
		var contentRatio = 0;

		var assetToContentRatio = $(xml).find('AssetToContentRatio').text().split(":");

		if (assetToContentRatio.length == 2)
		{
			assetRatio = parseInt(assetToContentRatio[0]);
			contentRatio = parseInt(assetToContentRatio[1]);
		}

		if (assetRatio + contentRatio != 12)
		{
			assetRatio = 4;
			contentRatio = 8;
		}

		$('#overviewPanel').addClass('col-md-' + assetRatio);
		$('#exerciseColumn').addClass('col-md-' + contentRatio);

    } else {
        $('#overviewPanel').remove();
        $('#overviewButton').remove();
        $('body').addClass('without-assets'); //.addClass('skin-' + gameskin);


        $('.game-container').addClass('no-tabs');
        //$('#overviewCloseTab').remove();

//		$('#exerciseColumn').removeClass('col-md-8');
    }


    processVideoPlayer();


    //$(".asset-text-expand-button").colorbox({iframe:true, width:"80%", height:"80%"});
    //$(".asset-image-expand-button").colorbox({rel:'group1'});

    //$(".asset-video-expand-button").colorbox({inline:true, width:"50%", overlayClose:true, closeButton:true});
    //$(".asset-image-expand-button").colorbox({inline:true, maxWidth:"80%", overlayClose:true, closeButton:true, scrolling:true, fixed:false});
    //$(".asset-text-expand-button").colorbox({inline:true, width:"50%", overlayClose:true, closeButton:true});

    $("a.asset-image-expand-button").click(function(e) {
        e.preventDefault();

        var $element_wrapper = $('<div id="overviewImagePanelTemp" class=""></div>');

		var $contentHolder = $(this).parent();
		var $content = $contentHolder.children();

        BootstrapDialog.show({
            //title: '',
            message: $element_wrapper.html($content),
            cssClass: 'overview-image-dialog',
            buttons: [{
                label: 'Close',
                cssClass: 'btn-primary',
                action: function(dialog) {
                    dialog.close();
                }
            }],
			onshown: function(dialogRef)
			{
				$('button.close').focus();
			},
            onhidden: function(dialogRef) {
                $contentHolder.html($content);
				$contentHolder.find('a').focus();

				$contentHolder = null;
				$content = null;
            }
        });
    });

    $(".asset-video-expand-button").click(function(e) {
        e.preventDefault();
        var $element_wrapper = $('<div id="overviewVideoPanelTemp" class="embed-responsive embed-responsive-16by9"></div>');

        BootstrapDialog.show({
            //title: '',
            message: $element_wrapper.html($('#overviewVideoPanelContent')),
            cssClass: 'overview-video-dialog',
            buttons: [{
                label: 'Close',
                cssClass: 'btn-primary',
                action: function(dialog) {
                    dialog.close();
                }
            }],
            onshow: function() {
                //processVideoPlayer();
            },
            onhide: function(dialogRef) {
                $('#overviewVideoPanel').html($('#overviewVideoPanelContent'));
            }
        });
    });

    $("a.asset-text-expand-button").click(function(e) {
        e.preventDefault();
        var $element_wrapper = $('<div id="overviewTextPanelTemp" class="embed-responsive embed-responsive-16by9"></div>');

		var $contentHolder = $(this).parent();
		var $content = $contentHolder.children();

        BootstrapDialog.show({
            //title: '',
            message: $element_wrapper.html($content),
            cssClass: 'overview-text-dialog',
            buttons: [{
                label: 'Close',
                cssClass: 'btn-primary',
                action: function(dialog) {
                    dialog.close();
                }
            }],
			onshown: function(dialogRef)
			{
				$('button.close').focus();
			},
            onhidden: function(dialogRef) {
                $contentHolder.html($content);
				$contentHolder.find('a').focus();

				$contentHolder = null;
				$content = null;
            }
        });
    });




    /*$("asset-video-expand-button").click(function() {
	  	// fix for video
		//$('.mejs-video').css({ width: '100%', height: '100%' });
	});*/

    //@
    var m = $(xml).find('Mode').text();
    if (m != '') {

        /*
        		if(gameModesSupportedForGame())
        		{
        			gameMode = m;
        		}
        		else
        		{
        			gameMode = "default";
        		}

        		if(gameMode == 'test')
        		{
        			 var showSeeAllAnswerOption = $(xml).find('Mode').attr("showSeeAllAnswerOption");
        			 var showAnswerFeedbackIcons = $(xml).find('Mode').attr("showAnswerFeedbackIcons");
        			 var showScore = $(xml).find('Mode').attr("showScore");

        			 gameModeOptions = {showSeeAllAnswerOption:showSeeAllAnswerOption, showAnswerFeedbackIcons:showAnswerFeedbackIcons, showScore:showScore};
        		
        			 $('#checkAnswerButton').hide();
        		}
        		else if(gameMode == 'learn')
        		{
        			$('#checkAnswerButton').hide();
        			$('#finishButton').hide();
        		}
        */

        if (m == "test" || m == "test_mode") {
            m = "test_mode";
        } else //if(m == "learn" || m == "learn_mode")
        {
            m = "learn_mode";
        }

        // check mode
        if (typeof parent.unitMode != 'undefined' && parent.unitMode != 'none') {
            gameMode = parent.unitMode;
            gameModeOptions = parent.unitModeOptions;
        }
		else if (isGameInAdvanceSlide && typeof parent.parent.unitMode != 'undefined' && parent.parent.unitMode != 'none')
		{
			gameMode = parent.parent.unitMode;
            gameModeOptions = parent.parent.unitModeOptions;
		}
		else
		{
			gameMode = m;
		}
        setExerciseMode();
    }


    var s = $(xml).find('ScoreToPass').text();
    if (s != '') {
        gameScoreToPass = parseInt(s);

        if (isNaN(gameScoreToPass)) {
            gameScoreToPass = 0;
        }

    }

    //console.log(gameMode);


    gameDescription = $(xml).find('Description').text();
    gameTestMin = $(xml).find('TestMin').text();
    gameShowQuestionNo = $(xml).find('ShowQuestionNo').text();
	gameQuestionNoAlphabetical = ($(xml).find('QuestionNoAlphabetical').text() === 'true');
	gameDoAllQuestions = $(xml).find('DoAllQuestions').text();

    var option = $(xml).find('DisplayOption').text();
    if (option === 'One Question Per Page') {
        gameDisplayOptions = 0;
    } else if (option === 'All Question On One Page') {
        gameDisplayOptions = 1;
    }
    setQuestionDisplay();

    if ($(xml).find('[noCorrectAnswer="true"]').length > 0 ||
        $(xml).find('NoCorrectAnswer').length > 0) {
        gameNoCorrectAnswers = 1;
        //disableCheckPageAnswer();
    }

	if ($(xml).find('Timer').text() != '')
	{
		gameXML_timer = $(xml).find('Timer').text();
	}

	if ($(xml).find('Lives').text() != '')
	{
		gameXML_lives = $(xml).find('Lives').text();
	}

    //updateRemainingQuestions();


    if (showOverview) {
        $('#overviewPanel').removeClass('hidden');
        //$('#ajaxhtmlplaceholder').scrollbar();

        /*$('#questions').scrollbar({
            ignoreMobile: false
        });*/
        
/*        $('.scrollbar-inner').scrollbar({
            ignoreMobile: false,
            ignoreOverlay: false
        });*/
        
        //$('.scrollbar-inner').mCustomScrollbar();
        //$('iframe').scrollbar();
        //$('#ajaxhtmlplaceholder').scrollbar();
    }

    exerciseLoaded(); //@

    /*
    	if(gameMode == "learn")
    	{
    		//$("#generalOptions").hide();
    	}
    	else
    	{
    		$("#generalOptions").show();
    	}
    */
    //
    /*
    	if($('gameInstructionsText').isChildOf('ajax-cont') == false)
    	{
    		$('#ajax-cont').append($('#gameInstructionsText'));
    	}
    	if($('ajax-options').isChildOf('ajax-cont') == false)
    	{
    		//$('#ajax-cont').append($('#ajax-options'));
    	}
    */

    // addGlobalAudio();

    // // $('#ajax-cont').append('<div id="qAudio"></div>');
    // if ($('#cardSlots')) {
    // 	$('<div id="qAudio"></div>').insertBefore('#cardSlots');
    // }
}



jQuery.fn.isChildOf = function(b) {
    return (this.parents(b).length > 0);
};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}


function generateShuffledIndexArray(len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(i);
    }
    return shuffle(arr);
}




function onGameStart() {
    if (gameTestMin !== "") {
        setTimeout(onTimeOut, parseInt(gameTestMin * 60 * 1000, 10));
    }
}

function onTimeOut() {
    openPopup('#gameTimeOutPopup');
}


function onTryAgain(obj) {

	if (obj && $(obj).hasClass('disabled'))
	{
		return ;
	}

    // call RemoveLearnerResponse() to remove previous attempt

    if (typeof parent.RemoveLearnerResponse == 'function') {
        //
        var chapter_index = window.frameElement.getAttribute("data-chapter-index");
        var page_index = window.frameElement.getAttribute("data-page-index");
        //
        parent.RemoveLearnerResponse(chapter_index, page_index);
    }
    
    //stopAllSound();
    location.reload();

    /*
	stopAllSound();
	//openPopup('#gameFinishPopup');
	BootstrapDialog.confirm('Are you sure you want to reset?', function(result){
        if(result) {
            //alert('Yup.');
            
            //onReset();
            location.reload();

        }else {
            //alert('Nope.');
        }
    });
   */
}

function onReset() {
    $('#jparse-meta').remove();

    $('#ajax-cont').empty();

    $('#answers').remove();
    stopAllSound();


    // 
    $('#showAnwsersButton').addClass('hidden');
    $('#scoreButton').addClass('hidden');
    //$('#helpButton').removeClass('hidden');
    $('#checkAnswerButton').removeClass('hidden');
    $('#finishButton').removeClass('hidden');


    //jQuery('.scrollbar-inner').scrollbar();
    //jQuery('.questions').scrollbar();
    //jQuery('iframe').scrollbar();

    /*
    	//@
    	//$("#seeAllAnswerOption").hide();
    	$("#testModeOptions").hide();
    	$("#seeAllAnswerOption").hide();
    	$("#scorePanel").hide();
    	$("#learnModeOptions").hide();
    	//$("#generalOptions").show();

    	closeGameAlertPopup();
    	//@change - no longer required
    	//closeGameInstructionsPopup();
    	closeGameCluesPopup();
    	closeGameFinishPopup();
    	closeGameScorePopup();
    	reset();

    	initSoundPlugin();

    	onGameStart();
    	*/

    reset();



    onPageClick("1");



    setExerciseMode();
    setQuestionDisplay();


    if(sample)
    {
        //console.log(getMode());
        onConfirmedFinish(); // no score popup, no submit to LMS
    }


    /*
	//@change - no longer required
	if (gameInstructions !== undefined && gameInstructions !== '') {
		//openPopup('#gameStartPopup');
		
	}*/




    //$('#cardPile0').scrollToFixed();
    //$("#cardPile0").hachiko({top: 0});


    //after all DOM elements ready

    //@ hide header/footer when scroll down
    var ost = 0;
    //$(window).scroll(function() { //
    $('#myNavmenuCanvas').scroll(function() { //
        var cOst = $(this).scrollTop();

        if (cOst > ost) {
            $('body').addClass('hide-ui').removeClass('default');
            if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
                parent.hideHeader();
            }
        } else {
            $('body').addClass('default').removeClass('hide-ui');
            if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
                parent.showHeader();
            }
        }

        ost = cOst;
    });

    $("#questions").focusin(function() {
        $('body').addClass('hide-ui').removeClass('default');
        if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
            parent.hideHeader();
        }
    });

    $("#questions").focusout(function() {
        $('body').addClass('default').removeClass('hide-ui');
        if (typeof parent.unitReady != 'undefined' && typeof parent.chapterReady != 'undefined') {
            parent.showHeader();
        }
    });


    /*$('#questions').addClass('scrollbar-inner');
    $('.scrollbar-inner').scrollbar({
            ignoreMobile: false
        });*/

/*    $('#questions').addClass('scrollbar-rail');
    $('.scrollbar-rail').scrollbar({
            ignoreMobile: false,
            ignoreOverlay: false
        });

    

    //
    $(window).trigger('resize');

    adjustExerciseHeight();*/

}

function openPopup(id) {

    stopAllSound();

    $(id).fadeIn("fast");
    $('#popup-overlay').fadeIn("fast");
}

function closePopup(id) {
    $(id).fadeOut("fast");
    $('#popup-overlay').fadeOut("fast");
}

function onHelp() {

    //stopAllSound();

    /*
    	//openPopup('#gameCluesPopup');
    	BootstrapDialog.alert(gameClues, function(){
        	//       
    	});
    */

    BootstrapDialog.show({
        title: 'Transcript',
        closable: true,
        message: gameClues,
        cssClass: 'clues-dialog',
		onshown: function(dialogRef)
		{
			$('button.close').focus();
		},
		onhidden: function(dialogRef)
		{
			$('#helpButton').focus();
		}
    });

}

function onInstructions(event) {
    //@change - no longer required
    //openPopup('#gameInstructionsPopup');
}

function onFinish(obj) {

	if ($(obj).hasClass('disabled'))
	{
		return ;
	}

    stopAllSound();

    var total = getTotalQuestionsCount();
    var remaining = getRemainingQuestionsCount();
    var answered = total - remaining;


    //
    if(gameNoCorrectAnswers) //@@ correct answers
    {
        var notSupported = ["MultipleSelection", "HighlightDeletion", "HighlightSelection"];

        if ($.inArray($.trim(gametype), notSupported) > -1) {
            onConfirmedFinish();

            return;
        }
    }


    if (remaining > 0) {
        //openPopup('#gameFinishPopup');
        var str = "Answered questions: " + answered + " out of " + total + ". Do you want to finish?";

        if (getMode() == "placement_test") {
            if (remaining == 1 || gametype == "Matching") // special case for Matching gametype
            {
                str = "You have not answered the question. Do you want to proceed?";
            } else {
                str = "You have " + remaining + " questions remaining. Do you want to proceed?";
            }
        }

        BootstrapDialog.confirm(str, function(result) {
            if (result) {
                //alert('Yup.');
                onConfirmedFinish();
            } else {
                //alert('Nope.');
            }
        });
    } else {
        onConfirmedFinish();
    }

}

function onScore(obj) {

		if ($(obj).hasClass('disabled'))
	{
		return ;
	}

    //openPopup('#gameScorePopup');
    //alert("Show score");

    if (gameMode == "learn_mode" /*|| gameMode == "default"*/ ) 
    {
        //$("#learnModeOptions").show();

        if(gameFeedback && gameFeedback != "")
        {
            $('#scoreButton').removeClass('hidden');

            BootstrapDialog.show({
                title: 'Feedback',
                closable: true,
                message: '<div class="feedback-editor_feedback">' + gameFeedback + '</div>',
                cssClass: 'score-dialog',
				onhidden: focusToFirstAnsweredItem,
				onshown: function()
				{
					$('button.close').focus();
				}
            });
        }

        return;
    }


    var score = gameScore;
    var percentage = Math.round(score.gamePoints * 100 / score.gameTotal);

    var noCorrectMessage = '';
    if (gameNoCorrectAnswers) {
        noCorrectMessage = 'There are no correct answers for this exercise.';

		var isConcatMsg = true;

		if (parent != null)
		{
			if (parent.isNoScoreForNoCorrectAnswerExercise)
			{
				isConcatMsg = false;
			}
			else if (isGameInAdvanceSlide && parent.parent.isNoScoreForNoCorrectAnswerExercise)
			{
				isConcatMsg = false;
			}
		}

		if (isConcatMsg)
		{
			noCorrectMessage += '<br><br>You scored 100%.';
		}
    }

    var scoreMessage = 'Total score is ' + score.gamePoints + ' out of ' + score.gameTotal + ' (' + percentage + '%) ';
    if (noCorrectMessage !== '') {
        scoreMessage = noCorrectMessage; // + ' <br> Your score is ' + score.gamePoints + ' out of ' + score.gameTotal + ' (' + percentage + '%) ';
    }
    else
    {
        if(gameScoreToPass > 0)
        {
            scoreMessage += "<br><br>" + "You need " + gameScoreToPass + "% to pass this exercise"; 
        }
    }

    
    if(gameFeedback && gameFeedback != "")
    {
        scoreMessage += "<br><br>" + '<div class="feedback-editor_feedback">' + gameFeedback + '</div>';
    }

    /*BootstrapDialog.alert(scoreMessage, function(){
			    	//       
				});*/

	var _buttons;

	if (isKidsGame) {
		_buttons = [{
			label: 'Try again',
			action: function(dialogRef){
				onTryAgain();
			}
		},{
			label: 'Close',
			action: function(dialogRef){
				dialogRef.close();
			}
		}];
	}
	else {
		_buttons = [];
	}

    BootstrapDialog.show({
        title: 'Feedback',
        closable: true,
        message: scoreMessage,
        cssClass: 'score-dialog',
		onhidden: focusToFirstAnsweredItem,
		buttons: _buttons,
		onshown: function()
		{
			if (isKidsGame) {
				$('div.bootstrap-dialog-footer-buttons').find('button').first().focus();
			}
			else {
				$('button.close').focus();
			}
		}
    });


}




function onConfirmedFinish() {

    finished = true;

    if (getMode() == "placement_test" || getMode() == SURVEY_MODE) {
        $('#finishButton').addClass('disabled');
    } else {
        //$('#helpButton').addClass('hidden'); //#11589	
        $('#checkAnswerButton').addClass('hidden');
        $('#finishButton').addClass('hidden');

        $('#showAnwsersButton').addClass('hidden'); // check settings
        $('#scoreButton').addClass('hidden'); // check settings

        //$('#resetButton').removeClass('hidden');

        if (getMode() == "test_mode") {
            //$('#showAnwsersButton').removeClass('hidden'); // check settings
            //$('#scoreButton').removeClass('hidden'); // check settings
        }

        $('#nextExerciseButton').removeClass('disabled hidden'); //('hidden');
    }

    var showFeedback = true;
    var showTryAgain = true;

    if (gameMode == "test_mode") {
        if (gameModeOptions.showAnswerFeedbackIcons == false || gameModeOptions.showAnswerFeedbackIcons == "false") {
            showFeedback = false;
        }

        if (gameModeOptions.showTryAgain == false || gameModeOptions.showTryAgain == "false") {
            showTryAgain = false;
        }
    } else if (getMode() == "placement_test" || getMode() == SURVEY_MODE) {
        showFeedback = false;
        showTryAgain = false;
    }

    if (showTryAgain) {
        $('#resetButton').removeClass('disabled hidden');
    }


    onCheckPageAnswer(showFeedback);

    //
    $('#checkAnswerButton, #nextPageButton').addClass('disabled');
    $('#showAnwsersButton').removeClass('disabled');

    $('.pager').removeClass('hidden');


    gameScore = getScore();

    if (gameScore == null) {
		if (gametype == "Roleplay")
		{
			toastr_success();
		}
        return;
    }


    var score = gameScore;
    var percentage = Math.round(score.gamePoints * 100 / score.gameTotal);

    //@ check unit mode
    if (!useDefaultFeedback || getMode() == "placement_test" || getMode() == SURVEY_MODE) {
        /*
    	console.log(score);
    	console.log(score.questions);
    	console.log(score.answers);
    	console.log(score.corrects);
    	console.log(score.points);
    	console.log(score.totals);
    	*/
    } else {
        // var pages = getPagesCount();
        // for (var i = 0; i < pages; i++) {
        // 	onCheckPageAnswer(i, false);
        // }

        var noCorrectMessage = '';
        if (gameNoCorrectAnswers) {

			noCorrectMessage = 'There are no correct answers for this exercise.';

			var isConcatMsg = true;

			if (parent != null)
			{
				if (parent.isNoScoreForNoCorrectAnswerExercise)
				{
					isConcatMsg = false;
				}
				else if (isGameInAdvanceSlide && parent.parent.isNoScoreForNoCorrectAnswerExercise)
				{
					isConcatMsg = false;
				}
			}

			if (isConcatMsg)
			{
				noCorrectMessage += '<br><br>You scored 100%.';
			}
        }

        var feedback_message = "";

        var scoreMessage = 'Total score is ' + score.gamePoints + ' out of ' + score.gameTotal + ' (' + percentage + '%) ';
        if (noCorrectMessage !== '') {
            scoreMessage = noCorrectMessage; // + ' <br> Your score is ' + score.gamePoints + ' out of ' + score.gameTotal + ' (' + percentage + '%) ';
        }
        else
        {
            if(gameScoreToPass > 0)
            {
                scoreMessage += "<br><br>" + "You need " + gameScoreToPass + "% to pass this exercise"; 
            }
        }

        var pages = getPagesCount();

        if (gameModesSupportedForGame() /*&& gameMode != "default"*/ ) 
        {
            if (gameMode == "learn_mode" /*|| gameMode == "default"*/ ) 
            {
                //$("#learnModeOptions").show();
                if(gameFeedback && gameFeedback != "")
                {
                    $('#scoreButton').removeClass('hidden');
                }
                
                if(!sample) { // if NO prev learner response found, show score popup

                    if(gameFeedback && gameFeedback != "")
                    {
                        BootstrapDialog.show({
                            title: 'Feedback',
                            closable: true,
                            message: '<div class="feedback-editor_feedback">' + gameFeedback + '</div>',
                            cssClass: 'score-dialog',
							onhidden: focusToFirstAnsweredItem,
							onshown: function()
							{
								$('button.close').focus();
							}
                        });
                    }
                }
            } 
            else if (gameMode == "test_mode") {
                //$("#testModeOptions").show();

                if (gameModeOptions.showSeeAllAnswerOption == true || gameModeOptions.showSeeAllAnswerOption == "true") {
                    //$("#seeAllAnswerOption").show();
                    if (gameNoCorrectAnswers) {
                        $('#showAnwsersButton').addClass('hidden');
                    } else {
                        $('#showAnwsersButton').removeClass('hidden');
                    }

                } else {
                    //
                    $('#showAnwsersButton').addClass('hidden');
                }

                if (gameModeOptions.showAnswerFeedbackIcons == true || gameModeOptions.showAnswerFeedbackIcons == "true") {
                    /*
					for (var i = 0; i < getPagesCount(); i++) {
						onCheckPageAnswer(i, true);
					}*/
                }
                
                
                if (gameModeOptions.showScore == true || gameModeOptions.showScore == "true") {
                    //$("#scorePanel").empty().append("<span>" + scoreMessage + "</span>");
                    //$("#scorePanel").show();

                    $('#scoreButton').removeClass('hidden');
                    /*BootstrapDialog.alert(scoreMessage, function(){
                    //       
                    });*/

                    if(!sample) { // if NO prev learner response found, show score popup

                        var msg = scoreMessage;
                        if(gameFeedback && gameFeedback != "")
                        {
                            msg += "<br><br>" + '<div class="feedback-editor_feedback">' + gameFeedback + '</div>';
                        }

						var _buttons;

						if (isKidsGame) {
							_buttons = [{
								label: 'Try again',
								action: function(dialogRef){
									onTryAgain();
								}
							},{
								label: 'Close',
								action: function(dialogRef){
									dialogRef.close();
								}
							}];
						}
						else {
							_buttons = [];
						}

                        BootstrapDialog.show({
                            title: 'Feedback',
                            closable: true,
                            message: msg, //scoreMessage,
                            cssClass: 'score-dialog',
							onhidden: focusToFirstAnsweredItem,
							buttons: _buttons,
							onshown: function()
							{
								if (isKidsGame) {
									$('div.bootstrap-dialog-footer-buttons').find('button').first().focus();
								}
								else {
									$('button.close').focus();
								}
							}
                        });
                    }

                } else {
                    //$("#scorePanel").empty().append("<span>" + "Your score has been recorded" + "</span>");
                    //$("#scorePanel").show();

                    $('#scoreButton').addClass('hidden');
                    /*BootstrapDialog.alert("Your score has been recorded", function(){
                    //       
                    });*/

                    if(!sample) { // if NO prev learner response found, show score popup

                        var msg = "Your score has been recorded";

						if (parent != null && parent.isNoScoreForNoCorrectAnswerExercise)
						{
							msg = noCorrectMessage;
						}

                        if(gameFeedback && gameFeedback != "")
                        {
                            msg += "<br><br>" + '<div class="feedback-editor_feedback">' + gameFeedback + '</div>';
                        }

                        BootstrapDialog.show({
                            title: 'Score',
                            closable: true,
                            message: msg,
                            cssClass: 'score-dialog',
							onshown: function()
							{
								$('button.close').focus();
							}
                        });
                    }
                }


                

                if (gameModeOptions.showTryAgain == false || gameModeOptions.showTryAgain == "false") {
                    $('#resetButton').addClass('hidden');
                }
            }
        } else {
            // not supported 
        }


        ////////////////////////////




        /*
        		var table = '';
        			
        		$.each(score.questions, function(qIndex, question) {
        			table +='';
        			
        			table += '<td>';
        			//table += '<div class="result-original">---------------------------------</div>';
        			table += '<div class="result-original"><b>Question ' + (qIndex + 1) + '</b>: ' + question + '</div>';
        			table += '<div class="result-answer"><b>Learner Response</b>: ' + score.answers[qIndex] + '</div>';
        			table += '<div class="result-correct"><b>Correct answer</b>: ' + score.corrects[qIndex] + '</div>';
        			table += '<div class="result-correct"><b>Weight</b>: ' + score.totals[qIndex] + '</div>';
        			table += '<div class="result-correct"><b>Points</b>: ' + score.points[qIndex] + '</div>';
        			table += '<div class="result-original">---------------------------------</div></td></tr>';
        		});
        		
        		tableOut =
        			'<table><tbody>' +
        				'<tr>' +
        					'<th colspan="2">'+ scoreMessage + '</th>' +
        					//'<th>Your answer</th>' +
        				'</tr>' +
        				table +
        			'</tbody></table>';

        		if ($('.game-container').hasClass('exam')) {
        			$('#gameScoreEmbed .content .scores').html(examResults(percentage));
        			$('#gameScoreEmbed').fadeIn("fast");
        		} else {
        			$('#gameScorePopup .content .scores').html(tableOut);
        			openPopup('#gameScorePopup');
        		}
        */

        //onScore();

        ///////////////////////////////

    }

    if(!sample) // if NO prev learner response found, show score popup
    {
		var lvFrameElement;

		if (isGameInAdvanceSlide)
		{
			lvFrameElement = parent.window.frameElement;
		}
		else
		{
			lvFrameElement = window.frameElement;
		}

        if (typeof saveUserResponse != 'undefined') {
            var chapter_index = lvFrameElement.getAttribute("data-chapter-index");
            var page_index = lvFrameElement.getAttribute("data-page-index");
            saveUserResponse(chapter_index, page_index, score);
        }

        if (typeof saveScoreWithStatus != 'undefined') {
            var chapter_index = lvFrameElement.getAttribute("data-chapter-index");
            var page_index = lvFrameElement.getAttribute("data-page-index");
            var status = saveScoreWithStatus(chapter_index, page_index, score);

            //
            if(getMode() != "placement_test" && getMode() != SURVEY_MODE && !isKidsGame)
            {
                if(status == "passed")
                {
                    toastr_success();
                }
                else if(status == "failed")
                {
                    toastr["error"]("Not passed");
                }
            }
        }
    }

    //@ check unit mode
    if (getMode() == "placement_test" || getMode() == SURVEY_MODE) {
        if (typeof parent.goNext == 'function') {
            parent.goNext();
        }

		if (getMode() == 'placement_test' && typeof parent.ScormSetPlacementTestResult == 'function')
		{
			parent.ScormSetPlacementTestResult();
		}
    }

    //saveScore(percentage);
}

function getMode() {
    var mode = "test_mode";

    //if(typeof IS_CITRUS != 'undefined' && IS_CITRUS == true)
    //{
    if ((typeof parent.unitMode != 'undefined' && parent.unitMode == "placement_test") || (isGameInAdvanceSlide && typeof parent.parent.unitMode != 'undefined' && parent.parent.unitMode == "placement_test")) {
        mode = "placement_test";
    }
	else if ((typeof parent.unitMode != 'undefined' && parent.unitMode == SURVEY_MODE) || (isGameInAdvanceSlide && typeof parent.parent.unitMode != 'undefined' && parent.parent.unitMode == SURVEY_MODE))
	{
		mode = SURVEY_MODE;
	}
	else if (gameMode == "learn" || gameMode == "learn_mode") {
        mode = "learn_mode";
    } else if (gameMode == "default" || gameMode == "test" || gameMode == "test_mode") {
        mode = "test_mode";
    }
    //}

    return mode;
}




//@ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function examResults(percentage) {
    var gradeDesc = '';
    $(gameXMLDOM).find('GradeOptions > GradeItem').each(function(index, Element) {
        if (percentage >= $(this).attr('from')) {
            gradeLabel = $(this).attr('label');
            gradeDesc = '<p>' + $(this).attr('description') + '</p>';
        }
    });
    var gradeOutput = '';
    gradeOutput = '<div class="score-result">' +
        '<div class="score-header">' +
        '<div class="score-percentage"> ' + percentage + '% </div>' +
        '<div class="score-level">' +
        '<span class="score-level-label">  Your Level </span>' +
        '<span class="scole-level-grade">' + gradeLabel + '</span>' +
        '</div>' +
        '</div>' +
        '<div class="score-description">';
    gradeOutput += gradeDesc;
    gradeOutput += '</div></div>';
    return gradeOutput;
}



function closeGameStartPopup() {
    //@change - no longer required
    //closePopup('#gameStartPopup');
    //onGameStart();
}

function closeGameAlertPopup() {
    closePopup('#gameAlertPopup');
}

function closeGameInstructionsPopup() {
    //@change - no longer required
    //closePopup('#gameInstructionsPopup');
}

function closeGameCluesPopup() {
    closePopup('#gameCluesPopup');
}

function closeGameFinishPopup() {
    closePopup('#gameFinishPopup');
}

function closeGameScorePopup() {
    closePopup('#gameScorePopup');
}

function closeGameTimeOutPopup() {
    closePopup('#gameTimeOutPopup');
    onConfirmedFinish();
}


/**
 * a helper function to get the key value from URL parameter http://example.com?key=value
 */
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null) {
        return "";
    } else {
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
}

/**
 * a helper function to get the game type from URL
 */
function getGameType(xmldata) {
    var flashname = xmldata.split("/");
    flashname = flashname[flashname.length - 1];
    flashname = flashname.split(".");
    flashname = flashname[0].split("_");
    return flashname[0];
}

//If an audio player is needed in the game, its code can be added with this function, argument 'mp3' is the audio url. After adding, processPlayer has to be called to replace the player with a flash version, if necessary
function getAudioCode(mp3, isMini) {
    if (!isMini) {
        isMini = 'false';
    }

    if (isMini == 'false') {

        return '' +
            '<div class="audio" source="' + mp3 + '">' +
            '<audio class="html-audio" id="html-player' + playerId + '" width="200" onEnded="onAudioEnded(event)" controls="controls" preload="none" autobuffer="true">' +
            '<source src="' + mp3 + '" type="audio/mp3"/>' +
            /*'<object width="1024" height="576" type="application/x-shockwave-flash" data="libs/mep/flashmediaelement.swf">' +
               '<param name="movie" value="libs/mep/flashmediaelement.swf">' +
               '<param name="flashvars" value="controls=true&file='+ mp3 + '">' +
            '</object>' +*/
            '</audio>' +
            // '<div class="play-btn" style="display:none;"></div>' +
            '<div class="player-wrap">' +
            '<div class="player" id="flash-player' + playerId++ + '">' +
            '</div>' +
            '</div>' +
            '</div>';
    } else {

        var s = '';




        /*		'<div class="audio" source="' + mp3 + '">' +
        			'<audio class="html-audio" id="html-player' + playerId + '" width="70" onEnded="onAudioEnded(event)">' +
        				'<source src="' + mp3 + '" type="audio/mp3"/>' +
        			'</audio>' +
        			// '<div class="play-btn"></div>' +
        			'<div class="player-wrap">' +
        				'<div class="player" id="flash-player' + playerId++ + '">' +
        				'</div>' +
        			'</div>' +
        		'</div>';
        */

        /* //@disbale
		if( isMSIE() )
		{
			s += '<div class="audio" source="' + mp3 + '">' +
			'<audio class="html-audio" id="html-player' + playerId + '" width="70">' +
				'<source src="' + mp3 + '" type="audio/mp3"/>' +
			'</audio>' +
			// '<div class="play-btn"></div>' +
			'<div class="player-wrap">' +
				'<div class="player" id="flash-player' + playerId++ + '">' +
				'</div>' +
			'</div>' +
		'</div>';
		}
		else
		{
			//mp3 = "http://lcms.exactls.com/britishcouncil/dr/_YZWUEAUDWPDEFA5OZOWWEFRTK4/1/launch#.mp3";

			//s += '<div class="audio" onclick="playSound(this, mp3)" id="' + mp3 + '"><button> PLAY </button></div>';
			s += '<div class="audio" onclick="playSound(this,\'' + mp3 + '\')"><button> PLAY </button></div>';
		}
		*/

        // autobuffer="true"

        s += '<div class="audio" source="' + mp3 + '">' +
            '<audio class="html-audio" id="html-player' + playerId + '" width="70" preload="none" autobuffer="true">' +
            '<source src="' + mp3 + '" type="audio/mp3"/>' +
            '</audio>' +
            // '<div class="play-btn"></div>' +
            '<div class="player-wrap">' +
            '<div class="player" id="flash-player' + playerId++ + '">' +
            '</div>' +
            '</div>' +
            '</div>';

        //
        return s;

    }
}

//if( isMobile.any() ) alert('mobile');
//if( !isMobile.any() ) alert('not Mmobile');

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

/*
function isMobile() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
*/

function GetBrowser() {
    $.browser.device = (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
    return $.browser.device; //navigator ? navigator.userAgent.toLowerCase() : "other";
}

function isMSIE()
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    {

        /*
        var isIE = false;
        var ver = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer')
        {
          var ua = navigator.userAgent;
          var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
          if (re.exec(ua) != null)
            ver = parseFloat( RegExp.$1 );
        }

        if ( ver > -1)
        {
          //if ( ver >= 8.0 ) 
            // new IE
          //else
            //old IE;

          isIE = true;
        }

        //return ver;
        return false;
        */

        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }


var player1 = null;

function addAudioSupport() {
    player1 = new MediaElement('mejs', {
        // shows debug errors on screen
        enablePluginDebug: false,
        // remove or reorder to change plugin priority
        plugins: ['flash', 'silverlight'],
        // specify to force MediaElement to use a particular video or audio type
        type: 'audio/mp3',
        // path to Flash and Silverlight plugins
        //pluginPath: '/myjsfiles/',
        // name of flash file
        //flashName: 'flashmediaelement.swf',
        // name of silverlight file
        //silverlightName: 'silverlightmediaelement.xap',
        // default if the <video width> is not specified
        //defaultVideoWidth: 295, //480,
        // default if the <video height> is not specified     
        //defaultVideoHeight: 166, //270,
        // overrides <video width>
        pluginWidth: -1,
        // overrides <video height>       
        pluginHeight: -1,
        // rate in milliseconds for Flash and Silverlight to fire the timeupdate event
        // larger number is less accurate, but less strain on plugin->JavaScript bridge
        timerRate: 250,
        // method that fires when the Flash or Silverlight object is ready
        success: function(mediaElement, domObject) {

            mediaElement.addEventListener('loadedmetadata', function() {
                //console.log("loadedmetadata");
            }, false);

            mediaElement.addEventListener('loadeddata', function() {
                //console.log("loadeddata");
            }, false);

            mediaElement.addEventListener('canplay', function() {
                //console.log("canplay");
            }, false);

            mediaElement.addEventListener('pause', function() {
                //console.log("pause");
            }, false);

            mediaElement.addEventListener('play', function() {
                //console.log("play");
            }, false);

            mediaElement.addEventListener('playing', function() {
                //console.log("playing");
                $('.mini-audio .glyphicon-spinner').removeClass('glyphicon-spinner').addClass('glyphicon-pause');
            }, false);

            mediaElement.addEventListener('ended', function(e) {
                //document.getElementById('current-time').innerHTML = mediaElement.currentTime;

                if (getMode() == "placement_test") {
                    $('.mini-audio .glyphicon-pause').removeClass('glyphicon-spinner glyphicon-pause').addClass('glyphicon-play').parent().addClass('disabled');
                    //$('.mini-audio').addClass('disable hidden'); // placement test requirements, mini audio also play once ONLY. Note this only allows for 1 audio button on page
                } else {
                    $('.mini-audio .glyphicon').removeClass('glyphicon-spinner glyphicon-pause').addClass('glyphicon-play');
                }

            }, false);

            // call the play method
            //mediaElement.play();

        },
        // fires when a problem is detected
        error: function() {

        }
    });


    //$('.mini-audio').mousedown(function(e) {
    $("body").on("click", ".mini-audio", function(e) {
        //alert( "Handler for .mousedown() called." );
        e.stopImmediatePropagation();

        if ($(this).hasClass('disabled')) {
            return;
        }

        if (getMode() == "placement_test") {
            $(this).addClass('disabled');
        }

        $('.mini-audio .glyphicon').removeClass('glyphicon-spinner glyphicon-pause').addClass('glyphicon-play');

        //$(this).find('.glyphicon').addClass('glyphicon-pause');//.siblings().removeClass('current');

        var audio_src = $(this).data('href'); //text();
        //alert(miniaudioSrc + "  -  " + audio_src);

        if (miniaudioSrc == audio_src) {
            var _playFromStart = ($(this).attr('data-play-from-start') == "true");

            if (player1.paused || player1.ended || _playFromStart) {
                $(this).find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');

                if (_playFromStart) {
                    player1.pause();
                    player1.setSrc([{
                        src: audio_src,
                        type: 'audio/mp3'
                    }]);
                }

                player1.play();
            } else {
                $(this).find('.glyphicon').removeClass('glyphicon-pause').addClass('glyphicon-play');

                player1.pause();
            }
        } else {

            player1.pause();
            player1.setSrc([{
                src: audio_src,
                type: 'audio/mp3'
            }]);

            miniaudioSrc = audio_src;

            //player1.load();
            player1.play();

            $(this).find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-spinner'); //.addClass('glyphicon-pause');
        }
    });



}


function addDragAndDropSupport() {
    $(".option-pool-list, .gapfield-list").sortable({
        connectWith: ".ui-sortable",
        cancel: ".ui-state-disabled",
        //axis: 'x',
        containment: "parent",
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
                onCheckPageAnswer();
            }

            ui.item.removeAttr('style');

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
        stack: '.list-group-item',
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
}

function limitDragAndDropToOneItem() {
    //
    $('.ui-sortable li').mousedown(function() {
        $('.ui-sortable').not($(this).parent()).each(function() {
            if ($(this).find('li').length >= 1) {
                if ($(this).attr('id') != "main_list") // if id is not "main_list" and has at least 1 item , disable drop 
                {

                    /*if($(this).find('li').length == 1 && $(this).find('li.dummy').length != 0)
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
    });

    $('.ui-sortable li').mouseup(function() {

        if (finished == false) {
            $('.ui-sortable').each(function() {
                $(this).sortable('enable');
                //console.log('enable : ' + $(this));
            });
        }
    });
}

function addSelectAndDropSupport(enableInputAtInit)
{
	enableInputAtInit = null || enableInputAtInit;
	
	if (enableInputAtInit == null)
	{
		enableInputAtInit = true;
	}
	
	var selectAndDropManager =
	{
		canDropToGapFieldFunc: null,
		customGapFieldHintClass: "",
		customGapFieldHintFilter: null,
		clickGapFieldCallback: null,
		disabled: false,
		disableInputCallback: null,
		dropBackToOptionList: false,
		droppableSelector: "",
		dropToOneItem: false,
		enableInputAtInit: enableInputAtInit,
		enableInputCallback: null,
		extraGapFieldHintSelector: "",
		gapFieldSelector: "ul.gapfield-list",
		inputEnabled: false,
		onCheckPageAnswer: true,
		selectedOption: new Array(),
		showGapFieldHint: true,
		
		init: function()
		{
			if (this.enableInputAtInit)
			{
				this.enableInput();
			}
			
			$("ul.option-pool-list").addClass("ui-select-and-drop");
			$("ul.gapfield-list").addClass("ui-select-and-drop");
		},
		enableInput: function()
		{
			if (this.inputEnabled)
			{
				this.disableInput();
			}
			
			if (this.disabled)
			{
				return ;
			}
			
			this.initOptionHandler();
			this.initGapFieldHandler();
			this.initDroppableHandler();
			
			if (this.dropBackToOptionList || gameMode == "test_mode" || gameMode == "placement_test")
			{
				this.initDropBackToOptionHandler();
			}
			
			updateRemainingQuestions();
			
			if (this.enableInputCallback != null)
			{
				this.enableInputCallback();
			}
			
			this.inputEnabled = true;
		},
		disableInput: function()
		{
			this.removeOptionHandler();
			this.removeGapFieldHandler();
			this.removeDroppableHandler();
			
			if (this.dropBackToOptionList || gameMode == "test_mode" || gameMode == "placement_test")
			{
				this.removeDropBackToOptionHandler();
			}
			
			updateRemainingQuestions();
			
			if (this.disableInputCallback != null)
			{
				this.disableInputCallback();
			}
			
			this.inputEnabled = false;
		},
		selectOption: function(optionObj)
		{
			if (optionObj == null)
			{
				return ;
			}
			
			var optionObjSelected = false;
			
			if (this.hasSelectedOption())
			{
				optionObjSelected = optionObj.is(this.getSelectedOption());
							
				selectAndDropManager.removeSelectedOption();
			}
			
			if (!optionObjSelected)
			{
				optionObj.addClass('btn-selected');
			
				this.selectedOption.push(optionObj);
				
				this.setGapFieldHintVisible(true);
				this.setGapFieldTappable(true);
			}
		},
		removeSelectedOption: function()
		{
			if (this.hasSelectedOption())
			{
				this.selectedOption[0].removeClass('btn-selected');
				this.selectedOption.splice(0, 1);
				
				this.setGapFieldHintVisible(false);
				this.setGapFieldTappable(false);
			}
		},
		hasSelectedOption: function()
		{
			return (this.selectedOption.length == 1);
		},
		getSelectedOption: function()
		{
			if (this.hasSelectedOption())
			{
				return this.selectedOption[0];
			}
			else
			{
				return null;
			}
		},
		initOptionHandler: function()
		{
			$("li", "ul.option-pool-list").click(function(e)
			{
				if ($(this).is(e.target))
				{
					selectAndDropManager.selectOption($(this));
				}
			}).keydown(function(e)
			{
				var key = e.which;

				if (key == 13 && $(this).is(e.target))
				{
					$(this).click().focus();
				}
			});
		},
		removeOptionHandler: function()
		{
			$("li", "ul.option-pool-list").off();
		},
		initGapFieldHandler: function()
		{
			var manager = this;
			
			$(this.gapFieldSelector).click(function(event)
			{
				if (!manager.hasSelectedOption() || !manager.canDropToGapField($(this)))
				{
					return ;
				}
				
				if (manager.getDropToOneItem())
				{
					var $li = $("li", this);
					
					if ($li.length == 1)
					{
						if (this.dropBackToOptionList || gameMode == "test_mode" || gameMode == "placement_test")
						{
							if ($li.not('li.ui-state-disabled').length == 1)
							{
								selectAndDropManager.dropBackToOptionListFunc($li);
								$li.attr('tabIndex', 0);
							}
						}
						else
						{
							return ;
						}
					}
				}
				
				manager.disableInput();				
				
				var selectedOption = manager.getSelectedOption();
				
				manager.removeSelectedOption();
				
				$(this).append(selectedOption);
				$(selectedOption).focus();
				
				if (gameMode == "learn_mode")
				{
					if (manager.getOnCheckPageAnswer())
					{
						onCheckPageAnswer();
					}
					else
					{
						manager.enableInput();
					}
				}
				else if (gameMode == "test_mode" || gameMode == "placement_test")
				{
					manager.enableInput();
				}

				selectedOption.removeAttr('style');
//				updateRemainingQuestions();
				
				if (manager.clickGapFieldCallback != null)
				{
					manager.clickGapFieldCallback();
				}
			}).keydown(function(e)
			{
				var key = e.which;

				if (key == 13 && $(this).is(e.target))
				{
					$(this).click();
				}
			});
		},
		removeGapFieldHandler: function()
		{
			$(this.gapFieldSelector).off();
		},
		initDroppableHandler: function()
		{
			if (this.droppableSelector != "")
			{
				var manager = this;
				
				$(this.droppableSelector).click(function(e)
				{
					var gapField = $(manager.gapFieldSelector, this);
					
					if (gapField.length == 1 && !gapField.is(e.target))
					{
						$(gapField[0]).trigger("click");
					}
				});
			}
		},
		removeDroppableHandler: function()
		{
			if (this.droppableSelector != "")
			{
				$(this.droppableSelector).off();
			}
		},
		initDropBackToOptionHandler: function()
		{
			var $selectedLi = $('li', 'ul.gapfield-list').not('li.ui-state-disabled');
			
			$selectedLi.click(function(e)
			{
				if ($(this).is(e.target))
				{
					selectAndDropManager.dropBackToOptionListFunc($(this));
				}
			}).keydown(function(e)
			{
				var key = e.which;

				if (key == 13 && $(this).is(e.target))
				{
					$(this).click().focus();
				}
			});
		},
		removeDropBackToOptionHandler: function()
		{
			$('li', 'ul.gapfield-list').off();
		},
		getDropToOneItem: function()
		{
			return this.dropToOneItem;
		},
		limitDropToOneItem: function()
		{
			this.dropToOneItem = true;
		},
		getOnCheckPageAnswer: function()
		{
			return this.onCheckPageAnswer;
		},
		setOnCheckPageAnswer: function(bool)
		{
			this.onCheckPageAnswer = bool;
		},
		addDroppable: function(string)
		{
			if (this.droppableSelector == "")
			{
				this.droppableSelector = string;
			}
			else
			{
				this.droppableSelector += "," + string;
			}
			
			this.enableInput();
		},
		setClickGapFieldCallback: function(callback)
		{
			if (this.clickGapFieldCallback == null)
			{
				this.clickGapFieldCallback = callback;
			}
		},
		setEnableInputCallback: function(callback)
		{
			if (this.enableInputCallback == null)
			{
				this.enableInputCallback = callback;
			}
		},
		setDisableInputCallback: function(callback)
		{
			if (this.disableInputCallback == null)
			{
				this.disableInputCallback = callback;
			}
		},
		setDropBackToOptionList: function(bool)
		{
			this.dropBackToOptionList = bool;
		},
		dropBackToOptionListFunc: function($li)
		{			
			$li.off();
			
			var optionListId = $li.attr('data-parent-option-pool-list');
			
			if (optionListId == null)
			{
				$('#main_list').append($li);
			}
			else
			{
				$(optionListId).append($li);
			}
			
			this.enableInput();
		},
		setDisabled: function(bool)
		{
			this.disabled = bool;
			
			if (this.disabled)
			{
				this.disableInput();
				this.removeSelectedOption();
				this.setGapFieldHintVisible(false);
				this.setGapFieldTappable(false);
			}
		},
		setCanDropToGapFieldFunc: function(func)
		{
			if (this.canDropToGapFieldFunc == null)
			{
				this.canDropToGapFieldFunc = func;
			}
		},
		canDropToGapField: function($gapField)
		{
			if (this.canDropToGapFieldFunc == null)
			{
				return true;
			}
			else
			{
				return this.canDropToGapFieldFunc($gapField, $(this.getSelectedOption()));
			}
		},
		setShowGapFieldHint: function(bool)
		{
			this.showGapFieldHint = bool;
		},
		setGapFieldHintVisible: function(bool)
		{
			var manager = this;
			
			if (this.showGapFieldHint)
			{
				var gapFieldSelector = this.gapFieldSelector;
				var gapFieldHintClass = 'gapfield-hint';

				if (this.customGapFieldHintClass != "")
				{
					gapFieldHintClass = this.customGapFieldHintClass;
				}

				if (this.extraGapFieldHintSelector != "")
				{
					gapFieldSelector += ',' + this.extraGapFieldHintSelector;
				}

				if (bool)
				{
					$(gapFieldSelector).filter(function()
					{
						if (!manager.getDropToOneItem())
						{
							return true;
						}
						else if (manager.customGapFieldHintFilter != null && !manager.customGapFieldHintFilter($(manager.getSelectedOption()), $(this)))
						{
							return false;
						}
						else if ($(this).is('ul'))
						{
							return ($('li', this).length == 0);
						}
						else
						{
							return true;
						}
					}).addClass(gapFieldHintClass);
				}
				else
				{
					$(gapFieldSelector).removeClass(gapFieldHintClass);
				}
			}
		},
		setGapFieldTappable: function(bool)
		{
			if (bool)
			{
				$(this.gapFieldSelector).attr('tabindex', 0);
				$('li', this.gapFieldSelector).removeAttr('tabindex');
			}
			else
			{
				$(this.gapFieldSelector).removeAttr('tabindex');
				$('li', this.gapFieldSelector).attr('tabindex', 0);
			}
		},
		setCustomGapFieldHintFilter: function(func)
		{
			if (this.customGapFieldHintFilter == null)
			{
				this.customGapFieldHintFilter = func;
			}
		},
		setExtraGapFieldHintSelector: function(str)
		{
			this.extraGapFieldHintSelector = str;
		},
		setCustomGapFieldHintClass: function(str)
		{
			this.customGapFieldHintClass = str;
		}
	};
	
	selectAndDropManager.init();
	
	return selectAndDropManager;
}

function updateRemainingQuestions() {
    if (getMode() == "placement_test") {
        return; // we do not need to disable the finish button OR show the items remaining
    }

    //var remaining = getRemainingQuestionsCount();
    var total = getTotalQuestionsCount();
    var remaining = getRemainingQuestionsCount();
    var answered = total - remaining;

    if ((total > 0 && total == remaining) || (gameDoAllQuestions === 'Yes' && remaining > 0)) {
        $('#finishButton').addClass('disabled');
    } else {
        $('#finishButton').removeClass('disabled');
    }

    if (remaining > 0) {
        $('#gameQuestionsRemainingText').removeClass('hidden');
    } else {
        $('#gameQuestionsRemainingText').addClass('hidden');
    }

    $('#gameQuestionsRemainingText').text(remaining + " item" + ((remaining > 1)? "s": "") + " remaining");

    //console.log("Remaining Questions count = " + remaining);


    if (finished == false) {
        if (getMode() == "learn_mode" && remaining == 0) {
            onConfirmedFinish();
        }
    }
}

function getTotalQuestionsCount() {
	if (gametype == 'ReorderingHorizontal' && countQuestionAsItem)
	{
		return $('#questions').find('div.question').length;
	}
	else
	{
		return $('.btn-info').length; //size();
	}
}

var jumpingToAnotherPage = false;

function getRemainingQuestionsCount() {
	switch (gametype) {
		case 'FindThePairs':
		case 'Word2word':
		case 'BalloonBurst':
		case 'DuoQuiz':
			return ($('.btn-info').length - $('.btn-success').length);
			break;
		default:
			break;
	}

    var remaining = 0;

    var remainingPerPage = [];

    if (getMode() == "learn_mode") {
        remaining = $('.btn-info').length - $('.btn-success').length;

        $('.question').each(function(index) {
            remainingPerPage.push($(this).find('.btn-info').length - $(this).find('.btn-success').length);
        });

        //alert(remainingPerPage.length + '   ' + remainingPerPage);

        if (remainingPerPage.length == getPagesCount()) {
            if (remainingPerPage[pageIndex] == 0 && jumpingToAnotherPage == false) {

                remainingPerPage[pageIndex] = -1; //@ To stop it jumping multiple times.

				switch (gametype)
				{
					case 'DuoQuiz':
					case 'Word2word':
					case 'BalloonBurst':
						$('#nextPageButton').removeClass('disabled');
						break;

					default:

						jumpingToAnotherPage = true;

						$('[name=gapfield-list]').parent().addClass('ui-state-disabled');

						setTimeout(
							function() {
								onNextPageClick();
								//
								jumpingToAnotherPage = false;
								$('[name=gapfield-list]').parent().removeClass('ui-state-disabled');

							}, 2500);
				}
            }

            // remove all .btn-

        }


    } else if (getMode() == "test_mode" || getMode() == "placement_test") {
        /*
		var notSupported = ["GapFillTyping", "ReorderingHorizontal", "ReorderingVertical"];
		if ($.inArray($.trim(gametype), notSupported) > -1) 
		{
			return false;
		}
		*/

		switch (gametype)
		{
			case "GapFillDragAndDrop":
			case "Grouping":
			case "Matching":
			case "ImageMatching":
			case "ReorderingHorizontal":
			case "ReorderingVertical":
			case "LabelThePicture":
				// drag n drop type
				remaining = $('.option-pool-list').children().length; //size();
				break;

			case "GapFillTyping":
				// typing / dropdown type
				$('[name=gapfield]').each(function(index) {
					if ($.trim($(this).val()) == "") {
						remaining++;
					}
				});
				break;

			case "GapFillDropDown":
				// typing / dropdown type
				$('[name=gapfield]').each(function(index) {
					if ($.trim($(this).text()) == "") {
						remaining++;
					}
				});
				break;

			case "TrueOrFalse":
			case "MultipleChoice":
			case "MultipleSelection":
			case "DuoQuiz":
				// for choice selection type
				remaining = $('.btn-info').length; //size();
				$('[name=gapfield-list]').each(function(index) {
					remaining = remaining - $(this).children('.active').length; //size();
				});

				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				if(gameNoCorrectAnswers) {
					if(gametype == "MultipleSelection")
					{
						remaining = 0;
					}
				}
				break;

			case "HighlightSelection":
			case "HighlightDeletion":
				remaining = $('.btn-info').length /*size()*/ - $('.highlighted').length; //size();

				// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				if(gameNoCorrectAnswers) {
					if(gametype == "HighlightSelection" || gametype == "HighlightDeletion")
					{
						remaining = 0;
					}
				}
				break;

			case 'ColorGrouping':
				remaining = $('[data-color-index="-1"]').length;
				break;

			default:
				debug.log("Game type: " + gameType + " is not supported for remaining questions.")
				break;
		}
    }

	if (gametype == 'ReorderingHorizontal' && countQuestionAsItem)
	{
		remaining = 0;

		var li_selector = "li";

		if (getMode() == "learn_mode")
		{
			li_selector = "li.btn-success";
		}

		$('#questions').find('div[name=main-gapfield-list]').each(function(index, data)
		{
			var $gapfieldList = $(data).find('ul.gapfield-list');

			if ($gapfieldList.length > 0 && $gapfieldList.length != $gapfieldList.find(li_selector).length)
			{
				remaining++;
			}
		});
	}

	if (gametype == 'Survey')
	{
		remaining = $('div[name="gapfield-list"]').find('select').find('option:selected[value=""]').length;
	}

    return remaining;
}

function getPageRemainingQuestionsCount()
{
	// only implemented learn mode
	
	var remainingPerPage = new Array();
	
	if (getMode() == "learn_mode")
	{
		$('.question').each(function(index)
		{
			remainingPerPage.push($(this).find('.btn-info').length - $(this).find('.btn-success').length);
		});

		if (remainingPerPage.length == getPagesCount())
		{
			return remainingPerPage[pageIndex];
		}
	}

	return 0;
}

/////////////////////////////////////////////////////
/**
	@change : introduce new sound class
*/


var soundInstance = null;

function initSoundPlugin() {

    /* //@disable
	if(isMSIE() == false)
	{
		
		if (!createjs.Sound.initializeDefaultPlugins()) {
				//
		}
		
	}
	*/
}

function registerAudioFiles(manifest) {

    /* //@disable
	if(isMSIE() == false)
	{
    	createjs.Sound.addEventListener("fileload", createjs.proxy(soundLoaded, this)); // add an event listener for when load is completed
    	createjs.Sound.registerManifest(manifest);
    }
    */

}


function soundLoaded(event) {
    //document.getElementById("loader").className = "";
    //var div = document.getElementById(event.id);
    //div.style.backgroundImage = "url('assets/audioButtonSheet.png')";
}

function playSound(target, url) {
    stopAllSound();
    //Play the sound: play (src, interrupt, delay, offset, loop, volume, pan)

    /* //@disable
        if(isMSIE() == false)
		{
            var instance = createjs.Sound.play(url, createjs.Sound.INTERRUPT_NONE, 0, 0, false, 1);
            if (instance == null || instance.playState == createjs.Sound.PLAY_FAILED) { return; }
            //target.className = "gridBox active";
			instance.addEventListener ("complete", function(instance) {
				//target.className = "gridBox";
			});

			soundInstance = instance;
		}
		*/

}


function stopAllSound() {

    /*
    		
    */
    if (isMSIE() == false) {
        /* //@disable
        	createjs.Sound.stop();
			*/
        /*
	        $.each($('audio'), function () {

	        	if (typeof variable != 'undefined') {
				    // variable is undefined
				    this.stop();   
		        	if(this.currentTime) {
						this.currentTime = 0;
		        	}
				}

			});*/

    } else {
        //alert("IE");
    }
    /*
    		var audios = $('audio').mediaelementplayer({iPadUseNativeControls: true, iPhoneUseNativeControls: true, pauseOtherPlayers: true});
    	 	for (var i = 0; i < audios.length; i++) {
    	 		audios[i].pause();
    	 	}	
    */


    //$('audio').each(function(){this.player.pause()}) // Safe.

    var mediaElementPlayers = [];
    $('audio').not('.independent').each(function() {
        mediaElementPlayers.push(new MediaElementPlayer(this));
    });

    for (var i = 0; i < mediaElementPlayers.length; i++) {
        mediaElementPlayers[i].pause(); // pause
        if (mediaElementPlayers[i].getCurrentTime()) {
            mediaElementPlayers[i].setCurrentTime(0); // rewind
            mediaElementPlayers[i].pause();
        }
    }

}

/////////////////////////////////////////////////////////


function createSimpleAudioButton(url, alwaysPlayFromStart) {
    alwaysPlayFromStart = alwaysPlayFromStart || false;

    var str = '';

    if (!url || url == "") {
        if (use_dummy_media) {
            url = "audio/empty.mp3";
        }
    }

    if (url) {
        str = '<a href="javascript:;" class="btn-sm btn-primary mini-audio" data-href="' + url + '" data-play-from-start="' + alwaysPlayFromStart + '"><span class="glyphicon glyphicon-play"></span><span class="sr-only">Toggle Audio</span></a>';
        //str = '<a class="btn-sm btn-primary mini-audio" data-href="' + url + '"><span class="glyphicon glyphicon-play"></span><label class="sr-only">Play Audio</label></a>';
    }

    return str;
}

function processVideoPlayer() {
    //
    mejs.MediaElementDefaults.enablePluginSmoothing = true;

    var _features = ['playpause', 'loop', 'current', 'progress', 'duration', 'tracks', 'volume', 'fullscreen']; //'sourcechooser'

    var options = {
        poster: 'images/video_poster.jpg',
        iPadUseNativeControls: false,
        iPhoneUseNativeControls: false,
		AndroidUseNativeControls: false,
        features: _features,
        pauseOtherPlayers: true,
        //videoWidth: '100%',
        //videoHeight: '100%',
        videoWidth: '100%',
        videoHeight: '100%',
        videoVolume: 'horizontal',
        enableAutosize: true,
        alwaysShowControls: true,
        enableKeyboard: true,
		startLanguage: 'en'
    };
    if (isMSIE()) {
        options.mode = 'auto_plugin'; //'shim';
    }
    $('video').mediaelementplayer(options);

    // fix for video
/*    setInterval(function() {
        $('.mejs-video').css({
            width: '100%',
            height: '100%'
        });
    }, 2000);*/
}

function processPlayer(player, isMini) {
    if (!isMini) {
        isMini = 'false';
    }

    var _features = [];

    if (isMini == 'false') {
        _features = ['playpause', 'current', 'progress', 'duration'];
    } else {
        _features = ['playpause'];
    }

    var successFunction = null;

    if (getMode() == "placement_test") {
        _features = ['playpause', 'current'];

        successFunction = function(mediaElement, domObject) {
            // add event listener
            mediaElement.addEventListener('ended', function(e) {
                //ended
                $('.global-audio .audio').addClass('disable hidden');
                $('.mini-audio').addClass('disable hidden'); // placement test requirements, mini audio also play once ONLY. Note this only allows for 1 audio button on page
            }, false);
        };
    }

    // auto: attempts to detect what the browser can do
    // auto_plugin: prefer plugins and then attempt native HTML5
    // native: forces HTML5 playback
    // shim: disallows HTML5, will attempt either Flash or Silverlight
    // none: forces fallback view

    var options = {
        features: _features,
        pauseOtherPlayers: true,
        audioWidth: '100%',
        enableAutosize: true,
        enableKeyboard: true,
        success: successFunction
    };

    if (isMSIE()) {
        options.mode = 'auto_plugin'; //'shim';
    }
    $('audio').mediaelementplayer(options);

    //$('.mejs-container').removeClass('svg').addClass('no-svg');

}

function onAudioEnded(event) {
    $(event.target).siblings('.play-btn').removeClass('playing');
}

//If the game does not support checking of the answers, the check answers button can be disabled
function disableCheckPageAnswer() {
    /*$('.btn-name-check-ans').addClass('disabled');
    if (gameNoCorrectAnswers == 1) {
        $('#checkAnswerButton').prop("onclick", null);
    }*/
}

function openAlertPopup(text) {
    if (text !== undefined && text !== '') {
        $('#gameAlertText').html(text);
        openPopup('#gameAlertPopup');
    }
}

function addGlobalAudio() {
    $('.global-audio .audio').remove();
    var audio = getGlobalAudio();
    if (audio !== undefined && audio !== '') {
        // $('#ajax-cont').append('<div id="globalAudio"></div>');
        // var audioStr = getAudioCode(audio);
        // $('#globalAudio').append($(audioStr));
        // processPlayer($('#globalAudio'));

        var audioStr = getAudioCode(audio);
        $('.global-audio').prepend($(audioStr));
        processPlayer($('.global-audio .audio'));
        $('.global-audio').removeClass('hidden');
        $('.global-audio .audio').removeClass('hidden'); //@audio 
    } else {
        //$('.global-audio').addClass('hidden');
    }
}

function focusToFirstAnsweredItem()
{
	switch(gametype)
	{
		case "GapFillTyping":
		case "GapFillDropDown":
			$('div.has-success:visible, div.has-error:visible, div.has-error0:visible').first().attr('tabindex', 0).focus();
			break;

		default:
			$('li.btn-success:visible, li.btn-danger:visible, div.btn-success:visible, div.btn-danger:visible').first().attr('tabindex', 0).focus();
			break;
	}
}

function floatButtonRow()
{
	var $upperButtonRow = $('#upperButtonRow');
	var $lowerButtonRow = $('#lowerButtonRow');

	if ($upperButtonRow.length == 1 && $lowerButtonRow.length == 1)
	{
		if ($upperButtonRow.isOnScreenVertical())
		{
			if ($upperButtonRow.children().length == 0)
			{
				$upperButtonRow.append($lowerButtonRow.children());
			}
		}
		else if ($lowerButtonRow.isOnScreenVertical())
		{
			if ($lowerButtonRow.children().length == 0)
			{
				$lowerButtonRow.append($upperButtonRow.children());
			}
		}
	}
}

function getObjectText($obj)//excluding object descendants
{
	var str = "";

	var $tmp = $obj.contents().filter(function()
	{
		return this.nodeType == 3;
	}
	);

	if ($tmp.length > 0)
	{
		str = $tmp[0].nodeValue;
	}

	return str;
}

function toastr_success()
{
	toastr["success"]("Completed");
}

function pad(n, width, z)//from unitplayer.js
{
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function overrideBootstrapModalShow(_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.$body.addClass('modal-open')

    this.setScrollbar()
    this.escape()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      // Commented following to fix unwanted scrolling bug
      // idea comes from:
      // https://github.com/twbs/bootstrap/issues/19850

/*      transition ?
        that.$element.find('.modal-dialog') // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)*/
    })
}

function onKeyDownToClick(e)
{
	if (e.which == 13)
	{
		$(this).click();
	}
}

function showBlankLandingPage()
{
	$('#landing-page').remove();
	$('body').prepend('<div id="landing-page"><div id="landing-page-contents"></div><div>');
}

function hideLandingPage()
{
	$('#landing-page').hide();
}

function hideLandingPageContents()
{
	$('#landing-page-contents').hide();
}

function fadeInLandingPageContents()
{
	$('#landing-page-contents').show();
}

function fadeOutLandingPageContents()
{
	$('#landing-page-contents').fadeOut(1000);
}

function fadeOutLandingPage(callback)
{
	if (callback)
	{
		$('#landing-page').fadeOut(1000, callback);
	}
	else
	{
		$('#landing-page').fadeOut(1000);
	}
}

function fadeOutLandingPageInSequence(callback)
{
	$('#landing-page-contents').fadeOut(1000, function()
	{
		fadeOutLandingPage(callback);
	});
}

function setLandingPageHTML(HTML)
{
	$('#landing-page-contents').html(HTML);
}

function addExtraHeader()
{
	$('#myNavmenuCanvas').prepend('<div id="extra-header" class="col-xs-12 extra-header"></div>');
}

function setExtraHeaderHTML(HTML)
{
	$('#extra-header').html(HTML);
}

function addKidsGameHeader()
{
	addExtraHeader();
	$('#extra-header').addClass('kids-game-header');
	setExtraHeaderHTML(
		'<div class="col-xs-10 col-left">' +
			'<div id="container-score" class="col-xs-12 hidden container-score"><div class="title">Score</div><div id="value-score" class="value">0</div><div class="unit">%</div></div>' +
			'<div id="container-bonus" class="col-xs-12 hidden container-bonus"><div class="title">Bonus</div><div id="value-bonus" class="value">00</div></div>' +
		'</div>' +
		'<div class="col-xs-2 col-right">' +
			'<div id="container-page-number" class="hidden container-page-number"><span class="sr-only">Page Number:</span><div id="value-page-number" class="value"></div></div>' +
			'<div id="container-lives" class="hidden container-lives"><span class="sr-only">lives</span><div id="value-lives" class="value">0</div></div>' +
			'<div id="container-timer" class="container-timer hidden"><span class="sr-only">timer</span><div id="value-timer" class="value">0</div></div>' +
		'</div>'
	);
}

function addKidsGameClassToBody()
{
	$('body').addClass('kids-game');
}

function moveItemRemainingUnderPager()
{
	$('#ajax-pages').parent().after($('#ajax-options'));
}

function removeItemRemaining() {
	$('#ajax-options').remove();
}

function getCurrentPageIndex()
{
	return pageIndex;
}

function setIsKidsGame(bool) {
	isKidsGame = bool;
}

function showKidsGameHeaderComponent(score, bonus, lives, timer, pageNumber) {
	var _$obj = $();

	if (score) {
		_$obj = _$obj.add('#container-score');
	}

	if (bonus) {
		_$obj = _$obj.add('#container-bonus');
	}

	if (lives) {
		_$obj = _$obj.add('#container-lives');
	}

	if (timer) {
		_$obj = _$obj.add('#container-timer');
	}

    if (pageNumber) {
        _$obj = _$obj.add('#container-page-number');
    }

	if (_$obj.length) {
		_$obj.removeClass('hidden');
	}
}

function getKidsGameScoringMsg(scorePercentInt) {
	if (scorePercentInt == 100) {
		return 'Well done!';
	}
	else if (scorePercentInt > 79) {
		return 'Great score!';
	}
	else if (scorePercentInt > 59) {
		return 'Good score!';
	}
	else if (scorePercentInt > 39) {
		return 'OK score!';
	}
	else {
		return 'Try again!';
	}
}

function isTestMode() {
	return (gameMode == "test_mode");
}

function getTotalOfQuestion() {
	return questionsArray.length;
}

function setUseDefaultFeedback(bool) {
	useDefaultFeedback = bool;
}

function closeAllBootstrapDialogs() {
	if (typeof BootstrapDialog != 'undefined') {
        BootstrapDialog.closeAll();
	}
}

function refreshMuteButton() {
	var _$muteButton = $('#muteButton');
	var _$span = _$muteButton.find('span.glyphicon');

	_$muteButton.empty().append(_$span).append(gameManager.gameSoundOn? ' Mute': ' Unmute');
	_$span.attr({
		class: "glyphicon " + (gameManager.gameSoundOn? "glyphicon-volume-off": "glyphicon-volume-up")
	});
}

function focusStartButton() {
    $('#button-start').focus();
}

function hidePager() {
    $('ul.pager').addClass('hidden');
}

function showPager() {
    $('ul.pager').removeClass('hidden');
}

function hidePagerPrevious() {
    $('ul.pager').find('li.previous').addClass('hidden');
}

function showPagerPrevious() {
    $('ul.pager').find('li.previous').removeClass('hidden');
}

function focusPagerNext() {
    $('#btn-next').focus();
}

//////////////////////////////////////

toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-top-center",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "1000",
  "timeOut": "2000",
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
