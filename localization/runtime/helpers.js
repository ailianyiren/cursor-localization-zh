    // 通用 DOM 补丁辅助（供 XiuZheng_* 复用）

    function GengXin_Shuxing_Hints(el, hints, attrs) {
        if (!el) return;
        attrs = attrs || ['title', 'aria-label'];
        for (var a = 0; a < attrs.length; a++) {
            var val = el.getAttribute(attrs[a]);
            if (!val) continue;
            var tr = ChaZhao_FanYi(val) || TiHuan_BuFen_WenBen(val);
            if (tr) {
                el.setAttribute(attrs[a], tr);
                continue;
            }
            for (var j = 0; j < hints.length; j++) {
                if (val === hints[j][0]) {
                    el.setAttribute(attrs[a], hints[j][1]);
                    break;
                }
            }
        }
    }

    function GengXin_WenBen_YeZi_Hints(el, hints, opts) {
        if (!el || el.closest('.monaco-editor .view-lines')) return;
        opts = opts || {};
        var maxLen = opts.maxLen || 120;
        var needleLen = opts.needleLen || 8;
        var allowTags = opts.allowTags || ['BUTTON', 'A', 'LI'];
        var skipChildQuery = opts.skipChildQuery ||
            'span, div, button, .action-label';
        if (opts.leafOnly) {
            if (el.querySelector('div, span, p, button, input, textarea')) return;
        } else if (el.querySelector(skipChildQuery) &&
            allowTags.indexOf(el.tagName) < 0 &&
            !(el.classList && el.classList.contains('action-label'))) return;
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (opts.translatePlaceholder) {
                var ph = el.getAttribute('placeholder');
                if (ph) {
                    var phTr = ChaZhao_FanYi(ph) || TiHuan_BuFen_WenBen(ph);
                    if (phTr && phTr !== ph) el.setAttribute('placeholder', phTr);
                }
            }
            return;
        }
        var text = GuiYiHua_WenBen(el.textContent || '');
        if (!text || text.length > maxLen) return;
        for (var j = 0; j < hints.length; j++) {
            if (text === hints[j][0] ||
                (typeof GuiYiHua_YinHao === 'function' &&
                    GuiYiHua_YinHao(text) === GuiYiHua_YinHao(hints[j][0]))) {
                KeYi_AnQuan_GaiXie_WenBen(el, hints[j][1], [hints[j][0].slice(0, needleLen)]);
                return;
            }
        }
        if (!opts.skipDictionary) {
            var tr = ChaZhao_FanYi(text) || TiHuan_BuFen_WenBen(text);
            if (tr && tr !== text) KeYi_AnQuan_GaiXie_WenBen(el, tr, [text.slice(0, Math.max(needleLen, 10))]);
        }
    }

    function FanYi_Scope_YeZi_Hints(scope, hints, opts) {
        if (!scope || scope.closest('.monaco-editor .view-lines')) return;
        var selector = (opts && opts.selector) ||
            'span, div, label, button, a, li, .action-label';
        var els = scope.querySelectorAll(selector);
        for (var i = 0; i < els.length; i++) {
            FanYi_ShuXing(els[i]);
            GengXin_WenBen_YeZi_Hints(els[i], hints, opts);
        }
    }

    function FanYi_Scope_Form_Hints(scope, hints, opts) {
        opts = opts || {};
        opts.translatePlaceholder = true;
        opts.skipChildQuery = opts.skipChildQuery || 'button, textarea, input';
        opts.allowTags = opts.allowTags || ['BUTTON', 'TEXTAREA', 'INPUT'];
        FanYi_Scope_YeZi_Hints(scope, hints, opts);
    }

    function FanYi_Scope_List_Hints(scopeList, hints, opts) {
        for (var r = 0; r < scopeList.length; r++) {
            FanYi_Scope_YeZi_Hints(scopeList[r], hints, opts);
        }
    }

    function FanYi_Gen_List_Hints(roots, hints, opts) {
        for (var r = 0; r < roots.length; r++) {
            var el = roots[r];
            if (!el || el.closest('.monaco-editor .view-lines')) continue;
            if (opts && opts.skipBianJiQi && YingGai_TiaoGuo_BianJiQi_YuanSu(el)) continue;
            if (opts && opts.skipMonacoEditor && el.closest('.monaco-editor')) continue;
            FanYi_ShuXing(el);
            GengXin_WenBen_YeZi_Hints(el, hints, opts);
        }
    }

    function FanYi_Gen_List_Substring_Hints(roots, hints, opts) {
        opts = opts || {};
        var needleLen = opts.needleLen || 16;
        for (var r = 0; r < roots.length; r++) {
            var el = roots[r];
            if (!el) continue;
            if (el.closest('.monaco-editor .view-lines')) continue;
            if (opts.skipEditor && el.closest('.monaco-editor')) continue;
            FanYi_ShuXing(el);
            var text = GuiYiHua_WenBen(el.textContent || '');
            if (!text) continue;
            if (opts.maxLen && text.length > opts.maxLen) continue;
            var matched = false;
            for (var j = 0; j < hints.length; j++) {
                if (text === hints[j][0] ||
                    text.indexOf(hints[j][0]) !== -1 ||
                    (typeof GuiYiHua_YinHao === 'function' &&
                        GuiYiHua_YinHao(text) === GuiYiHua_YinHao(hints[j][0]))) {
                    KeYi_AnQuan_GaiXie_WenBen(el, hints[j][1], [hints[j][0].slice(0, needleLen)]);
                    matched = true;
                    break;
                }
            }
            if (!matched && !opts.skipDictionary) {
                var tr = ChaZhao_FanYi(text) || TiHuan_BuFen_WenBen(text);
                if (tr && tr !== text) KeYi_AnQuan_GaiXie_WenBen(el, tr, [text.slice(0, needleLen)]);
            }
        }
    }

    function FanYi_Scope_ZiDian_Only(scopeList, opts) {
        opts = opts || {};
        var selector = opts.selector ||
            'h1, h2, h3, h4, p, span, div, button, a, label';
        var maxLen = opts.maxLen || 600;
        var needleLen = opts.needleLen || 14;
        for (var s = 0; s < scopeList.length; s++) {
            var scope = scopeList[s];
            if (!scope) continue;
            var els = scope.querySelectorAll ? scope.querySelectorAll(selector) : [];
            for (var i = 0; i < els.length; i++) {
                var el = els[i];
                if (el.closest('.monaco-editor .view-lines')) continue;
                if (opts.skipHoverWidget && el.closest('.cursorHoverWidget')) continue;
                if (opts.skipNestedInteractive) {
                    if (el.querySelector('button, a') && el.tagName !== 'BUTTON' && el.tagName !== 'A') continue;
                    if (el.querySelector('h1, h2, h3, h4, p, div') &&
                        el.tagName !== 'BUTTON' && el.tagName !== 'A') continue;
                }
                FanYi_ShuXing(el);
                var raw = (el.textContent || '').trim();
                if (!raw || raw.length > maxLen) continue;
                var tr = ChaZhao_FanYi(raw) || TiHuan_BuFen_WenBen(raw);
                if (tr && tr !== raw) {
                    KeYi_AnQuan_GaiXie_WenBen(el, tr, [raw.slice(0, needleLen)]);
                }
            }
        }
    }

    function FanYi_SheZhiGen_YeZi(sheZhiGen, selector) {
        if (!sheZhiGen) return [];
        return sheZhiGen.querySelectorAll(selector || 'div, span, p, label');
    }

    function FanYi_SheZhiGen_SuiPian_PiPei(sheZhiGen, fragments, piPeiFn, opts) {
        if (!sheZhiGen || !fragments || !fragments.length) return;
        var all = FanYi_SheZhiGen_YeZi(sheZhiGen, opts && opts.selector);
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (YingGai_TiaoGuo_BianJiQi_YuanSu(el)) continue;
            var text = GuiYiHua_WenBen(el.textContent || '');
            if (!text || (opts && opts.maxLen && text.length > opts.maxLen)) continue;
            if (piPeiFn(text)) TiHuan_WenBenJieDian_SuiPian(el, fragments);
        }
    }

    function FanYi_SheZhiGen_WenBen_GuiZe(sheZhiGen, guiZe, opts) {
        if (!sheZhiGen || !guiZe || !guiZe.length) return;
        var all = FanYi_SheZhiGen_YeZi(sheZhiGen, opts && opts.selector);
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (YingGai_TiaoGuo_BianJiQi_YuanSu(el)) continue;
            var text = GuiYiHua_WenBen(el.textContent || '');
            if (!text) continue;
            for (var g = 0; g < guiZe.length; g++) {
                if (guiZe[g].test(text, el)) {
                    guiZe[g].apply(el, text);
                    break;
                }
            }
        }
    }

    function FanYi_Scope_Attr_And_Hints(scopes, hints, opts) {
        opts = opts || {};
        var selector = opts.selector || 'span, div, button, label';
        for (var s = 0; s < scopes.length; s++) {
            var scope = scopes[s];
            if (!scope || scope.closest('.monaco-editor .view-lines')) continue;
            GengXin_Shuxing_Hints(scope, hints, opts.attrs);
            var nodes = scope.querySelectorAll ? scope.querySelectorAll(selector) : [];
            for (var n = 0; n < nodes.length; n++) {
                var el = nodes[n];
                if (el.closest('.monaco-editor .view-lines')) continue;
                if (opts.skipMultiChild &&
                    el.querySelector('span, div, button') &&
                    el.childElementCount > 1) continue;
                GengXin_Shuxing_Hints(el, hints, opts.attrs);
                GengXin_WenBen_YeZi_Hints(el, hints, opts);
            }
        }
    }

    function QuDiao_JingGao_FuHao(text) {
        if (!text) return '';
        return text.replace(/^[\u26A0\uFE0F\u26A0]\s*/u, '').trim();
    }

    function HuoQu_Cursor_SheZhi_Gen() {
        if (!document.querySelector(
            '.cursor-settings-cell, .cursor-settings-section, [class*="cursor-settings"]'
        )) return null;
        return HuoQu_SheZhi_Gen_JieDian();
    }

    function HuoQu_Cursor_SheZhi_MiaoShu_Cfg() {
        return {
            symlinkZh: Cursor_SheZhi_Symlink_Zh,
            symlinkZhAdmin: Cursor_SheZhi_Symlink_ZhAdmin,
            symlinkTail: Cursor_SheZhi_Symlink_Tail,
            mcpFragments: Cursor_SheZhi_MCP_SuiPian,
            domainFragments: Cursor_SheZhi_Domain_SuiPian
        };
    }

    function FanYi_Cursor_SheZhi_MiaoShu(root, cfg) {
        if (!root || !cfg) return;
        var descSelector = cfg.descSelector ||
            '.cursor-settings-cell-description, .cursor-settings-section-header-description, ' +
            '[class*="cursor-settings"] [class*="description"], ' +
            '[class*="cursor-settings"] [class*="subtitle"], [class*="cursor-settings"] p';
        var descs = root.querySelectorAll(descSelector);
        for (var i = 0; i < descs.length; i++) {
            var el = descs[i];
            if (el.closest('.monaco-editor .view-lines')) continue;
            var raw = el.textContent || '';
            if (!raw || raw.length > (cfg.maxLen || 500)) continue;
            var text = GuiYiHua_WenBen(raw);
            var plain = QuDiao_JingGao_FuHao(text);
            var tr = ChaZhao_FanYi(raw) || ChaZhao_FanYi(text) || ChaZhao_FanYi(plain) ||
                TiHuan_BuFen_WenBen(raw) || TiHuan_BuFen_WenBen(plain);
            if (!tr && plain.indexOf('Skip symlinks during') >= 0 && plain.indexOf('Use with caution') >= 0) {
                tr = plain.indexOf('(controlled by admin)') >= 0
                    ? (cfg.symlinkZhAdmin + cfg.symlinkTail)
                    : (cfg.symlinkZh + cfg.symlinkTail);
            }
            if (!tr && plain.indexOf('MCP tools that can run automatically') >= 0) {
                if (el.childElementCount > 0) {
                    TiHuan_WenBenJieDian_SuiPian(el, cfg.mcpFragments);
                    continue;
                }
                tr = TiHuan_BuFen_WenBen(raw) || TiHuan_BuFen_WenBen(plain);
            }
            if (!tr && plain.indexOf('Domains that Agent can fetch from automatically') >= 0) {
                if (el.childElementCount > 0) {
                    TiHuan_WenBenJieDian_SuiPian(el, cfg.domainFragments);
                    continue;
                }
                tr = TiHuan_BuFen_WenBen(raw) || TiHuan_BuFen_WenBen(plain);
            }
            if (tr && GuiYiHua_WenBen(raw) !== GuiYiHua_WenBen(tr)) {
                el.textContent = tr;
            }
        }
    }

    function HuoQu_Cursor_SheZhi_MiaoShu_Cfg() {
        return {
            symlinkZh: Cursor_SheZhi_Symlink_Zh,
            symlinkZhAdmin: Cursor_SheZhi_Symlink_ZhAdmin,
            symlinkTail: Cursor_SheZhi_Symlink_Tail,
            mcpFragments: Cursor_SheZhi_MCP_SuiPian,
            domainFragments: Cursor_SheZhi_Domain_SuiPian
        };
    }

    function FanYi_Cursor_SheZhi_BiaoQian(root) {
        if (!root) return;
        var labels = root.querySelectorAll(
            '.cursor-settings-cell-label, .cursor-settings-section-header-title, ' +
            '[class*="cursor-settings"] h1, [class*="cursor-settings"] h2, [class*="cursor-settings"] h3, ' +
            '[class*="cursor-settings"] [class*="title"], [class*="cursor-settings"] [class*="label"]'
        );
        for (var j = 0; j < labels.length; j++) {
            FanYi_ShuXing(labels[j]);
            var lraw = GuiYiHua_WenBen(labels[j].textContent || '');
            if (!lraw) continue;
            var ltr = ChaZhao_FanYi(lraw) || TiHuan_BuFen_WenBen(lraw);
            if (ltr && ltr !== lraw) {
                if (labels[j].childElementCount > 0) {
                    TiHuan_WenBenJieDian_SuiPian(labels[j], [[lraw, ltr]]);
                } else {
                    labels[j].textContent = ltr;
                }
            }
        }
    }

    var SheZhi_Symlink_SuiPian = [
        ['Use with caution.', '谨慎使用。'],
        ['Skip symlinks during', '在 .cursorignore 文件发现期间跳过符号链接。'],
        ['Only enable if your repository has many symlinks', '仅在您的仓库有很多符号链接时启用'],
        ['Changing this setting will require a restart of Cursor.', '更改此设置需要重启 Cursor。']
    ];

    function FanYi_SheZhiGen_Symlink_MiaoShu(sheZhiGen, opts) {
        if (!sheZhiGen) return;
        opts = opts || {};
        var descSelector = opts.descSelector ||
            '.setting-item-description, .settings-description, .cursor-settings-cell-description, ' +
            '[class*="setting"] p, [class*="settings"] p, div, span, p, label';
        var descs = sheZhiGen.querySelectorAll(descSelector);
        for (var di = 0; di < descs.length; di++) {
            var del = descs[di];
            if (YingGai_TiaoGuo_BianJiQi_YuanSu(del)) continue;
            var draw = del.textContent || '';
            var dtext = GuiYiHua_WenBen(draw);
            if (!dtext || dtext.length > (opts.maxLen || 400)) continue;
            if (dtext.indexOf('Use with caution') === -1 || dtext.indexOf('Skip symlinks') === -1) continue;
            var dplain = QuDiao_JingGao_FuHao(dtext);
            var dtr = ChaZhao_FanYi(draw) || ChaZhao_FanYi(dtext) || ChaZhao_FanYi(dplain) ||
                TiHuan_BuFen_WenBen(dplain);
            if (dtr && GuiYiHua_WenBen(draw) !== GuiYiHua_WenBen(dtr)) del.textContent = dtr;
        }
    }

    function FanYi_SheZhiGen_Leaf_SuiPian(sheZhiGen, fragments, opts) {
        if (!sheZhiGen || !fragments || !fragments.length) return;
        opts = opts || {};
        var all = sheZhiGen.querySelectorAll(opts.selector || 'div, span, p, label');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (YingGai_TiaoGuo_BianJiQi_YuanSu(el)) continue;
            if (el.querySelector('div, span, p, label, button')) continue;
            var text = GuiYiHua_WenBen(el.textContent || '');
            if (!text || text.length > (opts.maxLen || 200)) continue;
            if (/^[a-z][\w-]*(?:\.[A-Za-z][\w-]*){1,}$/i.test(text)) continue;
            if (text.indexOf('Use with caution') !== -1 && text.indexOf('Skip symlinks') !== -1) {
                TiHuan_WenBenJieDian_SuiPian(el, SheZhi_Symlink_SuiPian);
                continue;
            }
            TiHuan_WenBenJieDian_SuiPian(el, fragments);
        }
    }

    function YingGai_TiaoGuo_FanYi_ZiShu_YuanSu(el) {
        if (!el || el.nodeType !== 1) return false;
        if (el.classList && el.classList.contains('monaco-editor')) return true;
        try {
            if (el.closest('.monaco-editor')) return true;
            if (el.closest('webview')) return true;
            if (el.closest('.menubar, [role="menubar"], .menubar-menu-title, .menubar-menu-button')) return true;
            if (el.matches && el.matches(
                '.view-lines, .editor-scrollable, .overflow-guard, .inputarea, .margin, .minimap'
            )) return true;
        } catch (e) {}
        return false;
    }

    function HuoQu_FanYi_ZiShu_Gen() {
        var roots = [];
        var seen = new Set();
        function pushRoot(el) {
            if (!el || seen.has(el)) return;
            seen.add(el);
            roots.push(el);
        }
        var wb = document.querySelector('.monaco-workbench');
        if (wb) {
            var parts = wb.children;
            for (var i = 0; i < parts.length; i++) pushRoot(parts[i]);
            if (!roots.length) pushRoot(wb);
        }
        var floats = document.querySelectorAll(
            'body > .context-view, body > .monaco-hover, body > .monaco-menu-container, ' +
            'body > .monaco-select-box-dropdown-container, body > .quick-input-widget'
        );
        for (var f = 0; f < floats.length; f++) pushRoot(floats[f]);
        if (!roots.length && document.body) pushRoot(document.body);
        return roots;
    }

    function FanYi_ZiShu_QuYu() {
        var roots = HuoQu_FanYi_ZiShu_Gen();
        for (var i = 0; i < roots.length; i++) {
            try { FanYi_ZiShu(roots[i]); } catch (e) {}
        }
    }

    // ================================================================
    // Claude Code 风格 187 个趣味 Spinner 动词动态轮转（配生动 Emoji + 平滑垂直翻转动效）
    // ================================================================

    var _isCursorScrolling = false;
    var _cursorScrollTimer = null;
    if (typeof window !== 'undefined') {
        window.addEventListener('scroll', function() {
            _isCursorScrolling = true;
            clearTimeout(_cursorScrollTimer);
            _cursorScrollTimer = setTimeout(function() {
                _isCursorScrolling = false;
            }, 150);
        }, { passive: true, capture: true });
    }

    function QueBao_QuWei_Spinner_YangShi() {
        if (typeof document === 'undefined' || !document.head) return;
        if (document.getElementById('cursor-fun-spinner-style')) return;
        var style = document.createElement('style');
        style.id = 'cursor-fun-spinner-style';
        style.textContent = [
            '/* 方案一：锁定行高避免抖动重排，0额外动效侵入与重排重绘，保障60/144Hz原生滚动丝滑 */',
            '.cursor-fun-spinner {',
            '  line-height: 1.2 !important;',
            '  font-family: "Segoe WPC", "Segoe UI", "Segoe UI Emoji", "Microsoft YaHei", sans-serif !important;',
            '  font-variant-emoji: emoji !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function HuanSuan_WenBen_DaiDongHua(el, newText) {
        if (!el) return;
        var cur = (el.textContent || '').trim();
        if (cur === newText.trim()) return;
        QueBao_QuWei_Spinner_YangShi();

        el.classList.add('cursor-fun-spinner');

        // 瞬时安全更新：直接写入 TextNode.data，完全兼容 SolidJS 响应式生命周期，0 额外重排损耗
        if (el.firstChild && el.firstChild.nodeType === 3) {
            el.firstChild.data = newText;
        } else {
            el.textContent = newText;
        }
    }

    function AnZhuang_QuWei_Spinner_GuanCha() {
        QueBao_QuWei_Spinner_YangShi();
        var verbs = (typeof globalThis !== 'undefined' && globalThis.__cursorVerbs) || [
            "✨ 搞定中", "🚀 行动中", "💰 变现中", "📐 架构中", "🥐 烘焙中", "💡 发光中", "🎸 即兴中", "😵 犯晕中", "🍃 飘荡中", "🍲 焯水中",
            "🐂 吹牛中", "🪩 蹦迪中", "🏃 瞎忙活中", "👉 戳一戳", "🔌 引导启动中", "🍵 沏茶中", "🥟 蒸包子中", "⛏️ 掘进中", "🧮 计算中", "🍧 腻歪中",
            "🍮 焦糖化中", "🌊 级联中", "🏹 弹射中", "🧘 冥想中", "🔮 通灵中", "📡 感应中", "💃 编舞中", "🥣 翻搅中", "🤖 克劳丁中", "🧊 凝聚中",
            "🧐 琢磨中", "🧩 拼凑中", "🎼 谱曲中", "⚙️ 运算中", "🧪 调配中", "💭 盘算中", "🤔 沉思中", "🍳 烹饪中", "🔨 锻造中", "🎨 创造中",
            "📊 嚼数据中", "💎 结晶中", "🌱 培育中", "🔍 破译中", "⚖️ 推敲中", "🎯 定夺中", "⏳ 磨磨唧唧中", "🌀 七荤八素中", "👷 干活中", "🖍️ 涂鸦中",
            "🍯 淋酱中", "🌊 退潮中", "📜 施行中", "📖 阐释中", "💅 润色中", "🪄 施法中", "🧠 构想中", "💨 蒸发中", "🍺 发酵中", "🦥 磨洋工中",
            "🎩 忽悠中", "🔥 火焰烹饪中", "🗣️ 叽里呱啦中", "💫 流转中", "😵‍💫 懵圈中", "🦋 扑棱中", "⚔️ 淬炼中", "🏺 塑形中", "🎉 撒欢中", "❄️ 挂霜中",
            "🚶 到处溜达中", "🏎️ 飞驰中", "🍱 摆盘中", "🪄 生成中", "✌️ 比划中", "🌿 发芽中", "🦀 Git化中", "🎶 律动中", "🌪️ 狂风中", "🍵 调和中",
            "🔑 哈希中", "🐣 破壳中", "🐈 赶猫中", "📯 按喇叭中", "📢 吵吵嚷嚷中", "🚀 超空间跳跃中", "💭 构思中", "🌌 想象中", "🎷 即兴发挥中", "🥚 孵化中",
            "💡 推断中", "🫖 浸泡中", "⚡ 电离中", "🕺 跳吉特巴中", "🥒 切丝中", "🥖 揉面中", "🍞 发面中", "🛸 悬浮中", "🐮 反刍思考中", "✨ 显化中",
            "🥒 腌制中", "🐍 蜿蜒中", "🦋 蜕变中", "🌫️ 起雾中", "🕺 太空步中", "🚶 溜溜达达中", "🧐 沉吟中", "📣 召集中", "💭 遐想中", "💨 雾化中",
            "🪹 筑巢中", "📰 看报纸中", "🤔 瞎琢磨中", "⚛️ 成核中", "🪐 公转中", "🎼 编排中", "💧 渗透中", "🚶 闲庭信步中", "☕ 渗滤中", "📚 翻阅中",
            "🗣️ 思辨中", "🌻 光合作用中", "🐝 授粉中", "🧐 考究中", "🎙️ 高谈阔论中", "🐆 猛扑中", "🧪 沉淀中", "🎩 变魔术中", "⚙️ 处理中", "📝 校对中",
            "📡 传播中", "🐌 磨蹭中", "🧩 解谜中", "⚡ 量子化中", "🦚 花里胡哨中", "✨ 闪亮登场中", "🚩 重整旗鼓中", "🌐 联网中", "🕊️ 归巢中", "🐄 反刍中",
            "🥘 翻炒中", "🦘 蹦跶中", "🧱 搬砖中", "🐿️ 窜来窜去中", "🧂 调味中", "🧨 搞事情中", "🕯️ 摇曳中", "🍲 慢炖中", "💨 溜之大吉中", "✏️ 速写中",
            "🐾 游走中", "🧼 揉搓中", "💃 跳摇摆舞中", "🔦 探洞中", "🌀 旋转中", "🌱 萌芽中", "🥘 焖煮中", "💨 升华中", "🌪️ 旋涡中", "🦅 俯冲中",
            "🤝 共生中", "🧬 合成中", "🗡️ 淬火中", "🤔 思考中", "⚡ 雷鸣中", "🛠️ 鼓捣中", "🤡 胡闹中", "🙃 颠三倒四中", "🎭 变形中", "🔄 转化中",
            "🥨 扭转中", "🌊 起伏中", "📂 展开中", "🧩 拆解中", "🧘 沉浸中", "💪 抖擞中", "🎸 摇摆中", "🧭 漫游中", "🌌 扭曲时空中", "❓ 那个啥来着中",
            "🐝 嗡嗡转中", "🥛 搅打中", "🦥 磨叽中", "💼 搞事业中", "🐎 牧马中", "🍋 切柠檬皮中", "🐍 蛇行走位中"
        ];
        if (!verbs || !verbs.length) return;
        var verbSet = new Set(verbs);
        for (var vi = 0; vi < verbs.length; vi++) {
            var raw = verbs[vi].replace(/^[^\w\u4e00-\u9fa5]+\s*/, '');
            if (raw) verbSet.add(raw);
        }
        verbSet.add('Thinking');
        verbSet.add('思考中');
        verbSet.add('Planning next moves');
        verbSet.add('规划下一步行动');
        verbSet.add('Wrapping up');
        verbSet.add('收尾中');

        setInterval(function() {
            if (_isCursorScrolling) return; // 滚动期间完全跳过 DOM 更新，保证 60/144Hz 丝滑
            try {
                // 1. 折叠操作头部（正在加载中）
                var loadingActions = document.querySelectorAll(
                    '.ui-collapsible[data-loading] .ui-collapsible-action, ' +
                    '[data-component="collapsible-header"][data-loading] .ui-collapsible-action'
                );
                for (var i = 0; i < loadingActions.length; i++) {
                    var el = loadingActions[i];
                    var txt = (el.textContent || '').trim();
                    if (verbSet.has(txt)) {
                        var next = verbs[Math.floor(Math.random() * verbs.length)];
                        if (next !== txt) HuanSuan_WenBen_DaiDongHua(el, next);
                    }
                }
                // 2. Composer 底部尾随状态栏
                var tailStatuses = document.querySelectorAll(
                    '.agent-transcript-tail-status [clipping="fade"], ' +
                    '.agent-transcript-tail-status span'
                );
                for (var j = 0; j < tailStatuses.length; j++) {
                    var tel = tailStatuses[j];
                    var ttxt = (tel.textContent || '').trim();
                    if (verbSet.has(ttxt)) {
                        var tnext = verbs[Math.floor(Math.random() * verbs.length)];
                        if (tnext !== ttxt) HuanSuan_WenBen_DaiDongHua(tel, tnext);
                    }
                }
            } catch (e) {}
        }, 2500);
    }
