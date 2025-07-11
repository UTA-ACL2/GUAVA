class t {
    constructor() {
        this.listeners = {}
    }

    on(t, e, s) {
        if (this.listeners[t] || (this.listeners[t] = new Set), this.listeners[t].add(e), null == s ? void 0 : s.once) {
            const s = () => {
                this.un(t, s), this.un(t, e)
            };
            return this.on(t, s), s
        }
        return () => this.un(t, e)
    }

    un(t, e) {
        var s;
        null === (s = this.listeners[t]) || void 0 === s || s.delete(e)
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

function s(t, e) {
    const i = e.xmlns ? document.createElementNS(e.xmlns, t) : document.createElement(t);
    for (const [t, n] of Object.entries(e)) if ("children" === t) for (const [t, n] of Object.entries(e)) "string" == typeof n ? i.appendChild(document.createTextNode(n)) : i.appendChild(s(t, n)); else "style" === t ? Object.assign(i.style, n) : "textContent" === t ? i.textContent = n : i.setAttribute(t, n.toString());
    return i
}

function i(t, e, i) {
    const n = s(t, e || {});
    return null == i || i.appendChild(n), n
}

const n = {
    lineWidth: 1,
    labelSize: 11,
    formatTimeCallback: t => `${Math.floor(t / 60)}:${`0${Math.floor(t) % 60}`.slice(-2)}`
};

class r extends e {
    constructor(t) {
        super(t || {}), this.unsubscribe = () => {
        }, this.onPointerMove = t => {
            if (!this.wavesurfer) return;
            const e = this.wavesurfer.getWrapper().getBoundingClientRect(), {width: s} = e, i = t.clientX - e.left,
                n = Math.min(1, Math.max(0, i / s)), r = Math.min(s - this.options.lineWidth - 1, i);
            this.wrapper.style.transform = `translateX(${r}px)`, this.wrapper.style.opacity = "1";
            const o = this.wavesurfer.getDuration() || 0;
            this.label.textContent = this.options.formatTimeCallback(o * n);
            const a = this.label.offsetWidth;
            this.label.style.transform = r + a > s ? `translateX(-${a + this.options.lineWidth}px)` : "",

                // 计算 hover 线显示
                this.extraClones?.forEach(clone => {
                    const cloneContainer = clone.parentElement;
                    if (!cloneContainer) return;

                    // 主 wrapper 尺寸（参考基准）
                    const mainRect = this.wavesurfer.getWrapper().getBoundingClientRect();
                    const mainWidth = mainRect.width;

                    // 当前 clone 所在容器尺寸和偏移
                    const containerRect = cloneContainer.getBoundingClientRect();
                    const containerOffsetLeft = containerRect.left - mainRect.left;

                    // 统一的相对横坐标
                    const posX = Math.min(mainWidth - this.options.lineWidth - 1, t.clientX - mainRect.left);

                    // 位置计算：主 hover 坐标 - 容器偏移
                    const relativeX = posX - containerOffsetLeft;
                    clone.style.transform = `translateX(${relativeX}px)`;
                    clone.style.opacity = '1';

                    const label = clone.querySelector('span');
                    if (label) {
                        const duration = this.wavesurfer.getDuration() || 0;
                        const relRatio = posX / mainWidth;
                        const timeText = this.options.formatTimeCallback(duration * relRatio);
                        label.textContent = timeText;

                        const labelWidth = label.offsetWidth;
                        label.style.transform =
                            relativeX + labelWidth > containerRect.width
                                ? `translateX(-${labelWidth + this.options.lineWidth}px)`
                                : '';
                    }
                });


                this.emit("hover", n)
        }, this.onPointerLeave = () => {
            this.wrapper.style.opacity = "0",
                this.extraClones?.forEach(clone => {
                    clone.style.opacity = '0';
                });
        }, this.options = Object.assign({}, n, t), this.wrapper = i("div", {part: "hover"}), this.label = i("span", {part: "hover-label"}, this.wrapper), this.extraClones = []
    }

    static create(t) {
        return new r(t)
    }

    addUnits(t) {
        return `${t}${"number" == typeof t ? "px" : ""}`
    }

    onInit() {
        if (!this.wavesurfer) throw Error("WaveSurfer is not initialized");
        const t = this.wavesurfer.options, e = this.options.lineColor || t.cursorColor || t.progressColor;
        Object.assign(this.wrapper.style, {
            position: "absolute",
            zIndex: 10,
            left: 0,
            top: 0,
            height: "100%",
            pointerEvents: "none",
            borderLeft: `${this.addUnits(this.options.lineWidth)} solid ${e}`,
            opacity: "0",
            transition: "opacity .1s ease-in"
        }), Object.assign(this.label.style, {
            display: "block",
            backgroundColor: this.options.labelBackground,
            color: this.options.labelColor,
            fontSize: `${this.addUnits(this.options.labelSize)}`,
            transition: "transform .1s ease-in",
            padding: "2px 3px"
        });
        const s = this.wavesurfer.getWrapper();

        s.appendChild(this.wrapper), s.addEventListener("pointermove", this.onPointerMove), s.addEventListener("pointerleave", this.onPointerLeave), s.addEventListener("wheel", this.onPointerMove), this.unsubscribe = () => {
            s.removeEventListener("pointermove", this.onPointerMove), s.removeEventListener("pointerleave", this.onPointerLeave), s.removeEventListener("wheel", this.onPointerLeave)
        }
    }

    attachToContainer(container) {
        const clone = this.wrapper.cloneNode(true);
        container.style.position = 'relative';
        container.appendChild(clone);
        this.extraClones.push(clone)
    }



    destroy() {
        super.destroy(), this.unsubscribe(), this.wrapper.remove()
    }
}

export {r as default};
