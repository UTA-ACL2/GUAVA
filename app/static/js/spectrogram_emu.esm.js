class t {
    constructor() {
        this.listeners = {}
    }

    on(t, e, i) {
        if (this.listeners[t] || (this.listeners[t] = new Set), this.listeners[t].add(e), null == i ? void 0 : i.once) {
            const i = () => {
                this.un(t, i), this.un(t, e)
            };
            return this.on(t, i), i
        }
        return () => this.un(t, e)
    }

    un(t, e) {
        var i;
        null === (i = this.listeners[t]) || void 0 === i || i.delete(e)
    }

    once(t, e) {
        return this.on(t, e, {once: !0})
    }

    unAll() {
        this.listeners = {}
    }

    emit(t, ...e) {
        this.listeners[t] && this.listeners[t].forEach((t => t(...e)))
    }
}

class e extends t {
    constructor(t) {
        super(), this.subscriptions = [], this.options = t
    }

    onInit() {
    }

    _init(t) {
        this.wavesurfer = t, this.onInit()
    }

    destroy() {
        this.emit("destroy"), this.subscriptions.forEach((t => t()))
    }
}

function i(t, e) {
    const r = e.xmlns ? document.createElementNS(e.xmlns, t) : document.createElement(t);
    for (const [t, n] of Object.entries(e)) if ("children" === t) for (const [t, n] of Object.entries(e)) "string" == typeof n ? r.appendChild(document.createTextNode(n)) : r.appendChild(i(t, n)); else "style" === t ? Object.assign(r.style, n) : "textContent" === t ? r.textContent = n : r.setAttribute(t, n.toString());
    return r
}

function r(t, e, r) {
    const n = i(t, e || {});
    return null == r || r.appendChild(n), n
}

function n(t) {
    t = t || window.Worker, this.url = this.getWorkerURL(), this.worker = new t(this.url)
}

n.prototype = {
    getWorkerScript: function () {
        var t = "";
        return t += "(" + this.workerInit + ")(this);"
    }, workerInit: function (t) {
        t.executed = !1, t.PI = 3.141592653589793, t.TWO_PI = 6.283185307179586, t.totalMax = 0, t.dynRangeInDB = 50, t.myWindow = {
            BARTLETT: 1,
            BARTLETTHANN: 2,
            BLACKMAN: 3,
            COSINE: 4,
            GAUSS: 5,
            HAMMING: 6,
            HANN: 7,
            LANCZOS: 8,
            RECTANGULAR: 9,
            TRIANGULAR: 10
        }, t.imgWidth = 0, t.imgHeight = 0, t.upperFreq = 0, t.lowerFreq = 0, t.pixelRatio = 1, t.heatMapColorAnchors = [[255, 0, 0], [0, 255, 0], [0, 0, 0]], t.samplesPerPxl = 0, t.sampleRate = 0, t.preEmphasisFilterFactor = .97, t.transparency = 0, t.drawHeatMapColors = !1, t.N = 0, t.windowSizeInSecs = .01, t.audioBuffer = void 0, t.audioBufferChannels = 0, t.wFunction = 0, t.myFFT = void 0, t.pixelHeight = 1, t.internalalpha = 1, t.maxPsd = 0, t.HzStep = 0, t.paint = [], t.sin = void 0, t.cos = void 0, t.ceilingFreqFftIdx = 0, t.floorFreqFftIdx = 0, t.resultImgArr = void 0, t.toLinearLevel = function (t) {
            return Math.pow(10, t / 10)
        }, t.log10 = function (t) {
            return Math.log(t) / 2.302585092994046
        }, t.magnitude = function (t, e) {
            return Math.sqrt(t * t + e * e)
        }, t.FFT = function () {
            var e, i, r, n = t.N;
            if (e = parseInt(Math.log(n) / .6931471805599453, 10), void 0 === t.cos || n !== t.N) for (t.cos = new Float32Array(n / 2), r = 0; r < n / 2; r++) t.cos[r] = Math.cos(-2 * t.PI * r / n);
            if (void 0 === t.sin || n !== t.N) for (t.sin = new Float32Array(n / 2), r = 0; r < n / 2; r++) t.sin[r] = Math.sin(-2 * t.PI * r / n);
            this.applyWindowFuncAndPreemph = function (e, r, n, a) {
                switch (this.alpha = r, e) {
                    case t.myWindow.BARTLETT:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionBartlett(a, i);
                        break;
                    case t.myWindow.BARTLETTHANN:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionBartlettHann(a, i);
                        break;
                    case t.myWindow.BLACKMAN:
                        for (this.alpha = this.alpha || .16, i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionBlackman(a, i, r);
                        break;
                    case t.myWindow.COSINE:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionCosine(a, i);
                        break;
                    case t.myWindow.GAUSS:
                        for (this.alpha = this.alpha || .25, i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionGauss(a, i, r);
                        break;
                    case t.myWindow.HAMMING:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionHamming(a, i);
                        break;
                    case t.myWindow.HANN:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionHann(a, i);
                        break;
                    case t.myWindow.LANCZOS:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionLanczos(a, i);
                        break;
                    case t.myWindow.RECTANGULAR:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionRectangular(a, i);
                        break;
                    case t.myWindow.TRIANGULAR:
                        for (i = 0; i < a; i++) i > 0 && (n[i] = this.applyPreEmph(n[i], n[i - 1])), n[i] *= this.wFunctionTriangular(a, i)
                }
                return n
            }, this.wFunctionBartlett = function (t, e) {
                return 2 / (t - 1) * ((t - 1) / 2 - Math.abs(e - (t - 1) / 2))
            }, this.wFunctionBartlettHann = function (e, i) {
                return .62 - .48 * Math.abs(i / (e - 1) - .5) - .38 * Math.cos(t.TWO_PI * i / (e - 1))
            }, this.wFunctionBlackman = function (e, i, r) {
                var n = r / 2;
                return (1 - r) / 2 - .5 * Math.cos(t.TWO_PI * i / (e - 1)) + n * Math.cos(4 * t.PI * i / (e - 1))
            }, this.wFunctionCosine = function (e, i) {
                return Math.cos(t.PI * i / (e - 1) - t.PI / 2)
            }, this.wFunctionGauss = function (t, e, i) {
                return Math.pow(Math.E, -.5 * Math.pow((e - (t - 1) / 2) / (i * (t - 1) / 2), 2))
            }, this.wFunctionHamming = function (e, i) {
                return .54 - .46 * Math.cos(t.TWO_PI * i / (e - 1))
            }, this.wFunctionHann = function (e, i) {
                return .5 * (1 - Math.cos(t.TWO_PI * i / (e - 1)))
            }, this.wFunctionLanczos = function (e, i) {
                var r = 2 * i / (e - 1) - 1;
                return Math.sin(t.PI * r) / (t.PI * r)
            }, this.wFunctionRectangular = function () {
                return 1
            }, this.wFunctionTriangular = function (t, e) {
                return 2 / t * (t / 2 - Math.abs(e - (t - 1) / 2))
            }, this.applyPreEmph = function (e, i) {
                return e - t.preEmphasisFilterFactor * i
            }, this.fft = function (i, r) {
                var a, s, o, h, l, p, c, d, u, w;
                for (s = 0, l = n / 2, a = 1; a < n - 1; a++) {
                    for (h = l; s >= h;) s -= h, h /= 2;
                    a < (s += h) && (u = i[a], i[a] = i[s], i[s] = u, u = r[a], r[a] = r[s], r[s] = u)
                }
                for (h = 0, l = 1, a = 0; a < e; a++) for (h = l, l += l, p = 0, s = 0; s < h; s++) for (c = t.cos[p], d = t.sin[p], p += 1 << e - a - 1, o = s; o < n; o += l) u = c * i[o + h] - d * r[o + h], w = d * i[o + h] + c * r[o + h], i[o + h] = i[o] - u, r[o + h] = r[o] - w, i[o] = i[o] + u, r[o] = r[o] + w
            }
        }, t.convertToHeatmap = function (t, e, i, r) {
            var n = r.length - 1, a = (i - t) / (e - t) * n, s = Math.floor(a),
                o = Math.min.apply(null, [Math.floor(a) + 1, n]), h = r[s], l = r[o], p = a - s;
            return {
                r: Math.floor(h[0] + p * (l[0] - h[0])),
                g: Math.floor(h[1] + p * (l[1] - h[1])),
                b: Math.floor(h[2] + p * (l[2] - h[2]))
            }
        }, t.drawVerticalLineOfSpectogram = function (e) {
            var i, r, n = t.pixelHeight, a = 2 * Math.pow(t.paint[e][1], 2) / t.N, s = 10 * t.log10(a / t.maxPsd),
                o = (s + t.dynRangeInDB) / t.dynRangeInDB;
            o > 1 ? o = 1 : o < 0 && (o = 0);
            for (var h = 0; h < t.paint[e].length; h++) {
                var l = o;
                a = 2 * Math.pow(t.paint[e][h], 2) / t.N, (o = ((s = 10 * t.log10(a / t.maxPsd)) + t.dynRangeInDB) / t.dynRangeInDB) > 1 && (o = 1), o < 0 && (o = 0);
                var p = o;
                if (t.pixelHeight >= 1) for (var c = 0; c < t.pixelHeight; c++) {
                    var d = l + (p - l) / n * c;
                    if (i = t.invert ? Math.round(255 * d) : 255 - Math.round(255 * d), r = 4 * (Math.floor(e) + Math.floor(t.imgHeight - (t.pixelHeight * (h - 2) + c)) * t.imgWidth), t.drawHeatMapColors) if (isNaN(i)) t.resultImgArr[r + 0] = i, t.resultImgArr[r + 1] = i, t.resultImgArr[r + 2] = i, t.resultImgArr[r + 3] = t.transparency; else {
                        var u = t.convertToHeatmap(0, 255, i, t.heatMapColorAnchors);
                        t.resultImgArr[r + 0] = u.r, t.resultImgArr[r + 1] = u.g, t.resultImgArr[r + 2] = u.b, t.resultImgArr[r + 3] = t.transparency
                    } else t.resultImgArr[r + 0] = i, t.resultImgArr[r + 1] = i, t.resultImgArr[r + 2] = i, t.resultImgArr[r + 3] = t.transparency
                } else i = 255 - Math.round(255 * p), r = 4 * (Math.floor(e) + Math.floor(t.imgHeight - t.pixelHeight * (h - 2)) * t.imgWidth), t.resultImgArr[r + 0] = i, t.resultImgArr[r + 1] = i, t.resultImgArr[r + 2] = i, t.resultImgArr[r + 3] = t.transparency
            }
        }, t.calcMagnitudeSpectrum = function (e, i) {
            for (var r = new Float32Array(t.N), n = new Float32Array(t.N), a = new Float32Array(t.ceilingFreqFftIdx - t.floorFreqFftIdx), s = 0; s < i; s++) n[s] = t.audioBuffer[e + s];
            t.myFFT.applyWindowFuncAndPreemph(t.wFunction, t.internalalpha, n, i), t.myFFT.fft(n, r);
            for (var o = 0; o <= t.ceilingFreqFftIdx - t.floorFreqFftIdx; o++) a[o] = t.magnitude(n[o + t.floorFreqFftIdx], r[o + t.floorFreqFftIdx]), t.totalMax < a[o] && (t.totalMax = a[o]);
            return a
        }, t.renderSpectrogram = function () {
            if (!t.executed) {
                t.executed = !0;
                var e = t.sampleRate * t.windowSizeInSecs;
                t.myFFT = new t.FFT, t.paint = new Array(t.imgWidth), t.HzStep = t.sampleRate / 2 / (t.N / 2), t.ceilingFreqFftIdx = Math.ceil(t.upperFreq / t.HzStep), t.floorFreqFftIdx = Math.floor(t.lowerFreq / t.HzStep), t.pixelHeight = t.imgHeight / (t.ceilingFreqFftIdx - t.floorFreqFftIdx - 2), "undefined" == typeof Uint8ClampedArray && (Uint8ClampedArray = Uint8Array), t.resultImgArr = new Uint8ClampedArray(Math.ceil(t.imgWidth * t.imgHeight * 4));
                for (var i = 0; i < t.imgWidth; i++) t.paint[i] = t.calcMagnitudeSpectrum(Math.round(i * t.samplesPerPxl), e), t.maxPsd = 2 * Math.pow(t.totalMax, 2) / t.N;
                for (var r = 0; r < t.imgWidth; r++) t.drawVerticalLineOfSpectogram(r);
                t.postMessage({
                    window: t.wFunction,
                    samplesPerPxl: t.samplesPerPxl,
                    pixelHeight: t.pixelHeight,
                    pixelRatio: t.pixelRatio,
                    width: t.imgWidth,
                    height: t.imgHeight,
                    img: t.resultImgArr.buffer
                }, [t.resultImgArr.buffer]), t.myFFT = null, t.executed = !1
            }
        }, t.onmessage = function (e) {
            if (void 0 !== e.data) {
                var i = !0, r = "", n = e.data;
                if (void 0 !== n.windowSizeInSecs ? t.windowSizeInSecs = n.windowSizeInSecs : (r = "windowSizeInSecs", i = !1), void 0 !== n.fftN ? t.N = n.fftN : (r = "fftN", i = !1), void 0 !== n.alpha ? t.internalalpha = n.alpha : (r = "alpha", i = !1), void 0 !== n.upperFreq ? t.upperFreq = n.upperFreq : (r = "upperFreq", i = !1), void 0 !== n.lowerFreq ? t.lowerFreq = n.lowerFreq : (r = "lowerFreq", i = !1), void 0 !== n.samplesPerPxl ? t.samplesPerPxl = n.samplesPerPxl : (r = "samplesPerPxl", i = !1), void 0 !== n.window) switch (n.window) {
                    case 1:
                        t.wFunction = t.myWindow.BARTLETT;
                        break;
                    case 2:
                        t.wFunction = t.myWindow.BARTLETTHANN;
                        break;
                    case 3:
                        t.wFunction = t.myWindow.BLACKMAN;
                        break;
                    case 4:
                        t.wFunction = t.myWindow.COSINE;
                        break;
                    case 5:
                        t.wFunction = t.myWindow.GAUSS;
                        break;
                    case 6:
                        t.wFunction = t.myWindow.HAMMING;
                        break;
                    case 7:
                        t.wFunction = t.myWindow.HANN;
                        break;
                    case 8:
                        t.wFunction = t.myWindow.LANCZOS;
                        break;
                    case 9:
                        t.wFunction = t.myWindow.RECTANGULAR;
                        break;
                    case 10:
                        t.wFunction = t.myWindow.TRIANGULAR
                } else r = "window", i = !1;
                void 0 !== n.imgWidth ? t.imgWidth = n.imgWidth : (r = "imgWidth", i = !1), void 0 !== n.imgHeight ? t.imgHeight = n.imgHeight : (r = "imgHeight", i = !1), void 0 !== n.dynRangeInDB ? t.dynRangeInDB = n.dynRangeInDB : (r = "dynRangeInDB", i = !1), void 0 !== n.pixelRatio ? t.pixelRatio = n.pixelRatio : (r = "pixelRatio", i = !1), void 0 !== n.sampleRate ? t.sampleRate = n.sampleRate : (r = "sampleRate", i = !1), void 0 !== n.audioBufferChannels ? t.audioBufferChannels = n.audioBufferChannels : (r = "audioBufferChannels", i = !1), void 0 !== n.transparency ? t.transparency = n.transparency : (r = "transparency", i = !1), void 0 !== n.audioBuffer ? t.audioBuffer = n.audioBuffer : (r = "audioBuffer", i = !1), void 0 !== n.drawHeatMapColors ? t.drawHeatMapColors = n.drawHeatMapColors : (r = "drawHeatMapColors", i = !1), void 0 !== n.preEmphasisFilterFactor ? t.preEmphasisFilterFactor = n.preEmphasisFilterFactor : (r = "preEmphasisFilterFactor", i = !1), void 0 !== n.heatMapColorAnchors ? t.heatMapColorAnchors = n.heatMapColorAnchors : (r = "heatMapColorAnchors", i = !1), void 0 !== n.invert ? t.invert = n.invert : (r = "invert", i = !1), i ? t.renderSpectrogram() : t.postMessage({
                    status: {
                        type: "ERROR",
                        message: r + " is undefined"
                    }
                })
            } else t.postMessage({
                status: {
                    type: "ERROR",
                    message: "Undefined message was sent to spectroDrawingWorker"
                }
            })
        }
    }, getWorkerURL: function () {
        var t;
        try {
            t = new Blob([this.getWorkerScript()], {type: "application/javascript"})
        } catch (e) {
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder, (t = new BlobBuilder).append(n), t = t.getBlob()
        }
        return "object" != typeof URL && "undefined" != typeof webkitURL ? webkitURL.createObjectURL(t) : URL.createObjectURL(t)
    }, kill: function () {
        this.worker && this.worker.terminate(), this.url && ("object" != typeof URL && "undefined" != typeof webkitURL ? webkitURL.revokeObjectURL(this.url) : URL.revokeObjectURL(this.url))
    }, tell: function (t) {
        this.worker && this.worker.postMessage(t)
    }, says: function (t) {
        this.worker && this.worker.addEventListener("message", (function (e) {
            t(e.data)
        }))
    }
};
const a = {
    insertPosition: "afterend",
    height: 100,
    channel: 0,
    windowSizeInSecs: .005,
    lowerFreq: 0,
    alpha: .16,
    window: "hamming",
    dynRangeInDB: 70,
    preEmphasisFilterFactor: .97,
    transparency: 255,
    drawHeatMapColors: !1,
    heatMapColorAnchors: [[255, 0, 0], [0, 255, 0], [0, 0, 0]],
    invert: !1
};

class s extends e {
    static create(t) {
        return new s(t || {})
    }

    constructor(t) {
        switch (super(t || {}), this.options = Object.assign({}, a, t), this.windowNum = 6, this.options.window) {
            case"bartlett":
                this.windowNum = 1;
                break;
            case"bartletthann":
                this.windowNum = 2;
                break;
            case"blackman":
                this.windowNum = 3;
                break;
            case"cosine":
                this.windowNum = 4;
                break;
            case"gauss":
                this.windowNum = 5;
                break;
            case"hamming":
                this.windowNum = 6;
                break;
            case"hann":
                this.windowNum = 7;
                break;
            case"lanczos":
                this.windowNum = 8;
                break;
            case"rectangular":
                this.windowNum = 9;
                break;
            case"triangular":
                this.windowNum = 10;
                break;
            default:
                throw new Error("Unknown window type: " + this.options.window)
        }
        this.createWrapper(), this.createCanvas(), this.imageData = this.spectrCc.createImageData(this.canvas.width, this.canvas.height), this.spectroWorker = new n, this.update_needed = !1, this.old_sS = -1, this.old_eS = -1, this.terminated = !1
    }

    onInit() {
        var t, e;
        if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
        this.options.container ? ("string" == typeof this.options.container ? this.container = document.querySelector(this.options.container) : this.options.container instanceof HTMLElement && (this.container = this.options.container), null === (t = this.container) || void 0 === t || t.appendChild(this.wrapper)) : (this.container = this.wavesurfer.getWrapper().parentElement, null === (e = this.container) || void 0 === e || e.insertAdjacentElement(this.options.insertPosition, this.wrapper)), this.spectroWorker.says((t => {
            this.imageData.width == this.canvas.width && this.imageData.height == this.canvas.height || (this.imageData = this.spectrCc.createImageData(this.canvas.width, this.canvas.height));
            let e = new Uint8ClampedArray(t.img);
            this.imageData.data.set(e), this.spectrCc.putImageData(this.imageData, 0, 0), window.requestAnimationFrame((() => {
                this.render()
            }))
        })), this.subscriptions.push(this.wavesurfer.on("redraw", (() => {
            this.update_needed = !0
        }))), this.subscriptions.push(this.wavesurfer.on("scroll", (() => {
            this.update_needed = !0
        }))), this.subscriptions.push(this.wavesurfer.on("ready", (() => {
            this.update_needed = !0
        }))), window.requestAnimationFrame((() => {
            this.render()
        }))
    }

    destroy() {
        this.terminated = !0, this.unAll(), this.wavesurfer = null, this.util = null, this.options = null, this.wrapper && (this.wrapper.remove(), this.wrapper = null), this.spectroWorker.kill(), this.spectroWorker = null, super.destroy()
    }

    createWrapper() {
        this.wrapper = r("div", {
            part: "spectrogram-emu",
            style: {width: "100%", height: this.options.height + "px"}
        }), this.wrapper.addEventListener("click", this._onWrapperClick)
    }

    createCanvas() {
        this.canvas = r("canvas", {
            style: {
                position: "relative",
                width: "100%",
                height: "100%"
            }
        }, this.wrapper), this.spectrCc = this.canvas.getContext("2d")
    }

    calcClosestPowerOf2Gt(t) {
        for (var e = 0; Math.pow(2, e) < t;) e += 1;
        return Math.pow(2, e)
    }

    render() {
    if (this.terminated) return;

    const now = performance.now();  // new code

    // FPS Control
    const frameInterval = 1000 / 30; // 30 FPS
    if (this.lastRenderTime && now - this.lastRenderTime < frameInterval) {
        window.requestAnimationFrame(() => this.render());
        return;
    }
    this.lastRenderTime = now;

    // Check if decodedData is ready
    const decodedData = this.wavesurfer.getDecodedData();
    if (!decodedData) {
        this.update_needed = false;
        window.requestAnimationFrame(() => this.render());
        return;
    }

    // Calculating viewport extents
    const { scrollLeft, scrollWidth, clientWidth } = this.wavesurfer.renderer.scrollContainer;
    const nS = decodedData.length;
    const sS = Math.floor(scrollLeft / scrollWidth * nS);
    const eS = Math.floor((scrollLeft + clientWidth) / scrollWidth * nS);

    // If the viewport has not changed, no need to redraw
    if (sS === this.old_sS && eS === this.old_eS && !this.update_needed) {
        window.requestAnimationFrame(() => this.render());
        return;
    }
    this.old_sS = sS;
    this.old_eS = eS;
    this.update_needed = false;  // Reset update_needed

    // Resize canvas only when really needed
    const wrapperWidth = this.wrapper.offsetWidth;
    const wrapperHeight = this.wrapper.offsetHeight;
    if (this.canvas.width !== wrapperWidth || this.canvas.height !== wrapperHeight) {
        this.canvas.width = wrapperWidth;
        this.canvas.height = wrapperHeight;
        this.imageData = this.spectrCc.createImageData(this.canvas.width, this.canvas.height);
    }

    // Get Audio Data
    const buffer = decodedData.getChannelData(this.options.channel);
    const sampleRate = decodedData.sampleRate;
    const windowSizeInSecs = this.options.windowSizeInSecs;
    let fftN = this.calcClosestPowerOf2Gt(sampleRate * windowSizeInSecs);
    if (fftN < 512) fftN = 512;

    const windowSizeInSamples = windowSizeInSecs * sampleRate;
    const samplesPerPxl = (eS + 1 - sS) / this.canvas.width;

    // === Padding logic ===
    const left_padding = sS > windowSizeInSamples / 2 ? buffer.subarray(sS - windowSizeInSamples / 2, sS) : [];
    const right_padding = eS + fftN / 2 - 1 < buffer.length ? buffer.subarray(eS, eS + fftN / 2 - 1) : [];
    const data = buffer.subarray(sS, eS);

    const paddedSamples = new Float32Array(left_padding.length + data.length + right_padding.length);
    paddedSamples.set(left_padding);
    paddedSamples.set(data, left_padding.length);
    paddedSamples.set(right_padding, left_padding.length + data.length);

    // Calculate upperFreq
    const upperFreq = this.options.upperFreq || sampleRate / 2;

    // Call worker to draw
    this.spectroWorker.tell({
        windowSizeInSecs: windowSizeInSecs,
        fftN: fftN,
        alpha: this.options.alpha,
        upperFreq: upperFreq,
        lowerFreq: this.options.lowerFreq,
        samplesPerPxl: samplesPerPxl,
        window: this.windowNum,
        imgWidth: this.canvas.width,
        imgHeight: this.canvas.height,
        dynRangeInDB: this.options.dynRangeInDB,
        pixelRatio: window.devicePixelRatio,
        sampleRate: sampleRate,
        transparency: this.options.transparency,
        audioBuffer: paddedSamples,
        audioBufferChannels: 1,
        drawHeatMapColors: this.options.drawHeatMapColors,
        preEmphasisFilterFactor: this.options.preEmphasisFilterFactor,
        heatMapColorAnchors: this.options.heatMapColorAnchors,
        invert: this.options.invert,
    }, [paddedSamples.buffer]);

    // Continuous animation loop
    window.requestAnimationFrame(() => this.render());
}

}

export {s as default};
