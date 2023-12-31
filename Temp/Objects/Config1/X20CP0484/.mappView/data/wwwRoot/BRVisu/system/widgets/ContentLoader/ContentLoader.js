define([
    'brease/core/BaseWidget', 
    'brease/enum/Enum', 
    'brease/events/BreaseEvent', 
    'brease/controller/WidgetController', 
    'brease/controller/WidgetParser', 
    'brease/controller/libs/Utils',
    'brease/controller/objects/ContentStatus'
],
function (SuperClass, Enum, BreaseEvent, widgetController, parser, controllerUtils, ContentStatus) {

    'use strict';

    /**
        * @class system.widgets.ContentLoader
        * @extends brease.core.BaseWidget
        * @iatMeta studio:visible
        * false
        * @iatMeta category:Category
        * System
        * @finalClass
        */
    var defaultSettings = {
            loadPolicy: Enum.LoadPolicy.IMMEDIATE,
            cachePolicy: Enum.CachePolicy.CACHE,
            busyTimeout: 1000
        },

        WidgetClass = SuperClass.extend(function ContentLoader() {
            SuperClass.apply(this, arguments);
        }, defaultSettings, true),

        p = WidgetClass.prototype;

    p.init = function init() {
        this.step = 0;
        this.isLoaded = false;
        this.loadQueue = [];
        if (this.settings.url && this.settings.loadPolicy === Enum.LoadPolicy.IMMEDIATE) {
            this.load(this.settings.url, this.settings.contentId);
        }
        this._defer('_dispatchReady');
    };

    /**
        * @method load
        * Load a content by url.
        * @param {String} url
        * @param {String} contentId
        */
    p.load = function load(url, contentId, force) {
        //console.log('%c' + this.elem.id + '.load(' + url + ',' + contentId + '),loaded=' + this.isLoaded, 'color:#cc00cc');
        if ((this.loadQueue.length === 0 || url !== this.loadQueue[0]) || force === true) {
            _removeListeners.call(this);
            this.contentComplete = false;
            this.loadQueue.unshift(url);
            var previousContentId = this.settings.contentId;
            var previousUrl = this.settings.url;
            this.settings.url = url;
            this.settings.contentId = contentId;
            this.loadFlag = true;
            if (this.isLoaded === true) {
                _unload.call(this, previousContentId, previousUrl).then(function _unloadSuccess(widget) {
                    _load.call(widget);
                });
            } else {
                _load.call(this);
            }
            this.el.attr('data-brease-contentid', contentId);
        }
    };

    function _removeListeners() {
        document.body.removeEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('suspendedListener'));
        document.body.removeEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('disposedListener'));
        document.body.removeEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('unloadListener'));
    }
    // called by the LoaderPool when ContentLoader is inserted into the
    // locker (documentFragment)
    p.onBeforeSuspend = function () {
        _removeListeners.call(this);
        widgetController.walkWidgetsInContent(this.settings.contentId, 'onBeforeSuspend');
    };
    p.suspend = function suspend() {
        //_removeListeners.call(this);
        //widgetController.walkWidgetsInContent(this.settings.contentId, 'onBeforeSuspend');

        if (this.isLoaded) {
            document.body.addEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('suspendedListener'));
        }
        _deactivateContent.call(this);

        this.loadQueue.length = 0;
        _clearTimer.call(this);
        this.suspended = true;
    };

    p.suspendedListener = function suspendedListener(e) {
        if (e.detail.contentId === this.settings.contentId) {
            _removeListeners.call(this);
            widgetController.suspendInContent(this.elem, this.settings.contentId);
            _hide.call(this);
            document.body.dispatchEvent(new CustomEvent(BreaseEvent.CONTENT_SUSPENDED, { detail: { contentId: this.settings.contentId } }));
        }
    };

    p.disposedListener = function disposedListener(e) {
        if (e.detail.contentId === this.settings.contentId) {
            _removeListeners.call(this);
            widgetController.disposeInContent(this.elem, this.settings.contentId);
            _hide.call(this);
            document.body.dispatchEvent(new CustomEvent(BreaseEvent.CONTENT_DISPOSED, { detail: { contentId: this.settings.contentId } }));
        }
    };

    p.unloadListener = function (e) {
        if (e.detail.contentId === this.settings.unloadContentId) {
            _removeListeners.call(this);
            this.isLoaded = false;
            widgetController.disposeInContent(this.elem, e.detail.contentId);
            this.el.empty();
            document.body.dispatchEvent(new CustomEvent(BreaseEvent.CONTENT_DISPOSED, { detail: { contentId: e.detail.contentId } }));
            if (this.unloadDeferred) {
                this.unloadDeferred.resolve(this);
            }
        }
    };

    // called by the LoaderPool before the flush method is called
    p.onBeforeDispose = function () {
        _removeListeners.call(this);
        widgetController.walkWidgetsInContent(this.settings.contentId, 'onBeforeDispose');
    };

    p.flush = function flush() {
        if (this.isLoaded) {
            var contentState = brease.uiController.bindingController.getContentState(this.settings.contentId);
            if (contentState === ContentStatus.active || contentState === ContentStatus.deactivatePending) {
                document.body.addEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('disposedListener'));
                if (contentState === ContentStatus.active) {
                    _deactivateContent.call(this); 
                }
            } else {
                this.disposedListener({ detail: { contentId: this.settings.contentId } });
            }
        } 
        this.isLoaded = false;
        this.suspended = false;
        this.loadQueue.length = 0;
        _hide.call(this);
        _reset.call(this);
    };

    p.wake = function wake() {
        var widget = this;
        //console.log('%c                        wake ' + this.elem.id + ' (' + this.settings.contentId + '),complete:' + this.contentComplete, 'color:#00dddd');
        if (this.contentComplete === true) {
            _removeListeners.call(this);
            widgetController.wakeInContent(this.settings.contentId);

            this.suspended = false;
            this.step = 0;
            $.when(
                brease.uiController.bindingController.activateContent(this.settings.contentId)
            ).then(function successHandler(contentId) {
                if (widget.step === 0) {
                    //console.log('activateContent.successHandler:contentId=' + contentId + '/' + widget.settings.contentId);
                    widget.step = 1;
                    _setVisible.call(widget, true);
                    if (contentId === widget.settings.contentId) {
                        brease.uiController.bindingController.sendInitialValues(widget.settings.contentId);
                        widget.dispatchEvent(new CustomEvent(BreaseEvent.FRAGMENT_SHOW, { detail: { url: widget.settings.url, contentId: widget.settings.contentId }, bubbles: true }));
                    }
                }
            }, function () {
                console.log('activateContent.fail');
            });
            widget.active = true;
        } else {
            this.load(this.settings.url, this.settings.contentId);
        }
    };

    p.dispose = function dispose() {
        this.loadFlag = false;
        _removeListeners.call(this);
        if (this.isLoaded === true) {
            widgetController.disposeInContent(this.elem, this.settings.contentId);
            _deactivateContent.call(this);
        }
        this.loadQueue.length = 0;
        _clearTimer.call(this);
        SuperClass.prototype.dispose.apply(this, arguments);
    };

    p.getContentId = function getContentId() {
        return this.settings.contentId;
    };

    p.getUrl = function getUrl() {
        return this.settings.url;
    };

    function _setVisible(flag) {
        if (this.el) {
            this.el.css('visibility', (flag) ? 'visible' : 'hidden');
            this.elem.dispatchEvent(new CustomEvent(BreaseEvent.VISIBILITY_CHANGED, { bubbles: false, detail: { visible: flag } }));
        }
    }

    function _contentReadyHandler() {
        var widget = this;
        if (this.step === 0) {
            this.step = 1;
            this.contentComplete = true;

            _setVisible.call(this, true);

            brease.uiController.bindingController.sendInitialValues(widget.settings.contentId, function initialValuesSuccess(contentId) {
                if (widget.settings.contentId === contentId) {
                    if (widget.elem) {
                        widget.dispatchEvent(new CustomEvent(BreaseEvent.FRAGMENT_SHOW, { detail: { url: widget.settings.url, contentId: widget.settings.contentId }, bubbles: true }));
                    }
                }
            });
        }
    }

    function _busyHandler() {
        this.el.html(brease.language.getSystemTextByKey('BR/IAT/brease.common.pageloading'));
    }

    function _clearTimer() {
        if (this.timer) {
            window.clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    function _deactivateContent() {
        //console.warn(this.elem.id + '._deactivateContent:' + this.settings.contentId + ',this.active=' + this.active);
        if (this.active) {
            this.active = false;
            this.step = -1;
            brease.appElem.dispatchEvent(new CustomEvent(BreaseEvent.BEFORE_HIDE, { detail: { id: this.elem.id, contentId: this.settings.contentId } }));
            brease.uiController.bindingController.deactivateContent(this.settings.contentId);
        }
    }

    function _hide() {
        this.loadFlag = false;
        _setVisible.call(this, false);
        /**
            * @event fragment_hide
            * Fired after content is set to hidden
            * @param {Object} detail
            * @param {String} detail.url URL of content
            * @param {String} detail.contentId id of content
            * @param {String} type {@link brease.events.BreaseEvent#static-property-FRAGMENT_HIDE BreaseEvent.FRAGMENT_HIDE}
            * @param {HTMLElement} target element of ContentLoader
            */
        _dispatchHide.call(this, this.settings.contentId, this.settings.url);
    }

    function _reset() {
        this.isLoaded = false;
        this.settings.url = undefined;
    }

    function _parseContent(elem) {

        var deferred = $.Deferred(),
            widget = this,
            listener = function parsedListener() {
                elem.removeEventListener(BreaseEvent.CONTENT_PARSED, listener);
                deferred.resolve(null);
            };
        elem.addEventListener(BreaseEvent.CONTENT_PARSED, listener);
        parser.parse(elem, false, widget.settings.contentId);

        return deferred.promise();
    }

    function _unload(contentId, url) {
        this.unloadDeferred = $.Deferred();
        brease.appElem.dispatchEvent(new CustomEvent(BreaseEvent.BEFORE_UNLOAD, { detail: { id: this.elem.id, contentId: contentId } }));
        brease.appElem.dispatchEvent(new CustomEvent(BreaseEvent.BEFORE_HIDE, { detail: { id: this.elem.id, contentId: contentId } }));
        _setVisible.call(this, false);
        _dispatchHide.call(this, contentId, url);
        this.settings.unloadContentId = contentId;
        _removeListeners.call(this);
        if (this.isLoaded) {
            if (brease.uiController.isContentActive(contentId)) {
                document.body.addEventListener(BreaseEvent.CONTENT_DEACTIVATED, this._bind('unloadListener'));
                brease.uiController.bindingController.deactivateContent(contentId);
            } else {
                this.unloadListener({ detail: { contentId: contentId } });
            }
        }

        return this.unloadDeferred.promise();
    }

    function _dispatchHide(contentId, url) {
        this.dispatchEvent(new CustomEvent(BreaseEvent.FRAGMENT_HIDE, { detail: { contentId: contentId, url: url } }));
    }

    function _load() {
        var widget = this;
        _clearTimer.call(this);
        widget.timer = window.setTimeout(widget._bind(_busyHandler), widget.settings.busyTimeout);

        if (brease.uiController.bindingController.isContentActive(widget.settings.contentId)) {
            _loadFail.call(this, { message: 'ContentActive' });
        } else {
            brease.pageController.loadHTML(widget.settings.url, [widget.settings.url]).done(widget._bind(_loadSuccess)).fail(widget._bind(_loadFail));
        }
    }

    function _loadSuccess(html, url) {
        var widget = this;

        if (this.elem && url === widget.loadQueue[0] && this.loadFlag === true) {

            _clearTimer.call(this);
            widget.loadQueue.length = 0;

            try {
                controllerUtils.appendHTML(widget.elem, html);
            } catch (e) {
                console.error(e);
                console.log('Content "' + widget.settings.contentId + '": error in brease.setOptions');
            }
            /**
                * @event fragment_loaded
                * Fired AFTER content is loaded and BEFORE it's parsed
                * @param {Object} detail
                * @param {String} detail.url URL of content
                * @param {String} detail.contentId id of content
                * @param {String} type {@link brease.events.BreaseEvent#static-property-FRAGMENT_LOADED BreaseEvent.FRAGMENT_LOADED}
                * @param {HTMLElement} target element of ContentLoader
                */
            widget.dispatchEvent(new CustomEvent(BreaseEvent.FRAGMENT_LOADED, { detail: { url: widget.settings.url, contentId: widget.settings.contentId }, bubbles: true }));
            widget.isLoaded = true;
            widget.step = 0;

            $.when(
                brease.uiController.bindingController.activateContent(widget.settings.contentId)
            ).then(widget._bind(_activateFinished), widget._bind(_activateFailed));

            this.active = true;
        }
    }

    function _activateFinished() {
        var widget = this;
        $.when(
            _parseContent.call(widget, widget.elem)
        ).then(widget._bind(_contentReadyHandler));
    }

    function _activateFailed() {
        /**
            * @event activate_error
            * Fired if an error occurs at activate content
            * @param {Object} detail
            * @param {String} detail.contentId id of content
            * @param {HTMLElement} target element of ContentLoader
            */
        this.dispatchEvent(new CustomEvent(BreaseEvent.CONTENT_ACTIVATE_ERROR, { detail: { contentId: this.settings.contentId }, bubbles: true }));
        this.el.html('ERROR: could not activate content "' + this.settings.contentId + '", check logger').css('visibility', 'visible');
    }

    function _loadFail(error) {
        var widget = this;
        _clearTimer.call(this);
        widget.isLoaded = false;
        /**
            * @event load_error
            * Fired if an error occurs at content loading
            * @param {Object} detail
            * @param {String} detail.url URL of content
            * @param {String} detail.contentId id of content
            * @param {String} type {@link brease.events.BreaseEvent#static-property-LOAD_ERROR BreaseEvent.LOAD_ERROR}
            * @param {HTMLElement} target element of ContentLoader
            */
        if (widget.elem && this.loadFlag === true) {
            widget.dispatchEvent(new CustomEvent(BreaseEvent.LOAD_ERROR, { detail: { url: widget.settings.url, contentId: widget.settings.contentId } }));
            widget.el.html('ERROR: could not load content with url=' + widget.settings.url).css('visibility', 'visible');
        }
        console.iatWarn('WARNING: could not load content in ContentLoader[' + ((widget.elem) ? widget.elem.id : '') + ']:' + error.message);
    }

    // override some methods of BaseWidget

    p.dispatchEvent = function dispatchEvent(e) {
        this.elem.dispatchEvent(e);
    };

    return WidgetClass;

});
