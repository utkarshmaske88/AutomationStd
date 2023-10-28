define([
    'widgets/brease/DataHandlerWidget/DataHandlerWidget',
    'brease/events/BreaseEvent',
    'brease/enum/Enum',
    'brease/core/Utils',
    'brease/config/NumberFormat',
    'widgets/brease/PieChart/libs/Renderer',
    'brease/decorators/MeasurementSystemDependency',
    'widgets/brease/common/libs/wfUtils/UtilsObject',
    'brease/decorators/DragAndDropCapability',
    'widgets/brease/common/libs/BreaseResizeObserver',
    'brease/decorators/ContentActivatedDependency',
    'brease/core/ContainerUtils',
    'widgets/brease/common/DragDropProperties/libs/DroppablePropertiesEvents'
], 
function (SuperClass, BreaseEvent, Enum, Utils, NumberFormat, Renderer, measurementSystemDependency, UtilsObject, dragAndDropCapability, BreaseResizeObserver, contentActivatedDependency, ContainerUtils) {

    'use strict';

    /**
     * @class widgets.brease.PieChart
     * @extends widgets.brease.DataHandlerWidget
     * @iatMeta studio:license
     * licensed
     * @iatMeta studio:isContainer
     * true
     *
     * @mixins widgets.brease.common.DragDropProperties.libs.DroppablePropertiesEvents
     *
     * @iatMeta category:Category
     * Chart,Container
     *
     * @iatMeta description:short
     * Container for PieChartItems
     * @iatMeta description:de
     * Ein PieChart (Kreisdiagramm) ist eine Darstellungsform für Teilbereiche eines ganzen Kreises in Abhängigkeit ihrer Werte.
     * @iatMeta description:en
     * A PieChart (circle diagram) is a representation for partial areas of a whole circle depending on their values.   
     */

    /**
     * @cfg {UInteger} transitionTime=0
     * @iatStudioExposed
     * @iatCategory Behavior
     * Defines the time (in ms) used for a transition when the value of an item changes
     */

    /**
     * @cfg {brease.config.MeasurementSystemUnit} unit=''
     * @iatStudioExposed
     * @bindable
     * @iatCategory Appearance
     * Unit code depending on measurement system
     */

    /**
     * @cfg {brease.enum.ShowData} showData='percentage'
     * @iatStudioExposed
     * @iatCategory Appearance
     * Option to display the calculated percentage, value or none of both of each PieChartItem 
     */

    /**
     * @cfg {Boolean} showUnit=false
     * @iatStudioExposed
     * @iatCategory Behavior
     * Option to display the unit (if configured) of each PieChartItem in the infobox
     */

    /**
     * @cfg {Boolean} infoBox=true
     * @iatStudioExposed
     * @iatCategory Behavior
     * Option to display the infobox, which displays information out of the individual PieChartItem
     */

    /**
     * @cfg {brease.config.MeasurementSystemFormat} format={'metric':{ 'decimalPlaces' : 2, 'minimumIntegerDigits' : 1 }, 'imperial' :{ 'decimalPlaces' : 2, 'minimumIntegerDigits' : 1 }, 'imperial-us' :{ 'decimalPlaces' : 2, 'minimumIntegerDigits' : 1 }}  
     * @iatStudioExposed
     * @iatCategory Appearance
     * @bindable
     * Number format inside infobox (NumberFormat) depending on measurement system
     */

    /**
     * @cfg {brease.config.MeasurementSystemFormat} formatPercentage={'metric':{ 'decimalPlaces' : 0, 'minimumIntegerDigits' : 1 }, 'imperial' :{ 'decimalPlaces' : 0, 'minimumIntegerDigits' : 1 }, 'imperial-us' :{ 'decimalPlaces' : 0, 'minimumIntegerDigits' : 1 }}  
     * @iatStudioExposed
     * @iatCategory Appearance
     * @bindable
     * Number format inside infobox (NumberFormat) depending on measurement system
     */

    /**
     * @cfg {UInteger} itemPadding=2
     * @iatStudioExposed
     * @iatCategory Appearance
     * Space between 2 items 
     */

    /**
     * @property {WidgetList} children=["widgets.brease.PieChartItem"]
     * @inheritdoc  
     */

    var defaultSettings = {
            transitionTime: 0,
            showData: 'percentage',
            infoBox: true,
            showUnit: false,
            format: { default: { decimalPlaces: 2, minimumIntegerDigits: 1 } },
            formatPercentage: { default: { decimalPlaces: 0, minimumIntegerDigits: 1 } },
            itemPadding: 2
        },

        WidgetClass = SuperClass.extend(function PieChart() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.init = function () {

        if (this.settings.omitClass !== true) {
            this.el.addClass('breasePieChart');
            this.el.addClass('container');
        }

        this.createRenderer();
        this.observer = new BreaseResizeObserver(this.elem, this._bind(_redraw));
        SuperClass.prototype.init.apply(this, arguments);

        this.measurementSystemChangeHandler();
        document.body.addEventListener(BreaseEvent.THEME_CHANGED, this._bind(_redraw));
    };

    p.createRenderer = function () {
        var rendererSettings = {
            id: this.elem.id,
            height: this.el.height(),
            width: this.el.width(),
            unitSymbol: this.getShowUnit() ? this.settings.unitSymbol : '',
            transitionTime: this.getTransitionTime(),
            numberFormat: NumberFormat.getFormat(this.getFormat(), brease.measurementSystem.getCurrentMeasurementSystem()),
            formatPercentage: NumberFormat.getFormat(this.getFormatPercentage(), brease.measurementSystem.getCurrentMeasurementSystem()),
            itemIdList: this.settings.childrenIdList.slice(0),
            itemPadding: this.getItemPadding(),
            infoBox: this.getInfoBox(),
            showData: this.getShowData(),
            widget: this
        };
        this.renderer = new Renderer(rendererSettings, this);
    };
    p._visibleHandler = function () {
        SuperClass.prototype._visibleHandler.apply(this, arguments);
        ContainerUtils.inheritProperty(_getChildWidgets.call(this), 'parentVisibleState', this.isVisible());
        _redraw.call(this);
    };
    //FUNCTIONS GETTER AND SETTER

    /**
     * @method setTransitionTime
     * Sets transitionTime
     * @param {UInteger} transitionTime
     */
    p.setTransitionTime = function (transitionTime) {
        this.settings.transitionTime = transitionTime;
        brease.config.editMode ? this.renderer.setTransitionTime(0) : this.renderer.setTransitionTime(this.getTransitionTime());
    };

    /**
     * @method getTransitionTime 
     * Returns transitionTime
     * @return {UInteger}
     */
    p.getTransitionTime = function () {
        return this.settings.transitionTime;
    };

    /**
     * @method setUnit
     * Sets unit
     * @param {brease.config.MeasurementSystemUnit} unit
     */
    p.setUnit = function (unit) {
        this.settings.unit = unit;
        this.measurementSystemChangeHandler();
        this.setChildUnit();
    };

    /**
     * @method getUnit 
     * Returns unit
     * @return {brease.config.MeasurementSystemUnit}
     */
    p.getUnit = function () {
        return this.settings.unit;
    };

    /**
     * @method setShowData
     * @iatStudioExposed
     * Sets showData
     * @param {brease.enum.ShowData} value
     */
    p.setShowData = function (value) {
        if (Enum.ShowData.hasOwnProperty(value)) {
            this.settings.showData = value;
        }
        this.renderer.setShowData(this.getShowData());
    };

    /**
     * @method getShowData 
     * Returns showData
     * @return {brease.enum.ShowData}
     */
    p.getShowData = function () {
        return this.settings.showData;
    };

    /**
     * @method setInfoBox
     * @iatStudioExposed
     * Sets infoBox
     * @param {Boolean} value
     */
    p.setInfoBox = function (value) {
        if (_.isBoolean(value)) {
            this.settings.infoBox = value;
        }
        this.renderer.setInfoBox(this.getInfoBox());
    };

    /**
     * @method getInfoBox 
     * Returns infoBox
     * @return {Boolean}
     */
    p.getInfoBox = function () {
        return this.settings.infoBox;
    };

    /**
     * @method setShowUnit
     * Sets showUnit
     * @param {Boolean} showUnit
     */
    p.setShowUnit = function (showUnit) {
        this.settings.showUnit = showUnit;
        var unitSymbol;
        if (this.getShowUnit() && brease.config.editMode) {
            unitSymbol = 'unit';
        } else if (this.getShowUnit()) {
            unitSymbol = this.settings.unitSymbol;
        } else {
            unitSymbol = '';
        }
        this.renderer.setUnitSymbol(unitSymbol);
    };

    /**
     * @method getShowUnit 
     * Returns showUnit
     * @return {Boolean}
     */
    p.getShowUnit = function () {
        return this.settings.showUnit;
    };

    /**
     * @method setFormat
     * Sets format
     * @param {brease.config.MeasurementSystemFormat} format
     */
    p.setFormat = function (format) {
        this.settings.format = format;
        _updateFormat(this);
    };

    /**
     * @method getFormat 
     * Returns format
     * @return {brease.config.MeasurementSystemFormat}
     */
    p.getFormat = function () {
        return this.settings.format;
    };

    /**
         * @method setFormatPercentage
         * Sets formatPercentage
         * @param {brease.config.MeasurementSystemFormat} formatPercentage
         */
    p.setFormatPercentage = function (formatPercentage) {
        this.settings.formatPercentage = formatPercentage;
        _updateFormatPercentage(this);
    };

    /**
         * @method getFormatPercentage 
         * Returns formatPercentage.
         * @return {brease.config.MeasurementSystemFormat}
         */
    p.getFormatPercentage = function () {
        return this.settings.formatPercentage;
    };

    /**
     * @method setItemPadding
     * Sets itemPadding
     * @param {UInteger} itemPadding
     */
    p.setItemPadding = function (itemPadding) {
        this.settings.itemPadding = itemPadding;
        this.renderer.setItemPadding(itemPadding);
    };

    /**
     * @method getItemPadding 
     * Returns itemPadding
     * @return {UInteger}
     */
    p.getItemPadding = function () {
        return this.settings.itemPadding;
    };

    /**
     * @method setStyle
     * @iatStudioExposed
     * Sets style
     * @param {StyleReference} value
     */
    p.setStyle = function () {
        SuperClass.prototype.setStyle.apply(this, arguments);
        _redraw.call(this);
    };

    /**
     * @method getStyle 
     * Returns style.
     * @return {StyleReference}
     */
    p.getStyle = function () {
        return this.settings.style;
    };

    //FUNCTIONS

    p.updateData = function (objectReceive) {
        if (this.renderer !== undefined) {
            if (Utils.isFunction(this.renderer.setItem) && Utils.isFunction(this.renderer.removeItem)) {
                if (objectReceive.visibility) {
                    this.renderer.setItem({ text: objectReceive.text, value: objectReceive.value, id: objectReceive.id });
                } else {
                    this.renderer.removeItem(objectReceive.id);
                }
            }
        }
    };

    p.addClassNames = function (classNames) {
        var widget = this;
        classNames.forEach(function (id) {
            widget.el.addClass(id);
        });
        this.initialized = true;
    };

    p.setChildUnit = function () {
        var widget = this;
        this.settings.childrenList.forEach(function (currentWidget) {
            currentWidget.setUnit(widget.getUnit());
        });
    };
   
    //EVENTS 

    p.measurementSystemChangeHandler = function () {
        var widget = this;
        this.unitChange = $.Deferred();
        this.settings.mms = brease.measurementSystem.getCurrentMeasurementSystem();
        _updateFormat(this);
        _updateFormatPercentage(this);
        $.when(
            this.unitChange.promise()
        ).then(function successHandler() {
            if (widget.renderer !== undefined) {
                if (Utils.isFunction(widget.renderer.setUnitSymbol)) {
                    var unitSymbol;
                    if (widget.getShowUnit() && brease.config.editMode) {
                        unitSymbol = 'unit';
                    } else if (widget.getShowUnit()) {
                        unitSymbol = widget.settings.unitSymbol;
                    } else {
                        unitSymbol = '';
                    }
                    widget.renderer.setUnitSymbol(unitSymbol);
                }
            }
        });
        var previousUnit = this.settings.currentUnit;
        if (this.settings.unit !== undefined) {
            this.settings.currentUnit = this.settings.unit[this.settings.mms];
        }
        if (this.settings.currentUnit !== previousUnit) {
            brease.language.pipeAsyncUnitSymbol(this.settings.currentUnit, this._bind(_setUnitSymbol));
        } else {
            this.unitChange.resolve();
        }
    };

    p.contentActivatedHandler = function () {
        if (this.observer.initialized) {
            this.observer.wake();
        } else {
            this.observer.init();
        }
    };

    p.childrenInitializedHandler = function () {
        if (this.renderer !== undefined) {
            this.renderer.setItemIdList(this.settings.childrenIdList.slice(0));
        }
        SuperClass.prototype.childrenInitializedHandler.call(this);
        var widget = this;
        this.setChildUnit();
        this.settings.childrenIdList.forEach(function (childId) {
            var data = brease.callWidget(childId, 'getData');
            if (data) {
                widget.updateData(data);
            }
        });
    };

    p.childrenAdded = function (event) {
        SuperClass.prototype.childrenAdded.call(this, event);
        if (event.target === this.elem) {
            this.renderer.setItemIdList(this.settings.childrenIdList.slice(0));
            brease.callWidget(event.detail.widgetId, 'setParentWidgetId', this.elem.id);
            _redraw.call(this);
        }
    };

    p.childrenRemoved = function (event) {
        SuperClass.prototype.childrenRemoved.call(this, event);
        if (event.target === this.elem) {
            this.renderer.setItemIdList(this.settings.childrenIdList.slice(0));
            this.renderer.removeItem(event.detail.widgetId);
            _redraw.call(this);
        }
    };

    p.suspend = function () {
        this.observer.suspend();
        var renderer = this.renderer;
        renderer._hideInfoBox();
        document.body.removeEventListener(BreaseEvent.THEME_CHANGED, this._bind(_redraw));
        SuperClass.prototype.suspend.apply(this, arguments);
    };
    p.wake = function () {
        document.body.addEventListener(BreaseEvent.THEME_CHANGED, this._bind(_redraw));
        SuperClass.prototype.wake.apply(this, arguments);
    };
    p.dispose = function () {
        this.observer.dispose();
        this.observer = undefined;
        document.body.removeEventListener(BreaseEvent.THEME_CHANGED, this._bind(_redraw));
        var renderer = this.renderer;
        $(document).off(BreaseEvent.MOUSE_DOWN, renderer._bind('_hideInfoBox'));

        SuperClass.prototype.dispose.apply(this, arguments);
    };
    // override method called in BaseWidget.init
    // additional behaviour in DataHandler _initEditor
    p._initEditor = function () {
        var widget = this;
        this.elem.classList.add('iat-container-widget');
        this.elem.classList.add('iatd-outline');

        require(['widgets/brease/common/libs/EditorHandlesSquare'], function (EditorHandles) {
            var editorHandles = new EditorHandles(widget);
            widget.getHandles = function () {
                return editorHandles.getHandles();
            };
            widget.designer.getSelectionDecoratables = function () {
                return editorHandles.getSelectionDecoratables();
            };
            widget.designer.isSquare = function () {
                return true;
            };
            if (widget.renderer !== undefined) {
                widget.renderer.setTransitionTime(0);
            }
            ContainerUtils.inheritProperty(_getChildWidgets.call(widget), 'parentWidgetId', widget.elem.id);
            widget.dispatchEvent(new CustomEvent(BreaseEvent.WIDGET_EDITOR_IF_READY, { bubbles: true }));
            widget.observer.init();
        });
    };

    p._editorStyleChanged = function () {
        _redraw.call(this);
    };

    p._redrawInEditor = function (height, width) {
        if (height !== undefined) { this._setHeight(height); }
        if (width !== undefined) { this._setWidth(width); }
        _redraw.call(this);
    };
    
    //PRIVATE FUNCTIONS 
    function _redraw() {
        if (this.renderer && this.isVisible()) {
            this.renderer.redraw();
        }
    }

    function _failMessage(str, type) {
        return this.elem.id + ': ' + type + ' string "' + str + '" is invalid!';
    }

    function _updateFormat(widget) {
        if (brease.language.isKey(widget.settings.format)) {
            widget.setLangDependency(true);
        }
        var formatObject = UtilsObject.createFormatObject(widget.defaultSettings.format, widget.settings.format, _failMessage.call(widget, widget.settings.format, 'format'));
        var numberFormat = NumberFormat.getFormat(formatObject, widget.settings.mms);
        
        if (widget.renderer !== undefined) {
            widget.renderer.setNumberFormat(numberFormat); 
        }
    }

    function _updateFormatPercentage(widget) {
        
        if (brease.language.isKey(widget.settings.formatPercentage)) {
            widget.setLangDependency(true);
        }
        var formatObject = UtilsObject.createFormatObject(widget.defaultSettings.formatPercentage, widget.settings.formatPercentage, _failMessage.call(widget, widget.settings.formatPercentage, 'formatPercentage'));
        var numberFormat = NumberFormat.getFormat(formatObject, widget.settings.mms);
          
        if (widget.renderer !== undefined) {
            widget.renderer.setPercentageFormat(numberFormat); 
        }
    }

    function _setUnitSymbol(symbol) {
        this.settings.unitSymbol = symbol;
        this.unitChange.resolve();
    }

    function _getChildWidgets() {
        return this.elem.querySelectorAll('[data-brease-widget]');
    }

    return contentActivatedDependency.decorate(dragAndDropCapability.decorate(measurementSystemDependency.decorate(WidgetClass, true), false), true);
});
