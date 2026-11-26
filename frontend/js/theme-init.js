// يُنفَّذ مبكراً لتفادي وميض الوضع الخاطئ
try { const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t; } catch {}
