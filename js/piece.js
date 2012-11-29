/*global Base:true, window:true, Vector:true, _:true */

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
        paper: null
      }, config);
      this._offset = 0;//this.config.noseSize;
      this._eventHandlers = {};
      this.mergedPieces = [this];

      // this._createCanvas();
      // this._cutPiece();
      this._createSVG();
      this.setPosition(new Vector());
      this._makeDraggable();
    },

    _createSVG: function() {
      var svg = this.config.svg,
          width = this.config.width,
          height = this.config.height,
          offset = this._offset,
          config = this.config,
          path = ['M ' + offset + ',' + offset],
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

      path.push('L ' + (offset + width) + ', ' + offset);
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

      path.push('L ' + (offset + width) + ', ' + (offset + height));
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

      path.push('L ' + offset + ', ' + (offset + height));
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
        width: width + 2 * offset,
        height: height + 2 * offset,
        d: path.join(' '),
        fill: 'url(#puzzleimage' + this.pieceNumber + ')',
        strokeWidth: 1,
        stroke: 'rgba(0,0,0,0.4)',
        x: config.positionInImage.x,
        y: config.positionInImage.y
      });
      this.element = piece;
      this._$element = $(piece);
    },

    _createCanvas: function() {
      this.element = document.createElement('canvas');
      this.element.width = this.config.width + 2 * this._offset;
      this.element.height = this.config.height + 2 * this._offset;
      this._ctx = this.element.getContext('2d');
      this._$element = $(this.element).addClass('puzzle-piece');
    },

    _cutPiece: function() {
      var config = this.config,
          p = config.positionInImage,
          w = config.width,
          h = config.height,

          self = this;
      this._ctx.drawImage(this.config.image, p.x, p.y, w, h, this._offset, this._offset, w, h);
      _.each(['top', 'left', 'right', 'bottom'], function(dir) {
        self._createNose(dir);
      });
      //TEST:
      // this._ctx.fillStyle = 'rgba(0,0,0,0.3)';
      // //this._ctx.moveTo(40, 40);
      // this._ctx.rect(40, 40, 100 ,100);
      // this._ctx.fill();
    },

    // For now it makes strange boxes as noses :)
    _createNose: function(dir) {
      var config = this.config,
          p = config.positionInImage,
          w = config.width,
          h = config.height,
          o = this._offset,
          isOutside = config[dir] === OUTSIDE,
          isInside  = config[dir] === INSIDE;

      if (dir === 'right') {
        if (isOutside) {
          this._ctx.drawImage(this.config.image,
            p.x + w, p.y + h/2 - o/2, o, o,
            o + w, o + h/2 - o/2, o, o);
        } else if (isInside) {
          this._ctx.clearRect(w, o + h/2 - o/2, o, o);
        }
      } else if (dir === 'left') {
        if (isOutside) {
          this._ctx.drawImage(this.config.image,
            p.x - o, p.y + h/2 - o/2, o, o,
            0, o + h/2 - o/2, o, o);
        } else if (isInside) {
          //this._ctx.clearRect(o, o + h/2 - o/2, o, o);
          console.log(this._ctx);
          //var imageData = this._ctx.getImageData(o, o + h/2 - o/2, o, o);
          var imageData = this._ctx.createImageData(o, o);
          for (var y = 0; y < o + h/2 - o/2; ++y) {
            for (var x = 0; x < o; ++x) {
              var index = (y * o + x) * 4;
              // alpha channel
              imageData[index] = 200;
              imageData[index+1] = 100;
              imageData[index+2] = 0;
              imageData[index+3] = 220;
            }
          }
          console.log(imageData);
          this._ctx.putImageData(imageData, 0, 0 + h/2 - o/2, o, o)
        }
      } else if (dir === 'top') {
        if (isOutside) {
          this._ctx.drawImage(this.config.image,
            p.x + w/2 - o/2, p.y, o, o,
            o + w/2 - o/2, 0, o, o);
        } else if (isInside) {
          this._ctx.clearRect(o + w/2 - o/2, o, o, o);
        }
      } else if (dir === 'bottom') {
        if (isOutside) {
          this._ctx.drawImage(this.config.image,
            p.x + w/2 - o/2, p.y + h, o, o,
            o + w/2 - o/2, o+h, o, o);
        } else if (isInside) {
          this._ctx.clearRect(o + w/2 - o/2, h, o, o);
        }
      }
    },

    _makeDraggable: function() {
      var self = this;
      // $(this.element).draggable({
      //   start: function() { self._onDragStart(); },
      //   drag: function() { self._onDragMove(); },
      //   stop: function() { self._onDragStop(); }
      // });
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
          _.each(self.mergedPieces, function(p) {
            p.calcPositionFromTranslation();
          });
          $(document).off('.JigsawPiece');
          self.fire('dragStop');
        });
      self.fire('dragStart');
    },

    // TODO: Webkit could help here with translations
    _move: function(offset) {
      _.each(this.mergedPieces, function(p) {
        p.element.setAttribute('transform', 'translate('+(offset.x + p.position.x)+', '+(offset.y + p.position.y)+')');
      });
    },

    calcPositionFromTranslation: function() {
      var position = this.position,
          element  = this._$element,
          transform = this.element.getAttribute('transform'),
          translateX = parseInt(transform.split('(')[1], 10),
          translateY = parseInt(transform.split(',')[1], 10);
      position.x = translateX;
      position.y = translateY;
      return;
      position.x += parseInt(element.css('margin-left'), 10);
      position.y += parseInt(element.css('margin-top'), 10);
      element.css({
        left: position.x - this._offset,
        top: position.y - this._offset,
        marginLeft: 0,
        marginTop: 0
      });
    },

    _onDragStart: function() {
      this.fire('dragStart');
    },

    _onDragMove: function() {
      var p         = this._$element.position(),
          thisPiece = this;
      this.position.x = p.left + this._offset;
      this.position.y = p.top + this._offset;
    },

    _onDragStop: function() {
      var p = this._$element.position();
      this.position.x = p.left + this._offset;
      this.position.y = p.top + this._offset;
      this.fire('dragStop');
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
        _.each(this._eventHandlers[type], function(callback) {
          callback.call(self, data);
        });
      }
    },

    mergeWith: function(otherPiece) {
      otherPiece.alignWith(this);
// TODO: include other merged pieces as well
      this.addMergedPiece(otherPiece);
    },

    addMergedPiece: function(otherPiece) {
      var self = this;
      if (_.indexOf(this.mergedPieces, otherPiece) === -1) {
        this.mergedPieces = _.uniq($.merge(this.mergedPieces, otherPiece.mergedPieces));
        _.each(this.mergedPieces, function(p) {
          p.addMergedPiece(self);
        });
      }
    },

    alignWith: function(otherPiece) {
      var p1     = this.position,
          width  = this.config.width,
          height = this.config.height,
          x = p1.x,
          y = p1.y;

      switch(otherPiece) {
        case this._neighbors.top:
          y -= height;
          break;
        case this._neighbors.right:
          x += width;
          break;
        case this._neighbors.bottom:
          y += height;
          break;
        case this._neighbors.left:
          x -= width;
          break;
      }
      otherPiece.setPosition(new Vector(Math.round(x), Math.round(y)));
    },

    // THIS ONLY WORKS WITH PIECES OF SAME SIZE (and WITHOUT ROTATED OBJECTS)
    isMatchingWith: function(otherPiece, mergeTolerance) {
      var p1     = this.position,
          p2     = otherPiece.position,
          width  = this.config.width,
          height = this.config.height,

          result = false;

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
    },

    setZIndex: function(zIndex) {
      this._$element.css('z-index', zIndex);
    }
  });
  Piece.INSIDE  = INSIDE;
  Piece.OUTSIDE = OUTSIDE;
  Piece.PLAIN   = PLAIN;
  window.JigsawPiece = Piece;
}(jQuery));
