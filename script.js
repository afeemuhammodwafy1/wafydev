document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================================================
    // Single Page Application (SPA) Router / Tab Switching Implementation
    // ==========================================================================
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".tab-content");
    const dashboardCards = document.querySelectorAll(".tool-card");
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    function switchTab(targetId) {
        // Toggle active states on sidebar items
        navItems.forEach(item => {
            if (item.getAttribute("data-target") === targetId) {
                item.classList.add("active");
            } else {
                item.classList.remove("active");
            }
        });

        // Toggle active visibility states on sections
        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add("active");
            } else {
                section.classList.remove("active");
            }
        });

        // Close sidebar and overlay elements if visible on mobile devices
        closeSidebar();

        // Smooth scroll view back to top on panel changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeSidebar() {
        if (sidebar.classList.contains("open")) {
            sidebar.classList.remove("open");
            sidebarOverlay.classList.remove("active");
            menuToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    }

    // Attach Event Handlers to Navigation Options
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            switchTab(target);
        });
    });

    // CRITICAL FIX: Connect Dashboard click configurations directly to Tab Switching Router
    dashboardCards.forEach(card => {
        card.addEventListener("click", () => {
            const targetLink = card.getAttribute("data-link");
            if (targetLink) {
                switchTab(targetLink);
            }
        });
    });

    // Toggle menu events on viewport configurations
    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("open");
            sidebarOverlay.classList.toggle("active", isOpen);
            menuToggle.innerHTML = isOpen ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        });
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener("click", closeSidebar);
    }

    // ==========================================================================
    // Common Copy-To-Clipboard API Helper
    // ==========================================================================
    function copyToClipboard(text, buttonElement) {
        if (!text || text.trim() === "") return;

        navigator.clipboard.writeText(text).then(() => {
            const originalTooltip = buttonElement.getAttribute("data-tooltip") || "Copy Output";
            
            buttonElement.setAttribute("data-tooltip", "Copied!");
            buttonElement.classList.add("copied");
            const icon = buttonElement.querySelector("i");
            if (icon) {
                icon.className = "fa-solid fa-check";
                icon.style.color = "#00d2ff";
            }

            setTimeout(() => {
                buttonElement.setAttribute("data-tooltip", originalTooltip);
                buttonElement.classList.remove("copied");
                if (icon) {
                    icon.className = "fa-regular fa-copy";
                    icon.style.color = "";
                }
            }, 1800);
        }).catch(err => {
            console.error("Failed standard copy protocol: ", err);
        });
    }


    // ==========================================================================
    // Tool: Password Generator & Cryptographic Security
    // ==========================================================================
    const passwordDisplay = document.getElementById("passwordDisplay");
    const copyPasswordBtn = document.getElementById("copyPassword");
    const charLengthInput = document.getElementById("charLength");
    const charLengthVal = document.getElementById("charLengthVal");
    const optUppercase = document.getElementById("optUppercase");
    const optLowercase = document.getElementById("optLowercase");
    const optNumbers = document.getElementById("optNumbers");
    const optSymbols = document.getElementById("optSymbols");
    const generateBtn = document.getElementById("generatePassword");
    const strengthBar = document.getElementById("strengthBar");
    const strengthText = document.getElementById("strengthText");

    const charSets = {
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
    };

    // Keep length slider values synchronized
    charLengthInput.addEventListener("input", (e) => {
        charLengthVal.textContent = e.target.value;
    });

    // CRITICAL FIX: Ensure at least 1 checkbox option must remain active to prevent application crashes
    const securityCheckboxes = [optUppercase, optLowercase, optNumbers, optSymbols];
    
    securityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener("change", (e) => {
            const checkedCount = securityCheckboxes.filter(cb => cb.checked).length;
            if (checkedCount === 0) {
                // Force configuration to remain active if it's the last selected pool
                e.preventDefault();
                checkbox.checked = true;
            } else {
                generatePassword();
            }
        });
    });

    function evaluateStrength(password, criteriaCount) {
        let score = 0;
        const len = password.length;

        if (len === 0) return { score: 0, text: "Empty", color: "transparent" };
        
        if (len >= 8) score += 1;
        if (len >= 14) score += 1;
        if (len >= 20) score += 1;

        if (criteriaCount >= 3) score += 1;
        if (criteriaCount === 4) score += 1;

        if (score <= 2) {
            return { score: 20, text: "Weak", color: "#f87171" };
        } else if (score === 3 || score === 4) {
            return { score: 60, text: "Medium", color: "#fbbf24" };
        } else {
            return { score: 100, text: "Strong", color: "#10b981" };
        }
    }

    function generatePassword() {
        let allowedPool = "";
        let criteriaCount = 0;

        if (optUppercase.checked) { allowedPool += charSets.uppercase; criteriaCount++; }
        if (optLowercase.checked) { allowedPool += charSets.lowercase; criteriaCount++; }
        if (optNumbers.checked) { allowedPool += charSets.numbers; criteriaCount++; }
        if (optSymbols.checked) { allowedPool += charSets.symbols; criteriaCount++; }

        const targetLength = parseInt(charLengthInput.value);
        let outputStr = "";

        // Client-side cryptographic pseudo-random collection
        const randomValues = new Uint32Array(targetLength);
        window.crypto.getRandomValues(randomValues);

        for (let i = 0; i < targetLength; i++) {
            const randomIndex = randomValues[i] % allowedPool.length;
            outputStr += allowedPool[randomIndex];
        }

        passwordDisplay.value = outputStr;
        updateStrengthMeter(outputStr, criteriaCount);
    }

    function updateStrengthMeter(password, criteriaCount) {
        const evaluation = evaluateStrength(password, criteriaCount);
        strengthBar.style.width = `${evaluation.score}%`;
        strengthBar.style.backgroundColor = evaluation.color;
        strengthText.textContent = evaluation.text;
        strengthText.style.color = evaluation.color;
    }

    generateBtn.addEventListener("click", generatePassword);
    
    copyPasswordBtn.addEventListener("click", () => {
        copyToClipboard(passwordDisplay.value, copyPasswordBtn);
    });

    // Run baseline security components initialization
    generatePassword();


    // ==========================================================================
    // Tool: Text Case Converter & Lexical Counter
    // ==========================================================================
    const textInput = document.getElementById("textInput");
    const copyTextBtn = document.getElementById("copyText");
    const charCountEl = document.getElementById("charCount");
    const wordCountEl = document.getElementById("wordCount");
    const lineCountEl = document.getElementById("lineCount");
    const actionButtons = document.querySelectorAll(".text-action");

    function runCounters() {
        const value = textInput.value;
        charCountEl.textContent = value.length;
        
        const words = value.trim().split(/\s+/).filter(w => w.length > 0);
        wordCountEl.textContent = words.length;

        const lines = value.split("\n").filter(l => l.length > 0);
        lineCountEl.textContent = value.length > 0 ? lines.length : 0;
    }

    textInput.addEventListener("input", runCounters);

    copyTextBtn.addEventListener("click", () => {
        copyToClipboard(textInput.value, copyTextBtn);
    });

    actionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.getAttribute("data-action");
            const currentStr = textInput.value;

            switch(action) {
                case "upper":
                    textInput.value = currentStr.toUpperCase();
                    break;
                case "lower":
                    textInput.value = currentStr.toLowerCase();
                    break;
                case "title":
                    textInput.value = currentStr
                        .toLowerCase()
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    break;
                case "strip":
                    textInput.value = currentStr.replace(/\s+/g, ' ').trim();
                    break;
                case "clear":
                    textInput.value = "";
                    break;
            }
            runCounters();
        });
    });


    // ==========================================================================
    // Tool: Live QR Code Generator
    // ==========================================================================
    const qrInput = document.getElementById("qrInput");
    const qrColorDark = document.getElementById("qrColorDark");
    const qrColorLight = document.getElementById("qrColorLight");
    const generateQrBtn = document.getElementById("generateQR");
    const downloadQrBtn = document.getElementById("downloadQR");
    const qrcodeContainer = document.getElementById("qrcode");
    
    function renderQRCode() {
        // Fallback default target configuration if placeholder context is blank
        const val = qrInput.value.trim() || "https://github.com/";

        qrcodeContainer.innerHTML = "";

        // Build code configuration elements
        new QRCode(qrcodeContainer, {
            text: val,
            width: 180,
            height: 180,
            colorDark: qrColorDark.value,
            colorLight: qrColorLight.value,
            correctLevel: QRCode.CorrectLevel.H
        });

        // Delay to allow canvas parsing inside the target node
        setTimeout(() => {
            const generatedCanvas = qrcodeContainer.querySelector("canvas");
            const generatedImg = qrcodeContainer.querySelector("img");
            
            if (generatedCanvas || generatedImg) {
                downloadQrBtn.removeAttribute("disabled");
            } else {
                downloadQrBtn.setAttribute("disabled", "true");
            }
        }, 150);
    }

    generateQrBtn.addEventListener("click", renderQRCode);

    downloadQrBtn.addEventListener("click", () => {
        const canvas = qrcodeContainer.querySelector("canvas");
        const img = qrcodeContainer.querySelector("img");
        let downloadUri = null;

        if (canvas) {
            downloadUri = canvas.toDataURL("image/png");
        } else if (img) {
            downloadUri = img.src;
        }

        if (downloadUri) {
            const tempAnchor = document.createElement("a");
            tempAnchor.href = downloadUri;
            tempAnchor.download = `wafyops-qr-code.png`;
            document.body.appendChild(tempAnchor);
            tempAnchor.click();
            document.body.removeChild(tempAnchor);
        }
    });

    // Initialize baseline QR Code
    renderQRCode();


    // ==========================================================================
    // Tool: Color Palette & Swatches
    // ==========================================================================
    const primaryColorInput = document.getElementById("primaryColorInput");
    const hexDisplay = document.getElementById("hexDisplay");
    const rgbDisplay = document.getElementById("rgbDisplay");
    const hslDisplay = document.getElementById("hslDisplay");

    const copyHexBtn = document.getElementById("copyHex");
    const copyRgbBtn = document.getElementById("copyRgb");
    const copyHslBtn = document.getElementById("copyHsl");

    function parseHexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        const bigInt = parseInt(hex, 16);
        const r = (bigInt >> 16) & 255;
        const g = (bigInt >> 8) & 255;
        const b = bigInt & 255;
        return { r, g, b };
    }

    function parseRgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; 
        } else {
            const diff = max - min;
            s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
            switch (max) {
                case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
                case g: h = (b - r) / diff + 2; break;
                case b: h = (r - g) / diff + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    function processColorUpdates(newHex) {
        const hexVal = newHex.toUpperCase();
        hexDisplay.textContent = hexVal;

        const rgb = parseHexToRgb(newHex);
        const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        rgbDisplay.textContent = rgbString;

        const hsl = parseRgbToHsl(rgb.r, rgb.g, rgb.b);
        const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        hslDisplay.textContent = hslString;
    }

    primaryColorInput.addEventListener("input", (e) => {
        processColorUpdates(e.target.value);
    });

    copyHexBtn.addEventListener("click", () => {
        copyToClipboard(hexDisplay.textContent, copyHexBtn);
    });

    copyRgbBtn.addEventListener("click", () => {
        copyToClipboard(rgbDisplay.textContent, copyRgbBtn);
    });

    copyHslBtn.addEventListener("click", () => {
        copyToClipboard(hslDisplay.textContent, copyHslBtn);
    });

    // Run baseline color initialization
    processColorUpdates(primaryColorInput.value);
});