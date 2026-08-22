document.addEventListener("DOMContentLoaded", function() {

    // ================================================================
    // MOBILE SIDEBAR TOGGLE
    // ================================================================
    var menuToggle = document.getElementById("menuToggle");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebarOverlay");

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener("click", function() {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", function() {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        });
    }

    // ================================================================
    // COPY TO CLIPBOARD
    // ================================================================
    function copyToClipboard(text, buttonElement) {
        if (!text || text.trim() === "") return;
        navigator.clipboard.writeText(text).then(function() {
            var originalTooltip = buttonElement.getAttribute("data-tooltip") || "Copy";
            buttonElement.setAttribute("data-tooltip", "Copied!");
            var icon = buttonElement.querySelector("svg");
            if (icon) {
                icon.innerHTML = '<polyline points="20 6 9 17 4 12" />';
                icon.style.stroke = "#00d2ff";
            }
            setTimeout(function() {
                buttonElement.setAttribute("data-tooltip", originalTooltip);
                if (icon) {
                    icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />';
                    icon.style.stroke = "";
                }
            }, 1500);
        }).catch(function() {});
    }

    // ================================================================
    // PASSWORD GENERATOR
    // ================================================================
    (function initPasswordGenerator() {
        var passwordDisplay = document.getElementById("passwordDisplay");
        var copyPasswordBtn = document.getElementById("copyPassword");
        var charLengthInput = document.getElementById("charLength");
        var charLengthVal = document.getElementById("charLengthVal");
        var optUppercase = document.getElementById("optUppercase");
        var optLowercase = document.getElementById("optLowercase");
        var optNumbers = document.getElementById("optNumbers");
        var optSymbols = document.getElementById("optSymbols");
        var generateBtn = document.getElementById("generatePassword");
        var strengthBar = document.getElementById("strengthBar");
        var strengthText = document.getElementById("strengthText");

        if (!passwordDisplay) return;

        var charSets = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
        };

        charLengthInput.addEventListener("input", function(e) {
            charLengthVal.textContent = e.target.value;
            generatePassword();
        });

        var securityCheckboxes = [optUppercase, optLowercase, optNumbers, optSymbols];
        securityCheckboxes.forEach(function(cb) {
            cb.addEventListener("change", function(e) {
                var checkedCount = securityCheckboxes.filter(function(c) { return c.checked; }).length;
                if (checkedCount === 0) {
                    e.preventDefault();
                    cb.checked = true;
                } else {
                    generatePassword();
                }
            });
        });

        function evaluateStrength(password, criteriaCount) {
            var len = password.length;
            if (len === 0) return { score: 0, text: "Empty", color: "transparent" };
            var score = 0;
            if (len >= 8) score++;
            if (len >= 14) score++;
            if (len >= 20) score++;
            if (criteriaCount >= 3) score++;
            if (criteriaCount === 4) score++;
            if (score <= 2) return { score: 20, text: "Weak", color: "#f87171" };
            if (score <= 4) return { score: 60, text: "Medium", color: "#fbbf24" };
            return { score: 100, text: "Strong", color: "#10b981" };
        }

        function generatePassword() {
            var pool = "";
            var criteriaCount = 0;
            if (optUppercase.checked) { pool += charSets.uppercase;
                criteriaCount++; }
            if (optLowercase.checked) { pool += charSets.lowercase;
                criteriaCount++; }
            if (optNumbers.checked) { pool += charSets.numbers;
                criteriaCount++; }
            if (optSymbols.checked) { pool += charSets.symbols;
                criteriaCount++; }

            var len = parseInt(charLengthInput.value);
            var randomValues = new Uint32Array(len);
            window.crypto.getRandomValues(randomValues);
            var result = "";
            for (var i = 0; i < len; i++) {
                result += pool[randomValues[i] % pool.length];
            }
            passwordDisplay.value = result;
            var evalResult = evaluateStrength(result, criteriaCount);
            strengthBar.style.width = evalResult.score + "%";
            strengthBar.style.backgroundColor = evalResult.color;
            strengthText.textContent = evalResult.text;
            strengthText.style.color = evalResult.color;
        }

        generateBtn.addEventListener("click", generatePassword);
        copyPasswordBtn.addEventListener("click", function() {
            copyToClipboard(passwordDisplay.value, copyPasswordBtn);
        });

        generatePassword();
    })();

    // ================================================================
    // TEXT UTILITIES
    // ================================================================
    (function initTextUtilities() {
        var textInput = document.getElementById("textInput");
        var copyTextBtn = document.getElementById("copyText");
        var charCountEl = document.getElementById("charCount");
        var wordCountEl = document.getElementById("wordCount");
        var lineCountEl = document.getElementById("lineCount");
        var actionButtons = document.querySelectorAll(".text-action");

        if (!textInput) return;

        function updateCounters() {
            var val = textInput.value;
            charCountEl.textContent = val.length;
            var words = val.trim().split(/\s+/).filter(function(w) { return w.length > 0; });
            wordCountEl.textContent = words.length;
            var lines = val.split("\n").filter(function(l) { return l.length > 0; });
            lineCountEl.textContent = val.length > 0 ? lines.length : 0;
        }

        textInput.addEventListener("input", updateCounters);

        copyTextBtn.addEventListener("click", function() {
            copyToClipboard(textInput.value, copyTextBtn);
        });

        actionButtons.forEach(function(btn) {
            btn.addEventListener("click", function() {
                var action = btn.getAttribute("data-action");
                var current = textInput.value;
                switch (action) {
                    case "upper":
                        textInput.value = current.toUpperCase();
                        break;
                    case "lower":
                        textInput.value = current.toLowerCase();
                        break;
                    case "title":
                        textInput.value = current
                            .toLowerCase()
                            .split(" ")
                            .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
                            .join(" ");
                        break;
                    case "strip":
                        textInput.value = current.replace(/\s+/g, " ").trim();
                        break;
                    case "clear":
                        textInput.value = "";
                        break;
                }
                updateCounters();
            });
        });

        updateCounters();
    })();

    // ================================================================
    // QR CODE GENERATOR
    // ================================================================
    (function initQRGenerator() {
        var qrInput = document.getElementById("qrInput");
        var qrColorDark = document.getElementById("qrColorDark");
        var qrColorLight = document.getElementById("qrColorLight");
        var generateQrBtn = document.getElementById("generateQR");
        var downloadQrBtn = document.getElementById("downloadQR");
        var qrcodeContainer = document.getElementById("qrcode");

        if (!qrInput) return;

        function renderQR() {
            if (typeof QRCode === "undefined") {
                setTimeout(renderQR, 500);
                return;
            }
            var text = qrInput.value.trim() || "https://dev.amwafy.xyz";
            qrcodeContainer.innerHTML = "";
            new QRCode(qrcodeContainer, {
                text: text,
                width: 180,
                height: 180,
                colorDark: qrColorDark.value,
                colorLight: qrColorLight.value,
                correctLevel: QRCode.CorrectLevel.H
            });

            var observer = new MutationObserver(function() {
                var canvas = qrcodeContainer.querySelector("canvas");
                var img = qrcodeContainer.querySelector("img");
                if (canvas || img) {
                    downloadQrBtn.disabled = false;
                    observer.disconnect();
                }
            });
            observer.observe(qrcodeContainer, { childList: true, subtree: true });
            setTimeout(function() {
                var canvas = qrcodeContainer.querySelector("canvas");
                var img = qrcodeContainer.querySelector("img");
                if (canvas || img) {
                    downloadQrBtn.disabled = false;
                    observer.disconnect();
                }
            }, 500);
        }

        generateQrBtn.addEventListener("click", renderQR);

        downloadQrBtn.addEventListener("click", function() {
            var canvas = qrcodeContainer.querySelector("canvas");
            var img = qrcodeContainer.querySelector("img");
            var src = null;
            if (canvas) src = canvas.toDataURL("image/png");
            else if (img) src = img.src;
            if (src) {
                var a = document.createElement("a");
                a.href = src;
                a.download = "wafydev-qr.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });

        qrColorDark.addEventListener("input", renderQR);
        qrColorLight.addEventListener("input", renderQR);
        qrInput.addEventListener("change", renderQR);

        renderQR();
    })();

    // ================================================================
    // COLOR PALETTE
    // ================================================================
    (function initColorPalette() {
        var colorInput = document.getElementById("primaryColorInput");
        var hexDisplay = document.getElementById("hexDisplay");
        var rgbDisplay = document.getElementById("rgbDisplay");
        var hslDisplay = document.getElementById("hslDisplay");
        var copyHexBtn = document.getElementById("copyHex");
        var copyRgbBtn = document.getElementById("copyRgb");
        var copyHslBtn = document.getElementById("copyHsl");

        if (!colorInput) return;

        function hexToRgb(hex) {
            hex = hex.replace(/^#/, "");
            var big = parseInt(hex, 16);
            return { r: (big >> 16) & 255, g: (big >> 8) & 255, b: big & 255 };
        }

        function rgbToHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
        }

        function updateColors(hex) {
            var hexVal = hex.toUpperCase();
            hexDisplay.textContent = hexVal;
            var rgb = hexToRgb(hex);
            var rgbStr = "rgb(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ")";
            rgbDisplay.textContent = rgbStr;
            var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            hslDisplay.textContent = "hsl(" + hsl.h + ", " + hsl.s + "%, " + hsl.l + "%)";
        }

        colorInput.addEventListener("input", function(e) { updateColors(e.target.value); });
        copyHexBtn.addEventListener("click", function() { copyToClipboard(hexDisplay.textContent, copyHexBtn); });
        copyRgbBtn.addEventListener("click", function() { copyToClipboard(rgbDisplay.textContent, copyRgbBtn); });
        copyHslBtn.addEventListener("click", function() { copyToClipboard(hslDisplay.textContent, copyHslBtn); });

        updateColors(colorInput.value);
    })();

    // ================================================================
    // TYPING SPEED TEST
    // ================================================================
    (function initTypingTest() {
        var display = document.getElementById("typingDisplay");
        var input = document.getElementById("typingInput");
        var wpmEl = document.getElementById("typingWPM");
        var accEl = document.getElementById("typingAccuracy");
        var errEl = document.getElementById("typingErrors");
        var statusEl = document.getElementById("typingStatus");
        var resetBtn = document.getElementById("typingReset");

        if (!display) return;

        var sampleTexts = [
            "The quick brown fox jumps over the lazy dog.",
            "Developers build software that solves real world problems.",
            "Practice makes perfect when learning to code.",
            "JavaScript is the language of the web.",
            "Consistency is the key to mastering any skill.",
            "The best error message is the one that never shows up.",
            "Code is read more often than it is written."
        ];

        var currentText = "";
        var startTime = null;
        var timerInterval = null;
        var isRunning = false;
        var wpm = 0;
        var accuracy = 0;
        var errors = 0;
        var totalTyped = 0;

        function loadNewText() {
            currentText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
            display.textContent = currentText;
            input.value = "";
            input.disabled = false;
            input.focus();
            startTime = null;
            isRunning = false;
            wpm = 0;
            accuracy = 0;
            errors = 0;
            totalTyped = 0;
            if (timerInterval) { clearInterval(timerInterval);
                timerInterval = null; }
            updateStats();
            statusEl.textContent = "Start typing...";
            statusEl.style.color = "var(--text-muted)";
        }

        function updateStats() {
            wpmEl.textContent = wpm;
            accEl.textContent = accuracy + "%";
            errEl.textContent = errors;
        }

        function calculateStats() {
            if (!startTime) return;
            var elapsed = (Date.now() - startTime) / 60000;
            var wordsTyped = totalTyped / 5;
            wpm = Math.round(wordsTyped / elapsed);
            var totalChars = totalTyped + errors;
            accuracy = totalChars > 0 ? Math.round((totalTyped / totalChars) * 100) : 100;
            updateStats();
        }

        function handleInput() {
            var typed = input.value;
            var target = currentText;
            var typedLen = typed.length;

            if (!isRunning && typedLen > 0) {
                isRunning = true;
                startTime = Date.now();
                timerInterval = setInterval(calculateStats, 500);
                statusEl.textContent = "Typing...";
                statusEl.style.color = "var(--accent)";
            }

            var errCount = 0;
            var correctCount = 0;
            var minLen = Math.min(typedLen, target.length);
            for (var i = 0; i < minLen; i++) {
                if (typed[i] === target[i]) correctCount++;
                else errCount++;
            }
            if (typedLen > target.length) errCount += typedLen - target.length;

            errors = errCount;
            totalTyped = correctCount;

            var html = "";
            for (var j = 0; j < target.length; j++) {
                if (j < typedLen) {
                    if (typed[j] === target[j]) html += '<span style="color:#10b981;">' + target[j] + '</span>';
                    else html += '<span style="color:#ef4444;text-decoration:underline;">' + target[j] + '</span>';
                } else {
                    html += '<span style="color:var(--text-muted);">' + target[j] + '</span>';
                }
            }
            display.innerHTML = html;

            if (typedLen >= target.length && errors === 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                isRunning = false;
                calculateStats();
                statusEl.textContent = "Complete! Press Reset to try again.";
                statusEl.style.color = "#10b981";
                input.disabled = true;
            } else {
                calculateStats();
            }
        }

        function resetTest() {
            if (timerInterval) { clearInterval(timerInterval);
                timerInterval = null; }
            loadNewText();
        }

        input.addEventListener("input", handleInput);
        resetBtn.addEventListener("click", resetTest);
        loadNewText();
    })();

    // ================================================================
    // STUDY TIMER (POMODORO)
    // ================================================================
    (function initStudyTimer() {
        var display = document.getElementById("timerDisplay");
        var modeLabel = document.getElementById("timerMode");
        var sessionsEl = document.getElementById("timerSessions");
        var startBtn = document.getElementById("timerStart");
        var pauseBtn = document.getElementById("timerPause");
        var resetBtn = document.getElementById("timerReset");
        var workInput = document.getElementById("timerWorkDuration");
        var breakInput = document.getElementById("timerBreakDuration");

        if (!display) return;

        var state = {
            mode: "work",
            timeLeft: 25 * 60,
            isRunning: false,
            interval: null,
            workDuration: 25,
            breakDuration: 5,
            sessions: 0
        };

        function updateDisplay() {
            var mins = Math.floor(state.timeLeft / 60);
            var secs = state.timeLeft % 60;
            display.textContent = String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
            sessionsEl.textContent = state.sessions;
            modeLabel.textContent = state.mode === "work" ? "Focus" : "Break";
            modeLabel.style.color = state.mode === "work" ? "var(--accent)" : "#fbbf24";
        }

        function switchMode() {
            if (state.mode === "work") {
                state.mode = "break";
                state.timeLeft = state.breakDuration * 60;
            } else {
                state.mode = "work";
                state.timeLeft = state.workDuration * 60;
                state.sessions++;
            }
            updateDisplay();
        }

        function tick() {
            if (state.timeLeft <= 0) { switchMode(); return; }
            state.timeLeft--;
            updateDisplay();
        }

        function startTimer() {
            if (state.isRunning) return;
            state.isRunning = true;
            state.interval = setInterval(tick, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }

        function pauseTimer() {
            if (!state.isRunning) return;
            state.isRunning = false;
            clearInterval(state.interval);
            state.interval = null;
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }

        function resetTimer() {
            pauseTimer();
            state.mode = "work";
            state.timeLeft = state.workDuration * 60;
            state.sessions = 0;
            updateDisplay();
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }

        function updateDurations() {
            var w = parseInt(workInput.value) || 25;
            var b = parseInt(breakInput.value) || 5;
            state.workDuration = Math.max(1, Math.min(60, w));
            state.breakDuration = Math.max(1, Math.min(30, b));
            if (!state.isRunning) {
                state.timeLeft = state.workDuration * 60;
                updateDisplay();
            }
        }

        startBtn.addEventListener("click", startTimer);
        pauseBtn.addEventListener("click", pauseTimer);
        resetBtn.addEventListener("click", resetTimer);
        workInput.addEventListener("change", updateDurations);
        breakInput.addEventListener("change", updateDurations);
        resetTimer();
    })();

    // ================================================================
    // MARKDOWN PREVIEW
    // ================================================================
    (function initMarkdownPreview() {
        var input = document.getElementById("markdownInput");
        var preview = document.getElementById("markdownPreview");
        var rawToggle = document.getElementById("markdownRawToggle");

        if (!input) return;

        var showRaw = false;
        var markedLoaded = false;

        function loadMarked() {
            return new Promise(function(resolve) {
                if (typeof marked !== "undefined") { markedLoaded = true;
                    resolve(); return; }
                var script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
                script.onload = function() { markedLoaded = true;
                    resolve(); };
                script.onerror = function() { resolve(); };
                document.head.appendChild(script);
            });
        }

        function renderPreview() {
            var text = input.value || "Start typing **Markdown** here...";
            if (showRaw) { preview.textContent = text; return; }
            if (!markedLoaded) {
                preview.textContent = "Loading Markdown library...";
                loadMarked().then(renderPreview);
                return;
            }
            try {
                preview.innerHTML = marked.parse(text);
            } catch (_) {
                preview.textContent = "Error parsing Markdown.";
            }
        }

        function toggleRaw() {
            showRaw = !showRaw;
            rawToggle.textContent = showRaw ? "Show Rendered" : "Show Raw";
            renderPreview();
        }

        loadMarked();
        input.addEventListener("input", renderPreview);
        rawToggle.addEventListener("click", toggleRaw);
        renderPreview();
    })();

    // ================================================================
    // NOTE TAKER
    // ================================================================
    (function initNoteTaker() {
        var STORAGE_KEY = "wafydev_notes";
        var notes = [];
        var editId = null;

        var input = document.getElementById("noteInput");
        var search = document.getElementById("noteSearch");
        var list = document.getElementById("noteList");
        var count = document.getElementById("noteCount");
        var saveBtn = document.getElementById("noteSave");
        var clearBtn = document.getElementById("noteClear");

        if (!input) return;

        function loadNotes() {
            try { notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (_) { notes = []; }
        }

        function saveNotes() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
            renderNotes();
        }

        function renderNotes() {
            var term = search.value.toLowerCase().trim();
            var filtered = notes;
            if (term) filtered = notes.filter(function(n) { return n.text.toLowerCase().includes(term); });
            count.textContent = filtered.length;

            if (filtered.length === 0) {
                list.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">' +
                    '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 0.5rem;opacity:0.3;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>' +
                    '<p>' + (term ? "No notes match your search." : "No notes yet. Write one!") + '</p>' +
                    '</div>';
                return;
            }

            list.innerHTML = filtered.map(function(n) {
                return '<div class="note-item" data-id="' + n.id + '" style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0.8rem;background:rgba(255,255,255,0.03);border-radius:8px;border-bottom:1px solid var(--border-color);">' +
                    '<span style="flex:1;word-break:break-word;cursor:pointer;" class="note-text">' + escapeHtml(n.text) + '</span>' +
                    '<div style="display:flex;gap:0.4rem;flex-shrink:0;">' +
                    '<button class="note-edit-btn" data-id="' + n.id + '" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem;padding:0.2rem 0.4rem;">Edit</button>' +
                    '<button class="note-delete-btn" data-id="' + n.id + '" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.8rem;padding:0.2rem 0.4rem;">Delete</button>' +
                    '</div></div>';
            }).join("");

            list.querySelectorAll(".note-edit-btn").forEach(function(btn) {
                btn.addEventListener("click", function(e) {
                    var id = parseInt(btn.dataset.id);
                    editNote(id);
                    e.stopPropagation();
                });
            });
            list.querySelectorAll(".note-delete-btn").forEach(function(btn) {
                btn.addEventListener("click", function(e) {
                    var id = parseInt(btn.dataset.id);
                    deleteNote(id);
                    e.stopPropagation();
                });
            });
            list.querySelectorAll(".note-text").forEach(function(el) {
                el.addEventListener("click", function() {
                    var id = parseInt(this.closest(".note-item").dataset.id);
                    editNote(id);
                });
            });
        }

        function escapeHtml(text) {
            var div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }

        function addOrUpdateNote() {
            var text = input.value.trim();
            if (!text) return;
            if (editId !== null) {
                var idx = notes.findIndex(function(n) { return n.id === editId; });
                if (idx !== -1) notes[idx].text = text;
                editId = null;
                saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save';
            } else {
                notes.unshift({ id: Date.now(), text: text, createdAt: new Date().toISOString() });
            }
            input.value = "";
            saveNotes();
            input.focus();
        }

        function editNote(id) {
            var note = notes.find(function(n) { return n.id === id; });
            if (!note) return;
            input.value = note.text;
            editId = id;
            saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg> Update';
            input.focus();
        }

        function deleteNote(id) {
            if (!confirm("Delete this note?")) return;
            notes = notes.filter(function(n) { return n.id !== id; });
            if (editId === id) { editId = null;
                saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save';
                input.value = ""; }
            saveNotes();
        }

        function clearAllNotes() {
            if (notes.length === 0 || !confirm("Delete all notes?")) return;
            notes = [];
            editId = null;
            saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg> Save';
            input.value = "";
            saveNotes();
        }

        loadNotes();
        renderNotes();
        saveBtn.addEventListener("click", addOrUpdateNote);
        clearBtn.addEventListener("click", clearAllNotes);
        search.addEventListener("input", renderNotes);
        input.addEventListener("keydown", function(e) { if (e.key === "Enter") addOrUpdateNote(); });
    })();

    // ================================================================
    // COUNTDOWN TIMER
    // ================================================================
    (function initCountdown() {
        var eventNameInput = document.getElementById("eventName");
        var eventDateInput = document.getElementById("eventDate");
        var startBtn = document.getElementById("startCountdown");
        var display = document.getElementById("countdownDisplay");

        if (!eventNameInput) return;

        var interval = null;

        function updateCountdown() {
            var target = new Date(eventDateInput.value).getTime();
            var now = Date.now();
            var diff = target - now;
            if (diff <= 0) {
                clearInterval(interval);
                interval = null;
                display.innerHTML = '<strong>' + (eventNameInput.value || "Event") + '</strong> has started!';
                return;
            }
            var days = Math.floor(diff / (1000 * 60 * 60 * 24));
            var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((diff % (1000 * 60)) / 1000);
            display.innerHTML = '<div style="font-size:2.5rem;">' + days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's</div>' +
                '<div style="font-size:1rem;color:var(--text-muted);">until ' + (eventNameInput.value || "Event") + '</div>';
        }

        function startCountdown() {
            if (!eventDateInput.value) {
                alert("Please select a date and time.");
                return;
            }
            if (interval) { clearInterval(interval);
                interval = null; }
            updateCountdown();
            interval = setInterval(updateCountdown, 1000);
        }

        var defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 7);
        eventDateInput.value = defaultDate.toISOString().slice(0, 16);

        startBtn.addEventListener("click", startCountdown);
        updateCountdown();
    })();

});