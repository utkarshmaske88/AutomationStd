define(['brease/core/Class', 'libs/d3/d3'], function (SuperClass, d3) {

    'use strict';

    var ModuleClass = SuperClass.extend(function EditorHandles(widget) {
            SuperClass.call(this);
            this.widget = widget;
        }, null),

        p = ModuleClass.prototype;

    p.getHandles = function () {

        var self = this;
        self.points = { centerPosition: { x: 0, y: 0 }, pointPosition: { x: 0, y: 0 } };
        self.points.parentWidget = brease.callWidget(self.widget.settings.parentRefId, 'widget');

        var parentRect = self.points.parentWidget.elem.getBoundingClientRect();
        var circleRect = self.points.parentWidget.elem.getElementsByTagName('circle')[0].getBoundingClientRect();
        self.points.centerPosition.x = circleRect.left - parentRect.left + circleRect.width / 2;
        self.points.centerPosition.y = circleRect.top - parentRect.top + circleRect.height / 2;
        self.points.currentPathElement = d3.select('#' + self.widget.elem.id + ' > path')[0][0];
        self.points.currentPathElementSegmentList = self.points.currentPathElement.pathSegList;

        this.newBackColorPoints = $('#' + this.widget.elem.id).find('path').css('fill');

        return {
            pointHandles: [
                {
                    start: function () {

                    },
                    update: function (newPosX, newPosY) { },
                    finish: function () { },
                    handle: function () {
                        if (self.points.currentPathElementSegmentList) {
                            _determinePointPosition(self, 2);
                        }
                        return { x: self.points.pointPosition.x, y: self.points.pointPosition.y };
                    }
                },
                {
                    start: function () { },
                    update: function (newPosX, newPosY) { },
                    finish: function () { },
                    handle: function () {
                        if (self.points.currentPathElementSegmentList) {
                            _determinePointPosition(self, 0);
                        }
                        return { x: self.points.pointPosition.x, y: self.points.pointPosition.y };
                    }
                },
                {
                    start: function () { },
                    update: function (newPosX, newPosY) { },
                    finish: function () { },
                    handle: function () {
                        if (self.points.currentPathElementSegmentList) {
                            _determinePointPosition(self, 1);
                        }
                        return { x: self.points.pointPosition.x, y: self.points.pointPosition.y };

                    }
                }
            ],
            moveHandles: [],
            resizeHandles: []
        };
    };

    function _determinePointPosition(self, segmentNumber) {
        self.points.pointPosition.x = self.points.centerPosition.x;
        self.points.pointPosition.y = self.points.centerPosition.y;
        self.points.pointPosition.x += Math.round(self.points.currentPathElementSegmentList.getItem(segmentNumber).x);
        self.points.pointPosition.y += Math.round(self.points.currentPathElementSegmentList.getItem(segmentNumber).y);
    }

    p.getSelectionDecoratables = function () {
        //return [this.widget.elem];
        var self = this;
        for (var i = 0; i < 3; i += 1) {
            $('#iatd-selection-handle_' + self.widget.elem.id + '_' + i).css('background-color', self.newBackColorPoints);
        }
    };

    return ModuleClass;

});
