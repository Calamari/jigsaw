/*global Base, window, JigsawPiece, Vector, JazSvg */

;(function($) {
  "use strict";
  var AUTOMATIC  = 'auto',
      LIKE_IMAGE = 'as image',

      actualZIndex = 1;

  var Jigsaw = Base.extend({
    constructor: function(imageUrl, config) {
      this.config = $.extend({
        width: AUTOMATIC,
        height: AUTOMATIC,
        puzzleWidth: LIKE_IMAGE,
        puzzleHeight: LIKE_IMAGE,
        piecesX: 10,
        piecesY: 10,
        mergeTolerance: 20,
        pieceBorderColor: 'rgba(0,0,0,0.4)',
        dropShadow: false,
        fitImageTo: window,
        onImageLoaded: function() {},
        onComplete: function() {}
      }, config);
      this._pieces = [];

      this._loadImage(imageUrl);
    },

    remove: function() {
      if (this.svg) {
        $(this.svg.element).remove();
      }
    },

    _loadImage: function(url) {
      var self = this,
          image = document.createElement('img');
      image.src = url;
      image.onload = function() {
        self._onImageLoaded();
      };
      image.onerror = function() {
        self._onImageError();
      };
      this._image = image;
    },

    _createSVG: function() {
      var config      = this.config,
          svg = new JazSvg({
            height: window.innerHeight,
            width: window.innerWidth
          }),
          defs = svg.defs(),
          element = svg.element;
      $(element)
        .css({
          position: 'absolute',
          left: 0,
          top: 0
        })
        .appendTo('body');
      svg.pattern(defs, {
        id: "puzzleimage",
        patternUnits: "userSpaceOnUse", //objectBoundingBox
        width: config.puzzleWidth,
        height: config.puzzleHeight,
        x: 0,
        y: 0
      }, svg.image({
        x: 0,
        y: 0,
        width: config.puzzleWidth,
        height: config.puzzleHeight,
        'href': this._image.src
      }));
      this.svg = svg;
      this.defs = defs;
      if (config.dropShadow) {
        this._createShadow();
      }
      $(window).on('resize', function() {
        $(element).css({
          width: window.innerWidth,
          height: window.innerHeight
        });
      });
    },

    _createPieces: function() {
      var pieceNumber = 0,
          config      = this.config,
          pieceWidth  = config.puzzleWidth  / config.piecesX,
          pieceHeight = config.puzzleHeight / config.piecesY;

      for (var y=0,ly=this.config.piecesY; y<ly; ++y) {
        for (var x=0,lx=this.config.piecesX; x<lx; ++x) {
          this._pieces.push(new JigsawPiece(pieceNumber++, {
            image: this._image,
            width: pieceWidth,
            height: pieceHeight,
            svg: this.svg,
            positionInImage: new Vector(pieceWidth * x, pieceHeight * y),
            pieceBorderColor: config.pieceBorderColor,
            scale: this.scale || 1,
            dropShadow: config.dropShadow ? 'dropShadow' : false,

            right: x===lx-1 ? JigsawPiece.PLAIN : (Math.random() < 0.5 ? JigsawPiece.INSIDE : JigsawPiece.OUTSIDE),
            left: x===0 ? JigsawPiece.PLAIN : (this._pieces[pieceNumber-1-1].config.right === JigsawPiece.OUTSIDE ? JigsawPiece.INSIDE : JigsawPiece.OUTSIDE),
            bottom: y===ly-1 ? JigsawPiece.PLAIN : (Math.random() < 0.5 ? JigsawPiece.INSIDE : JigsawPiece.OUTSIDE),
            top: y===0 ? JigsawPiece.PLAIN : (this._pieces[pieceNumber-lx-1].config.bottom === JigsawPiece.OUTSIDE ? JigsawPiece.INSIDE : JigsawPiece.OUTSIDE)
          }));
        }
      }

      this._setNeighbors();
    },

    _setNeighbors: function() {
      var self    = this,
          piecesX = ~~this.config.piecesX,
          piecesY = ~~this.config.piecesY,
          x       = 0;

      this._pieces.forEach(function(piece, i) {
        piece.setNeighbors({
          top: self._pieces[i - piecesX] || null,
          right: x < piecesX-1 ? self._pieces[i + 1] : null,
          bottom: self._pieces[i + piecesX] || null,
          left: x > 0 ? self._pieces[i - 1] : null
        });
        x = ++x % piecesX;
      });
    },

    _observePieces: function() {
      var self = this;
      this._pieces.forEach(function(piece, i) {
        piece.on('dragStop', function() {
          var draggedPiece = this;
          draggedPiece.mergedPieces.forEach(function(piece) {
            self._checkCollision(piece).forEach(function(fittingPiece, i) {
              piece.mergeWith(fittingPiece);
            });
          });
          self._checkCompleteness(draggedPiece);
        });
      });
    },

    _checkCompleteness: function(piece) {
      if (!this._alreadyCompleted && this._pieces.length === piece.mergedPieces.length && this.config.onComplete) {
        this.config.onComplete.call(this);
        this._alreadyCompleted = true;
      }
    },

    _checkCollision: function(piece) {
      var self        = this;
      return $.grep(self._pieces, function(otherPiece) {
        return piece.isMatchingWith(otherPiece, self.config.mergeTolerance);
      });
    },

    _shufflePieces: function() {
      var config      = this.config,
          pieceWidth  = config.puzzleWidth  / config.piecesX,
          pieceHeight = config.puzzleHeight / config.piecesY,
          fitTo       = config.fitImageTo;

      this._pieces.forEach(function(piece, i) {
        piece.setPosition(new Vector(Math.random() * ($(fitTo).width() - pieceWidth), Math.random() * ($(fitTo).height() - pieceHeight)));
      });
    },

    _onImageError: function() {
      if (this.config.onImageError) {
        this.config.onImageError.call(this, "Image could not be loaded");
      }
    },

    // do everything that has to be done after image was loaded
    _onImageLoaded: function() {
      this._imageLoaded = true;
      if (this.config.puzzleWidth === LIKE_IMAGE) {
        this.config.puzzleWidth = this._image.width;
      }
      if (this.config.puzzleHeight === LIKE_IMAGE) {
        this.config.puzzleHeight = this._image.height;
      }
      // trigger onImageLoaded callback
      if (this.config.onImageLoaded) {
        this.config.onImageLoaded.call(this, this._image);
      }
      this._calculateScaling();
      this._createSVG();
      this._createPieces();
      this._shufflePieces();
      this._observePieces();
    },

    _calculateScaling: function() {
      var fitTo = this.config.fitImageTo;
      if (fitTo) {
        this.scale = Math.min($(fitTo).width() / this.config.puzzleWidth, 1);
        this.scale = Math.min($(fitTo).height() / this.config.puzzleHeight, this.scale);
      }
    },

    _createShadow: function() {
      var svg = this.svg,
          filter = svg.createElement('filter', {
            id: 'dropShadow',
            x: 0, y: 0,
            width: '200%',
            height: '200%'
          });
      filter.appendChild(svg.createElement('feOffset', {
        'result': 'offOut',
        'in': 'SourceAlpha',
        'dx': 10,
        'dy': 10
      }));
      filter.appendChild(svg.createElement('feGaussianBlur', {
        'result': 'blurOut',
        'in': 'offOut',
        'stdDeviation': 10
      }));
      filter.appendChild(svg.createElement('feBlend', {
        'in': 'SourceGraphic',
        'in2': 'blurOut',
        'mode': 'normal'
      }));
      this.defs.appendChild(filter);
    }
  });
  window.Jigsaw = Jigsaw;
}(jQuery));
