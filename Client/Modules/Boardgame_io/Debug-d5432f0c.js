import { e as error, s as sync, M as MAKE_MOVE } from './reducer-ccb19701.js';
import { stringify, parse } from 'https://unpkg.com/flatted@2.0.2/esm/index.js';
import { M as MCTSBot, R as RandomBot, S as Step } from './ai-19aa8c0b.js';

function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, callback) {
    const unsub = store.subscribe(callback);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
        : ctx.$$scope.ctx;
}
function get_slot_changes(definition, ctx, changed, fn) {
    return definition[1]
        ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
        : ctx.$$scope.changed || {};
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
let running = false;
function run_tasks() {
    tasks.forEach(task => {
        if (!task[0](now())) {
            tasks.delete(task);
            task[1]();
        }
    });
    running = tasks.size > 0;
    if (running)
        raf(run_tasks);
}
function loop(fn) {
    let task;
    if (!running) {
        running = true;
        raf(run_tasks);
    }
    return {
        promise: new Promise(fulfil => {
            tasks.add(task = [fn, fulfil]);
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else
        node.setAttribute(attribute, value);
}
function to_number(value) {
    return value === '' ? undefined : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function select_option(select, value) {
    for (let i = 0; i < select.options.length; i += 1) {
        const option = select.options[i];
        if (option.__value === value) {
            option.selected = true;
            return;
        }
    }
}
function select_value(select) {
    const selected_option = select.querySelector(':checked') || select.options[0];
    return selected_option && selected_option.__value;
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = current_component;
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function flush() {
    const seen_callbacks = new Set();
    do {
        // first, call beforeUpdate functions
        // and update components
        while (dirty_components.length) {
            const component = dirty_components.shift();
            set_current_component(component);
            update(component.$$);
        }
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                callback();
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
}
function update($$) {
    if ($$.fragment) {
        $$.update($$.dirty);
        run_all($$.before_update);
        $$.fragment.p($$.dirty, $$.ctx);
        $$.dirty = null;
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined' ? window : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    if (component.$$.fragment) {
        run_all(component.$$.on_destroy);
        component.$$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        component.$$.on_destroy = component.$$.fragment = null;
        component.$$.ctx = {};
    }
}
function make_dirty(component, key) {
    if (!component.$$.dirty) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty = blank_object();
    }
    component.$$.dirty[key] = true;
}
function init(component, options, instance, create_fragment, not_equal, prop_names) {
    const parent_component = current_component;
    set_current_component(component);
    const props = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props: prop_names,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty: null
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, props, (key, ret, value = ret) => {
            if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                if ($$.bound[key])
                    $$.bound[key](value);
                if (ready)
                    make_dirty(component, key);
            }
            return ret;
        })
        : props;
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment($$.ctx);
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}

/* src/client/debug/Menu.svelte generated by Svelte v3.12.1 */

function add_css() {
	var style = element("style");
	style.id = 'svelte-19bfq8g-style';
	style.textContent = ".menu.svelte-19bfq8g{display:flex;margin-top:-10px;flex-direction:row;border:1px solid #ccc;border-radius:5px 5px 0 0;height:25px;line-height:25px;margin-right:-500px;transform-origin:bottom right;transform:rotate(-90deg) translate(0, -500px)}.menu-item.svelte-19bfq8g{line-height:25px;cursor:pointer;background:#fefefe;color:#555;padding-left:15px;padding-right:15px;text-align:center}.menu-item.svelte-19bfq8g:last-child{border-radius:0 5px 0 0}.menu-item.svelte-19bfq8g:first-child{border-radius:5px 0 0 0}.menu-item.active.svelte-19bfq8g{cursor:default;font-weight:bold;background:#ddd;color:#555}.menu-item.svelte-19bfq8g:hover{background:#ddd;color:#555}";
	append(document.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.key = list[i][0];
	child_ctx.label = list[i][1].label;
	return child_ctx;
}

// (55:2) {#each Object.entries(panes).reverse() as [key, {label}
function create_each_block(ctx) {
	var div, t0_value = ctx.label + "", t0, t1, dispose;

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div, "class", "menu-item svelte-19bfq8g");
			toggle_class(div, "active", ctx.pane == ctx.key);
			dispose = listen(div, "click", click_handler);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.panes) && t0_value !== (t0_value = ctx.label + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.pane || changed.panes)) {
				toggle_class(div, "active", ctx.pane == ctx.key);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			dispose();
		}
	};
}

function create_fragment(ctx) {
	var div;

	let each_value = Object.entries(ctx.panes).reverse();

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "menu svelte-19bfq8g");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p(changed, ctx) {
			if (changed.pane || changed.panes) {
				each_value = Object.entries(ctx.panes).reverse();

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { pane, panes } = $$props;
  const dispatch = createEventDispatcher();

	const click_handler = ({ key }) => dispatch('change', key);

	$$self.$set = $$props => {
		if ('pane' in $$props) $$invalidate('pane', pane = $$props.pane);
		if ('panes' in $$props) $$invalidate('panes', panes = $$props.panes);
	};

	return { pane, panes, dispatch, click_handler };
}

class Menu extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-19bfq8g-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, ["pane", "panes"]);
	}
}

/* src/client/debug/main/Hotkey.svelte generated by Svelte v3.12.1 */

function add_css$1() {
	var style = element("style");
	style.id = 'svelte-1olzq4i-style';
	style.textContent = ".key.svelte-1olzq4i{display:flex;flex-direction:row;align-items:center}.key-box.svelte-1olzq4i{cursor:pointer;min-width:10px;padding-left:5px;padding-right:5px;height:20px;line-height:20px;text-align:center;border:1px solid #ccc;box-shadow:1px 1px 1px #888;background:#eee;color:#444}.key-box.svelte-1olzq4i:hover{background:#ddd}.key.active.svelte-1olzq4i .key-box.svelte-1olzq4i{background:#ddd;border:1px solid #999;box-shadow:none}.label.svelte-1olzq4i{margin-left:10px}";
	append(document.head, style);
}

// (73:2) {#if label}
function create_if_block(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.label);
			attr(div, "class", "label svelte-1olzq4i");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.label) {
				set_data(t, ctx.label);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function create_fragment$1(ctx) {
	var div1, div0, t0, t1, dispose;

	var if_block = (ctx.label) && create_if_block(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(ctx.value);
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "key-box svelte-1olzq4i");
			attr(div1, "class", "key svelte-1olzq4i");
			toggle_class(div1, "active", ctx.active);

			dispose = [
				listen(window, "keydown", ctx.Keypress),
				listen(div0, "click", ctx.Activate)
			];
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
		},

		p(changed, ctx) {
			if (changed.value) {
				set_data(t0, ctx.value);
			}

			if (ctx.label) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (changed.active) {
				toggle_class(div1, "active", ctx.active);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if (if_block) if_block.d();
			run_all(dispose);
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let $disableHotkeys;

	let { value, onPress = null, label = null, disable = false } = $$props;

  const { disableHotkeys } = getContext('hotkeys'); component_subscribe($$self, disableHotkeys, $$value => { $disableHotkeys = $$value; $$invalidate('$disableHotkeys', $disableHotkeys); });

  let active = false;

  function Deactivate() {
    $$invalidate('active', active = false);
  }

  function Activate() {
    $$invalidate('active', active = true);
    setTimeout(Deactivate, 200);
    if (onPress) {
      setTimeout(onPress, 1);
    }
  }

  function Keypress(e) {
    if (!$disableHotkeys && !disable && e.key == value) {
      e.preventDefault();
      Activate();
    }
  }

	$$self.$set = $$props => {
		if ('value' in $$props) $$invalidate('value', value = $$props.value);
		if ('onPress' in $$props) $$invalidate('onPress', onPress = $$props.onPress);
		if ('label' in $$props) $$invalidate('label', label = $$props.label);
		if ('disable' in $$props) $$invalidate('disable', disable = $$props.disable);
	};

	return {
		value,
		onPress,
		label,
		disable,
		disableHotkeys,
		active,
		Activate,
		Keypress
	};
}

class Hotkey extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1olzq4i-style")) add_css$1();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["value", "onPress", "label", "disable"]);
	}
}

/* src/client/debug/main/InteractiveFunction.svelte generated by Svelte v3.12.1 */

function add_css$2() {
	var style = element("style");
	style.id = 'svelte-khot71-style';
	style.textContent = ".move.svelte-khot71{cursor:pointer;margin-left:10px;color:#666}.move.svelte-khot71:hover{color:#333}.move.active.svelte-khot71{color:#111;font-weight:bold}.arg-field.svelte-khot71{outline:none;font-family:monospace}";
	append(document.head, style);
}

function create_fragment$2(ctx) {
	var div, t0, t1, span_1, t2, dispose;

	return {
		c() {
			div = element("div");
			t0 = text(ctx.name);
			t1 = text("(");
			span_1 = element("span");
			t2 = text(")");
			attr(span_1, "class", "arg-field svelte-khot71");
			attr(span_1, "contenteditable", "");
			attr(div, "class", "move svelte-khot71");
			toggle_class(div, "active", ctx.active);

			dispose = [
				listen(span_1, "blur", ctx.Deactivate),
				listen(span_1, "keydown", ctx.OnKeyDown),
				listen(div, "click", ctx.Activate)
			];
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
			append(div, span_1);
			ctx.span_1_binding(span_1);
			append(div, t2);
		},

		p(changed, ctx) {
			if (changed.name) {
				set_data(t0, ctx.name);
			}

			if (changed.active) {
				toggle_class(div, "active", ctx.active);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			ctx.span_1_binding(null);
			run_all(dispose);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { Activate, Deactivate, name, active } = $$props;
  let span;
  const dispatch = createEventDispatcher();

  function Submit() {
    try {
      const value = span.innerText;
      let argArray = new Function(`return [${value}]`)();
      dispatch('submit', argArray);
    } catch (error) {
      dispatch('error', error);
    }
    $$invalidate('span', span.innerText = '', span);
  }

  function OnKeyDown(e) {
    if (e.key == 'Enter') {
      e.preventDefault();
      Submit();
    }

    if (e.key == 'Escape') {
      e.preventDefault();
      Deactivate();
    }
  }

  afterUpdate(() => {
    if (active) {
      span.focus();
    } else {
      span.blur();
    }
  });

	function span_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('span', span = $$value);
		});
	}

	$$self.$set = $$props => {
		if ('Activate' in $$props) $$invalidate('Activate', Activate = $$props.Activate);
		if ('Deactivate' in $$props) $$invalidate('Deactivate', Deactivate = $$props.Deactivate);
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('active' in $$props) $$invalidate('active', active = $$props.active);
	};

	return {
		Activate,
		Deactivate,
		name,
		active,
		span,
		OnKeyDown,
		span_1_binding
	};
}

class InteractiveFunction extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-khot71-style")) add_css$2();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["Activate", "Deactivate", "name", "active"]);
	}
}

/* src/client/debug/main/Move.svelte generated by Svelte v3.12.1 */

function add_css$3() {
	var style = element("style");
	style.id = 'svelte-smqssc-style';
	style.textContent = ".move-error.svelte-smqssc{color:#a00;font-weight:bold}.wrapper.svelte-smqssc{display:flex;flex-direction:row;align-items:center}";
	append(document.head, style);
}

// (65:2) {#if error}
function create_if_block$1(ctx) {
	var span, t;

	return {
		c() {
			span = element("span");
			t = text(ctx.error);
			attr(span, "class", "move-error svelte-smqssc");
		},

		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},

		p(changed, ctx) {
			if (changed.error) {
				set_data(t, ctx.error);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(span);
			}
		}
	};
}

function create_fragment$3(ctx) {
	var div1, div0, t0, t1, current;

	var hotkey = new Hotkey({
		props: { value: ctx.shortcut, onPress: ctx.Activate }
	});

	var interactivefunction = new InteractiveFunction({
		props: {
		Activate: ctx.Activate,
		Deactivate: ctx.Deactivate,
		name: ctx.name,
		active: ctx.active
	}
	});
	interactivefunction.$on("submit", ctx.Submit);
	interactivefunction.$on("error", ctx.Error);

	var if_block = (ctx.error) && create_if_block$1(ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			hotkey.$$.fragment.c();
			t0 = space();
			interactivefunction.$$.fragment.c();
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "wrapper svelte-smqssc");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			mount_component(hotkey, div0, null);
			append(div0, t0);
			mount_component(interactivefunction, div0, null);
			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			var hotkey_changes = {};
			if (changed.shortcut) hotkey_changes.value = ctx.shortcut;
			hotkey.$set(hotkey_changes);

			var interactivefunction_changes = {};
			if (changed.name) interactivefunction_changes.name = ctx.name;
			if (changed.active) interactivefunction_changes.active = ctx.active;
			interactivefunction.$set(interactivefunction_changes);

			if (ctx.error) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					if_block.m(div1, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		i(local) {
			if (current) return;
			transition_in(hotkey.$$.fragment, local);

			transition_in(interactivefunction.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(hotkey.$$.fragment, local);
			transition_out(interactivefunction.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			destroy_component(hotkey);

			destroy_component(interactivefunction);

			if (if_block) if_block.d();
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { shortcut, name, fn } = $$props;

  const {disableHotkeys} = getContext('hotkeys');

  let error$1 = '';
  let active = false;

  function Activate() {
    disableHotkeys.set(true);
    $$invalidate('active', active = true);
  }

  function Deactivate() {
    disableHotkeys.set(false);
    $$invalidate('error', error$1 = '');
    $$invalidate('active', active = false);
  }

  function Submit(e) {
    $$invalidate('error', error$1 = '');
    Deactivate();
    fn.apply(this, e.detail);
  }

  function Error(e) {
    $$invalidate('error', error$1 = e.detail);
    error(e.detail);
  }

	$$self.$set = $$props => {
		if ('shortcut' in $$props) $$invalidate('shortcut', shortcut = $$props.shortcut);
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('fn' in $$props) $$invalidate('fn', fn = $$props.fn);
	};

	return {
		shortcut,
		name,
		fn,
		error: error$1,
		active,
		Activate,
		Deactivate,
		Submit,
		Error
	};
}

class Move extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-smqssc-style")) add_css$3();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["shortcut", "name", "fn"]);
	}
}

/* src/client/debug/main/Controls.svelte generated by Svelte v3.12.1 */

function add_css$4() {
	var style = element("style");
	style.id = 'svelte-1x2w9i0-style';
	style.textContent = "li.svelte-1x2w9i0{list-style:none;margin:none;margin-bottom:5px}";
	append(document.head, style);
}

function create_fragment$4(ctx) {
	var section, li0, t0, li1, t1, li2, t2, li3, current;

	var hotkey0 = new Hotkey({
		props: {
		value: "1",
		onPress: ctx.client.reset,
		label: "reset"
	}
	});

	var hotkey1 = new Hotkey({
		props: {
		value: "2",
		onPress: ctx.Save,
		label: "save"
	}
	});

	var hotkey2 = new Hotkey({
		props: {
		value: "3",
		onPress: ctx.Restore,
		label: "restore"
	}
	});

	var hotkey3 = new Hotkey({
		props: {
		value: ".",
		disable: true,
		label: "hide"
	}
	});

	return {
		c() {
			section = element("section");
			li0 = element("li");
			hotkey0.$$.fragment.c();
			t0 = space();
			li1 = element("li");
			hotkey1.$$.fragment.c();
			t1 = space();
			li2 = element("li");
			hotkey2.$$.fragment.c();
			t2 = space();
			li3 = element("li");
			hotkey3.$$.fragment.c();
			attr(li0, "class", "svelte-1x2w9i0");
			attr(li1, "class", "svelte-1x2w9i0");
			attr(li2, "class", "svelte-1x2w9i0");
			attr(li3, "class", "svelte-1x2w9i0");
			attr(section, "id", "debug-controls");
			attr(section, "class", "controls");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, li0);
			mount_component(hotkey0, li0, null);
			append(section, t0);
			append(section, li1);
			mount_component(hotkey1, li1, null);
			append(section, t1);
			append(section, li2);
			mount_component(hotkey2, li2, null);
			append(section, t2);
			append(section, li3);
			mount_component(hotkey3, li3, null);
			current = true;
		},

		p(changed, ctx) {
			var hotkey0_changes = {};
			if (changed.client) hotkey0_changes.onPress = ctx.client.reset;
			hotkey0.$set(hotkey0_changes);
		},

		i(local) {
			if (current) return;
			transition_in(hotkey0.$$.fragment, local);

			transition_in(hotkey1.$$.fragment, local);

			transition_in(hotkey2.$$.fragment, local);

			transition_in(hotkey3.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(hotkey0.$$.fragment, local);
			transition_out(hotkey1.$$.fragment, local);
			transition_out(hotkey2.$$.fragment, local);
			transition_out(hotkey3.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(hotkey0);

			destroy_component(hotkey1);

			destroy_component(hotkey2);

			destroy_component(hotkey3);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { client } = $$props;

  function Save() {
    const { G, ctx } = client.getState();
    const json = stringify({ G, ctx });
    window.localStorage.setItem('gamestate', json);
  }

  function Restore() {
    const gamestateJSON = window.localStorage.getItem('gamestate');
    if (gamestateJSON !== null) {
      const gamestate = parse(gamestateJSON);
      client.store.dispatch(sync(gamestate));
    }
  }

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return { client, Save, Restore };
}

class Controls extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1x2w9i0-style")) add_css$4();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/main/PlayerInfo.svelte generated by Svelte v3.12.1 */

function add_css$5() {
	var style = element("style");
	style.id = 'svelte-6sf87x-style';
	style.textContent = ".player-box.svelte-6sf87x{display:flex;flex-direction:row}.player.svelte-6sf87x{cursor:pointer;text-align:center;width:30px;height:30px;line-height:30px;background:#eee;border:3px solid #fefefe;box-sizing:content-box}.player.current.svelte-6sf87x{background:#555;color:#eee;font-weight:bold}.player.active.svelte-6sf87x{border:3px solid #ff7f50}";
	append(document.head, style);
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.player = list[i];
	return child_ctx;
}

// (49:2) {#each players as player}
function create_each_block$1(ctx) {
	var div, t0_value = ctx.player + "", t0, t1, dispose;

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	return {
		c() {
			div = element("div");
			t0 = text(t0_value);
			t1 = space();
			attr(div, "class", "player svelte-6sf87x");
			toggle_class(div, "current", ctx.player == ctx.ctx.currentPlayer);
			toggle_class(div, "active", ctx.player == ctx.playerID);
			dispose = listen(div, "click", click_handler);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t0);
			append(div, t1);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.players) && t0_value !== (t0_value = ctx.player + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.players || changed.ctx)) {
				toggle_class(div, "current", ctx.player == ctx.ctx.currentPlayer);
			}

			if ((changed.players || changed.playerID)) {
				toggle_class(div, "active", ctx.player == ctx.playerID);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			dispose();
		}
	};
}

function create_fragment$5(ctx) {
	var div;

	let each_value = ctx.players;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "player-box svelte-6sf87x");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}
		},

		p(changed, ctx) {
			if (changed.players || changed.ctx || changed.playerID) {
				each_value = ctx.players;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let { ctx, playerID } = $$props;

  const dispatch = createEventDispatcher();
  function OnClick(player) {
    if (player == playerID) {
      dispatch("change", { playerID: null });
    } else {
      dispatch("change", { playerID: player });
    }
  }

  let players;

	const click_handler = ({ player }) => OnClick(player);

	$$self.$set = $$props => {
		if ('ctx' in $$props) $$invalidate('ctx', ctx = $$props.ctx);
		if ('playerID' in $$props) $$invalidate('playerID', playerID = $$props.playerID);
	};

	$$self.$$.update = ($$dirty = { ctx: 1 }) => {
		if ($$dirty.ctx) { $$invalidate('players', players = ctx ? [...Array(ctx.numPlayers).keys()].map(i => i.toString()) : []); }
	};

	return {
		ctx,
		playerID,
		OnClick,
		players,
		click_handler
	};
}

class PlayerInfo extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-6sf87x-style")) add_css$5();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["ctx", "playerID"]);
	}
}

/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */
function AssignShortcuts(moveNames, eventNames, blacklist) {
  var shortcuts = {};
  var events = {};

  for (var name in moveNames) {
    events[name] = name;
  }

  for (var _name in eventNames) {
    events[_name] = _name;
  }

  var taken = {};

  for (var i = 0; i < blacklist.length; i++) {
    var c = blacklist[i];
    taken[c] = true;
  } // Try assigning the first char of each move as the shortcut.


  var t = taken;
  var canUseFirstChar = true;

  for (var _name2 in events) {
    var shortcut = _name2[0];

    if (t[shortcut]) {
      canUseFirstChar = false;
      break;
    }

    t[shortcut] = true;
    shortcuts[_name2] = shortcut;
  }

  if (canUseFirstChar) {
    return shortcuts;
  } // If those aren't unique, use a-z.


  t = taken;
  var next = 97;
  shortcuts = {};

  for (var _name3 in events) {
    var _shortcut = String.fromCharCode(next);

    while (t[_shortcut]) {
      next++;
      _shortcut = String.fromCharCode(next);
    }

    t[_shortcut] = true;
    shortcuts[_name3] = _shortcut;
  }

  return shortcuts;
}

/* src/client/debug/main/Main.svelte generated by Svelte v3.12.1 */

function add_css$6() {
	var style = element("style");
	style.id = 'svelte-1vg2l2b-style';
	style.textContent = ".json.svelte-1vg2l2b{font-family:monospace;color:#888}label.svelte-1vg2l2b{font-weight:bold;font-size:1.1em;display:inline}h3.svelte-1vg2l2b{text-transform:uppercase}li.svelte-1vg2l2b{list-style:none;margin:none;margin-bottom:5px}.events.svelte-1vg2l2b{display:flex;flex-direction:column}.events.svelte-1vg2l2b button.svelte-1vg2l2b{width:100px}.events.svelte-1vg2l2b button.svelte-1vg2l2b:not(:last-child){margin-bottom:10px}";
	append(document.head, style);
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.name = list[i][0];
	child_ctx.fn = list[i][1];
	return child_ctx;
}

// (85:2) {#each Object.entries(client.moves) as [name, fn]}
function create_each_block$2(ctx) {
	var li, t, current;

	var move = new Move({
		props: {
		shortcut: ctx.shortcuts[ctx.name],
		fn: ctx.fn,
		name: ctx.name
	}
	});

	return {
		c() {
			li = element("li");
			move.$$.fragment.c();
			t = space();
			attr(li, "class", "svelte-1vg2l2b");
		},

		m(target, anchor) {
			insert(target, li, anchor);
			mount_component(move, li, null);
			append(li, t);
			current = true;
		},

		p(changed, ctx) {
			var move_changes = {};
			if (changed.client) move_changes.shortcut = ctx.shortcuts[ctx.name];
			if (changed.client) move_changes.fn = ctx.fn;
			if (changed.client) move_changes.name = ctx.name;
			move.$set(move_changes);
		},

		i(local) {
			if (current) return;
			transition_in(move.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(move.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(li);
			}

			destroy_component(move);
		}
	};
}

// (96:2) {#if client.events.endTurn}
function create_if_block_2(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Turn";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

// (99:2) {#if ctx.phase && client.events.endPhase}
function create_if_block_1(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Phase";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler_1);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

// (102:2) {#if ctx.activePlayers && client.events.endStage}
function create_if_block$2(ctx) {
	var button, dispose;

	return {
		c() {
			button = element("button");
			button.textContent = "End Stage";
			attr(button, "class", "svelte-1vg2l2b");
			dispose = listen(button, "click", ctx.click_handler_2);
		},

		m(target, anchor) {
			insert(target, button, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(button);
			}

			dispose();
		}
	};
}

function create_fragment$6(ctx) {
	var section0, h30, t1, t2, section1, h31, t4, t5, section2, h32, t7, t8, section3, h33, t10, div, t11, t12, t13, section4, label0, t15, pre0, t16_value = JSON.stringify(ctx.G, null, 2) + "", t16, t17, section5, label1, t19, pre1, t20_value = JSON.stringify(SanitizeCtx(ctx.ctx), null, 2) + "", t20, current;

	var controls = new Controls({ props: { client: ctx.client } });

	var playerinfo = new PlayerInfo({
		props: {
		ctx: ctx.ctx,
		playerID: ctx.playerID
	}
	});
	playerinfo.$on("change", ctx.change_handler);

	let each_value = Object.entries(ctx.client.moves);

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	var if_block0 = (ctx.client.events.endTurn) && create_if_block_2(ctx);

	var if_block1 = (ctx.ctx.phase && ctx.client.events.endPhase) && create_if_block_1(ctx);

	var if_block2 = (ctx.ctx.activePlayers && ctx.client.events.endStage) && create_if_block$2(ctx);

	return {
		c() {
			section0 = element("section");
			h30 = element("h3");
			h30.textContent = "Controls";
			t1 = space();
			controls.$$.fragment.c();
			t2 = space();
			section1 = element("section");
			h31 = element("h3");
			h31.textContent = "Players";
			t4 = space();
			playerinfo.$$.fragment.c();
			t5 = space();
			section2 = element("section");
			h32 = element("h3");
			h32.textContent = "Moves";
			t7 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t8 = space();
			section3 = element("section");
			h33 = element("h3");
			h33.textContent = "Events";
			t10 = space();
			div = element("div");
			if (if_block0) if_block0.c();
			t11 = space();
			if (if_block1) if_block1.c();
			t12 = space();
			if (if_block2) if_block2.c();
			t13 = space();
			section4 = element("section");
			label0 = element("label");
			label0.textContent = "G";
			t15 = space();
			pre0 = element("pre");
			t16 = text(t16_value);
			t17 = space();
			section5 = element("section");
			label1 = element("label");
			label1.textContent = "ctx";
			t19 = space();
			pre1 = element("pre");
			t20 = text(t20_value);
			attr(h30, "class", "svelte-1vg2l2b");
			attr(h31, "class", "svelte-1vg2l2b");
			attr(h32, "class", "svelte-1vg2l2b");
			attr(h33, "class", "svelte-1vg2l2b");
			attr(div, "class", "events svelte-1vg2l2b");
			attr(label0, "class", "svelte-1vg2l2b");
			attr(pre0, "class", "json svelte-1vg2l2b");
			attr(label1, "class", "svelte-1vg2l2b");
			attr(pre1, "class", "json svelte-1vg2l2b");
		},

		m(target, anchor) {
			insert(target, section0, anchor);
			append(section0, h30);
			append(section0, t1);
			mount_component(controls, section0, null);
			insert(target, t2, anchor);
			insert(target, section1, anchor);
			append(section1, h31);
			append(section1, t4);
			mount_component(playerinfo, section1, null);
			insert(target, t5, anchor);
			insert(target, section2, anchor);
			append(section2, h32);
			append(section2, t7);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(section2, null);
			}

			insert(target, t8, anchor);
			insert(target, section3, anchor);
			append(section3, h33);
			append(section3, t10);
			append(section3, div);
			if (if_block0) if_block0.m(div, null);
			append(div, t11);
			if (if_block1) if_block1.m(div, null);
			append(div, t12);
			if (if_block2) if_block2.m(div, null);
			insert(target, t13, anchor);
			insert(target, section4, anchor);
			append(section4, label0);
			append(section4, t15);
			append(section4, pre0);
			append(pre0, t16);
			insert(target, t17, anchor);
			insert(target, section5, anchor);
			append(section5, label1);
			append(section5, t19);
			append(section5, pre1);
			append(pre1, t20);
			current = true;
		},

		p(changed, ctx) {
			var controls_changes = {};
			if (changed.client) controls_changes.client = ctx.client;
			controls.$set(controls_changes);

			var playerinfo_changes = {};
			if (changed.ctx) playerinfo_changes.ctx = ctx.ctx;
			if (changed.playerID) playerinfo_changes.playerID = ctx.playerID;
			playerinfo.$set(playerinfo_changes);

			if (changed.shortcuts || changed.client) {
				each_value = Object.entries(ctx.client.moves);

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(section2, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (ctx.client.events.endTurn) {
				if (!if_block0) {
					if_block0 = create_if_block_2(ctx);
					if_block0.c();
					if_block0.m(div, t11);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.ctx.phase && ctx.client.events.endPhase) {
				if (!if_block1) {
					if_block1 = create_if_block_1(ctx);
					if_block1.c();
					if_block1.m(div, t12);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (ctx.ctx.activePlayers && ctx.client.events.endStage) {
				if (!if_block2) {
					if_block2 = create_if_block$2(ctx);
					if_block2.c();
					if_block2.m(div, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((!current || changed.G) && t16_value !== (t16_value = JSON.stringify(ctx.G, null, 2) + "")) {
				set_data(t16, t16_value);
			}

			if ((!current || changed.ctx) && t20_value !== (t20_value = JSON.stringify(SanitizeCtx(ctx.ctx), null, 2) + "")) {
				set_data(t20, t20_value);
			}
		},

		i(local) {
			if (current) return;
			transition_in(controls.$$.fragment, local);

			transition_in(playerinfo.$$.fragment, local);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			transition_out(controls.$$.fragment, local);
			transition_out(playerinfo.$$.fragment, local);

			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section0);
			}

			destroy_component(controls);

			if (detaching) {
				detach(t2);
				detach(section1);
			}

			destroy_component(playerinfo);

			if (detaching) {
				detach(t5);
				detach(section2);
			}

			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(t8);
				detach(section3);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();

			if (detaching) {
				detach(t13);
				detach(section4);
				detach(t17);
				detach(section5);
			}
		}
	};
}

function SanitizeCtx(ctx) {
  let r = {};
  for (const key in ctx) {
    if (!key.startsWith('_')) {
      r[key] = ctx[key];
    }
  }
  return r;
}

function instance$6($$self, $$props, $$invalidate) {
	let { client } = $$props;

  const shortcuts = AssignShortcuts(client.moves, client.events, 'mlia');

  let playerID = client.playerID;
  let ctx = {};
  let G = {};
  client.subscribe((state) => {
    if (state) {
      $$invalidate('G', G = state.G);
      $$invalidate('ctx', ctx = state.ctx);
    }
    $$invalidate('playerID', playerID = client.playerID);
  });

	const change_handler = (e) => client.updatePlayerID(e.detail.playerID);

	const click_handler = () => client.events.endTurn();

	const click_handler_1 = () => client.events.endPhase();

	const click_handler_2 = () => client.events.endStage();

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		shortcuts,
		playerID,
		ctx,
		G,
		change_handler,
		click_handler,
		click_handler_1,
		click_handler_2
	};
}

class Main extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1vg2l2b-style")) add_css$6();
		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/info/Item.svelte generated by Svelte v3.12.1 */

function add_css$7() {
	var style = element("style");
	style.id = 'svelte-13qih23-style';
	style.textContent = ".item.svelte-13qih23{padding:10px}.item.svelte-13qih23:not(:first-child){border-top:1px dashed #aaa}.item.svelte-13qih23 div.svelte-13qih23{float:right;text-align:right}";
	append(document.head, style);
}

function create_fragment$7(ctx) {
	var div1, strong, t0, t1, div0, t2_value = JSON.stringify(ctx.value) + "", t2;

	return {
		c() {
			div1 = element("div");
			strong = element("strong");
			t0 = text(ctx.name);
			t1 = space();
			div0 = element("div");
			t2 = text(t2_value);
			attr(div0, "class", "svelte-13qih23");
			attr(div1, "class", "item svelte-13qih23");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, strong);
			append(strong, t0);
			append(div1, t1);
			append(div1, div0);
			append(div0, t2);
		},

		p(changed, ctx) {
			if (changed.name) {
				set_data(t0, ctx.name);
			}

			if ((changed.value) && t2_value !== (t2_value = JSON.stringify(ctx.value) + "")) {
				set_data(t2, t2_value);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div1);
			}
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { name, value } = $$props;

	$$self.$set = $$props => {
		if ('name' in $$props) $$invalidate('name', name = $$props.name);
		if ('value' in $$props) $$invalidate('value', value = $$props.value);
	};

	return { name, value };
}

class Item extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-13qih23-style")) add_css$7();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["name", "value"]);
	}
}

/* src/client/debug/info/Info.svelte generated by Svelte v3.12.1 */

function add_css$8() {
	var style = element("style");
	style.id = 'svelte-1yzq5o8-style';
	style.textContent = ".gameinfo.svelte-1yzq5o8{padding:10px}";
	append(document.head, style);
}

// (17:2) {#if $client.isMultiplayer}
function create_if_block$3(ctx) {
	var span, t, current;

	var item0 = new Item({
		props: { name: "isConnected", value: ctx.$client.isConnected }
	});

	var item1 = new Item({
		props: {
		name: "isMultiplayer",
		value: ctx.$client.isMultiplayer
	}
	});

	return {
		c() {
			span = element("span");
			item0.$$.fragment.c();
			t = space();
			item1.$$.fragment.c();
		},

		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(item0, span, null);
			append(span, t);
			mount_component(item1, span, null);
			current = true;
		},

		p(changed, ctx) {
			var item0_changes = {};
			if (changed.$client) item0_changes.value = ctx.$client.isConnected;
			item0.$set(item0_changes);

			var item1_changes = {};
			if (changed.$client) item1_changes.value = ctx.$client.isMultiplayer;
			item1.$set(item1_changes);
		},

		i(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);

			transition_in(item1.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(span);
			}

			destroy_component(item0);

			destroy_component(item1);
		}
	};
}

function create_fragment$8(ctx) {
	var section, t0, t1, t2, current;

	var item0 = new Item({
		props: { name: "gameID", value: ctx.client.gameID }
	});

	var item1 = new Item({
		props: { name: "playerID", value: ctx.client.playerID }
	});

	var item2 = new Item({
		props: { name: "isActive", value: ctx.$client.isActive }
	});

	var if_block = (ctx.$client.isMultiplayer) && create_if_block$3(ctx);

	return {
		c() {
			section = element("section");
			item0.$$.fragment.c();
			t0 = space();
			item1.$$.fragment.c();
			t1 = space();
			item2.$$.fragment.c();
			t2 = space();
			if (if_block) if_block.c();
			attr(section, "class", "gameinfo svelte-1yzq5o8");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			mount_component(item0, section, null);
			append(section, t0);
			mount_component(item1, section, null);
			append(section, t1);
			mount_component(item2, section, null);
			append(section, t2);
			if (if_block) if_block.m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var item0_changes = {};
			if (changed.client) item0_changes.value = ctx.client.gameID;
			item0.$set(item0_changes);

			var item1_changes = {};
			if (changed.client) item1_changes.value = ctx.client.playerID;
			item1.$set(item1_changes);

			var item2_changes = {};
			if (changed.$client) item2_changes.value = ctx.$client.isActive;
			item2.$set(item2_changes);

			if (ctx.$client.isMultiplayer) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(section, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(item0.$$.fragment, local);

			transition_in(item1.$$.fragment, local);

			transition_in(item2.$$.fragment, local);

			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(item0.$$.fragment, local);
			transition_out(item1.$$.fragment, local);
			transition_out(item2.$$.fragment, local);
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(item0);

			destroy_component(item1);

			destroy_component(item2);

			if (if_block) if_block.d();
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let $client;

	let { client } = $$props; component_subscribe($$self, client, $$value => { $client = $$value; $$invalidate('$client', $client); });

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return { client, $client };
}

class Info extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1yzq5o8-style")) add_css$8();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/log/TurnMarker.svelte generated by Svelte v3.12.1 */

function add_css$9() {
	var style = element("style");
	style.id = 'svelte-6eza86-style';
	style.textContent = ".turn-marker.svelte-6eza86{display:flex;justify-content:center;align-items:center;grid-column:1;background:#555;color:#eee;text-align:center;font-weight:bold;border:1px solid #888}";
	append(document.head, style);
}

function create_fragment$9(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.turn);
			attr(div, "class", "turn-marker svelte-6eza86");
			attr(div, "style", ctx.style);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.turn) {
				set_data(t, ctx.turn);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let { turn, numEvents } = $$props;
  const style = `grid-row: span ${numEvents}`;

	$$self.$set = $$props => {
		if ('turn' in $$props) $$invalidate('turn', turn = $$props.turn);
		if ('numEvents' in $$props) $$invalidate('numEvents', numEvents = $$props.numEvents);
	};

	return { turn, numEvents, style };
}

class TurnMarker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-6eza86-style")) add_css$9();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, ["turn", "numEvents"]);
	}
}

/* src/client/debug/log/PhaseMarker.svelte generated by Svelte v3.12.1 */

function add_css$a() {
	var style = element("style");
	style.id = 'svelte-1t4xap-style';
	style.textContent = ".phase-marker.svelte-1t4xap{grid-column:3;background:#555;border:1px solid #888;color:#eee;text-align:center;font-weight:bold;padding-top:10px;padding-bottom:10px;text-orientation:sideways;writing-mode:vertical-rl;line-height:30px;width:100%}";
	append(document.head, style);
}

function create_fragment$a(ctx) {
	var div, t_value = ctx.phase || '' + "", t;

	return {
		c() {
			div = element("div");
			t = text(t_value);
			attr(div, "class", "phase-marker svelte-1t4xap");
			attr(div, "style", ctx.style);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if ((changed.phase) && t_value !== (t_value = ctx.phase || '' + "")) {
				set_data(t, t_value);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let { phase, numEvents } = $$props;

  const style = `grid-row: span ${numEvents}`;

	$$self.$set = $$props => {
		if ('phase' in $$props) $$invalidate('phase', phase = $$props.phase);
		if ('numEvents' in $$props) $$invalidate('numEvents', numEvents = $$props.numEvents);
	};

	return { phase, numEvents, style };
}

class PhaseMarker extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1t4xap-style")) add_css$a();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, ["phase", "numEvents"]);
	}
}

/* src/client/debug/log/CustomPayload.svelte generated by Svelte v3.12.1 */

function create_fragment$b(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.custompayload);
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let { payload } = $$props;
  const custompayload =
    payload !== undefined ? JSON.stringify(payload, null, 4) : '';

	$$self.$set = $$props => {
		if ('payload' in $$props) $$invalidate('payload', payload = $$props.payload);
	};

	return { payload, custompayload };
}

class CustomPayload extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, ["payload"]);
	}
}

/* src/client/debug/log/LogEvent.svelte generated by Svelte v3.12.1 */

function add_css$b() {
	var style = element("style");
	style.id = 'svelte-10wdo7v-style';
	style.textContent = ".log-event.svelte-10wdo7v{grid-column:2;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;justify-content:center;background:#fff;border:1px dotted #ccc;border-left:5px solid #ccc;padding:5px;text-align:center;color:#888;font-size:14px;min-height:25px;line-height:25px}.log-event.svelte-10wdo7v:hover{border-style:solid;background:#eee}.log-event.pinned.svelte-10wdo7v{border-style:solid;background:#eee;opacity:1}.player0.svelte-10wdo7v{border-left-color:#ff851b}.player1.svelte-10wdo7v{border-left-color:#7fdbff}.player2.svelte-10wdo7v{border-left-color:#0074d9}.player3.svelte-10wdo7v{border-left-color:#39cccc}.player4.svelte-10wdo7v{border-left-color:#3d9970}.player5.svelte-10wdo7v{border-left-color:#2ecc40}.player6.svelte-10wdo7v{border-left-color:#01ff70}.player7.svelte-10wdo7v{border-left-color:#ffdc00}.player8.svelte-10wdo7v{border-left-color:#001f3f}.player9.svelte-10wdo7v{border-left-color:#ff4136}.player10.svelte-10wdo7v{border-left-color:#85144b}.player11.svelte-10wdo7v{border-left-color:#f012be}.player12.svelte-10wdo7v{border-left-color:#b10dc9}.player13.svelte-10wdo7v{border-left-color:#111111}.player14.svelte-10wdo7v{border-left-color:#aaaaaa}.player15.svelte-10wdo7v{border-left-color:#dddddd}";
	append(document.head, style);
}

// (122:2) {:else}
function create_else_block(ctx) {
	var current;

	var custompayload = new CustomPayload({ props: { payload: ctx.payload } });

	return {
		c() {
			custompayload.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(custompayload, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var custompayload_changes = {};
			if (changed.payload) custompayload_changes.payload = ctx.payload;
			custompayload.$set(custompayload_changes);
		},

		i(local) {
			if (current) return;
			transition_in(custompayload.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(custompayload.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(custompayload, detaching);
		}
	};
}

// (120:2) {#if payloadComponent}
function create_if_block$4(ctx) {
	var switch_instance_anchor, current;

	var switch_value = ctx.payloadComponent;

	function switch_props(ctx) {
		return { props: { payload: ctx.payload } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) switch_instance.$$.fragment.c();
			switch_instance_anchor = empty();
		},

		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.payload) switch_instance_changes.payload = ctx.payload;

			if (switch_value !== (switch_value = ctx.payloadComponent)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},

		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			current = true;
		},

		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(switch_instance_anchor);
			}

			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment$c(ctx) {
	var div1, div0, t0_value = ctx.action.payload.type + "", t0, t1, t2_value = ctx.args.join(',') + "", t2, t3, t4, current_block_type_index, if_block, current, dispose;

	var if_block_creators = [
		create_if_block$4,
		create_else_block
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.payloadComponent) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = text("(");
			t2 = text(t2_value);
			t3 = text(")");
			t4 = space();
			if_block.c();
			attr(div1, "class", "log-event player" + ctx.playerID + " svelte-10wdo7v");
			toggle_class(div1, "pinned", ctx.pinned);

			dispose = [
				listen(div1, "click", ctx.click_handler),
				listen(div1, "mouseenter", ctx.mouseenter_handler),
				listen(div1, "mouseleave", ctx.mouseleave_handler)
			];
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);
			append(div0, t0);
			append(div0, t1);
			append(div0, t2);
			append(div0, t3);
			append(div1, t4);
			if_blocks[current_block_type_index].m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			if ((!current || changed.action) && t0_value !== (t0_value = ctx.action.payload.type + "")) {
				set_data(t0, t0_value);
			}

			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				transition_in(if_block, 1);
				if_block.m(div1, null);
			}

			if (changed.pinned) {
				toggle_class(div1, "pinned", ctx.pinned);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			if_blocks[current_block_type_index].d();
			run_all(dispose);
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let { logIndex, action, pinned, payload, payloadComponent } = $$props;

  const dispatch = createEventDispatcher();

  const args = action.payload.args || [];
  const playerID = action.payload.playerID;

	const click_handler = () => dispatch('click', { logIndex });

	const mouseenter_handler = () => dispatch('mouseenter', { logIndex });

	const mouseleave_handler = () => dispatch('mouseleave');

	$$self.$set = $$props => {
		if ('logIndex' in $$props) $$invalidate('logIndex', logIndex = $$props.logIndex);
		if ('action' in $$props) $$invalidate('action', action = $$props.action);
		if ('pinned' in $$props) $$invalidate('pinned', pinned = $$props.pinned);
		if ('payload' in $$props) $$invalidate('payload', payload = $$props.payload);
		if ('payloadComponent' in $$props) $$invalidate('payloadComponent', payloadComponent = $$props.payloadComponent);
	};

	return {
		logIndex,
		action,
		pinned,
		payload,
		payloadComponent,
		dispatch,
		args,
		playerID,
		click_handler,
		mouseenter_handler,
		mouseleave_handler
	};
}

class LogEvent extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-10wdo7v-style")) add_css$b();
		init(this, options, instance$c, create_fragment$c, safe_not_equal, ["logIndex", "action", "pinned", "payload", "payloadComponent"]);
	}
}

/* node_modules/svelte-icons/components/IconBase.svelte generated by Svelte v3.12.1 */

function add_css$c() {
	var style = element("style");
	style.id = 'svelte-c8tyih-style';
	style.textContent = "svg.svelte-c8tyih{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}";
	append(document.head, style);
}

// (18:2) {#if title}
function create_if_block$5(ctx) {
	var title_1, t;

	return {
		c() {
			title_1 = svg_element("title");
			t = text(ctx.title);
		},

		m(target, anchor) {
			insert(target, title_1, anchor);
			append(title_1, t);
		},

		p(changed, ctx) {
			if (changed.title) {
				set_data(t, ctx.title);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(title_1);
			}
		}
	};
}

function create_fragment$d(ctx) {
	var svg, if_block_anchor, current;

	var if_block = (ctx.title) && create_if_block$5(ctx);

	const default_slot_template = ctx.$$slots.default;
	const default_slot = create_slot(default_slot_template, ctx, null);

	return {
		c() {
			svg = svg_element("svg");
			if (if_block) if_block.c();
			if_block_anchor = empty();

			if (default_slot) default_slot.c();

			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "viewBox", ctx.viewBox);
			attr(svg, "class", "svelte-c8tyih");
		},

		l(nodes) {
			if (default_slot) default_slot.l(svg_nodes);
		},

		m(target, anchor) {
			insert(target, svg, anchor);
			if (if_block) if_block.m(svg, null);
			append(svg, if_block_anchor);

			if (default_slot) {
				default_slot.m(svg, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (ctx.title) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$5(ctx);
					if_block.c();
					if_block.m(svg, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (default_slot && default_slot.p && changed.$$scope) {
				default_slot.p(
					get_slot_changes(default_slot_template, ctx, changed, null),
					get_slot_context(default_slot_template, ctx, null)
				);
			}

			if (!current || changed.viewBox) {
				attr(svg, "viewBox", ctx.viewBox);
			}
		},

		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},

		o(local) {
			transition_out(default_slot, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(svg);
			}

			if (if_block) if_block.d();

			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { title = null, viewBox } = $$props;

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ('title' in $$props) $$invalidate('title', title = $$props.title);
		if ('viewBox' in $$props) $$invalidate('viewBox', viewBox = $$props.viewBox);
		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
	};

	return { title, viewBox, $$slots, $$scope };
}

class IconBase extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-c8tyih-style")) add_css$c();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, ["title", "viewBox"]);
	}
}

/* node_modules/svelte-icons/fa/FaArrowAltCircleDown.svelte generated by Svelte v3.12.1 */

// (4:8) <IconBase viewBox="0 0 512 512" {...$$props}>
function create_default_slot(ctx) {
	var path;

	return {
		c() {
			path = svg_element("path");
			attr(path, "d", "M504 256c0 137-111 248-248 248S8 393 8 256 119 8 256 8s248 111 248 248zM212 140v116h-70.9c-10.7 0-16.1 13-8.5 20.5l114.9 114.3c4.7 4.7 12.2 4.7 16.9 0l114.9-114.3c7.6-7.6 2.2-20.5-8.5-20.5H300V140c0-6.6-5.4-12-12-12h-64c-6.6 0-12 5.4-12 12z");
		},

		m(target, anchor) {
			insert(target, path, anchor);
		},

		d(detaching) {
			if (detaching) {
				detach(path);
			}
		}
	};
}

function create_fragment$e(ctx) {
	var current;

	var iconbase_spread_levels = [
		{ viewBox: "0 0 512 512" },
		ctx.$$props
	];

	let iconbase_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};
	for (var i = 0; i < iconbase_spread_levels.length; i += 1) {
		iconbase_props = assign(iconbase_props, iconbase_spread_levels[i]);
	}
	var iconbase = new IconBase({ props: iconbase_props });

	return {
		c() {
			iconbase.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(iconbase, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var iconbase_changes = (changed.$$props) ? get_spread_update(iconbase_spread_levels, [
									iconbase_spread_levels[0],
			get_spread_object(ctx.$$props)
								]) : {};
			if (changed.$$scope) iconbase_changes.$$scope = { changed, ctx };
			iconbase.$set(iconbase_changes);
		},

		i(local) {
			if (current) return;
			transition_in(iconbase.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(iconbase.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(iconbase, detaching);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	$$self.$set = $$new_props => {
		$$invalidate('$$props', $$props = assign(assign({}, $$props), $$new_props));
	};

	return {
		$$props,
		$$props: $$props = exclude_internal_props($$props)
	};
}

class FaArrowAltCircleDown extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$e, create_fragment$e, safe_not_equal, []);
	}
}

/* src/client/debug/mcts/Action.svelte generated by Svelte v3.12.1 */

function add_css$d() {
	var style = element("style");
	style.id = 'svelte-1a7time-style';
	style.textContent = "div.svelte-1a7time{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:500px}";
	append(document.head, style);
}

function create_fragment$f(ctx) {
	var div, t;

	return {
		c() {
			div = element("div");
			t = text(ctx.text);
			attr(div, "alt", ctx.text);
			attr(div, "class", "svelte-1a7time");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},

		p(changed, ctx) {
			if (changed.text) {
				set_data(t, ctx.text);
				attr(div, "alt", ctx.text);
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(div);
			}
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	let { action } = $$props;

  let text;

	$$self.$set = $$props => {
		if ('action' in $$props) $$invalidate('action', action = $$props.action);
	};

	$$self.$$.update = ($$dirty = { action: 1 }) => {
		if ($$dirty.action) { {
        const { type, args } = action.payload;
        const argsFormatted = (args || []).join(',');
        $$invalidate('text', text = `${type}(${argsFormatted})`);
      } }
	};

	return { action, text };
}

class Action extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1a7time-style")) add_css$d();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, ["action"]);
	}
}

/* src/client/debug/mcts/Table.svelte generated by Svelte v3.12.1 */

function add_css$e() {
	var style = element("style");
	style.id = 'svelte-ztcwsu-style';
	style.textContent = "table.svelte-ztcwsu{font-size:12px;border-collapse:collapse;border:1px solid #ddd;padding:0}tr.svelte-ztcwsu{cursor:pointer}tr.svelte-ztcwsu:hover td.svelte-ztcwsu{background:#eee}tr.selected.svelte-ztcwsu td.svelte-ztcwsu{background:#eee}td.svelte-ztcwsu{padding:10px;height:10px;line-height:10px;font-size:12px;border:none}th.svelte-ztcwsu{background:#888;color:#fff;padding:10px;text-align:center}";
	append(document.head, style);
}

function get_each_context$3(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.child = list[i];
	child_ctx.i = i;
	return child_ctx;
}

// (86:2) {#each children as child, i}
function create_each_block$3(ctx) {
	var tr, td0, t0_value = ctx.child.value + "", t0, t1, td1, t2_value = ctx.child.visits + "", t2, t3, td2, t4, current, dispose;

	var action = new Action({ props: { action: ctx.child.parentAction } });

	function click_handler() {
		return ctx.click_handler(ctx);
	}

	function mouseout_handler() {
		return ctx.mouseout_handler(ctx);
	}

	function mouseover_handler() {
		return ctx.mouseover_handler(ctx);
	}

	return {
		c() {
			tr = element("tr");
			td0 = element("td");
			t0 = text(t0_value);
			t1 = space();
			td1 = element("td");
			t2 = text(t2_value);
			t3 = space();
			td2 = element("td");
			action.$$.fragment.c();
			t4 = space();
			attr(td0, "class", "svelte-ztcwsu");
			attr(td1, "class", "svelte-ztcwsu");
			attr(td2, "class", "svelte-ztcwsu");
			attr(tr, "class", "svelte-ztcwsu");
			toggle_class(tr, "clickable", ctx.children.length > 0);
			toggle_class(tr, "selected", ctx.i === ctx.selectedIndex);

			dispose = [
				listen(tr, "click", click_handler),
				listen(tr, "mouseout", mouseout_handler),
				listen(tr, "mouseover", mouseover_handler)
			];
		},

		m(target, anchor) {
			insert(target, tr, anchor);
			append(tr, td0);
			append(td0, t0);
			append(tr, t1);
			append(tr, td1);
			append(td1, t2);
			append(tr, t3);
			append(tr, td2);
			mount_component(action, td2, null);
			append(tr, t4);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((!current || changed.children) && t0_value !== (t0_value = ctx.child.value + "")) {
				set_data(t0, t0_value);
			}

			if ((!current || changed.children) && t2_value !== (t2_value = ctx.child.visits + "")) {
				set_data(t2, t2_value);
			}

			var action_changes = {};
			if (changed.children) action_changes.action = ctx.child.parentAction;
			action.$set(action_changes);

			if (changed.children) {
				toggle_class(tr, "clickable", ctx.children.length > 0);
			}

			if (changed.selectedIndex) {
				toggle_class(tr, "selected", ctx.i === ctx.selectedIndex);
			}
		},

		i(local) {
			if (current) return;
			transition_in(action.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(action.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(tr);
			}

			destroy_component(action);

			run_all(dispose);
		}
	};
}

function create_fragment$g(ctx) {
	var table, thead, t_5, tbody, current;

	let each_value = ctx.children;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			table = element("table");
			thead = element("thead");
			thead.innerHTML = `<th class="svelte-ztcwsu">Value</th> <th class="svelte-ztcwsu">Visits</th> <th class="svelte-ztcwsu">Action</th>`;
			t_5 = space();
			tbody = element("tbody");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(table, "class", "svelte-ztcwsu");
		},

		m(target, anchor) {
			insert(target, table, anchor);
			append(table, thead);
			append(table, t_5);
			append(table, tbody);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(tbody, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (changed.children || changed.selectedIndex) {
				each_value = ctx.children;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(tbody, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(table);
			}

			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let { root, selectedIndex = null } = $$props;

  const dispatch = createEventDispatcher();

  let parents = [];
  let children = [];

  function Select(node, i) {
    dispatch('select', { node, selectedIndex: i });
  }

  function Preview(node, i) {
    if (selectedIndex === null) {
      dispatch('preview', { node });
    }
  }

	const click_handler = ({ child, i }) => Select(child, i);

	const mouseout_handler = ({ i }) => Preview(null);

	const mouseover_handler = ({ child, i }) => Preview(child);

	$$self.$set = $$props => {
		if ('root' in $$props) $$invalidate('root', root = $$props.root);
		if ('selectedIndex' in $$props) $$invalidate('selectedIndex', selectedIndex = $$props.selectedIndex);
	};

	$$self.$$.update = ($$dirty = { root: 1, parents: 1 }) => {
		if ($$dirty.root || $$dirty.parents) { {
        let t = root;
        $$invalidate('parents', parents = []);
        while (t.parent) {
          const parent = t.parent;
          const { type, args } = t.parentAction.payload;
          const argsFormatted = (args || []).join(',');
          const arrowText = `${type}(${argsFormatted})`;
          parents.push({ parent, arrowText });
          t = parent;
        }
        parents.reverse();
    
        $$invalidate('children', children = [...root.children]
                       .sort((a, b) => (a.visits < b.visits ? 1 : -1))
                       .slice(0, 50));
      } }
	};

	return {
		root,
		selectedIndex,
		children,
		Select,
		Preview,
		click_handler,
		mouseout_handler,
		mouseover_handler
	};
}

class Table extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-ztcwsu-style")) add_css$e();
		init(this, options, instance$g, create_fragment$g, safe_not_equal, ["root", "selectedIndex"]);
	}
}

/* src/client/debug/mcts/MCTS.svelte generated by Svelte v3.12.1 */

function add_css$f() {
	var style = element("style");
	style.id = 'svelte-1f0amz4-style';
	style.textContent = ".visualizer.svelte-1f0amz4{display:flex;flex-direction:column;align-items:center;padding:50px}.preview.svelte-1f0amz4{opacity:0.5}.icon.svelte-1f0amz4{color:#777;width:32px;height:32px;margin-bottom:20px}";
	append(document.head, style);
}

function get_each_context$4(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.node = list[i].node;
	child_ctx.selectedIndex = list[i].selectedIndex;
	child_ctx.i = i;
	return child_ctx;
}

// (50:4) {#if i !== 0}
function create_if_block_2$1(ctx) {
	var div, current;

	var arrow = new FaArrowAltCircleDown({});

	return {
		c() {
			div = element("div");
			arrow.$$.fragment.c();
			attr(div, "class", "icon svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(arrow, div, null);
			current = true;
		},

		i(local) {
			if (current) return;
			transition_in(arrow.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(arrow.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_component(arrow);
		}
	};
}

// (61:6) {:else}
function create_else_block$1(ctx) {
	var current;

	function select_handler_1(...args) {
		return ctx.select_handler_1(ctx, ...args);
	}

	var table = new Table({
		props: {
		root: ctx.node,
		selectedIndex: ctx.selectedIndex
	}
	});
	table.$on("select", select_handler_1);

	return {
		c() {
			table.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(table, target, anchor);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			var table_changes = {};
			if (changed.nodes) table_changes.root = ctx.node;
			if (changed.nodes) table_changes.selectedIndex = ctx.selectedIndex;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(table, detaching);
		}
	};
}

// (57:6) {#if i === nodes.length - 1}
function create_if_block_1$1(ctx) {
	var current;

	function select_handler(...args) {
		return ctx.select_handler(ctx, ...args);
	}

	function preview_handler(...args) {
		return ctx.preview_handler(ctx, ...args);
	}

	var table = new Table({ props: { root: ctx.node } });
	table.$on("select", select_handler);
	table.$on("preview", preview_handler);

	return {
		c() {
			table.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(table, target, anchor);
			current = true;
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			var table_changes = {};
			if (changed.nodes) table_changes.root = ctx.node;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(table, detaching);
		}
	};
}

// (49:2) {#each nodes as { node, selectedIndex }
function create_each_block$4(ctx) {
	var t, section, current_block_type_index, if_block1, current;

	var if_block0 = (ctx.i !== 0) && create_if_block_2$1();

	var if_block_creators = [
		create_if_block_1$1,
		create_else_block$1
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.i === ctx.nodes.length - 1) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			section = element("section");
			if_block1.c();
		},

		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			insert(target, section, anchor);
			if_blocks[current_block_type_index].m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block1 = if_blocks[current_block_type_index];
				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				}
				transition_in(if_block1, 1);
				if_block1.m(section, null);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},

		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},

		d(detaching) {
			if (if_block0) if_block0.d(detaching);

			if (detaching) {
				detach(t);
				detach(section);
			}

			if_blocks[current_block_type_index].d();
		}
	};
}

// (69:2) {#if preview}
function create_if_block$6(ctx) {
	var div, t, section, current;

	var arrow = new FaArrowAltCircleDown({});

	var table = new Table({ props: { root: ctx.preview } });

	return {
		c() {
			div = element("div");
			arrow.$$.fragment.c();
			t = space();
			section = element("section");
			table.$$.fragment.c();
			attr(div, "class", "icon svelte-1f0amz4");
			attr(section, "class", "preview svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(arrow, div, null);
			insert(target, t, anchor);
			insert(target, section, anchor);
			mount_component(table, section, null);
			current = true;
		},

		p(changed, ctx) {
			var table_changes = {};
			if (changed.preview) table_changes.root = ctx.preview;
			table.$set(table_changes);
		},

		i(local) {
			if (current) return;
			transition_in(arrow.$$.fragment, local);

			transition_in(table.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(arrow.$$.fragment, local);
			transition_out(table.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_component(arrow);

			if (detaching) {
				detach(t);
				detach(section);
			}

			destroy_component(table);
		}
	};
}

function create_fragment$h(ctx) {
	var div, t, current;

	let each_value = ctx.nodes;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	var if_block = (ctx.preview) && create_if_block$6(ctx);

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if (if_block) if_block.c();
			attr(div, "class", "visualizer svelte-1f0amz4");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append(div, t);
			if (if_block) if_block.m(div, null);
			current = true;
		},

		p(changed, ctx) {
			if (changed.nodes) {
				each_value = ctx.nodes;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, t);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (ctx.preview) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$6(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(if_block);
			current = true;
		},

		o(local) {
			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks, detaching);

			if (if_block) if_block.d();
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	let { metadata } = $$props;

  let nodes = [];
  let preview = null;

  function SelectNode({ node, selectedIndex }, i) {
    $$invalidate('preview', preview = null);
    $$invalidate('nodes', nodes[i].selectedIndex = selectedIndex, nodes);
    $$invalidate('nodes', nodes = [...nodes.slice(0, i + 1), { node }]);
  }

  function PreviewNode({ node }, i) {
    $$invalidate('preview', preview = node);
  }

	const select_handler = ({ i }, e) => SelectNode(e.detail, i);

	const preview_handler = ({ i }, e) => PreviewNode(e.detail);

	const select_handler_1 = ({ i }, e) => SelectNode(e.detail, i);

	$$self.$set = $$props => {
		if ('metadata' in $$props) $$invalidate('metadata', metadata = $$props.metadata);
	};

	$$self.$$.update = ($$dirty = { metadata: 1 }) => {
		if ($$dirty.metadata) { {
        $$invalidate('nodes', nodes = [{ node: metadata }]);
      } }
	};

	return {
		metadata,
		nodes,
		preview,
		SelectNode,
		PreviewNode,
		select_handler,
		preview_handler,
		select_handler_1
	};
}

class MCTS extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1f0amz4-style")) add_css$f();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, ["metadata"]);
	}
}

/* src/client/debug/log/Log.svelte generated by Svelte v3.12.1 */

function add_css$g() {
	var style = element("style");
	style.id = 'svelte-1pq5e4b-style';
	style.textContent = ".gamelog.svelte-1pq5e4b{display:grid;grid-template-columns:30px 1fr 30px;grid-auto-rows:auto;grid-auto-flow:column}";
	append(document.head, style);
}

function get_each_context$5(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.phase = list[i].phase;
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.action = list[i].action;
	child_ctx.payload = list[i].payload;
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.turn = list[i].turn;
	child_ctx.i = i;
	return child_ctx;
}

// (137:4) {#if i in turnBoundaries}
function create_if_block_1$2(ctx) {
	var current;

	var turnmarker = new TurnMarker({
		props: {
		turn: ctx.turn,
		numEvents: ctx.turnBoundaries[ctx.i]
	}
	});

	return {
		c() {
			turnmarker.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(turnmarker, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var turnmarker_changes = {};
			if (changed.renderedLogEntries) turnmarker_changes.turn = ctx.turn;
			if (changed.turnBoundaries) turnmarker_changes.numEvents = ctx.turnBoundaries[ctx.i];
			turnmarker.$set(turnmarker_changes);
		},

		i(local) {
			if (current) return;
			transition_in(turnmarker.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(turnmarker.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(turnmarker, detaching);
		}
	};
}

// (136:2) {#each renderedLogEntries as { turn }
function create_each_block_2(ctx) {
	var if_block_anchor, current;

	var if_block = (ctx.i in ctx.turnBoundaries) && create_if_block_1$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.i in ctx.turnBoundaries) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_1$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}
		}
	};
}

// (142:2) {#each renderedLogEntries as { action, payload }
function create_each_block_1(ctx) {
	var current;

	var logevent = new LogEvent({
		props: {
		pinned: ctx.i === ctx.pinned,
		logIndex: ctx.i,
		action: ctx.action,
		payload: ctx.payload
	}
	});
	logevent.$on("click", ctx.OnLogClick);
	logevent.$on("mouseenter", ctx.OnMouseEnter);
	logevent.$on("mouseleave", ctx.OnMouseLeave);

	return {
		c() {
			logevent.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(logevent, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var logevent_changes = {};
			if (changed.pinned) logevent_changes.pinned = ctx.i === ctx.pinned;
			if (changed.renderedLogEntries) logevent_changes.action = ctx.action;
			if (changed.renderedLogEntries) logevent_changes.payload = ctx.payload;
			logevent.$set(logevent_changes);
		},

		i(local) {
			if (current) return;
			transition_in(logevent.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(logevent.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(logevent, detaching);
		}
	};
}

// (154:4) {#if i in phaseBoundaries}
function create_if_block$7(ctx) {
	var current;

	var phasemarker = new PhaseMarker({
		props: {
		phase: ctx.phase,
		numEvents: ctx.phaseBoundaries[ctx.i]
	}
	});

	return {
		c() {
			phasemarker.$$.fragment.c();
		},

		m(target, anchor) {
			mount_component(phasemarker, target, anchor);
			current = true;
		},

		p(changed, ctx) {
			var phasemarker_changes = {};
			if (changed.renderedLogEntries) phasemarker_changes.phase = ctx.phase;
			if (changed.phaseBoundaries) phasemarker_changes.numEvents = ctx.phaseBoundaries[ctx.i];
			phasemarker.$set(phasemarker_changes);
		},

		i(local) {
			if (current) return;
			transition_in(phasemarker.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(phasemarker.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			destroy_component(phasemarker, detaching);
		}
	};
}

// (153:2) {#each renderedLogEntries as { phase }
function create_each_block$5(ctx) {
	var if_block_anchor, current;

	var if_block = (ctx.i in ctx.phaseBoundaries) && create_if_block$7(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.i in ctx.phaseBoundaries) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$7(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}
		}
	};
}

function create_fragment$i(ctx) {
	var div, t0, t1, current, dispose;

	let each_value_2 = ctx.renderedLogEntries;

	let each_blocks_2 = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
		each_blocks_2[i] = null;
	});

	let each_value_1 = ctx.renderedLogEntries;

	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
		each_blocks_1[i] = null;
	});

	let each_value = ctx.renderedLogEntries;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
	}

	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].c();
			}

			t0 = space();

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			t1 = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			attr(div, "class", "gamelog svelte-1pq5e4b");
			toggle_class(div, "pinned", ctx.pinned);
			dispose = listen(window, "keydown", ctx.OnKeyDown);
		},

		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks_2.length; i += 1) {
				each_blocks_2[i].m(div, null);
			}

			append(div, t0);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(div, null);
			}

			append(div, t1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},

		p(changed, ctx) {
			if (changed.turnBoundaries || changed.renderedLogEntries) {
				each_value_2 = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(changed, child_ctx);
						transition_in(each_blocks_2[i], 1);
					} else {
						each_blocks_2[i] = create_each_block_2(child_ctx);
						each_blocks_2[i].c();
						transition_in(each_blocks_2[i], 1);
						each_blocks_2[i].m(div, t0);
					}
				}

				group_outros();
				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if (changed.pinned || changed.renderedLogEntries) {
				each_value_1 = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(changed, child_ctx);
						transition_in(each_blocks_1[i], 1);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						transition_in(each_blocks_1[i], 1);
						each_blocks_1[i].m(div, t1);
					}
				}

				group_outros();
				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
					out_1(i);
				}
				check_outros();
			}

			if (changed.phaseBoundaries || changed.renderedLogEntries) {
				each_value = ctx.renderedLogEntries;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$5(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$5(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out_2(i);
				}
				check_outros();
			}

			if (changed.pinned) {
				toggle_class(div, "pinned", ctx.pinned);
			}
		},

		i(local) {
			if (current) return;
			for (let i = 0; i < each_value_2.length; i += 1) {
				transition_in(each_blocks_2[i]);
			}

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks_1[i]);
			}

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o(local) {
			each_blocks_2 = each_blocks_2.filter(Boolean);
			for (let i = 0; i < each_blocks_2.length; i += 1) {
				transition_out(each_blocks_2[i]);
			}

			each_blocks_1 = each_blocks_1.filter(Boolean);
			for (let i = 0; i < each_blocks_1.length; i += 1) {
				transition_out(each_blocks_1[i]);
			}

			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			destroy_each(each_blocks_2, detaching);

			destroy_each(each_blocks_1, detaching);

			destroy_each(each_blocks, detaching);

			dispose();
		}
	};
}

function instance$i($$self, $$props, $$invalidate) {
	let $client;

	let { client } = $$props; component_subscribe($$self, client, $$value => { $client = $$value; $$invalidate('$client', $client); });

  const { secondaryPane } = getContext('secondaryPane');

  const initialState = client.getInitialState();
  let { log } = $client;
  let pinned = null;

  function rewind(logIndex) {
    let state = initialState;
    for (let i = 0; i < log.length; i++) {
      const { action, automatic } = log[i];

      if (!automatic) {
        state = client.reducer(state, action);
      }

      if (action.type == MAKE_MOVE) {
        if (logIndex == 0) {
          break;
        }

        logIndex--;
      }
    }
    return { G: state.G, ctx: state.ctx };
  }

  function OnLogClick(e) {
    const { logIndex } = e.detail;
    const state = rewind(logIndex);
    const renderedLogEntries = log.filter(e => e.action.type == MAKE_MOVE);
    client.overrideGameState(state);

    if (pinned == logIndex) {
      $$invalidate('pinned', pinned = null);
      secondaryPane.set(null);
    } else {
      $$invalidate('pinned', pinned = logIndex);
      const { metadata } = renderedLogEntries[logIndex].action.payload;
      if (metadata) {
        secondaryPane.set({ component: MCTS, metadata });
      }
    }
  }

  function OnMouseEnter(e) {
    const { logIndex } = e.detail;
    if (pinned === null) {
      const state = rewind(logIndex);
      client.overrideGameState(state);
    }
  }

  function OnMouseLeave() {
    if (pinned === null) {
      client.overrideGameState(null);
    }
  }

  function Reset() {
    $$invalidate('pinned', pinned = null);
    client.overrideGameState(null);
    secondaryPane.set(null);
  }

  onDestroy(Reset);

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Reset();
    }
  }

  let renderedLogEntries;
  let turnBoundaries = {};
  let phaseBoundaries = {};

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	$$self.$$.update = ($$dirty = { $client: 1, log: 1, renderedLogEntries: 1 }) => {
		if ($$dirty.$client || $$dirty.log || $$dirty.renderedLogEntries) { {
        $$invalidate('log', log = $client.log);
        $$invalidate('renderedLogEntries', renderedLogEntries = log.filter(e => e.action.type == MAKE_MOVE));
    
        let eventsInCurrentPhase = 0;
        let eventsInCurrentTurn = 0;
    
        $$invalidate('turnBoundaries', turnBoundaries = {});
        $$invalidate('phaseBoundaries', phaseBoundaries = {});
    
        for (let i = 0; i < renderedLogEntries.length; i++) {
          const { action, payload, turn, phase } = renderedLogEntries[i];
    
          eventsInCurrentTurn++;
          eventsInCurrentPhase++;
    
          if (
            i == renderedLogEntries.length - 1 ||
            renderedLogEntries[i + 1].turn != turn
          ) {
            $$invalidate('turnBoundaries', turnBoundaries[i] = eventsInCurrentTurn, turnBoundaries);
            eventsInCurrentTurn = 0;
          }
    
          if (
            i == renderedLogEntries.length - 1 ||
            renderedLogEntries[i + 1].phase != phase
          ) {
            $$invalidate('phaseBoundaries', phaseBoundaries[i] = eventsInCurrentPhase, phaseBoundaries);
            eventsInCurrentPhase = 0;
          }
        }
      } }
	};

	return {
		client,
		pinned,
		OnLogClick,
		OnMouseEnter,
		OnMouseLeave,
		OnKeyDown,
		renderedLogEntries,
		turnBoundaries,
		phaseBoundaries
	};
}

class Log extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1pq5e4b-style")) add_css$g();
		init(this, options, instance$i, create_fragment$i, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/ai/Options.svelte generated by Svelte v3.12.1 */
const { Object: Object_1 } = globals;

function add_css$h() {
	var style = element("style");
	style.id = 'svelte-7cel4i-style';
	style.textContent = "label.svelte-7cel4i{font-weight:bold;color:#999}.option.svelte-7cel4i{margin-bottom:20px}.value.svelte-7cel4i{font-weight:bold}input[type='checkbox'].svelte-7cel4i{vertical-align:middle}";
	append(document.head, style);
}

function get_each_context$6(ctx, list, i) {
	const child_ctx = Object_1.create(ctx);
	child_ctx.key = list[i][0];
	child_ctx.value = list[i][1];
	return child_ctx;
}

// (39:4) {#if value.range}
function create_if_block_1$3(ctx) {
	var span, t0_value = ctx.values[ctx.key] + "", t0, t1, input, input_min_value, input_max_value, dispose;

	function input_change_input_handler() {
		ctx.input_change_input_handler.call(input, ctx);
	}

	return {
		c() {
			span = element("span");
			t0 = text(t0_value);
			t1 = space();
			input = element("input");
			attr(span, "class", "value svelte-7cel4i");
			attr(input, "type", "range");
			attr(input, "min", input_min_value = ctx.value.range.min);
			attr(input, "max", input_max_value = ctx.value.range.max);

			dispose = [
				listen(input, "change", input_change_input_handler),
				listen(input, "input", input_change_input_handler),
				listen(input, "change", ctx.OnChange)
			];
		},

		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t0);
			insert(target, t1, anchor);
			insert(target, input, anchor);

			set_input_value(input, ctx.values[ctx.key]);
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.values || changed.bot) && t0_value !== (t0_value = ctx.values[ctx.key] + "")) {
				set_data(t0, t0_value);
			}

			if ((changed.values || changed.Object || changed.bot)) set_input_value(input, ctx.values[ctx.key]);

			if ((changed.bot) && input_min_value !== (input_min_value = ctx.value.range.min)) {
				attr(input, "min", input_min_value);
			}

			if ((changed.bot) && input_max_value !== (input_max_value = ctx.value.range.max)) {
				attr(input, "max", input_max_value);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(span);
				detach(t1);
				detach(input);
			}

			run_all(dispose);
		}
	};
}

// (44:4) {#if typeof value.value === 'boolean'}
function create_if_block$8(ctx) {
	var input, dispose;

	function input_change_handler() {
		ctx.input_change_handler.call(input, ctx);
	}

	return {
		c() {
			input = element("input");
			attr(input, "type", "checkbox");
			attr(input, "class", "svelte-7cel4i");

			dispose = [
				listen(input, "change", input_change_handler),
				listen(input, "change", ctx.OnChange)
			];
		},

		m(target, anchor) {
			insert(target, input, anchor);

			input.checked = ctx.values[ctx.key];
		},

		p(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.values || changed.Object || changed.bot)) input.checked = ctx.values[ctx.key];
		},

		d(detaching) {
			if (detaching) {
				detach(input);
			}

			run_all(dispose);
		}
	};
}

// (35:0) {#each Object.entries(bot.opts()) as [key, value]}
function create_each_block$6(ctx) {
	var div, label, t0_value = ctx.key + "", t0, t1, t2, t3;

	var if_block0 = (ctx.value.range) && create_if_block_1$3(ctx);

	var if_block1 = (typeof ctx.value.value === 'boolean') && create_if_block$8(ctx);

	return {
		c() {
			div = element("div");
			label = element("label");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			attr(label, "class", "svelte-7cel4i");
			attr(div, "class", "option svelte-7cel4i");
		},

		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, t0);
			append(div, t1);
			if (if_block0) if_block0.m(div, null);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
			append(div, t3);
		},

		p(changed, ctx) {
			if ((changed.bot) && t0_value !== (t0_value = ctx.key + "")) {
				set_data(t0, t0_value);
			}

			if (ctx.value.range) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_1$3(ctx);
					if_block0.c();
					if_block0.m(div, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (typeof ctx.value.value === 'boolean') {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block$8(ctx);
					if_block1.c();
					if_block1.m(div, t3);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function create_fragment$j(ctx) {
	var each_1_anchor;

	let each_value = ctx.Object.entries(ctx.bot.opts());

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},

		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
		},

		p(changed, ctx) {
			if (changed.Object || changed.bot || changed.values) {
				each_value = ctx.Object.entries(ctx.bot.opts());

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$6(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$6(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d(detaching) {
			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(each_1_anchor);
			}
		}
	};
}

function instance$j($$self, $$props, $$invalidate) {
	let { bot } = $$props;

  let values = {};
  for (let [key, value] of Object.entries(bot.opts())) {
    $$invalidate('values', values[key] = value.value, values);
  }

  function OnChange() {
    for (let [key, value] of Object.entries(values)) {
      bot.setOpt(key, value);
    }
  }

	function input_change_input_handler({ key }) {
		values[key] = to_number(this.value);
		$$invalidate('values', values);
		$$invalidate('Object', Object);
		$$invalidate('bot', bot);
	}

	function input_change_handler({ key }) {
		values[key] = this.checked;
		$$invalidate('values', values);
		$$invalidate('Object', Object);
		$$invalidate('bot', bot);
	}

	$$self.$set = $$props => {
		if ('bot' in $$props) $$invalidate('bot', bot = $$props.bot);
	};

	return {
		bot,
		values,
		OnChange,
		Object,
		input_change_input_handler,
		input_change_handler
	};
}

class Options extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-7cel4i-style")) add_css$h();
		init(this, options, instance$j, create_fragment$j, safe_not_equal, ["bot"]);
	}
}

/* src/client/debug/ai/AI.svelte generated by Svelte v3.12.1 */

function add_css$i() {
	var style = element("style");
	style.id = 'svelte-hsd9fq-style';
	style.textContent = "li.svelte-hsd9fq{list-style:none;margin:none;margin-bottom:5px}h3.svelte-hsd9fq{text-transform:uppercase}label.svelte-hsd9fq{font-weight:bold;color:#999}input[type='checkbox'].svelte-hsd9fq{vertical-align:middle}";
	append(document.head, style);
}

function get_each_context$7(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.bot = list[i];
	return child_ctx;
}

// (193:4) {:else}
function create_else_block$2(ctx) {
	var p0, t_1, p1;

	return {
		c() {
			p0 = element("p");
			p0.textContent = "No bots available.";
			t_1 = space();
			p1 = element("p");
			p1.innerHTML = `
			        Follow the instructions
			        <a href="https://boardgame.io/documentation/#/tutorial?id=bots" target="_blank">
			          here</a>
			        to set up bots.
			      `;
		},

		m(target, anchor) {
			insert(target, p0, anchor);
			insert(target, t_1, anchor);
			insert(target, p1, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(p0);
				detach(t_1);
				detach(p1);
			}
		}
	};
}

// (191:4) {#if client.multiplayer}
function create_if_block_5(ctx) {
	var p;

	return {
		c() {
			p = element("p");
			p.textContent = "The bot debugger is only available in singleplayer mode.";
		},

		m(target, anchor) {
			insert(target, p, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d(detaching) {
			if (detaching) {
				detach(p);
			}
		}
	};
}

// (145:2) {#if client.game.ai && !client.multiplayer}
function create_if_block$9(ctx) {
	var section0, h30, t1, li0, t2, li1, t3, li2, t4, section1, h31, t6, select, t7, show_if = Object.keys(ctx.bot.opts()).length, t8, if_block1_anchor, current, dispose;

	var hotkey0 = new Hotkey({
		props: {
		value: "1",
		onPress: ctx.Reset,
		label: "reset"
	}
	});

	var hotkey1 = new Hotkey({
		props: {
		value: "2",
		onPress: ctx.Step,
		label: "play"
	}
	});

	var hotkey2 = new Hotkey({
		props: {
		value: "3",
		onPress: ctx.Simulate,
		label: "simulate"
	}
	});

	let each_value = Object.keys(ctx.bots);

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
	}

	var if_block0 = (show_if) && create_if_block_4(ctx);

	var if_block1 = (ctx.botAction || ctx.iterationCounter) && create_if_block_1$4(ctx);

	return {
		c() {
			section0 = element("section");
			h30 = element("h3");
			h30.textContent = "Controls";
			t1 = space();
			li0 = element("li");
			hotkey0.$$.fragment.c();
			t2 = space();
			li1 = element("li");
			hotkey1.$$.fragment.c();
			t3 = space();
			li2 = element("li");
			hotkey2.$$.fragment.c();
			t4 = space();
			section1 = element("section");
			h31 = element("h3");
			h31.textContent = "Bot";
			t6 = space();
			select = element("select");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t7 = space();
			if (if_block0) if_block0.c();
			t8 = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
			attr(h30, "class", "svelte-hsd9fq");
			attr(li0, "class", "svelte-hsd9fq");
			attr(li1, "class", "svelte-hsd9fq");
			attr(li2, "class", "svelte-hsd9fq");
			attr(h31, "class", "svelte-hsd9fq");
			if (ctx.selectedBot === void 0) add_render_callback(() => ctx.select_change_handler.call(select));

			dispose = [
				listen(select, "change", ctx.select_change_handler),
				listen(select, "change", ctx.ChangeBot)
			];
		},

		m(target, anchor) {
			insert(target, section0, anchor);
			append(section0, h30);
			append(section0, t1);
			append(section0, li0);
			mount_component(hotkey0, li0, null);
			append(section0, t2);
			append(section0, li1);
			mount_component(hotkey1, li1, null);
			append(section0, t3);
			append(section0, li2);
			mount_component(hotkey2, li2, null);
			insert(target, t4, anchor);
			insert(target, section1, anchor);
			append(section1, h31);
			append(section1, t6);
			append(section1, select);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(select, null);
			}

			select_option(select, ctx.selectedBot);

			insert(target, t7, anchor);
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t8, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (changed.bots) {
				each_value = Object.keys(ctx.bots);

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$7(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$7(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(select, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (changed.selectedBot) select_option(select, ctx.selectedBot);

			if (changed.bot) show_if = Object.keys(ctx.bot.opts()).length;

			if (show_if) {
				if (if_block0) {
					if_block0.p(changed, ctx);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_4(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t8.parentNode, t8);
				}
			} else if (if_block0) {
				group_outros();
				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});
				check_outros();
			}

			if (ctx.botAction || ctx.iterationCounter) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_1$4(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		i(local) {
			if (current) return;
			transition_in(hotkey0.$$.fragment, local);

			transition_in(hotkey1.$$.fragment, local);

			transition_in(hotkey2.$$.fragment, local);

			transition_in(if_block0);
			current = true;
		},

		o(local) {
			transition_out(hotkey0.$$.fragment, local);
			transition_out(hotkey1.$$.fragment, local);
			transition_out(hotkey2.$$.fragment, local);
			transition_out(if_block0);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section0);
			}

			destroy_component(hotkey0);

			destroy_component(hotkey1);

			destroy_component(hotkey2);

			if (detaching) {
				detach(t4);
				detach(section1);
			}

			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach(t7);
			}

			if (if_block0) if_block0.d(detaching);

			if (detaching) {
				detach(t8);
			}

			if (if_block1) if_block1.d(detaching);

			if (detaching) {
				detach(if_block1_anchor);
			}

			run_all(dispose);
		}
	};
}

// (162:8) {#each Object.keys(bots) as bot}
function create_each_block$7(ctx) {
	var option, t_value = ctx.bot + "", t;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			option.__value = ctx.bot;
			option.value = option.__value;
		},

		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},

		p: noop,

		d(detaching) {
			if (detaching) {
				detach(option);
			}
		}
	};
}

// (168:4) {#if Object.keys(bot.opts()).length}
function create_if_block_4(ctx) {
	var section, h3, t1, label, t3, input, t4, current, dispose;

	var options = new Options({ props: { bot: ctx.bot } });

	return {
		c() {
			section = element("section");
			h3 = element("h3");
			h3.textContent = "Options";
			t1 = space();
			label = element("label");
			label.textContent = "debug";
			t3 = space();
			input = element("input");
			t4 = space();
			options.$$.fragment.c();
			attr(h3, "class", "svelte-hsd9fq");
			attr(label, "class", "svelte-hsd9fq");
			attr(input, "type", "checkbox");
			attr(input, "class", "svelte-hsd9fq");

			dispose = [
				listen(input, "change", ctx.input_change_handler),
				listen(input, "change", ctx.OnDebug)
			];
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, h3);
			append(section, t1);
			append(section, label);
			append(section, t3);
			append(section, input);

			input.checked = ctx.debug;

			append(section, t4);
			mount_component(options, section, null);
			current = true;
		},

		p(changed, ctx) {
			if (changed.debug) input.checked = ctx.debug;

			var options_changes = {};
			if (changed.bot) options_changes.bot = ctx.bot;
			options.$set(options_changes);
		},

		i(local) {
			if (current) return;
			transition_in(options.$$.fragment, local);

			current = true;
		},

		o(local) {
			transition_out(options.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			destroy_component(options);

			run_all(dispose);
		}
	};
}

// (177:4) {#if botAction || iterationCounter}
function create_if_block_1$4(ctx) {
	var section, h3, t1, t2;

	var if_block0 = (ctx.progress && ctx.progress < 1.0) && create_if_block_3(ctx);

	var if_block1 = (ctx.botAction) && create_if_block_2$2(ctx);

	return {
		c() {
			section = element("section");
			h3 = element("h3");
			h3.textContent = "Result";
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			attr(h3, "class", "svelte-hsd9fq");
		},

		m(target, anchor) {
			insert(target, section, anchor);
			append(section, h3);
			append(section, t1);
			if (if_block0) if_block0.m(section, null);
			append(section, t2);
			if (if_block1) if_block1.m(section, null);
		},

		p(changed, ctx) {
			if (ctx.progress && ctx.progress < 1.0) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_3(ctx);
					if_block0.c();
					if_block0.m(section, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (ctx.botAction) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_2$2(ctx);
					if_block1.c();
					if_block1.m(section, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

// (180:6) {#if progress && progress < 1.0}
function create_if_block_3(ctx) {
	var progress_1;

	return {
		c() {
			progress_1 = element("progress");
			progress_1.value = ctx.progress;
		},

		m(target, anchor) {
			insert(target, progress_1, anchor);
		},

		p(changed, ctx) {
			if (changed.progress) {
				progress_1.value = ctx.progress;
			}
		},

		d(detaching) {
			if (detaching) {
				detach(progress_1);
			}
		}
	};
}

// (184:6) {#if botAction}
function create_if_block_2$2(ctx) {
	var li0, t0, t1, t2, li1, t3, t4_value = JSON.stringify(ctx.botActionArgs) + "", t4;

	return {
		c() {
			li0 = element("li");
			t0 = text("Action: ");
			t1 = text(ctx.botAction);
			t2 = space();
			li1 = element("li");
			t3 = text("Args: ");
			t4 = text(t4_value);
			attr(li0, "class", "svelte-hsd9fq");
			attr(li1, "class", "svelte-hsd9fq");
		},

		m(target, anchor) {
			insert(target, li0, anchor);
			append(li0, t0);
			append(li0, t1);
			insert(target, t2, anchor);
			insert(target, li1, anchor);
			append(li1, t3);
			append(li1, t4);
		},

		p(changed, ctx) {
			if (changed.botAction) {
				set_data(t1, ctx.botAction);
			}

			if ((changed.botActionArgs) && t4_value !== (t4_value = JSON.stringify(ctx.botActionArgs) + "")) {
				set_data(t4, t4_value);
			}
		},

		d(detaching) {
			if (detaching) {
				detach(li0);
				detach(t2);
				detach(li1);
			}
		}
	};
}

function create_fragment$k(ctx) {
	var section, current_block_type_index, if_block, current, dispose;

	var if_block_creators = [
		create_if_block$9,
		create_if_block_5,
		create_else_block$2
	];

	var if_blocks = [];

	function select_block_type(changed, ctx) {
		if (ctx.client.game.ai && !ctx.client.multiplayer) return 0;
		if (ctx.client.multiplayer) return 1;
		return 2;
	}

	current_block_type_index = select_block_type(null, ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			section = element("section");
			if_block.c();
			dispose = listen(window, "keydown", ctx.OnKeyDown);
		},

		m(target, anchor) {
			insert(target, section, anchor);
			if_blocks[current_block_type_index].m(section, null);
			current = true;
		},

		p(changed, ctx) {
			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block = if_blocks[current_block_type_index];
				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}
				transition_in(if_block, 1);
				if_block.m(section, null);
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(section);
			}

			if_blocks[current_block_type_index].d();
			dispose();
		}
	};
}

function instance$k($$self, $$props, $$invalidate) {
	let { client } = $$props;

  const { secondaryPane } = getContext('secondaryPane');

  const bots = {
    'MCTS': MCTSBot,
    'Random': RandomBot,
  };

  let debug = false;
  let progress = null;
  let iterationCounter = 0;
  let metadata = null;
  const iterationCallback = ({ iterationCounter: c, numIterations, metadata: m }) => {
    $$invalidate('iterationCounter', iterationCounter = c);
    $$invalidate('progress', progress = c / numIterations);
    metadata = m;

    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    }
  };

  function OnDebug() {
    if (debug && metadata) {
      secondaryPane.set({ component: MCTS, metadata });
    } else {
      secondaryPane.set(null);
    }
  }

  let bot;
  if (client.game.ai) {
    $$invalidate('bot', bot = new MCTSBot({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    }));
    bot.setOpt('async', true);
  }

  let selectedBot;
  let botAction;
  let botActionArgs;
  function ChangeBot() {
    const botConstructor = bots[selectedBot];
    $$invalidate('bot', bot = new botConstructor({
      game: client.game,
      enumerate: client.game.ai.enumerate,
      iterationCallback,
    }));
    bot.setOpt('async', true);
    $$invalidate('botAction', botAction = null);
    metadata = null;
    secondaryPane.set(null);
    $$invalidate('iterationCounter', iterationCounter = 0);
  }

  async function Step$1() {
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);

    const t = await Step(client, bot);

    if (t) {
      $$invalidate('botAction', botAction = t.payload.type);
      $$invalidate('botActionArgs', botActionArgs = t.payload.args);
    }
  }

  function Simulate(iterations = 10000, sleepTimeout = 100) {
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);
    const step = async () => {
      for (let i = 0; i < iterations; i++) {
        const action = await Step(client, bot);
        if (!action) break;
        await new Promise(resolve => setTimeout(resolve, sleepTimeout));
      }
    };

    return step();
  }

  function Exit() {
    client.overrideGameState(null);
    secondaryPane.set(null);
    $$invalidate('debug', debug = false);
  }

  function Reset() {
    client.reset();
    $$invalidate('botAction', botAction = null);
    metadata = null;
    $$invalidate('iterationCounter', iterationCounter = 0);
    Exit();
  }

  function OnKeyDown(e) {
    // ESC.
    if (e.keyCode == 27) {
      Exit();
    }
  }

  onDestroy(Exit);

	function select_change_handler() {
		selectedBot = select_value(this);
		$$invalidate('selectedBot', selectedBot);
		$$invalidate('bots', bots);
	}

	function input_change_handler() {
		debug = this.checked;
		$$invalidate('debug', debug);
	}

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		bots,
		debug,
		progress,
		iterationCounter,
		OnDebug,
		bot,
		selectedBot,
		botAction,
		botActionArgs,
		ChangeBot,
		Step: Step$1,
		Simulate,
		Reset,
		OnKeyDown,
		select_change_handler,
		input_change_handler
	};
}

class AI extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-hsd9fq-style")) add_css$i();
		init(this, options, instance$k, create_fragment$k, safe_not_equal, ["client"]);
	}
}

/* src/client/debug/Debug.svelte generated by Svelte v3.12.1 */

function add_css$j() {
	var style = element("style");
	style.id = 'svelte-1h5kecx-style';
	style.textContent = ".debug-panel.svelte-1h5kecx{position:fixed;color:#555;font-family:monospace;display:flex;flex-direction:row;text-align:left;right:0;top:0;height:100%;font-size:14px;box-sizing:border-box;opacity:0.9}.pane.svelte-1h5kecx{flex-grow:2;overflow-x:hidden;overflow-y:scroll;background:#fefefe;padding:20px;border-left:1px solid #ccc;box-shadow:-1px 0 5px rgba(0, 0, 0, 0.2);box-sizing:border-box;width:280px}.secondary-pane.svelte-1h5kecx{background:#fefefe;overflow-y:scroll}.debug-panel.svelte-1h5kecx button, select{cursor:pointer;outline:none;background:#eee;border:1px solid #bbb;color:#555;padding:3px;border-radius:3px}.debug-panel.svelte-1h5kecx button{padding-left:10px;padding-right:10px}.debug-panel.svelte-1h5kecx button:hover{background:#ddd}.debug-panel.svelte-1h5kecx button:active{background:#888;color:#fff}.debug-panel.svelte-1h5kecx section{margin-bottom:20px}";
	append(document.head, style);
}

// (109:0) {#if visible}
function create_if_block$a(ctx) {
	var div1, t0, div0, t1, div1_transition, current;

	var menu = new Menu({
		props: {
		panes: ctx.panes,
		pane: ctx.pane
	}
	});
	menu.$on("change", ctx.MenuChange);

	var switch_value = ctx.panes[ctx.pane].component;

	function switch_props(ctx) {
		return { props: { client: ctx.client } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	var if_block = (ctx.$secondaryPane) && create_if_block_1$5(ctx);

	return {
		c() {
			div1 = element("div");
			menu.$$.fragment.c();
			t0 = space();
			div0 = element("div");
			if (switch_instance) switch_instance.$$.fragment.c();
			t1 = space();
			if (if_block) if_block.c();
			attr(div0, "class", "pane svelte-1h5kecx");
			attr(div1, "class", "debug-panel svelte-1h5kecx");
		},

		m(target, anchor) {
			insert(target, div1, anchor);
			mount_component(menu, div1, null);
			append(div1, t0);
			append(div1, div0);

			if (switch_instance) {
				mount_component(switch_instance, div0, null);
			}

			append(div1, t1);
			if (if_block) if_block.m(div1, null);
			current = true;
		},

		p(changed, ctx) {
			var menu_changes = {};
			if (changed.pane) menu_changes.pane = ctx.pane;
			menu.$set(menu_changes);

			var switch_instance_changes = {};
			if (changed.client) switch_instance_changes.client = ctx.client;

			if (switch_value !== (switch_value = ctx.panes[ctx.pane].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div0, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}

			if (ctx.$secondaryPane) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_1$5(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div1, null);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);

			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			transition_in(if_block);

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400 }, true);
				div1_transition.run(1);
			});

			current = true;
		},

		o(local) {
			transition_out(menu.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			transition_out(if_block);

			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 400 }, false);
			div1_transition.run(0);

			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div1);
			}

			destroy_component(menu);

			if (switch_instance) destroy_component(switch_instance);
			if (if_block) if_block.d();

			if (detaching) {
				if (div1_transition) div1_transition.end();
			}
		}
	};
}

// (115:4) {#if $secondaryPane}
function create_if_block_1$5(ctx) {
	var div, current;

	var switch_value = ctx.$secondaryPane.component;

	function switch_props(ctx) {
		return { props: { metadata: ctx.$secondaryPane.metadata } };
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) switch_instance.$$.fragment.c();
			attr(div, "class", "secondary-pane svelte-1h5kecx");
		},

		m(target, anchor) {
			insert(target, div, anchor);

			if (switch_instance) {
				mount_component(switch_instance, div, null);
			}

			current = true;
		},

		p(changed, ctx) {
			var switch_instance_changes = {};
			if (changed.$secondaryPane) switch_instance_changes.metadata = ctx.$secondaryPane.metadata;

			if (switch_value !== (switch_value = ctx.$secondaryPane.component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;
					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});
					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));

					switch_instance.$$.fragment.c();
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, null);
				} else {
					switch_instance = null;
				}
			}

			else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},

		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

			current = true;
		},

		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},

		d(detaching) {
			if (detaching) {
				detach(div);
			}

			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

function create_fragment$l(ctx) {
	var if_block_anchor, current, dispose;

	var if_block = (ctx.visible) && create_if_block$a(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
			dispose = listen(window, "keypress", ctx.Keypress);
		},

		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},

		p(changed, ctx) {
			if (ctx.visible) {
				if (if_block) {
					if_block.p(changed, ctx);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$a(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();
				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});
				check_outros();
			}
		},

		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},

		o(local) {
			transition_out(if_block);
			current = false;
		},

		d(detaching) {
			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach(if_block_anchor);
			}

			dispose();
		}
	};
}

function instance$l($$self, $$props, $$invalidate) {
	let $secondaryPane;

	let { client } = $$props;

  const panes = {
    main: { label: 'Main', shortcut: 'm', component: Main },
    log: { label: 'Log', shortcut: 'l', component: Log },
    info: { label: 'Info', shortcut: 'i', component: Info },
    ai: { label: 'AI', shortcut: 'a', component: AI },
  };

  const disableHotkeys = writable(false);
  const secondaryPane = writable(null); component_subscribe($$self, secondaryPane, $$value => { $secondaryPane = $$value; $$invalidate('$secondaryPane', $secondaryPane); });

  setContext('hotkeys', { disableHotkeys });
  setContext('secondaryPane', { secondaryPane });

  let pane = 'main';
  function MenuChange(e) {
    $$invalidate('pane', pane = e.detail);
  }

  let visible = true;
  function Keypress(e) {
    if (e.key == '.') {
      $$invalidate('visible', visible = !visible);
      return;
    }
    Object.entries(panes).forEach(([key, { shortcut }]) => {
      if (e.key == shortcut) {
        $$invalidate('pane', pane = key);
      }
    });
  }

	$$self.$set = $$props => {
		if ('client' in $$props) $$invalidate('client', client = $$props.client);
	};

	return {
		client,
		panes,
		secondaryPane,
		pane,
		MenuChange,
		visible,
		Keypress,
		$secondaryPane
	};
}

class Debug extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1h5kecx-style")) add_css$j();
		init(this, options, instance$l, create_fragment$l, safe_not_equal, ["client"]);
	}
}

export { Debug as D };
