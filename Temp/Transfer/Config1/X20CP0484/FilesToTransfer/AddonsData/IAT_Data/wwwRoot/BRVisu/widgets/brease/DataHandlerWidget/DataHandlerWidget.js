define([
    'brease/core/BaseWidget', 
    'brease/events/BreaseEvent', 
    'brease/enum/Enum', 
    'brease/core/Utils'
], function (SuperClass, BreaseEvent, Enum, Utils) {

    'use strict';

    /**
     * @class widgets.brease.DataHandlerWidget
     * @abstract
     * #Description
     * Base class for all dataContainer Widgets --> e.g. BarChart, PieChart,...
     * @extends brease.core.BaseWidget
     * @iatMeta studio:visible
     * false
     *
     */

    var defaultSettings = {
            childrenInitialized: false,
            childrenList: [],
            childrenIdList: [],
            totalNbrofChildren: 0
        },

        WidgetClass = SuperClass.extend(function DataHandlerWidget() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.init = function () {
        if (brease.config.editMode === true) {
            _initEditor(this);
        } else {
            _initChildren(this);
        }

        SuperClass.prototype.init.apply(this, arguments);
    };

    p.childrenInitializedHandler = function () {
        //can be overwritten in the derived Widgets to trigger eg. creating the renderer,...
        var widget = this;
        this.settings.childrenIdList.forEach(function (id) {
            var childWidget = brease.callWidget(id, 'widget');
            widget.settings.childrenList.push(childWidget);
            if (Utils.isFunction(childWidget.setParentWidget)) {
                childWidget.setParentWidget(widget);
            } else if (Utils.isFunction(childWidget.setParentWidgetId)) {
                childWidget.setParentWidgetId(widget.elem.id);
            }
        });
        
        this.settings.totalNbrofChildren = this.settings.childrenIdList.length;

        var childrenReady = this.createEvent('WIDGET_CHILDREN_READY');
        childrenReady.dispatch();
    };

    p.getChildrenList = function () {
        return this.settings.childrenList;
    };

    p.getChildrenInitialized = function () {
        return this.settings.childrenInitialized;
    };

    p.childrenParsed = function (e) {
        if (e.target === this.elem) {
            Array.prototype.forEach.call(_getChildWidgets.call(this), function (elem) {
                // this = widget
                var childId = elem.id;
                if (!this.settings.childrenIdList.includes(childId)) {
                    this.settings.childrenList.push(brease.callWidget(childId, 'widget'));
                    this.settings.childrenIdList.push(childId);
                }
            }, this);
            this.elem.removeEventListener(BreaseEvent.CONTENT_PARSED, this._bind(this.childrenParsed));
            this.elem.addEventListener(BreaseEvent.WIDGET_ADDED, this._bind(this.childrenAdded));
            this.elem.addEventListener(BreaseEvent.WIDGET_REMOVED, this._bind(this.childrenRemoved));
        }
    };

    p.childrenAdded = function (e) {
        if (e.target === this.elem && !this.settings.childrenIdList.includes(e.detail.widgetId)) {
            var childrenWidgetId = e.detail.widgetId,
                childrenWidget = brease.callWidget(childrenWidgetId, 'widget');
            this.settings.childrenIdList.push(childrenWidgetId);
            this.settings.childrenList.push(childrenWidget);
            
            var orderID = _order(this);
            this.settings.childrenList.sort(function (a, b) {
                return orderID.indexOf(a.elem.id) - orderID.indexOf(b.elem.id);
            });
            this.settings.childrenIdList.sort(function (a, b) {
                return orderID.indexOf(a) - orderID.indexOf(b);
            });
            this.settings.totalNbrofChildren += 1;
        }
    };

    function _order(widget) {
        return Array.prototype.map.call(_getChildWidgets.call(widget), function (elem) {
            return elem.id;
        });
    }

    p.childrenRemoved = function (e) {
        if (e.target === this.elem) {
            var childrenWidgetId = e.detail.widgetId,
                index = this.settings.childrenIdList.indexOf(childrenWidgetId);
            if (index > -1) {
                this.settings.childrenList.splice(index, 1);
                this.settings.childrenIdList.splice(index, 1);
            }
            this.settings.totalNbrofChildren -= 1;
        }
    };

    p.dispose = function () {
        _removeListener(this);
        this.settings.childrenIdList = [];
        this.settings.childrenList = [];
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    p.enable = function () {
        SuperClass.prototype.enable.call(this, arguments);
        if (this.settings.childrenInitialized || brease.config.editMode) {
            _setChildWidgetEnableState(this);
        }

    };

    p.disable = function () {
        SuperClass.prototype.disable.call(this, arguments);
        if (this.settings.childrenInitialized || brease.config.editMode) {
            _setChildWidgetEnableState(this);
        }
    };

    //Private functions

    function _initChildren(widget) {
        widget.itemDefs = Array.prototype.map.call(_getChildWidgets.call(widget), function (childWidgetElem) {
            var childId = childWidgetElem.id;
            var deferred = $.Deferred();

            widget.settings.childrenIdList.push(childId);
            if (brease.uiController.getWidgetState(childId) >= Enum.WidgetState.INITIALIZED && brease.uiController.getWidgetState(childId) !== Enum.WidgetState.SUSPENDED) {
                deferred.resolve();
            } else {
                childWidgetElem.addEventListener(BreaseEvent.WIDGET_INITIALIZED, _onWidgetInitialized);
            }
            function _onWidgetInitialized() {
                childWidgetElem.removeEventListener(BreaseEvent.WIDGET_INITIALIZED, _onWidgetInitialized);
                deferred.resolve();
            }
            return deferred;
        });

        $.when.apply($, widget.itemDefs).done(function () {
            widget.settings.childrenInitialized = true;
            _setChildWidgetEnableState(widget);
            widget.childrenInitializedHandler();
        });
    }

    function _setChildWidgetEnableState(widget) {
        widget.settings.childrenIdList.forEach(function (id) {
            brease.uiController.callWidget(id, 'setParentEnableState', !widget.isDisabled);
        });
    }

    function _initEditor(widget) {
        var isTableWidget = widget._cssClasses.includes('breaseTableWidget') || widget.elem.classList.contains('breaseTableWidget');
        if (isTableWidget) {
            widget.elem.addEventListener(BreaseEvent.CONTENT_PARSED, widget._bind(widget.childrenParsed));
        } else {
            widget.elem.addEventListener(BreaseEvent.WIDGET_ADDED, widget._bind(widget.childrenAdded));
            widget.elem.addEventListener(BreaseEvent.WIDGET_REMOVED, widget._bind(widget.childrenRemoved));
        }
    }

    function _removeListener(widget) {
        if (brease.config.editMode === true) {
            widget.elem.removeEventListener(BreaseEvent.CONTENT_PARSED, widget._bind(widget.childrenParsed));
            widget.elem.removeEventListener(BreaseEvent.WIDGET_ADDED, widget._bind(widget.childrenAdded));
            widget.elem.removeEventListener(BreaseEvent.WIDGET_REMOVED, widget._bind(widget.childrenRemoved));
        }
    }
    function _getChildWidgets() {
        return this.elem.querySelectorAll('[data-brease-widget]');
    }
    return WidgetClass;

});
