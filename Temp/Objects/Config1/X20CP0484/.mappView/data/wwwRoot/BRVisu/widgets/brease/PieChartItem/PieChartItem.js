define(['brease/core/BaseWidget', 
    'brease/datatype/Node', 
    'brease/core/Utils', 
    'brease/decorators/LanguageDependency',
    'brease/decorators/MeasurementSystemDependency',
    'brease/events/BreaseEvent'
], function (SuperClass, Node, Utils, languageDependency, measurementSystemDependency, BreaseEvent) {

    'use strict';

    /**
     * @class widgets.brease.PieChartItem
     * @extends brease.core.BaseWidget
     *
     * @iatMeta category:Category
     * Chart,Numeric
     *
     * @iatMeta description:short
     * PieChartItem zur Datenanbindung
     * @iatMeta description:de
     * Widget zur Datenanbindung für PieChart.
     * Jedes PieChartItem repräsentiert einen Teilbereich des Kreisdiagrammes in Abhängigkeit seines Wertes.
     * @iatMeta description:en
     * Widget used for data connection to PieChart. 
     * Each PieChartItem represents a partial area of a whole circle depending on its values.
     */

    /**
     * @cfg {Number} value=50
     * @bindable
     * @iatStudioExposed
     * @iatCategory Data
     * @nodeRefId node
     * Displayed value inside the infobox.
     */

    /**
     * @cfg {brease.datatype.Node} node=''
     * @bindable
     * @iatStudioExposed
     * @iatCategory Data
     * Displayed value with an unit inside the infobox.
     */

    /**
     * @cfg {String} text=''
     * @bindable
     * @iatStudioExposed
     * @localizable
     * @iatCategory Appearance
     * Displayed text inside the infobox
     */

    /**
     * @cfg {String} tooltip=''
     * @iatStudioExposed
     * @hide
     */
    /**
     * @method showTooltip
     * @hide
     */

    /**
     * @property {WidgetList} parents=["widgets.brease.PieChart"]
     * @inheritdoc  
     */

    /**
     * @cfg {Integer} tabIndex=-1
     * @hide
     */

    /**
    * @method focus
    * @hide
    */
   
    /**
    * @event FocusIn
    * @hide
    */

    /**
    * @event FocusOut
    * @hide
    */

    var defaultSettings = {
            value: 50,
            node: {},
            text: '',
            avoidSubmitChange: false
        },

        WidgetClass = SuperClass.extend(function PieChartItem() {
            SuperClass.apply(this, arguments);
        }, defaultSettings),

        p = WidgetClass.prototype;

    p.init = function () {
        this.el.addClass('pieWidget');
        this.data = {
            node: new Node(this.settings.value, null),
            text: this.settings.text
        };

        SuperClass.prototype.init.call(this);

        this.setNode(this.data.node);
        this.setText(this.data.text);
    };
    //FUNCTIONS GETTER AND SETTER

    /**
     * @method setNode
     * Sets the node
     * @param {brease.datatype.Node} node
     */
    p.setNode = function (node) {
        if (Utils.isObject(node)) {
            this.setAvoidSubmitChange(true);
            this.data.node.setId(node.id);
            this.setValue(node.value);
            this.setAvoidSubmitChange(false);
            _sendDataChange(this);
        }
    };

    /**
     * @method getNode
     * Get a node
     * @return {brease.datatype.Node}
     */
    p.getNode = function () {
        return this.data.node;
    };

    /**
     * @method setValue
     * @iatStudioExposed
     * Sets a value for the PieChartItem
     * @param {Number} value
     */
    p.setValue = function (value) {
        if (Utils.isNumeric(value)) {
            this.data.node.setValue(value);
            _sendDataChange(this);
        }
    };

    /**
     * @method getValue
     * Get a item value
     * @return {Number}
     */
    p.getValue = function () {
        return this.data.node.value;
    };

    /**
     * @method setText
     * Sets a text
     * @param {String} text
     */
    p.setText = function (text) {
        if (text !== undefined) {
            if (brease.language.isKey(text)) {
                this.setTextkey(text);
            } else if (Utils.isString(text)) {
                this.data.text = text;
                _sendDataChange(this);
                if (this.getTextkey() !== undefined) {
                    this.removeTextkey();
                }
            }
        }
    };

    /**
     * @method getText
     * Get a text
     * @return {String}
     */
    p.getText = function () {
        return this.data.text;
    };

    //FUNCTIONS

    p.updateVisibility = function (initial) {
        SuperClass.prototype.updateVisibility.apply(this, arguments);
        _sendDataChange(this);
    };

    p.setTextkey = function (textkey) {
        if (textkey !== undefined) {
            this.settings.textkey = brease.language.parseKey(textkey);
            this.setLangDependency(true);
            this.langChangeHandler();
        }
    };

    p.getTextkey = function () {
        return this.settings.textkey;
    };

    p.removeTextkey = function () {
        this.settings.textkey = undefined;
        this.setLangDependency(false);
    };

    p.setParentWidgetId = function (parentWidgetId) {
        this.settings.parentWidgetId = parentWidgetId;
        _sendDataChange(this);
    };

    p.getParentWidgetId = function () {
        return this.settings.parentWidgetId;
    };

    p.setUnit = function (unit) {
        this.settings.unit = unit;
        this.measurementSystemChangeHandler();
    };

    p.addClassNames = function (classNames) {
        var widget = this;
        classNames.forEach(function (id) {
            widget.el.addClass(id);
        });
        this.initialized = true;
    };
   
    p.langChangeHandler = function (e) {
        if (this.settings.textkey !== undefined) {
            var oldText = this.data.text,
                newText = brease.language.getTextByKey(this.settings.textkey);
            if (oldText !== newText) {
                this.data.text = newText;
                _sendDataChange(this);
            }
        }
    };

    p.measurementSystemChangeHandler = function () {
        var widget = this;
        this.settings.mms = brease.measurementSystem.getCurrentMeasurementSystem();
        this.valueChange = $.Deferred();
        this.unitChange = $.Deferred();

        $.when(this.valueChange.promise(), this.unitChange.promise()).then(function successHandler() {
            if (widget.elem) {
                _sendDataChange(widget); 
            }
        });

        var previousUnitCode = this.data.node.unit;

        if (this.settings.unit !== undefined) {
            this.data.node.setUnit(this.settings.unit[this.settings.mms]);
        } else {
            this.unitChange.resolve();
        }

        var subscriptions = brease.uiController.getSubscriptionsForElement(this.elem.id);
        if (subscriptions !== undefined && subscriptions.node !== undefined) {
            if (this.data.node.unit !== previousUnitCode) {
                this.sendNodeChange({ attribute: 'node', nodeAttribute: 'unit', value: this.data.node.unit });
            } else {
                this.valueChange.resolve();
            }
        } else {
            this.valueChange.resolve();
        }
    };
    p.setAvoidSubmitChange = function (avoidSubmitChange) {
        this.settings.avoidSubmitChange = avoidSubmitChange;
    };

    p.getAvoidSubmitChange = function () {
        return this.settings.avoidSubmitChange;
    };

    p.getData = function () {
        if (this.getAvoidSubmitChange()) { return; }

        if (!this.isHidden) {
            this.el.addClass('visible');
        } else {
            this.el.removeClass('visible');
        }

        return {
            id: this.elem.id,
            value: this.getValue(),
            text: this.getText(),
            visibility: !this.isHidden
        };
    };

    //PRIVATE FUNCTIONS 

    function _sendDataChange(widget) {

        var objectSend = widget.getData();
        if (objectSend === undefined) {
            return;
        }
        var parentWidgetId = widget.getParentWidgetId();
        if (brease.uiController.isWidgetCallable(parentWidgetId)) {
            brease.callWidget(parentWidgetId, 'updateData', objectSend);
        }
    }

    // override method called in BaseWidget.init
    p._initEditor = function () {
        var widget = this;
        require(['widgets/brease/PieChartItem/libs/EditorHandles', 'widgets/brease/common/libs/SVGUtils'], function (EditorHandles, SVGUtils) {
            // ensure element is created in svg namespace. Otherwise it won't appear in the ContentDesigner
            widget.elem = SVGUtils.importToSVGNamespace(widget.elem);
            widget.el = $(widget.elem);
            var editorHandles = new EditorHandles(widget);
            widget.getHandles = function () {
                return editorHandles.getHandles();
            };
            widget.designer.getSelectionDecoratables = function () {
                return editorHandles.getSelectionDecoratables();
            };
            _sendDataChange(widget);
            widget.dispatchEvent(new CustomEvent(BreaseEvent.WIDGET_EDITOR_IF_READY, { bubbles: true }));
        });
    };

    return measurementSystemDependency.decorate(languageDependency.decorate(WidgetClass, false), true);
});
