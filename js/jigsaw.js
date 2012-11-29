/*global Base:true, window:true, JigsawPiece:true, Vector:true, JazSvg:true */

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
        mergeTolerance: 20
      }, config);
      this._pieces = [];

      this._loadImage(imageUrl);
    },

    _loadImage: function(url) {
      var self = this,
          image = document.createElement('img');
      image.src = url;
      image.onload = function() {
        self._onImageLoaded();
      };
      this._image = image;
    },

    _createSVG: function() {
      var config      = this.config,
          svg = new JazSvg({
            height: window.innerHeight,
            width: window.innerWidth
          }),
          defs = svg.defs();
      $(svg.element)
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

            right: x===lx-1 ? JigsawPiece.PLAIN : JigsawPiece.OUTSIDE,
            left: x===0 ? JigsawPiece.PLAIN : JigsawPiece.INSIDE,
            bottom: y===ly-1 ? JigsawPiece.PLAIN : JigsawPiece.OUTSIDE,
            top: y===0 ? JigsawPiece.PLAIN : JigsawPiece.INSIDE
          }));
        }
      }

      this._setNeighbors();
    },

    _setNeighbors: function() {
      var self    = this,
          piecesX = this.config.piecesX,
          piecesY = this.config.piecesY;
      $.each(this._pieces, function(i, piece) {
        piece.setNeighbors({
          top: self._pieces[i - piecesY],
          right: i%piecesX === 0 ? self._pieces[i + 1] : null,
          bottom: self._pieces[i + piecesY],
          left: i%piecesX-1 === 0 ? self._pieces[i - 1] : null
        });
      });
    },

    _observePieces: function() {
      var self = this;
      $.each(this._pieces, function(i, piece) {
        piece.on('dragStop', function() {
          var draggedPiece = this;
          $.each(self._checkCollision(this), function(i, fittingPiece) {
            draggedPiece.mergeWith(fittingPiece);
          });
        });
      });
    },

    _checkCollision: function(piece) {
      var self        = this;
      return $.grep(this._pieces, function(otherPiece) {
        return piece.isMatchingWith(otherPiece, self.config.mergeTolerance);
      });
    },

    _shufflePieces: function() {
      var config      = this.config,
          pieceWidth  = config.puzzleWidth  / config.piecesX,
          pieceHeight = config.puzzleHeight / config.piecesY;

      $.each(this._pieces, function(i, piece) {
        piece.setPosition(new Vector(Math.random() * (window.innerWidth - pieceWidth), Math.random() * (window.innerHeight - pieceHeight)));
      });
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
      this._createSVG();
      this._createPieces();
      this._shufflePieces();
      this._observePieces();
    }
  });
  window.Jigsaw = Jigsaw;
}(jQuery));
