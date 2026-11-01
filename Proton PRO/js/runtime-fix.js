/**
 * Proton PRO - Chrome MV3 Runtime LastError & Message Port Fix
 * Suppresses benign unchecked runtime.lastError errors when ports close or receivers are inactive.
 */
(function () {
    "use strict";

    const globalObj = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : self);
    const cr = globalObj.chrome;
    if (!cr || !cr.runtime) return;

    // Helper to clear unchecked lastError flag
    function clearLastError() {
        try {
            if (cr.runtime && cr.runtime.lastError) {
                void cr.runtime.lastError.message;
            }
        } catch (_) {}
    }

    // 1. Wrap chrome.runtime.sendMessage
    if (typeof cr.runtime.sendMessage === "function") {
        const origSendMessage = cr.runtime.sendMessage.bind(cr.runtime);
        cr.runtime.sendMessage = function (...args) {
            const lastIdx = args.length - 1;
            const cb = args[lastIdx];
            if (typeof cb === "function") {
                args[lastIdx] = function (...cbArgs) {
                    clearLastError();
                    try {
                        return cb.apply(this, cbArgs);
                    } finally {
                        clearLastError();
                    }
                };
                try {
                    return origSendMessage(...args);
                } catch (e) {
                    clearLastError();
                }
            } else {
                try {
                    const ret = origSendMessage(...args);
                    if (ret && typeof ret.catch === "function") {
                        ret.catch(() => {
                            clearLastError();
                        });
                    }
                    return ret;
                } catch (e) {
                    clearLastError();
                }
            }
        };
    }

    // 2. Wrap chrome.tabs.sendMessage if available
    if (cr.tabs && typeof cr.tabs.sendMessage === "function") {
        const origTabsSendMessage = cr.tabs.sendMessage.bind(cr.tabs);
        cr.tabs.sendMessage = function (...args) {
            const lastIdx = args.length - 1;
            const cb = args[lastIdx];
            if (typeof cb === "function") {
                args[lastIdx] = function (...cbArgs) {
                    clearLastError();
                    try {
                        return cb.apply(this, cbArgs);
                    } finally {
                        clearLastError();
                    }
                };
                try {
                    return origTabsSendMessage(...args);
                } catch (e) {
                    clearLastError();
                }
            } else {
                try {
                    const ret = origTabsSendMessage(...args);
                    if (ret && typeof ret.catch === "function") {
                        ret.catch(() => {
                            clearLastError();
                        });
                    }
                    return ret;
                } catch (e) {
                    clearLastError();
                }
            }
        };
    }

    // 3. Wrap chrome.runtime.onMessage.addListener to handle Promise-returning listeners in MV3
    if (cr.runtime.onMessage && typeof cr.runtime.onMessage.addListener === "function") {
        const origAddListener = cr.runtime.onMessage.addListener.bind(cr.runtime.onMessage);
        cr.runtime.onMessage.addListener = function (listener) {
            return origAddListener(function (message, sender, sendResponse) {
                let res;
                try {
                    res = listener.apply(this, arguments);
                } catch (err) {
                    clearLastError();
                    return false;
                }
                if (res instanceof Promise) {
                    if (typeof sendResponse === "function") {
                        res.then(val => {
                            try {
                                sendResponse(val);
                            } catch (_) {
                                clearLastError();
                            }
                        }).catch(err => {
                            try {
                                sendResponse({ error: (err && err.message) || err });
                            } catch (_) {
                                clearLastError();
                            }
                        });
                        return true;
                    }
                    return false;
                }
                return res;
            });
        };
    }
})();
