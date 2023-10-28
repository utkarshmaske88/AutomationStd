define(['brease/core/Class',
    'brease/events/BreaseEvent',
    'libs/d3/d3',
    'brease/core/Types',
    'brease/core/Utils',
    'widgets/brease/common/libs/redux/utils/UtilsSize'
], function (SuperClass, BreaseEvent, d3, Types, Utils, UtilsSize) {

    'use strict';

    var renderer = SuperClass.extend(function renderer(settings, widget) {

            SuperClass.call(this);
            this.widget = widget;
            this.settings = settings;
            this.settings.margin = {
                top: 30,
                left: 30,
                bottom: 30,
                right: 30
            };
            this.settings.borderWidth = 1;
            this.settings.fontSize = 12;
            this.settings.scaleFactorRadius = 0.35;

            this.initialize();
        }, null),

        p = renderer.prototype;

    p.initialize = function () {
        this.data = [];
        this.info = [];
        this.pieChartContainer = d3.select('#' + this.settings.id);
        _createBaseItem(this);
        this.createArcs();
        _recalculateCss(this);
        _createInfoBox(this);
    };

    //FUNCTIONS

    p.setItemIdList = function (itemIdList) {
        this.settings.itemIdList = itemIdList;
    };

    p.getItemIdList = function () {
        return this.settings.itemIdList;
    };

    p.setItem = function (item) {
        if (item !== undefined) {
            if (this.info.indexOf(item.id) === -1) {
                _addArrayEntry(this, item);
                _positionItemsCentered(this);
            } else {
                _updateArrayEntry(this, item);
            }
        }
        _updateChartItems(this);
    };

    p.removeItem = function (id) {
        var index = this.info.indexOf(id);
        if (index !== -1) {
            _removeArrayEntry(this, id);
            _updateChartItems(this);
        }
    };

    p.setItemPadding = function (itemPadding) {
        this.settings.itemPadding = itemPadding;
        _updateChartItems(this);
    };

    p.setSize = function (height, width) {
        var styles = this.widget.el.css(['padding-top', 'padding-right', 'padding-bottom', 'padding-left']),
            paddingHorizontal = Types.parseValue(styles['padding-left'], 'Integer') + Types.parseValue(styles['padding-right'], 'Integer'),
            paddingVertical = Types.parseValue(styles['padding-top'], 'Integer') + Types.parseValue(styles['padding-bottom'], 'Integer');

        if (height !== undefined) {
            this.settings.height = UtilsSize.getHeight(height, this.widget.elem) - paddingVertical;
        }
        if (width !== undefined) {
            this.settings.width = UtilsSize.getWidth(width, this.widget.elem) - paddingHorizontal;
        }
    };

    p.setUnitSymbol = function (unitSymbol) {
        if (Utils.isString(unitSymbol)) {
            this.settings.unitSymbol = unitSymbol;
            _placeDataToDisplay(this);
        }
    };

    p.setNumberFormat = function (numberFormat) {
        this.settings.numberFormat = numberFormat;
        _updateChartItems(this);
    };

    p.getNumberFormat = function () {
        return this.settings.numberFormat;
    };

    p.setPercentageFormat = function (formatPercentage) {
        this.settings.formatPercentage = formatPercentage;
        _updateChartItems(this);
    };

    p.setTransitionTime = function (time) {
        this.settings.transitionTime = time;
    };

    p.setInfoBox = function (infoBox) {
        this.settings.infoBox = infoBox;
        if (this.settings.infoBox === false) {
            this._hideInfoBox();
        }
    };

    p.setShowData = function (showData) {
        this.settings.showData = showData;
        _updateChartItems(this);
    };

    p.redraw = function () {
        this.setSize(this.widget.settings.height, this.widget.settings.width);
        this.pieChartContainer.selectAll('circle').remove();
        _createBaseItem(this);
        this.createArcs();
        _recalculateCss(this);
        _positionItemsCentered(this);
        _updateChartItems(this);
    };

    p.createArcs = function () {
        this.settings.arc = d3.svg.arc()
            .startAngle(function (d) { return isNaN(d.startAngle) ? 0 : d.startAngle; })
            .endAngle(function (d) { return isNaN(d.endAngle) ? 0 : d.endAngle; })
            .outerRadius(this.settings.pieRadius);

        this.pieChartContainer.pie = d3.layout.pie()
            .sort(null)
            .value(function (d) { return d.value; });
    };

    //PRIVATE FUNCTIONS
    function _createBaseItem(renderer) {
        renderer.settings.pieRadius = Math.max(0, Math.min(renderer.settings.height, renderer.settings.width) * renderer.settings.scaleFactorRadius);

        renderer.pieChartContainer.insert('circle', ':first-child')
            .attr('id', renderer.settings.id + 'BaseItem')
            .attr('class', 'pieChartDefault')
            .attr('cx', renderer.settings.width * 0.5)
            .attr('cy', renderer.settings.height * 0.5)
            .attr('r', renderer.settings.pieRadius);
    }

    function _positionItemsCentered(renderer) {
        renderer.pieChartContainer.selectAll('g.pieWidget')
            .attr('transform', 'translate(' + renderer.settings.width * 0.5 + ',' + renderer.settings.height * 0.5 + ')');

        renderer.pieChartContainer.selectAll('g.pieWidget.visible > path')
            .on('click', function (d) { _openInfoBox(this, renderer); })
            .on('touchend', function (d) { _openInfoBox(this, renderer); });
    }

    function _recalculateCss(renderer) {
        _setCurrentFontSize(renderer);
        _setCurrentBorderWidth(renderer);
        renderer.pieChartContainer.dataTextOffset = renderer.settings.fontSize * renderer.settings.scaleFactorRadius + renderer.settings.borderWidth / 2;
    }

    function _setCurrentFontSize(renderer) {
        var fontSize = $('#' + renderer.settings.id).find('text').css('font-size');
        renderer.settings.fontSize = (fontSize !== undefined) ? parseInt(fontSize, 10) : renderer.settings.fontSize;
    }

    function _setCurrentBorderWidth(renderer) {
        var borderWidth = renderer.pieChartContainer.selectAll('circle').style('stroke-width');
        renderer.settings.borderWidth = (borderWidth !== undefined && borderWidth.length > 0) ? parseInt(borderWidth, 10) : renderer.settings.borderWidth;
    }

    function _updateChartItems(renderer) {

        renderer.arcs = renderer.pieChartContainer.selectAll('g.pieWidget.visible > path')
            .data(renderer.pieChartContainer.pie(renderer.data))
            .attr('stroke', '#FFF')
            .attr('stroke-width', renderer.settings.itemPadding)
            .attr('d', renderer.settings.arc)
            .style('stroke-opacity', 1);

        renderer.arcs
            .transition()
            .duration(renderer.settings.transitionTime)
            .attrTween('d', function (d) {
                var that = this;
                return _transitionAttrTween(d, that, renderer.settings.arc);
            });

        _calcItemPercentage(renderer);
        _placeDataToDisplay(renderer);

        if (renderer.infoBoxIsOpen) {
            var pieItemData = d3.select(renderer.currentInfoBox).datum();
            _updateInfoBox(renderer, pieItemData);
        }
    }

    function _openInfoBox(path, renderer) {
        if (brease.config.editMode || !renderer.settings.infoBox) { return; }

        if (renderer.settings.infoBox) {
            renderer.infoBoxIsOpen = true;
            renderer.currentInfoBox = path;
            var pieItemData = d3.select(renderer.currentInfoBox).datum();
            _calculateTextPosition(renderer);
            _updateInfoBox(renderer, pieItemData);
            _positionInfoBox(renderer, pieItemData);
            d3.event.stopPropagation();
            $(document).on(BreaseEvent.MOUSE_DOWN, renderer._bind('_hideInfoBox'));
        }
        $('#' + renderer.settings.id).css('overflow', 'visible');
    }

    function _calcItemPercentage(renderer) {
        var percentageValues = [];
        renderer.settings.totalValue = 0;

        renderer.data.forEach(function (arrayItem) {
            renderer.settings.totalValue = renderer.settings.totalValue + arrayItem.value;
        });

        for (var i = 0; i < renderer.data.length; i += 1) {
            if (renderer.settings.totalValue === 0 && brease.config.editMode) {
                percentageValues[i] = 0;
            } else if (renderer.data[i].value === 0 && !brease.config.editMode) {
                percentageValues[i] = 0;
            } else {
                percentageValues[i] = _formatNumberValue((renderer.data[i].value / renderer.settings.totalValue * 100), renderer.settings.formatPercentage);
            }
        }

        percentageValues = _roundPercentageValuesToDisplay(percentageValues, 100, renderer.settings.formatPercentage);

        for (var j = 0; j < renderer.data.length; j += 1) {
            if (renderer.settings.totalValue === 0 && brease.config.editMode) {
                renderer.data[j].percentage = '0%';
            } else if (renderer.data[j].value === 0 && !brease.config.editMode) {
                renderer.data[j].percentage = '';
            } else {
                renderer.data[j].percentage = _formatNumberValue(percentageValues[j], renderer.settings.formatPercentage) + '%';
            }
        }
    }

    function _roundPercentageValuesToDisplay(percentageArray, target, format) {
        var off = target - Number(_.reduce(percentageArray, function (acc, x) { return acc + Number(x); }, 0));
        var lastSubstraction = false;
        var substraction = false;

        if (format.decimalPlaces === undefined) {
            return _.chain(percentageArray)
                .map(function (x, i) {
                    lastSubstraction = (i >= (percentageArray.length + off)) && !substraction;
                    substraction = (percentageArray[i + 1] === 0 && i + 1 >= (percentageArray.length + off) && (i < (percentageArray.length + off)));
                    return Number(x) + (off > i) - (lastSubstraction || substraction);
                })
                .value();
        } else {
            return _.chain(percentageArray)
                .map(function (x, i) {
                    lastSubstraction = (i >= (percentageArray.length + off)) && !substraction;
                    substraction = (percentageArray[i + 1] === 0 && i + 1 >= (percentageArray.length + off) && (i < (percentageArray.length + off)));
                    var offset = (((off > i) - (lastSubstraction || substraction)) / Math.pow(10, format.decimalPlaces));

                    return (Number(x) + Number(offset)).toFixed(format.decimalPlaces);
                })
                .value();
        }
    }

    function _placeDataToDisplay(renderer) {
        var arcPercentage = d3.svg.arc()
            .startAngle(function (d) { return isNaN(d.startAngle) ? 0 : d.startAngle; })
            .endAngle(function (d) { return isNaN(d.endAngle) ? 0 : d.endAngle; })
            .outerRadius(renderer.settings.pieRadius + renderer.pieChartContainer.dataTextOffset)
            .innerRadius(renderer.settings.pieRadius + renderer.pieChartContainer.dataTextOffset);

        var texts = renderer.pieChartContainer.selectAll('g.pieWidget.visible > text')
            .data(renderer.pieChartContainer.pie(renderer.data))
            .attr('font-size', renderer.settings.fontSize)
            .style('alignment-baseline', function (d) { return _determineDataTextBaseline(d); })
            .text(function (d, i) {
                var displayData;
                switch (renderer.settings.showData) {
                    case 'percentage':
                        displayData = renderer.data[i].percentage;
                        break;
                    case 'value':
                        displayData = (renderer.data[i].value === 0 && !brease.config.editMode) ? '' : _formatNumberValue(renderer.data[i].value, renderer.settings.numberFormat) + _formatUnitValue(renderer.settings);
                        break;
                    case 'none':
                        displayData = '';
                        break;
                    default:
                        displayData = '';
                }
                return displayData;
            });

        texts.transition()
            .duration(renderer.settings.transitionTime)
            .each(function (d, i) {
                renderer.data[i].dataPosition = arcPercentage.centroid(d);
            })
            .attrTween('transform', function (d) {
                var that = this;
                return _transitionAttrTween(d, that, arcPercentage);
            })
            .styleTween('text-anchor', function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    return _determineDataTextAnchor(d2);
                };
            });
    }

    function _determineDataTextAnchor(d) {
        var textAnchor,
            pi = Math.PI.toFixed(2),
            textPositionAngle = parseFloat(_midAngle(d).toFixed(2));

        if (textPositionAngle === 0 || textPositionAngle === 2 * pi) {
            textAnchor = 'middle';
        } else if (textPositionAngle === pi) {
            textAnchor = 'middle';
        } else if (textPositionAngle > 0 && textPositionAngle < pi) {
            textAnchor = 'start';
        } else if (textPositionAngle > pi && textPositionAngle < 2 * pi) {
            textAnchor = 'end';
        } else {
            textAnchor = 'middle';
        }
        return textAnchor;
    }

    function _determineDataTextBaseline(d) {
        var alignmentBaseline,
            pi = Math.PI.toFixed(2),
            textPositionAngle = parseFloat(_midAngle(d).toFixed(2));

        if (textPositionAngle === 0 || textPositionAngle === 2 * pi) {
            alignmentBaseline = 'ideographic';
        } else if (textPositionAngle === pi) {
            alignmentBaseline = 'text-before-edge';
        } else {
            alignmentBaseline = 'middle';
        }
        return alignmentBaseline;
    }

    function _midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }

    function _transitionAttrTween(d, that, arcThat) {
        that._current = (that._current === undefined) ? d : that._current;
        that._current.startAngle = isNaN(that._current.startAngle) ? 0 : that._current.startAngle;
        that._current.endAngle = isNaN(that._current.endAngle) ? 0 : that._current.endAngle;
        var i = d3.interpolate(that._current, d);
        that._current = i(0);
        return function (t) {
            if (that.tagName.toLowerCase() === 'path') {
                return arcThat(i(t));
            } else {
                var d2 = i(t);
                var pos = arcThat.centroid(d2);
                return 'translate(' + pos + ')';
            }
        };
    }

    function _createInfoBox(renderer) {
        renderer.infoBoxContainer = renderer.pieChartContainer.append('g')
            .attr('class', 'infoBox');
        renderer.infoBoxContainer.append('rect')
            .attr('id', renderer.settings.id + 'InfoBoxRect');
        renderer.infoBoxContainer.append('text')
            .attr('class', 'percentage');
        renderer.infoBoxContainer.append('text')
            .attr('class', 'value');
        renderer.infoBoxContainer.append('text')
            .attr('class', 'information');
    }

    function _calculateTextPosition(renderer) {
        renderer.settings.textPadding = parseInt((renderer.settings.fontSize / 2), 10);
        renderer.settings.textPositionY = [1, 2, 3];

        for (var i = 0; i < renderer.settings.textPositionY.length; i += 1) {
            renderer.settings.textPositionY[i] = (renderer.settings.fontSize + renderer.settings.textPadding) * renderer.settings.textPositionY[i];
        }
    }

    function _updateInfoBox(renderer, pieItemData) {

        if (!renderer.settings.infoBox || brease.config.editMode || !renderer.settings.widget.getEnable()) { return; }

        renderer.infoBoxContainer.style('display', renderer.settings.infoBox ? 'block' : 'none');

        renderer.infoBoxContainer.select('rect')
            .attr('height', (renderer.settings.fontSize + renderer.settings.textPadding) * renderer.settings.textPositionY.length + 2 * renderer.settings.textPadding);
        renderer.infoBoxContainer.select('text.percentage')
            .attr('x', renderer.settings.textPadding)
            .attr('y', renderer.settings.textPositionY[0])
            .text(pieItemData.data.percentage);
        renderer.infoBoxContainer.select('text.value')
            .attr('x', renderer.settings.textPadding)
            .attr('y', renderer.settings.textPositionY[1])
            .text(_formatNumberValue(pieItemData.data.value, renderer.settings.numberFormat) + _formatUnitValue(renderer.settings));
        renderer.infoBoxContainer.select('text.information')
            .attr('x', renderer.settings.textPadding)
            .attr('y', renderer.settings.textPositionY[2])
            .text(pieItemData.data.text);

    }

    function _positionInfoBox(renderer, pieItemData) {
        renderer.settings.groupPosition = [0, 0];
        renderer.settings.groupPosition = _infoBoxPosition(renderer, pieItemData, renderer.settings.textPositionY.length);
        renderer.infoBoxContainer.attr('transform', 'translate(' + renderer.settings.groupPosition[0] + ',' + renderer.settings.groupPosition[1] + ')');
    }

    function _infoBoxPosition(renderer, pieItemData, numberTextEntries) {
        var textPadding = parseInt((renderer.settings.fontSize / 2), 10),
            groupPosition = [0, 0],
            groupPositionOffsetX,
            groupPositionOffsetY,
            textLabels = renderer.pieChartContainer.selectAll('.infoBox > text'),
            maxTextWidth = _getMaxTextWidth(textLabels),
            infoBoxWidth = maxTextWidth + 2 * textPadding;

        renderer.pieChartContainer.select('#' + renderer.settings.id + 'InfoBoxRect').style('width', infoBoxWidth > 100 ? infoBoxWidth + 'px' : 100 + 'px');

        groupPositionOffsetX = renderer.settings.width * 0.5 - ((renderer.settings.fontSize + textPadding) * numberTextEntries - textPadding);
        groupPositionOffsetY = renderer.settings.height * 0.5 - ((renderer.settings.fontSize + textPadding) * (numberTextEntries * 0.5) + textPadding);
        groupPosition[0] = pieItemData.data.dataPosition[0] + groupPositionOffsetX;
        groupPosition[1] = pieItemData.data.dataPosition[1] + groupPositionOffsetY;

        return groupPosition;
    }

    function _formatNumberValue(value, numberFormat) {
        var formattedValue = brease.formatter.formatNumber(value, numberFormat);
        return formattedValue;
    }

    function _formatUnitValue(rendererSettings) {
        var formattedUnit;
        if (brease.config.editMode && rendererSettings.unitSymbol === 'unit') {
            formattedUnit = ' unit';
        } else if (rendererSettings.unitSymbol !== '' && rendererSettings.unitSymbol !== undefined) {
            formattedUnit = ' ' + rendererSettings.unitSymbol;
        } else {
            formattedUnit = '';
        }
        return formattedUnit;
    }

    function _getMaxTextWidth(textLabels) {
        var maxTextWidth = 0;
        textLabels.each(function () {
            maxTextWidth = Math.max(maxTextWidth, this.getComputedTextLength());
        });
        return maxTextWidth;
    }

    p._hideInfoBox = function () {
        var renderer = this;
        renderer.pieChartContainer.selectAll('g.infoBox').style('display', 'none');
        renderer.infoBoxIsOpen = false;
        $(document).off(BreaseEvent.MOUSE_DOWN, renderer._bind('_hideInfoBox'));
        $('#' + renderer.settings.id).css('overflow', 'hidden');
    };

    function _addArrayEntry(renderer, data) {
        var index = renderer.settings.itemIdList.indexOf(data.id),
            obj = { text: data.text, value: data.value, id: data.id };
        renderer.data.splice(index, 0, obj);
        renderer.info.splice(index, 0, data.id);
        var orderID = renderer.settings.itemIdList;

        //We have to sort the entries as we dont know which order these are added to the widget in
        renderer.data.sort(function (a, b) {
            return orderID.indexOf(a.id) - orderID.indexOf(b.id);
        });
        renderer.info.sort(function (a, b) {
            return orderID.indexOf(a) - orderID.indexOf(b);
        });
    }

    function _updateArrayEntry(renderer, data) {
        var index = brease.config.editMode ? renderer.settings.itemIdList.indexOf(data.id) : renderer.info.indexOf(data.id);
        renderer.data[index] = {
            text: data.text,
            value: data.value,
            id: data.id
        };
    }

    function _removeArrayEntry(renderer, id) {
        var index = renderer.info.indexOf(id);
        if (index !== -1) {
            renderer.info.splice(index, 1);
            renderer.data.splice(index, 1);
        }
    }

    return renderer;
});
