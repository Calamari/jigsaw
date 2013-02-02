(function(win) {
  win.startJigsaw = function(url, x, y) {
    if (win.jigsaw) {
      win.jigsaw.remove();
    }
    win.jigsaw = new Jigsaw(url, {
      piecesX: x,
      piecesY: y,
      pieceBorderColor: 'rgba(250,250,250,0.4)',
      mergeTolerance: 7,
      onImageLoaded: function() {
        //console.log("image", arguments);
      },
      onImageError: function() {
        $('.error-layer').addClass('open');
      },
      onComplete: function() {
        $('.solved-layer').addClass('open');
      }
    });
  };
}(window));

$(function() {
  var solvedLayer = $('.solved-layer'),
      errorLayer  = $('.error-layer'),
      hash        = location.hash.replace('#', ''),
      params      = hash.split(';'),
      form        = $('#puzzleform'),
      xField      = form.find('input[name=x]'),
      yField      = form.find('input[name=y]');

  if (params.length === 3) {
    openPuzzle(params[0], params[1], params[2]);
  } else {
    openPuzzle('http://www.get83.de/images/20080625001233_fishernet hdr.jpg', 4, 4);
  }

  function calcNumTiles(x, y) {
    var numTiles = x * y;
    $('#num-tiles').html(numTiles);
  }

  function openPuzzle(url, x, y) {
    calcNumTiles(x, y);

    startJigsaw(url, x, y);
    location.hash = '#' + url + ';' + x + ';' + y;

    solvedLayer.removeClass('open');
    errorLayer.removeClass('open');

    var text = encodeURIComponent('Take time and puzzle with jaz-lounge.com jigsaw. It\'s kind of a Zen thing.'),
        shareUrl = encodeURIComponent(location);
    $('.share-fb').prop('href', 'http://www.facebook.com/sharer.php?u=' + shareUrl + '&p[title]=TITLE&p[url]=URL&p[summary]=' + text);

    $('.share-twitter').prop('href', 'https://twitter.com/share?text=' + text + '&url=' + shareUrl + '&hashtags=' + encodeURIComponent('jigsaw,jazlounge'));

    $('.share-gplus').prop('href', 'https://plus.google.com/share?url=' + shareUrl);

    // bit.ly shortening
    $.getJSON('https://api-ssl.bitly.com/v3/user/link_save', {
      access_token: '113326fee77b51f016bfa70ec78dde7140c03141',
      longUrl: location.href
    }).success(function(data) {
      if (data && data.data && data.data.link_save && data.data.link_save.link) {
        var shortenedUrl = data.data.link_save.link;

        $('.share-twitter').prop('href', 'https://twitter.com/share?text=' + text + '&url=' + shortenedUrl + '&hashtags=' + encodeURIComponent('jigsaw,jazlounge'));

        $('.share-gplus').prop('href', 'https://plus.google.com/share?url=' + shortenedUrl);
      }
    });
  }

  function openShareWindow(url) {
    window.open(url, 'share-jigsaw', 'status=0,location=0,toolbar=0,width=575,height=400');
  }

  $('.layer').on('click', '.closer', function(event) {
    var layer = $(event.target).closest('.layer');
    layer.removeClass('open');
  });


  form.on('submit', function(event) {
    event.preventDefault();
    openPuzzle(form.find('input[name=url]').val(), xField.val(), yField.val());
  });

  $('button.help').on('click', function() {
    $('div.help').toggle();
  });
  $('body').on('click', function(event) {
    if (!$(event.target).closest('.help').length) {
      $('div.help').hide();
    }
  });

  $('#notfunny-button').on('click', function(event) {
    var picUrl = notFunnyUrl + notFunnys[Math.floor(Math.random()*notFunnys.length-1)];
    openPuzzle(picUrl, xField.val(), yField.val());
    event.preventDefault();
  });

  $('.share-fb, .share-gplus').on('click', function(event) {
    openShareWindow(this.href)
    event.preventDefault();
  });

  $('.share-twitter').on('click', function(event) {
    var href = this.href;
    // $.get('https://api-ssl.bitly.com/v3/user/link_save', {
    //   access_token: '113326fee77b51f016bfa70ec78dde7140c03141',
    //   longUrl: href
    // }).success(function(data) {
    //   if (data && data.link_save && data.link_save.link) {
    //     openShareWindow(data.link_save.link)
    //   } else {
    //     openShareWindow(href);
    //   }
    // });
        openShareWindow(href);
    event.preventDefault();
  });
/*
  // Flattr:
  var s = document.createElement('script');
  var t = document.getElementsByTagName('script')[0],
      url   = location.href.split('#')[0],
      title = '';

  s.type = 'text/javascript';
  s.async = true;
  s.src = '//api.flattr.com/js/0.6/load.js?mode=auto&uid=Georg_Tavonius&button=compact&category=rest';
  t.parentNode.insertBefore(s, t);
*/
});
