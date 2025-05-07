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
    const n = e.xmlns ? document.createElementNS(e.xmlns, t) : document.createElement(t);
    for (const [t, s] of Object.entries(e)) if ("children" === t) for (const [t, s] of Object.entries(e)) "string" == typeof s ? n.appendChild(document.createTextNode(s)) : n.appendChild(i(t, s)); else "style" === t ? Object.assign(n.style, s) : "textContent" === t ? n.textContent = s : n.setAttribute(t, s.toString());
    return n
}

function n(t, e, n) {
    return i(t, e || {})
}

const s = {
    height: 20, timeOffset: 0, formatTimeCallback: t => {
        if (t / 60 > 1) {
            return `${Math.floor(t / 60)}:${`${(t = Math.round(t % 60)) < 10 ? "0" : ""}${t}`}`
        }
        return `${Math.round(1e3 * t) / 1e3}`
    }
};

class r extends e {


    constructor(t) {
        super(t || {}), this.options = Object.assign({}, s, t), this.timelineWrapper = this.initTimelineWrapper(),
            this.timelineTicks = []; // 用于集中管理所有 tick DOM 元素
    }

    static create(t) {
        return new r(t)
    }

    onInit() {
        var t;
        if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
        let e = this.wavesurfer.getWrapper();
        if (this.options.container instanceof HTMLElement) e = this.options.container; else if ("string" == typeof this.options.container) {
            const t = document.querySelector(this.options.container);
            if (!t) throw Error(`No Timeline container found matching ${this.options.container}`);
            e = t
        }
        this.options.insertPosition ? (e.firstElementChild || e).insertAdjacentElement(this.options.insertPosition, this.timelineWrapper) : e.appendChild(this.timelineWrapper), this.subscriptions.push(this.wavesurfer.on("redraw", (() => this.initTimeline()))), ((null === (t = this.wavesurfer) || void 0 === t ? void 0 : t.getDuration()) || this.options.duration) && this.initTimeline()
    }

    destroy() {
        this.timelineWrapper.remove(), super.destroy()
    }

    initTimelineWrapper() {
        return n("div", {part: "timeline-wrapper", style: {pointerEvents: "none"}})
    }

    defaultTimeInterval(pixelsPerSecond) {
        if (pixelsPerSecond > 500) return 0.01;
        if (pixelsPerSecond > 200) return 0.05;
        if (pixelsPerSecond > 100) return 0.1;
        if (pixelsPerSecond > 50) return 0.2;
        if (pixelsPerSecond > 20) return 0.5;
        if (pixelsPerSecond > 10) return 1;
        return 5;
    }


    defaultPrimaryLabelInterval(t) {
        return t >= 25 ? 10 : 5 * t >= 25 ? 6 : 4
    }

    defaultSecondaryLabelInterval(t) {
        return t >= 25 ? 5 : 2
    }

    virtualAppend(x, tickEl) {
        tickEl.dataset.tickLeft = x; // 存 px 位置
        tickEl.style.left = `${x}px`;
        this.timelineTicks.push(tickEl); // 暂存，不立即 append
    }



    initTimeline() {
        this.timelineTicks = []; // 清空旧的 tick 缓存

        var t, e, i, s, r, o, l, a;
        const h = null !== (i = null !== (e = null === (t = this.wavesurfer) || void 0 === t ? void 0 : t.getDuration()) && void 0 !== e ? e : this.options.duration) && void 0 !== i ? i : 0;
        // p = ((null === (s = this.wavesurfer) || void 0 === s ? void 0 : s.getWrapper().scrollWidth) || this.timelineWrapper.scrollWidth) / h,
        // u = null !== (r = this.options.timeInterval) && void 0 !== r ? r : this.defaultTimeInterval(p),
        const p = ((this.wavesurfer?.getWrapper().scrollWidth || this.timelineWrapper.scrollWidth) / h);
        let timeStep;
        if (p > 3000) timeStep = 0.001;
        else if (p > 2000) timeStep = 0.002;
        else if (p > 1000) timeStep = 0.005;
        else if (p > 600)  timeStep = 0.01;
        else if (p > 400) timeStep = 0.02;
        else if (p > 300) timeStep = 0.05;
        else if (p > 200) timeStep = 0.1;
        else if (p > 100) timeStep = 0.2;
        else if (p > 40) timeStep = 0.5;
        else if (p > 20) timeStep = 1;
        else if (p > 10) timeStep = 2;
        else timeStep = 5;

        const u = this.options.timeInterval ?? timeStep,

            c = null !== (o = this.options.primaryLabelInterval) && void 0 !== o ? o : this.defaultPrimaryLabelInterval(p),
            d = this.options.primaryLabelSpacing,
            f = null !== (l = this.options.secondaryLabelInterval) && void 0 !== l ? l : this.defaultSecondaryLabelInterval(p),
            v = this.options.secondaryLabelSpacing, m = "beforebegin" === this.options.insertPosition, y = n("div", {
                style: Object.assign({
                    height: `${this.options.height}px`,
                    overflow: "hidden",
                    fontSize: this.options.height / 2 + "px",
                    whiteSpace: "nowrap"
                }, m ? {position: "absolute", top: "0", left: "0", right: "0", zIndex: "2"} : {position: "relative"})
            });
        y.setAttribute("part", "timeline"), "string" == typeof this.options.style ? y.setAttribute("style", y.getAttribute("style") + this.options.style) : "object" == typeof this.options.style && Object.assign(y.style, this.options.style);
        const b = n("div", {
            style: {
                width: "0",
                height: "50%",
                display: "flex",
                flexDirection: "column",
                justifyContent: m ? "flex-start" : "flex-end",
                top: m ? "0" : "auto",
                bottom: m ? "auto" : "0",
                overflow: "visible",
                borderLeft: "1px solid currentColor",
                opacity: `${null !== (a = this.options.secondaryLabelOpacity) && void 0 !== a ? a : .25}`,
                position: "absolute",
                zIndex: "1"
            }
        });
        const minSpacingPx = 30;
        let lastDrawnPx = -Infinity;

        for (let t = 0, e = 0; t <= h; t = Math.round((t + u) * 1000) / 1000, e++) {
            const px = (t + this.options.timeOffset) * p;
            if (px - lastDrawnPx < minSpacingPx) continue;
            lastDrawnPx = px;

            const i = b.cloneNode(), n = e % c === 0,
                s = e % f === 0;


            if (n) {
                i.style.height = "100%";
                i.style.textIndent = "3px";
                i.textContent = this.options.formatTimeCallback(t);
                i.style.opacity = "1";

                i.setAttribute("part", "timeline-notch timeline-notch-primary");
                this.virtualAppend(px, i); //  只缓存，不 append
            }



        }
        const updateVisibleTicks = () => {
            const scrollLeft = this.wavesurfer.getScroll();
            const scrollRight = scrollLeft + this.wavesurfer.getWidth();

            this.timelineTicks.forEach(tick => {
                const x = parseFloat(tick.dataset.tickLeft);
                const inView = x >= scrollLeft && x <= scrollRight;

                if (inView && !tick.isConnected) {
                    y.appendChild(tick);
                } else if (!inView && tick.isConnected) {
                    tick.remove();
                }
            });
        };

        // 初始执行一次
        const unsub = this.wavesurfer.on("scroll", updateVisibleTicks);
        this.subscriptions.push(unsub);

        this.timelineWrapper.innerHTML = "",updateVisibleTicks();  this.timelineWrapper.appendChild(y), this.emit("ready")
    }
}

export {r as default};
