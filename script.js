// ================================================================
// GLOBAL FUNCTIONS
// ================================================================

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ===== ENHANCED COPY WITH FEEDBACK (Tooltip + Toast) =====
function copyWithFeedback(text, buttonElement) {
    if (!text || text.trim() === "") return;
    navigator.clipboard.writeText(text).then(function() {
        var originalTooltip = buttonElement.getAttribute('data-tooltip') || "Copy";
        buttonElement.setAttribute('data-tooltip', 'Copied!');
        buttonElement.classList.add('copied');

        var icon = buttonElement.querySelector('svg');
        if (icon) {
            icon.innerHTML = '<polyline points="20 6 9 17 4 12" />';
            icon.style.stroke = "#38bdf8";
        }

        showToast('✅ Copied!');

        setTimeout(function() {
            buttonElement.setAttribute('data-tooltip', originalTooltip);
            buttonElement.classList.remove('copied');
            if (icon) {
                icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />';
                icon.style.stroke = "";
            }
        }, 2000);
    }).catch(function() {});
}

// ================================================================
// PASSWORD GENERATOR (UPDATED)
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
    var optEasyRead = document.getElementById("optEasyRead");
    var generateBtn = document.getElementById("generatePassword");
    var strengthBar = document.getElementById("strengthBar");
    var strengthText = document.getElementById("strengthText");
    var strengthTip = document.getElementById("strengthTip");
    var historyList = document.getElementById("historyList");
    var clearHistoryBtn = document.getElementById("clearHistory");

    if (!passwordDisplay) return;

    var charSets = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
    };

    // Easy to Read – exclude confusing characters
    var easyReadExclude = /[0OIl1]/g;

    // ===== PASSWORD HISTORY =====
    function getHistory() {
        try {
            return JSON.parse(localStorage.getItem('wafydev_password_history')) || [];
        } catch (_) {
            return [];
        }
    }

    function saveHistory(history) {
        localStorage.setItem('wafydev_password_history', JSON.stringify(history));
    }

    function addToHistory(password) {
        if (!password) return;
        var history = getHistory();
        history = history.filter(function(p) { return p !== password; });
        history.unshift(password);
        if (history.length > 10) history.pop();
        saveHistory(history);
        renderHistory();
    }

    function clearHistory() {
        if (getHistory().length === 0) return;
        if (!confirm('Clear all password history?')) return;
        saveHistory([]);
        renderHistory();
    }

    function renderHistory() {
        if (!historyList) return;
        var history = getHistory();
        if (history.length === 0) {
            historyList.innerHTML = '<div id="historyEmpty">No passwords saved yet.</div>';
            return;
        }
        var html = '';
        history.forEach(function(pwd) {
            html += '<div class="history-item">' +
                '<span class="password-text">' + pwd + '</span>' +
                '<div class="history-actions">' +
                '<button class="copy-history-btn" data-password="' + pwd.replace(/"/g, '&quot;') + '" data-tooltip="Copy">📋</button>' +
                '<button class="delete-history-btn" data-password="' + pwd.replace(/"/g, '&quot;') + '">✕</button>' +
                '</div>' +
                '</div>';
        });
        historyList.innerHTML = html;

        // Copy from history
        historyList.querySelectorAll('.copy-history-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var pwd = this.getAttribute('data-password');
                copyWithFeedback(pwd, this);
                e.stopPropagation();
            });
        });

        // Delete from history
        historyList.querySelectorAll('.delete-history-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                var pwd = this.getAttribute('data-password');
                var history = getHistory();
                history = history.filter(function(p) { return p !== pwd; });
                saveHistory(history);
                renderHistory();
                e.stopPropagation();
            });
        });
    }

    // ===== EVALUATE STRENGTH =====
    function evaluateStrength(password, criteriaCount) {
        var len = password.length;
        if (len === 0) return { score: 0, text: "Empty", color: "transparent", tip: "Generate a password to see strength." };
        var score = 0;
        if (len >= 8) score++;
        if (len >= 14) score++;
        if (len >= 20) score++;
        if (criteriaCount >= 3) score++;
        if (criteriaCount === 4) score++;
        if (score <= 2) {
            return {
                score: 20,
                text: "Weak",
                color: "#f87171",
                tip: "💡 Use 12+ characters with symbols and numbers for better security."
            };
        } else if (score <= 4) {
            return {
                score: 60,
                text: "Medium",
                color: "#fbbf24",
                tip: "💡 Add more characters or include symbols to make it stronger."
            };
        } else {
            return {
                score: 100,
                text: "Strong",
                color: "#10b981",
                tip: "✅ Great password! This is secure."
            };
        }
    }

    // ===== GENERATE PASSWORD =====
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

        // Easy to Read filter
        if (optEasyRead && optEasyRead.checked) {
            pool = pool.replace(easyReadExclude, '');
        }

        var len = parseInt(charLengthInput.value);

        if (pool.length === 0) {
            pool = charSets.lowercase;
            criteriaCount = 1;
        }

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

        if (strengthTip) {
            strengthTip.textContent = evalResult.tip;
            strengthTip.className = evalResult.text.toLowerCase();
        }

        addToHistory(result);
    }

    // ===== EVENT LISTENERS =====
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

    if (optEasyRead) {
        optEasyRead.addEventListener("change", generatePassword);
    }

    generateBtn.addEventListener("click", generatePassword);

    copyPasswordBtn.addEventListener("click", function() {
        copyWithFeedback(passwordDisplay.value, copyPasswordBtn);
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener("click", clearHistory);
    }

    renderHistory();
    generatePassword();
})();

// ================================================================
// QR GENERATOR (Uses copyWithFeedback, works fine)
// ================================================================
// No changes needed — already uses the enhanced copy function.

// ================================================================
// TYPING TEST (Works fine)
// ================================================================

// ================================================================
// STUDY TIMER (Works fine)
// ================================================================

// ================================================================
// MARKDOWN PREVIEW (Works fine)
// ================================================================

// ================================================================
// NOTE TAKER (Works fine)
// ================================================================

// ================================================================
// COUNTDOWN (Works fine)
// ================================================================

// ================================================================
// TEXT UTILITIES (Works fine)
// ================================================================

// ================================================================
// COLOR PALETTE (Works fine)
// ================================================================

// ================================================================
// MOBILE SIDEBAR TOGGLE (Existing code, keep as is)
// ================================================================
document.addEventListener("DOMContentLoaded", function() {
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
});