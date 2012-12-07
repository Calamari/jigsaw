/*global Base, window, Vector, _ */

;(function($) {
  "use strict";
  var INSIDE  = -1,
      OUTSIDE = 1,
      PLAIN   = 0;

  var Piece = Base.extend({
    constructor: function(pieceNr, config) {
      this.pieceNumber = pieceNr;
      this.config = $.extend({
        // [mandatory] width of puzzle piece
        width: null,
        // [mandatory] height of puzzle piece
        height: null,
        // top, left, right, bottom are PLAIN by default
        top: PLAIN,
        left: PLAIN,
        right: PLAIN,
        bottom: PLAIN,
        // [mandatory] position of puzzle piece
        //position: null,
        // [mandatory] image element to cut
        image: null,
        // [mandatory] position of piece within image
        positionInImage: null,
        // how big can the noses be? (in px)
        noseSize: 20,
        paper: null,
        scale: 1
      }, config);
      this._eventHandlers = {};
      this.mergedPieces = [this];

      this._scaleImage();
      this._createPattern();
      this._createSVGPiece();
      this.setPosition(new Vector());
      this._makeDraggable();
    },

    _scaleImage: function() {
      if (this.config.scale) {
        this.config.width *= this.config.scale;
        this.config.height *= this.config.scale;
      }
    },

    _createPattern: function() {
      var svg = this.config.svg,
          defs = document.getElementsByTagName('defs')[0];
      svg.pattern(defs, {
        id: "puzzleimage" + this.pieceNumber,
        href: '#puzzleimage',
        x: -this.config.positionInImage.x,
        y: -this.config.positionInImage.y,
        patternTransform: "scale(" + this.config.scale + ")"
      });
    },

    _createSVGPiece: function() {
      var svg = this.config.svg,
          width = this.config.width,
          height = this.config.height,
          config = this.config,
          path = ['M 0,0'],
          piece;

      // TOP NOSE
      path.push('l ' + (width*6/15) + ', 0');
      if (config['top'] === OUTSIDE) {
        path.push('c ' + (width*0/15) + ',' + (-height*1/15) + ' ' + (-width*1/15) + ',' + (-height*1/15) + ' ' + (-width*1/15) + ',' + (-height*2/15));
        path.push('c 0,' + (-height*2/15) + ' ' + (width*5/15) + ',' + (-height*2/15) + ' ' + (width*5/15) + ',0');
        path.push('c ' + (width*0/15) + ',' + (height*1/15) + ' ' + (-width*1/15) + ',' + (height*1/15) + ' ' + (-width*1/15) + ',' + (height*2/15));
      } else if (config['top'] === INSIDE) {
        path.push('c ' + (width*0/15) + ',' + (height*1/15) + ' ' + (-width*1/15) + ',' + (height*1/15) + ' ' + (-width*1/15) + ',' + (height*2/15));
        path.push('c 0,' + (height*2/15) + ' ' + (width*5/15) + ',' + (height*2/15) + ' ' + (width*5/15) + ',0');
        path.push('c ' + (width*0/15) + ',' + (-height*1/15) + ' ' + (-width*1/15) + ',' + (-height*1/15) + ' ' + (-width*1/15) + ',' + (-height*2/15));
      }

      path.push('L ' + width + ', 0');
      // RIGHT NOSE
      path.push('l ' + (0) + ', ' + (height*6/15));
      if (config['right'] === OUTSIDE) {
        path.push('c ' + (width*1/15) + ',' + (height*0/15) + ' ' + (width*1/15) + ',' + (-height*1/15) + ' ' + (width*2/15) + ',' + (-height*1/15));
        path.push('c ' + (width*2/15) + ',0 ' + (width*2/15) + ',' + (height/3) + ' 0,' + (height/3));
        path.push('c ' + (-width*1/15) + ',' + (height*0/15) + ' ' + (-width*1/15) + ',' + (-height*1/15) + ' ' + (-width*2/15) + ',' + (-height*1/15));
      } else if (config['right'] === INSIDE) {
        path.push('c ' + (-width*1/15) + ',' + (height*0/15) + ' ' + (-width*1/15) + ',' + (-height*1/15) + ' ' + (-width*2/15) + ',' + (-height*1/15));
        path.push('c ' + (-width*2/15) + ',0 ' + (-width*2/15) + ',' + (height/3) + ' 0,' + (height/3));
        path.push('c ' + (width*1/15) + ',' + (height*0/15) + ' ' + (width*1/15) + ',' + (-height*1/15) + ' ' + (width*2/15) + ',' + (-height*1/15));
      }

      path.push('L ' + width + ', ' + height);
      // BOTTOM NOSE
      path.push('l ' + (-width*6/15) + ', 0');
      if (config['bottom'] === OUTSIDE) {
        path.push('c ' + (-width*0/15) + ',' + (height*1/15) + ' ' + (width*1/15) + ',' + (height*1/15) + ' ' + (width*1/15) + ',' + (height*2/15));
        path.push('c 0,' + (height*2/15) + ' ' + (-width*5/15) + ',' + (height*2/15) + ' ' + (-width*5/15) + ',0');
        path.push('c ' + (-width*0/15) + ',' + (-height*1/15) + ' ' + (width*1/15) + ',' + (-height*1/15) + ' ' + (width*1/15) + ',' + (-height*2/15));
      } else if (config['bottom'] === INSIDE) {
        path.push('c ' + (-width*0/15) + ',' + (-height*1/15) + ' ' + (width*1/15) + ',' + (-height*1/15) + ' ' + (width*1/15) + ',' + (-height*2/15));
        path.push('c 0,' + (-height*2/15) + ' ' + (-width*5/15) + ',' + (-height*2/15) + ' ' + (-width*5/15) + ',0');
        path.push('c ' + (-width*0/15) + ',' + (height*1/15) + ' ' + (width*1/15) + ',' + (height*1/15) + ' ' + (width*1/15) + ',' + (height*2/15));
      }

      path.push('L 0, ' + height);
      // LEFT NOSE
      path.push('l ' + (0) + ', ' + (-height*6/15));
      if (config['left'] === OUTSIDE) {
        path.push('c ' + (-width*1/15) + ',' + (-height*0/15) + ' ' + (-width*1/15) + ',' + (height*1/15) + ' ' + (-width*2/15) + ',' + (height*1/15));
        path.push('c ' + (-width*2/15) + ',0 ' + (-width*2/15) + ',' + (-height/3) + ' 0,' + (-height/3));
        path.push('c ' + (width*1/15) + ',' + (-height*0/15) + ' ' + (width*1/15) + ',' + (height*1/15) + ' ' + (width*2/15) + ',' + (height*1/15));
      } else if (config['left'] === INSIDE) {
        path.push('c ' + (width*1/15) + ',' + (-height*0/15) + ' ' + (width*1/15) + ',' + (height*1/15) + ' ' + (width*2/15) + ',' + (height*1/15));
        path.push('c ' + (width*2/15) + ',0 ' + (width*2/15) + ',' + (-height/3) + ' 0,' + (-height/3));
        path.push('c ' + (-width*1/15) + ',' + (-height*0/15) + ' ' + (-width*1/15) + ',' + (height*1/15) + ' ' + (-width*2/15) + ',' + (height*1/15));
      }

      path.push('z'); // close path
      piece = svg.path({
        width: width,
        height: height,
        d: path.join(' '),
        fill: 'url(#puzzleimage' + this.pieceNumber + ')',
        strokeWidth: 1,
        stroke: config.pieceBorderColor || 'rgba(0,0,0,0.4)',
        x: config.positionInImage.x,
        y: config.positionInImage.y
      });
      this.element = piece;
      this._$element = $(piece);
    },

    _makeDraggable: function() {
      var self = this;
      this._$element.on('mousedown', function(event) {
        if (event.which === 1) {
          self._startMoving(event);
        }
      });
    },

    _startMoving: function(event) {
      var self = this;
      var startPosition = new Vector(event.pageX, event.pageY);
      $(document)
        .on('mousemove.JigsawPiece', function(event) {
          self._move(new Vector(event.pageX, event.pageY).sub(startPosition));
        })
        .on('mouseup.JigsawPiece', function(event) {
          self._move(new Vector(event.pageX, event.pageY).sub(startPosition));
          self.mergedPieces.forEach(function(p) {
            p.calcPositionFromTranslation();
          });
          $(document).off('.JigsawPiece');
          self._dropShadow(false);
          self.fire('dragStop');
        });
      self._putToFront();
      this._dropShadow(true);
      self.fire('dragStart');
    },

    _dropShadow: function(val) {
      if (val && this.config.dropShadow) {
        this.mergedPieces.forEach(function(p) {
          p.element.setAttribute('filter', 'url(#' + this.config.dropShadow + ')');
        });
      } else {
        this.mergedPieces.forEach(function(p) {
          p.element.removeAttribute('filter');
        });
      }
    },

    _putToFront: function() {
      var svgElement = this.config.svg.element;
      this.mergedPieces.forEach(function(p) {
        svgElement.appendChild(p.element);
      });
    },

    _move: function(offset) {
      this.mergedPieces.forEach(function(p) {
        p.element.setAttribute('transform', 'translate('+(offset.x + p.position.x)+', '+(offset.y + p.position.y)+')');
      });
    },

    calcPositionFromTranslation: function() {
      var position = this.position,
          element  = this._$element,
          transform = this.element.getAttribute('transform');

      position.x = parseInt(transform.split('(')[1], 10);
      position.y = parseInt(transform.split(',')[1], 10);
    },

    otherPieces: function(pieces) {
      this._pieces = pieces;
    },

    setPosition: function(position) {
      this.position = position;
      this.element.setAttribute('transform', 'translate(' + position.x + ', ' + position.y + ')');
    },

    on: function(type, callback) {
      if (!this._eventHandlers[type]) {
        this._eventHandlers[type] = [];
      }
      this._eventHandlers[type].push(callback);
    },

    fire: function(type, data) {
      var self = this;
      if (this._eventHandlers[type]) {
        this._eventHandlers[type].forEach(function(callback) {
          callback.call(self, data);
        });
      }
    },

    mergeWith: function(otherPiece) {
      this.addMergedPiece(otherPiece);
      otherPiece._alignPiecesWithThis(this.mergedPieces, otherPiece.mergedPieces);
    },

    addMergedPiece: function(otherPiece) {
      var self = this;
      if (_.indexOf(this.mergedPieces, otherPiece) === -1) {
        this.mergedPieces = _.uniq($.merge(this.mergedPieces, otherPiece.mergedPieces));
        this.mergedPieces.forEach(function(p) {
          p.addMergedPiece(self);
        });
      }
    },

    /**
      For every piece pf piecesToAlign do
        if there is a matching partner in our merged Pieces
          align this to his matching piece
          add it to merged pieces
        else remember for next duration
      if there are pieces that didn't fit this round, recursion happens
     */
    _alignPiecesWithThis: function(piecesToAlign, mergedPieces) {
      var piecesLeft = [];
      piecesToAlign.forEach(function(piece) {
        var wasAligned = _.find(mergedPieces, function(alignedPiece) {
            return piece.alignWith(alignedPiece);
          });
        if (wasAligned) {
          mergedPieces.push(piece);
        } else {
          piecesLeft.push(piece);
        }
      });
      if (piecesLeft.length) {
        this._alignPiecesWithThis(piecesLeft);
      }
    },

    alignWith: function(otherPiece) {
      var p1     = otherPiece.position,
          width  = this.config.width,
          height = this.config.height,
          x = p1.x,
          y = p1.y;

      switch(otherPiece) {
        case this._neighbors.top:
          y += height;
          break;
        case this._neighbors.right:
          x -= width;
          break;
        case this._neighbors.bottom:
          y -= height;
          break;
        case this._neighbors.left:
          x += width;
          break;
        default:
          return false;
      }
      this.setPosition(new Vector(Math.round(x), Math.round(y)));
      return true;
    },

    // THIS ONLY WORKS WITH PIECES OF SAME SIZE (and WITHOUT ROTATED OBJECTS)
    isMatchingWith: function(otherPiece, mergeTolerance) {
      var p1     = this.position,
          p2     = otherPiece.position,
          width  = this.config.width,
          height = this.config.height,

          result = false;

      // if we are already connected, do not say it's new match
      if (_.find(this.mergedPieces, function(p) { return p == otherPiece; })) {
        return false;
      }

      switch(otherPiece) {
        case this._neighbors.top:
          result = Math.abs(p1.y - height - p2.y) < mergeTolerance &&
                   Math.abs(p1.x - p2.x) < mergeTolerance;
          break;
        case this._neighbors.right:
          result = Math.abs(p1.x + width - p2.x) < mergeTolerance &&
                   Math.abs(p1.y - p2.y) < mergeTolerance;
          break;
        case this._neighbors.bottom:
          result = Math.abs(p1.y + height - p2.y) < mergeTolerance &&
                   Math.abs(p1.x - p2.x) < mergeTolerance;
          break;
        case this._neighbors.left:
          result = Math.abs(p1.x - width - p2.x) < mergeTolerance &&
                   Math.abs(p1.y - p2.y) < mergeTolerance;
          break;
      }
      return result;
    },

    setNeighbors: function(pieces) {
      this._neighbors = pieces;
    }
  });
  Piece.INSIDE  = INSIDE;
  Piece.OUTSIDE = OUTSIDE;
  Piece.PLAIN   = PLAIN;
  window.JigsawPiece = Piece;
}(jQuery));
