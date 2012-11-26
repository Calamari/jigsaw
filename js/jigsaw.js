/*global Base:true, window:true, JigsawPiece:true, Vector:true */

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
        // canvas: null,
        // canvasId: "jigsaw-canvas",
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
          piecesY = this.config.piecesY;
      $.each(this._pieces, function(i, piece) {
        piece.setNeighbors({
          top: self._pieces[i - piecesY],
          right: self._pieces[i + 1],
          bottom: self._pieces[i + piecesY],
          left: self._pieces[i - 1]
        });
      });
    },

    _observePieces: function() {
      var self = this;
      $.each(this._pieces, function(i, piece) {
        piece.on('dragStart', function() {
          this.setZIndex(++actualZIndex);
        });
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

    _addPiecesToDom: function() {
      var body = $('body');
      $.each(this._pieces, function(i, piece) {
        body.append(piece.element);
        piece.setPosition(new Vector(200 - 50*i, 50*i));
        // add info about all other pieces
        piece.otherPieces(this._pieces);
      });
      // TEST:

//      console.log(this._pieces);

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
      this._createPieces();
      this._addPiecesToDom();
      this._observePieces();
    }
  });
  window.Jigsaw = Jigsaw;
}(jQuery));
