/** Tailwind 設定：自訂色票皆依「數字越大越深」排序，避免與 Tailwind 內建色名衝突。 */
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  theme: {
    "extend": {
      "fontFamily": {
        "display": [
          "\"Noto Sans TC\"",
          "sans-serif"
        ],
        "sans": [
          "\"Noto Sans TC\"",
          "\"Noto Sans\"",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"PingFang TC\"",
          "\"Microsoft JhengHei\"",
          "sans-serif"
        ],
        "mono": [
          "\"JetBrains Mono\"",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace"
        ]
      },
      "colors": {
        "ink": {
          "0": "#ffffff",
          "50": "#f8f9ff",
          "100": "#e8f5e9",
          "200": "#e2e8f0",
          "300": "#d8e3fb",
          "500": "#bbcbbb",
          "600": "#94a3b8",
          "700": "#6c7b6d",
          "800": "#3c4a3e",
          "900": "#111c2d",
          "950": "#0d1c2e"
        },
        "leaf": {
          "0": "#e8f5e9",
          "200": "#d5e0f8",
          "500": "#06c167",
          "700": "#006d37",
          "950": "#005228"
        },
        "jade": {
          "0": "#f0fdf4",
          "100": "#e8f5e9",
          "200": "#44e183",
          "400": "#34c067",
          "500": "#06c167",
          "700": "#006d37",
          "800": "#005228",
          "950": "#004722"
        },
        "mist": {
          "0": "#e8f5e9",
          "50": "#d5e0f8",
          "100": "#bae6fd",
          "300": "#7dd3fc",
          "400": "#38bdf8",
          "500": "#06c167",
          "600": "#006d37",
          "800": "#075985",
          "900": "#0c4a6e",
          "950": "#082f49"
        },
        "ochre": {
          "0": "#fffbeb",
          "200": "#d97706",
          "500": "#b45309",
          "700": "#92400e",
          "950": "#78350f"
        },
        "crimson": {
          "0": "#fff1f2",
          "200": "#e11d48",
          "500": "#be123c",
          "700": "#9f1239",
          "950": "#881337"
        },
        "brand": {
          "0": "#f8f9ff",
          "200": "#e8f5e9",
          "500": "#d5e0f8",
          "700": "#06c167",
          "950": "#006d37"
        }
      }
    }
  }
};
